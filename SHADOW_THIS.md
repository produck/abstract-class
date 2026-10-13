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
  构造"不需要额外登记或构造栈

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

## 用户决议（第四轮）：构造栈 + 链上寻父 + 单对象

目标顺序：先做基础设施，再保证每层构造体内的 `this` 是同一个对象，而不是
每过一层 Abstract 就多套一层代理。

### A. 完备的构造栈跟踪机制

- 每次构造一个帧；trap 进入压栈、`try/finally` 退栈
- 嵌套 `new` 靠嵌套深度天然分行，不与外层构造混用
- 栈挂 `globalThis[Symbol.for(...)]`，与注册表同源

评估：可行。但要说明"一一对应"本身并不需要栈（对象键就够），栈的独立价值
在时序判定（是否处于构造中）与事后核对。

### B. 每层沿继承链找到上一个更 Abstract 的 Constructor

- `Abstract()` 时记录"我的父抽象层"，形成抽象层链表
- 两两之间的成员规则覆盖：最具体优先，即从最具体那头往上查表

评估：可行，而且有额外收益 —— trap 里能拿到 `newTarget`（`new` 处那个类，
沿 `super()` 传递），所以**一次构造的完整层链在最内层就能算出来**，不需要在
构造过程中逐层动态登记表。

### C. 每层 constructor 内的 `this` 是同一个对象

每个 trap 都做同一件事，靠幂等自然分层：

```js
const instance = Reflect.construct(target, argumentList, newTarget);

return Shadow(instance);
```

最内层建立影子，外层原样拿回同一个，于是 derived 层全部看到同一个对象。
base 体内仍是原生对象（替换点之下），只能用 `Shadow(this)` 取。

## 对"现有测试不受影响"的核对

- 没有测试依赖"每层各一个代理"：全仓测试里没有 `notEqual`、原型键断言
- 唯一涉及身份的是 `assert.equal(target, mock)`（成员解析器看到的对象必须
  等于调用方拿到的对象）—— 单对象设计正好满足
- `instanceof` 链，以及 `SubConstructorProxy` 的三条错误语义被测试钉死，
  实现时必须保留
- 需要留意：两个两层用例的外层成员表都是空的（`...[]`），所以"多层成员表
  叠加"其实没有被测到，只覆盖了"外层委托内层"。因此"测试不受影响"即使成立
  也只是弱证据，必须补多层叠加的测试

## 阶段一设计决策与结果：Trace.mjs（A）+ 抽象层链（B）

### A. `Trace.mjs`（构造栈，独立文件，内部设施）

- 一帧 = **一次构造**，不是一次 trap
- 由"没有抽象父层"的那一层压栈 —— 它正是触发对象创建的那一层
- trap 内 `try/finally` 配对；嵌套 `new` 与重入靠嵌套自然分行；抛错不残留帧
- 帧内容：`target`（根层的原始类）、`newTarget`（`new` 处那个类）
- 曾带过 `layerList`（抽象层链），静态化累积规则后无人消费，已删
- 后续 ShadowThis 把影子挂进帧
- 栈先放模块内，不挂 `globalThis`

**帧的覆盖范围**（重要）：帧的生存期 = 根层 trap 的 `Reflect.construct` 跨度。
derived 层的构造函数体在帧之外 —— 根层 trap 返回时就把帧退了，而那时上层
构造函数体还没跑。要覆盖整条 `new`，得换机制（最外层 trap 无法自知）。

### B. 抽象层链（后续被静态化取代）

- 原设计：`Abstract()` 时找最近抽象祖先，层记录挂 WeakMap（键是代理），
  由 `newTarget` 反查链路，实例 handler 逐层查表
- 已改为：层记录挂在构造器上（`Symbol.for('abstract.layer')`），累积
  规则在声明期一次算完，handler 只持单表；WeakMap 层记录已删
- 重复抽象同一构造器现在被门禁拦下（`This constructor has already been
abstracted`）

### 实测：同名成员的现状与"最具体优先"不一致

探针 `logs/layer-override.mjs`：两层都声明 `foo`，内层返回 `inner:x`，外层
返回 `outer:...`。

结果：`inner = ['x']`、`outer = ['inner:x']` —— **两层都跑，逐层串联**。

所以"以最具体的那一层为准"目前**不成立**。要变成真覆盖，外层必须能拿到
**未经内层解析的原始值**，而这要求 handler 的 target 就是原生对象本身，
即单对象那一步。这条已定要素只能等 ShadowThis 落地。

### 补充：替代只发生在最外层抽象层

- 判据：`nearestLayerOf(newTarget)` 就是本层记录
- 最外层抽象层返回代理，其余层原样返回原生对象

实测（`util.types.isProxy`）：

| 场景              | base 体内 | 抽象层体内 | 具体子类体内 | 调用方         |
| ----------------- | --------- | ---------- | ------------ | -------------- |
| 裸类 `new Leaf()` | 原生      | 原生       | 代理         | 代理（同一个） |

具体子类体内与调用方必然是同一个对象（`new Leaf()` 的返回值恒等于 `Leaf`
的 `this`），所以"具体子类体内是原生、调用方是代理"只能靠给 `new` 的那个
类包一层实现 —— 那会强制下游用 `SubConstructorProxy`，已否决：SCP 只服务
静态侧，实例侧不需要它。

连带结论：抽象层体内 `this` 是原生对象，构造体内要拿规范对象就得靠
`Shadow(this)` —— ShadowThis 的必要性由此坐实。

