# DEV Notes

研发过程记录：走过的路、否掉的理由、未决的问题。
不是对外文档，不追求措辞，只保证结论可复查。

## 实例身份（issue #9）：SELF 方案，已放弃

- 时间：2026-10-12
- 状态：代码未采纳，工作区已还原
- 相关包：`@produck/es-abstract-token`
- 涉及文件：`src/Constructor.mjs`、`src/Erase/index.mjs`、`src/index.mjs`、
  `index.d.ts`、`test/Self.mjs`、`test/Erase.mjs`、`test/index.mjs`

### 问题

抽象构造函数返回的是代理。构造函数体内 `this` 是原始对象，调用方拿到
的是代理，于是出现两件事：

- 构造函数里 `set.add(this)`，与 `new Foo()` 拿到的结果不是同一个键
- 构造函数里读自己的成员，绕过了成员校验

### 尝试的机制

- `SELF = Symbol.for('abstract.self')`，由 token 导出
- `PROXY_LIST`：`WeakMap<原始实例, WeakMap<handler, 代理>>`。同一实例
  配同一 handler 只产一个代理，保证身份稳定
- `ProxyHandler(members, fieldName, resolveSelf)`：`get` 命中 `SELF`
  时交给 `resolveSelf`，不当作普通成员处理
- `Abstract()` 在 `constructor.prototype` 上挂 `SELF` getter，于是
  构造函数里 `this[SELF]` 就是调用方拿到的代理
- `construct` trap 改为返回 `proxyOfInstance(instance, handler)`
- `Erase` 侧挂同样的 getter，返回 `this` 自身
- 类型侧：`readonly [SELF]: MixinInstance<C, FG>` + 导出 `SELF`

核心代码（还原前形态，供复查）：

```js
const PROXY_LIST = new WeakMap();

function proxyOfInstance(instance, handler) {
  let byHandler = PROXY_LIST.get(instance);

  if (byHandler === undefined) {
    byHandler = new WeakMap();
    PROXY_LIST.set(instance, byHandler);
  }

  let proxy = byHandler.get(handler);

  if (proxy === undefined) {
    proxy = new Proxy(instance, handler);
    byHandler.set(handler, proxy);
  }

  return proxy;
}
```

```js
function ProxyHandler(members, fieldName, resolveSelf = null) {
  return {
    get(target, property, receiver) {
      if (resolveSelf !== null && property === SELF) {
        return resolveSelf(target);
      }

      const value = Reflect.get(target, property, receiver);

      // ...成员校验分支不变

      return value;
    },
  };
}
```

```js
const instanceProxyHandler = ProxyHandler(
  Field.Instance,
  'Instance',
  (instance) => proxyOfInstance(instance, instanceProxyHandler),
);

Object.defineProperty(constructor.prototype, SELF, {
  configurable: true,
  get() {
    return proxyOfInstance(this, instanceProxyHandler);
  },
});
```

### 实测结论

单层可用：

- 构造函数里 `this[SELF] === new 结果` → `true`
- `set.has(this[SELF])` → `true`
- 构造函数里裸 `this` 仍不是代理，仍绕过校验（已知边界）

两层会丢祖先层。探针：A 为祖先层、B 为外层，各带一个会被拒绝的成员。

| 实现                | 读 A 层成员      | 读 B 层成员 | 内层 `this[SELF] === 结果` |
| ------------------- | ---------------- | ----------- | -------------------------- |
| 原实现              | 校验生效         | 校验生效    | `false`                    |
| 改 `instance[SELF]` | 校验失效（放行） | 校验生效    | `true`                     |

原因：`SELF` getter 挂在各自的 `prototype` 上，`instance[SELF]` 走的是
原型链，**就近命中外层那一层**，祖先层的 handler 从不参与。

### 被否掉的“等价简化”

一种想法：`construct` trap 里直接 `return instance[SELF]` 就够了，反正
弱映射里已经有构造好的代理。实测**单层等价、多层不等价**：

1. 只跑 `test/AbstractDefault.mjs` 就挂 2 个用例，报
   `Missing expected exception` —— 该抛的校验没抛
2. 两层探针：祖先层成员由“校验生效”变“放行”，祖先层整张表被丢弃
3. 构造函数返回自有对象时，trap 返回 `undefined`，抛
   `TypeError: 'construct' on proxy: trap returned non-object`

所以第 3 列那个 `true` 是假象：不是两层都生效，而是整条链塌缩成一层。

### 为什么难（ES 硬约束）

- `[[Construct]]` 先建对象、再跑构造函数体；构造函数一进去，`this`
  已经绑定。trap 只能替换最外层 `new` 的返回值，替换不了最内层构造
  函数手里的 `this`
- 想靠原型上的 getter/setter 拦成员：类字段用 define 语义
  （`CreateDataPropertyOrThrow`）写入，绕过 setter；而且自己那份数据
  属性会遮蔽原型 getter
- 想在实例上预置 `defineProperty`：只可能发生在构造之前

结论：要么用 Proxy，要么放弃构造期校验，没有第三条路。

### 代价（原型 getter 这条路）

| 代价             | 说明                                                    |
| ---------------- | ------------------------------------------------------- |
| 改了用户的 class | `Reflect.ownKeys(Foo.prototype)` 多一个符号（不可枚举） |
| 与冻结冲突       | `Object.freeze(Foo.prototype)` 早于 `Abstract()` 就抛   |
| 多层就近命中     | 祖先层表被丢（见上）                                    |
| 静默失效         | `configurable: true`，被 delete / 覆盖后不报错          |
| 调试成本         | 断点里 `this[SELF]` 是有副作用的 getter，返回值是 Proxy |

### 可选方向

1. 留 Proxy，去掉 `SELF`：承认构造期内 `this` 不是最终对象，身份交给
   调用方（构造完成后注册）。零侵入，代价是丢失构造期自注册能力。
2. 留 Proxy + 留 `SELF`：构造期可用，上表代价全吞。

倾向 1（收益面窄、成本面宽），但 issue #9 要的到底是哪种语义未定。

### 附：排查记录

测试数从 37 掉到 1，一度被误判为改动引入。实际是测试文件残留
`it.only`：`node:test` 只要看到 `only`，整个入口只跑那一个用例，
而且 exit code 仍为 0。
