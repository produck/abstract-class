# ShadowThis 方案记录

讨论记录：方案、已确立的事实与实测证据、已定要素、未决项。
不是对外文档。相关实现记录见 `DEV.md`。

## 背景

- 目标：抽象构造函数在**构造期**就能给出"规范对象"，使 `set.has(this)`、
  身份比较在任意继承层都成立（issue #9）
- 现状：抽象构造函数返回代理，构造函数体内的 `this` 与调用方拿到的对象
  不是同一个

## 已确立的事实

### 1. 原生行为下，整条链只有一个对象

无代理时：对象由最内层 **base** 构造函数创建，`newTarget` 是 `new` 处那个
类并沿 `super()` 传递，所以对象的原型是 `Sub.prototype`；base / mid / sub
各层构造函数体内的 `this` 与 `new` 的结果是同一个对象。

注：此前用"被代理之后"的实测去反驳这一条是打偏了。本条描述的是原生行为，
代理之后的偏离恰好是我们要处理的那个量。

### 2. 每层的 `this` 都可能被替换

derived 类的 `this` 等于 `super()` 的返回值。任一层 trap 换了返回值，其上
所有层看到的 `this` 就跟着换。原生链条本来只有一个对象，是被我们自己的
trap 打破的。

### 3. 现行实现：规则已叠加，身份每层分裂（实测）

| 观察点              | 结果                           |
| ------------------- | ------------------------------ |
| `base.this === foo` | `false`（base 体内拿不到代理） |
| `mid.this === foo`  | `false`（拿到本层代理 P_A）    |
| `sub.this === foo`  | `true`                         |
| 读 `foo.fromA`      | 触发 `A.parser`                |
| 读 `foo.fromB`      | 触发 `B.parser`                |

外层 handler 认领不到成员时 `Reflect.get` 会落到内层代理，内层表照样跑。
所以"规则没有层层叠加"对现行实现**不成立**，只对 `return instance[SELF]`
那个变体成立（见 `DEV.md`）。

中间层的症状：

```js
class Mid extends A {
  constructor() {
    super();
    set.add(this); // 注册的是 P_A，调用方拿到的是 P_B，set.has() 失败
  }
}
```

### 4. 最内层 base 体内的 `this` 无法被替换

对象由最内层 base 构造函数创建，没有 trap 能替换它体内的 `this`。想在那里
拿到规范对象，只能靠挂在原型上的解析入口（getter + 弱映射懒建）。

### 5. 影子对象先建，只能是占位对象（代价已实测）

Proxy 必须有真 target，而 `Reflect.construct` 返回之前谁都拿不到 instance，
所以影子只能架在占位对象上，之后所有操作都要转发到真实 instance。代价：

- 状态分裂：base 体内的写入落在原生对象上丢失
- 不变式回归：目标一旦不可扩展（如 `Object.freeze(instance)`），`ownKeys`
  必须与占位对象一致，转发到 instance 直接违规（现行实现没这个问题）

## 方案（ShadowThis，由用户提出）

- 在 `Reflect.construct` 之前先构造一个影子对象
- 最终返回的是影子对象的代理
- 用弱引用建立影子与真实 instance 的关联，构造函数侧用解析方法直接返回影子
  - 擦除后（Erase）的实现就是 `passthrough`
- 影子先建，于是可借构造时序探测当前构造栈状态，保证一次构造只造一个
  ShadowThis；在拿到 instance 之前，解析方法接受 `this`，返回 shadowThis

## 讨论后的修正目标

真正要保证的只有一件事：**替换只发生一次**。

- 一次构造只产一个代理：谁最先拿到原生对象就以它为基准（最内层抽象层的
  trap，或最内层 base 体内懒建的那个；两者靠同一张弱映射天然重合），外层
  trap 发现是本次构造的代理就原样返回
- 单代理会丢掉外层成员表，所以让同一个 handler **依次登记各层成员表**
- 于是不需要占位对象、不需要全量转发、不会状态分裂

## 已定要素

- 同名成员跨层覆盖：**以最具体的那一层为准**（外层覆盖内层）

## 未决项

- 最内层 base 体内是否要求 `this[SELF] === 调用方拿到的对象`（倾向：要求）
- 构造上下文栈的判定方式与 `try/finally` 收尾
- 解析入口与 `SELF` 符号的归属（token 内部 / argot 的 `SYMBOL` 表）
- 静态/类侧身份（`AbstractFoo` 代理 vs 原始 class）未处理
- `Object.freeze(Foo.prototype)` 早于 `Abstract()` 会抛

## 解析入口改为函数式（用户决定）

下游统一用 `Shadow(this)` 取规范对象，**替代**在原型上补成员（`SELF` getter）。

### 为什么这样更好

- 不动用户的原型：`Reflect.ownKeys` 不再多出符号；
  `Object.freeze(Foo.prototype)` 冲突、"就近命中"、`configurable` 静默失效
  一并消失