新增测试 `test/Layered.mjs`：裸类形态身份、返回实例的成员校验、最具体层
获胜、缺省向上回退。

### 验证结果

- `abstract-token`：41 用例全绿（既有 33 个未受影响，新增 8 个）
- 全仓 `npm run test`：4 个 workspace 全部 `fail 0`
- `npm run produck:commit:check`：exit 0
- 新增测试覆盖：空闲无帧、base 体深度为 1、独立构造嵌套分行、重入分行、
  构造抛错不残留、derived 抛错不残留

## 设计纪要：进入 ShadowThis 之前

### 已经钉住的形状

- base 与各抽象层的构造函数体内是同一个原生对象；具体子类体内与调用方是
  同一个代理
- 全局只有一处替换：最外层抽象层
- 实例 handler 持单张累积规则表（声明期合并，最具体优先）

### ShadowThis 的三条前置约束

1. **懒铸与边界铸必须收敛到同一张表**
   构造期内 `Shadow(this)` 会先铸代理（早于边界 trap），边界必须复用它，
   否则又会出现两个对象
2. **`Shadow(this)` 铸出的代理要带完整层链 handler**
   层链不能依赖 `Trace` 帧：帧只在 base 构造函数体内有效，中间抽象层体内
   帧已退（帧覆盖边界的直接后果）。可靠来源是 `this.constructor` 沿构造器
   链向上走，但用户覆盖 `constructor` 时会失效，需要评估
3. **非法入参判定未定**
   既非构造对象也非影子时的行为（抛错 / 忽略 / 降级）待定，`Shadow()` 的
   入口形态也待定

### 已知未做

- 静态/类侧身份（`AbstractFoo` 代理 vs 原始 class）
- 跨副本：`INSTANCE_PROXY` 是模块内 `WeakSet`，多副本下身份判定仍会
  分裂；与"注册表挂 `globalThis[Symbol.for(...)]`"同批处理

## 待评审：`Trace.mjs`

实现已落地，等着被 review。目前可指认的取舍点：

- 帧容器是模块内数组，未挂 `globalThis`（与影子注册表的取舍相反）
- `exit(frame)` 只在它是栈顶时出栈，不匹配时静默忽略
- 帧是可变的普通对象（后续要挂影子），未 `Object.freeze`
- API 形状：`enter(target, newTarget)` / `exit(frame)` / `current()` /
  `depth()`，`enter` 返回帧自身
- 一帧 = 一次构造，由"没有抽象父层"的那一层压栈（该层正是触发对象创建的
  那一层）；嵌套 `new` 与重入靠嵌套分行
- 无注释、无 JSDoc（按仓库约定）

### 已定：静态抽象成员要求 SCP

原为未决项，现已定：**抽象层的静态成员表非空时，未被 SCP 过的具体子类在
构造时当场抛错**。判据只看"这一层有没有静态抽象成员"+"该类有没有被 SCP
过"，不去分辨子类实现了哪些成员 —— 静态成员运行时也能补上或改写，所以
"当时没实现"不是安全状态。

- 时机：最外层抽象层的 `construct` trap，`Reflect.construct` 之前
- 信息：`It MUST SubConstructorProxy("<类名>").`
- "已 SCP" = 该类本身、或 SCP 返回的 wrapper 调用过 `SubConstructorProxy`
  （所以 SCP 之后用原始引用构造同样放行）
- 下游写法：每一层具体子类都要包，且下一层 `extends` 上一层的 wrapper

代价与残留：

- 只继承、什么都没实现的类也必须 SCP（对校验无收益，是契约成本）
- 判据锚在 `newTarget` 上：中间层若有裸类自己实现了静态成员，不会被提醒
- 从不构造、只读静态的用法仍然绕过（构造期是唯一能检查的时机）

### 为什么无法秘密附着

静态成员的读取要被拦住，那个类对象本身必须是代理。裸子类的静态是它自己的
属性，父层预埋会被遮蔽；`extends` 求值时唯一能触发的 trap（读 `prototype`）
拿到的 `receiver` 是代理自己，子类尚未创建，拿不到引用。

实测（直接看 parser 有没有跑）：

| 场景               | 结果                                 |
| ------------------ | ------------------------------------ |
| 包装层读 `foo`     | `w`，parser 参与，校验生效           |
| 裸层自己实现 `foo` | `b`，**parser 未调用**，静默绕过校验 |
| 裸层未实现 `foo`   | 抛"必须由子类实现"错误               |

所以没有任何隐蔽的附着点，只能"构造时检查并拒绝"；这也正是上面那条判据只能
覆盖"被构造过的类"的原因。

## 状态

- ShadowThis 本身（`Shadow()` 入口、注册表、帧内挂影子）仍未落笔
- 已完成：A（`Trace.mjs` 构造栈）、B（抽象层链，已静态化为层记录 +
  累积规则）、最外层抽象层替代（抽象层体内为原生对象，具体子类与调用方
  为同一个代理）
- 未做：`Shadow(this)` 解析入口、非法入参判定、静态/类侧身份
- 跨副本注记：规则侧已通过 `Symbol.for('abstract.layer')` 可跨副本读；
  `INSTANCE_PROXY` 仍是模块内 `WeakSet`，身份判定在多副本下仍会分裂
- 测试：逐文件全绿（`AbstractDefault` 30 / `Extends` 4 / `Erase` 1 /
  `Trace` 6 / `Layered` 4）；全仓 4 个 workspace `fail 0`；
  `produck:commit:check` exit 0

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