- 解析仍然只依赖 `this`，能力没有损失
- 入口显式：忘记调用就没有身份，是可看见的契约，不是隐式魔法

### 顺带取消"影子先建"

函数必须吃一个 `this`，影子因此必然由 `this` 派生，也就只能存在于原生对象
之后。于是占位对象那条路自然不存在：状态分裂、全量转发、freeze 后
`ownKeys` 不变式三项代价全部消失。

### 机制要点

- `WeakMap<原生 this, shadow>`：正向唯一
- `WeakSet<shadow>`：判定"已经是影子"，保证 `Shadow()` 幂等
  - `Shadow(原生 this)` → 取或建影子
  - `Shadow(shadow)` → 原样返回
- 一一对应的两端都是对象身份，不依赖时序、标志位或构造栈

### 新增代价与待定边界

- 下游必须显式调用；跨包多副本时，`Shadow` 必须与建影子的那份同源
  - 加固建议：注册表挂到 `globalThis[Symbol.for(...)]` 上，与既有
    "跨副本协议靠 `Symbol.for`"的结论一致
- 传入既非原生对象也非影子时：抛错还是新建，待定
- `Erase` 侧保持 `passthrough` 语义（不做任何代理），已定

## 用户决议（第二、三轮）

### 1. 跨副本：注册表挂全局

采纳：注册表挂到 `globalThis[Symbol.for(...)]` 上，多副本共用一份，避免各建
一个影子、身份再次分裂。

### 2. 影子与原生 `this` 的配对：事后再核对

判断是必需的。做法是在 instance 创建**之后**核对：回头看它是不是
constructor 内用过的那个 `this`。

两段式：

- 构造期（base 体内调用 `Shadow(this)`）：只登记**待定**条目，键就是这个
  `this`
- trap 拿到 instance 后核对：
  - `instance === 待定条目的键` → 转正式，影子交出去
  - 不相等（例如构造函数返回了自有对象）→ 丢弃待定条目，为 `instance` 另建

由此得到的结论：

- `Shadow` 的合法性只能在构造完成后闭合，构造期间无法严格自证
- "传入既非原生对象也非影子"的判断，正好落在核对这一步
- 对象身份本身就能定锚：一个对象只可能是某一次构造的 `this`，"登记自哪次
  构造"不需要额外标记或构造栈

待用户继续思考的细节：

- 核对失败时：抛错、忽略，还是降级
- 构造期内传入非本次 `this` 的对象该怎么判
- 待定条目是否需要清理

### 3. 核心机制独立成文件

ShadowThis 的核心机制单独一个文件实施，不与 `Constructor.mjs` 混在一起。
建议职责划分：

- 新文件：注册表、`Shadow()`、影子识别、成员表登记
- `Constructor.mjs`：只留 trap 与委托调用
- `index.mjs`：导出 `Shadow`

## 状态

仍在设计阶段，**未落笔写程序**。探针（长链单对象、构造内部 `new` 的四形态、
栈式 vs 对象键的重入对比）待跑。

## 复现实验

探针一：两层身份与成员表（存为 `logs/probe.mjs`，用 `../packages/...` 路径）

```js
import Abstract from '../packages/abstract-token/src/index.mjs';

const fire = [];
const log = (label, value) => fire.push([label, value]);

const A = Abstract(
  class Base {
    constructor() {
      log('base', this);
    }
  },
  ...[
    Abstract({
      fromA: (value) => {
        log('A.parser', value);

        return value;
      },
    }),
  ],
);

class Mid extends A {
  fromA = 'from-mid';

  constructor() {
    super();
    log('mid', this);
  }
}

const B = Abstract(
  Mid,
  ...[
    Abstract({
      fromB: (value) => {
        log('B.parser', value);

        return value;
      },
    }),
  ],
);

class Sub extends B {
  fromB = 'from-sub';

  constructor() {
    super();
    log('sub', this);
  }
}

const foo = new Sub();

for (const [label, value] of fire) {
  console.log(`${label}.this === foo :`, value === foo);
}

fire.length = 0;
foo.fromA;
foo.fromB;
console.log('触发:', fire.map(([label]) => label).join(', '));
```

输出：

```text
base.this === foo : false
mid.this === foo : false
sub.this === foo : true
触发: A.parser, B.parser
```

探针二：影子先建导致的状态分裂

```js
class Base {
  constructor() {
    this.a = 1;
  }
}

const BaseProxy = new Proxy(Base, {
  construct(target, argumentList, newTarget) {
    Reflect.construct(target, argumentList, newTarget);

    return Object.create(newTarget.prototype);
  },
});

class Sub extends BaseProxy {
  constructor() {
    super();
    this.b = 2;
  }
}

const s = new Sub();

console.log('s.a =', s.a, '| s.b =', s.b);
```

输出：

```text
s.a = undefined | s.b = 2
```

原因：`a` 由 base 体内写在原生对象上，`b` 由 Sub 体内写在影子上。要修就得让
影子全量转发到真实 instance。
