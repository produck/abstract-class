# @produck/es-abstract-token

An easy way to define abstract constructor (or class) in JavaScript.

## Installation

```bash
npm install @produck/es-abstract-token
```

## Features

- **Following Convention** — Provides `abstract` and `static` operators like
  other major programming languages do. Any native constructable function can
  be made abstract by `Abstract`.
- **Abstract Constructor** — Marks a constructor as abstract, so that it can
  only be extended, never instantiated.
- **Abstract Member** — Declares, through the reserved `Instance` / `Static`
  field groups, the members a subclass has to implement.
- **Member Field Instance/Static** — Members may be required on instances or on
  the constructor itself.
- **NO Instantiation** — There has been a mechanism to ensure that
  instantiation of an abstract constructable is prohibited.
- **Runtime Checking** — Member implementation is checked when the member is
  accessed, even if it is not fully implemented or incorrectly implemented.
- **Runtime Parser** — Every declared member carries a parser validating the
  value the member resolves to.
- **Stable Instance Identity** — One construction yields exactly one proxy,
  created at the outermost abstract layer. Code running inside a base or
  abstract constructor body sees the raw object, so `ShadowThis` is provided to
  resolve it to the very object the caller of `new` receives.
- **Erasing in Production** — `@produck/es-abstract-token/erase` exposes the
  same API as a passthrough, so all runtime checks can be left out of
  production builds.
- **Strict/loose Dependency** about error users.
- **No Error Flag** — Failures are thrown instead of being reported through a
  flag.

## Quick Start

```js
import Abstract, { Any } from '@produck/es-abstract-token';

const AbstractSample = Abstract(
  class Sample {
    superMember = 'foo';
  },
  ...[
    Abstract({
      foo: Any,
    }),
    Abstract('bar'),
    Abstract.Static({
      baz: Any,
    }),
    Abstract.Static('qux'),
  ],
);

// ❌ Error: Illegal construction on an abstract constructor.
new AbstractSample();

class Sample extends AbstractSample {
  foo = 'implemented';
  static baz = 'implemented';
}

// ✔ Creating a new instance is OK.
const sample = new Sample();

// ❌ Error: Instance member "bar" must be implemented.
sample.bar;

// ✔ Accessing `.foo` OK.
sample.foo;

// ❌ Error: Static member "qux" must be implemented.
Sample.qux;

// ✔ Accessing `::baz` OK.
Sample.baz;
```

## API

### `Abstract(Constructor, ...fieldList)`

Makes `Constructor` abstract and returns it. Every item of `...fieldList` has
to be a field group built by `Abstract` itself.

```js
const AbstractSample = Abstract(
  class Sample {},
  ...[Abstract({ foo: Any }), Abstract.Static('baz')],
);
```

### `Abstract(fieldMap)` / `Abstract(name, parser?)`

Builds an **instance** field group:

- `Abstract({ foo: Any, bar: Any })` declares the named instance members.
- `Abstract('foo')` declares one instance member; its parser defaults to any.
- `Abstract('foo', parser)` declares one instance member with `parser`.

`Abstract.Static` (alias `Abstract.static`) does the same for **static**
members.

### `Any`

A parser that passes any value through without validation. It is also the
default parser when a declared member has none.

### `SubConstructorProxy(subConstructor)` / `SCP`

Creates the guarded proxy of a class extending an abstract constructor. It
throws when `subConstructor` is not constructable, does not extend an abstract
constructor, or already has a proxy.

`SCP` is an alias of `SubConstructorProxy`.

When the construction check is enabled and the abstract layer declares static
members, the returned proxy is the only constructible form; wrapping is what
puts the class under that check.

### `enableSubConstructorProxyCheck()` / `disableSubConstructorProxyCheck()`

Turn the construction-time check on or off. It is **off** by default, so a
subclass may declare static members without wrapping. Enable it in tests to
catch classes that never went through `SubConstructorProxy`.

```js
import {
  enableSubConstructorProxyCheck,
  disableSubConstructorProxyCheck,
} from '@produck/es-abstract-token';

enableSubConstructorProxyCheck();

try {
  // constructing an unwrapped subclass now throws
} finally {
  disableSubConstructorProxyCheck();
}
```

### `ShadowThis(instance)`

Returns the object the caller of `new` receives for `instance`. Inside a base or
abstract constructor body `this` is still the raw object, so `ShadowThis(this)`
is the only way to reach the identity the caller holds.

```js
import Abstract, { ShadowThis as $ } from '@produck/es-abstract-token';

const seen = [];

const AbstractSample = Abstract(
  class Sample {
    constructor() {
      seen.push($(this));
    }
  },
);

class Sub extends AbstractSample {}

const sub = new Sub();

// ✔ The constructor body resolved to the very object the caller holds.
sub === seen[0];
```

Importing it under a short alias (as `Member` is aliased to `_`) keeps the
resolution call apart from ordinary helpers. `$` doubles as a mnemonic: it is an
`S` (Shadow) cut by a stroke. It is idempotent: an already resolved object is
returned unchanged. It throws a `TypeError` when `instance` is not an object,
and an `Error` when it does not belong to a class extending an abstract
constructor.

### Types

- `Parser<V, T>` — A parser that asserts a value is of type `V`. The raw input
  is always `unknown` because the check happens at runtime.
- `Field` — A map from member name to the parser checking that member.
- `FieldGroup` — A set of parsers keyed by member name, split into the instance
  group and the static group.
- `Instance` — The field group key holding the members defined on instances.
- `Static` — The field group key holding the members defined on the
  constructor.
- `ConstructorLike` — Any constructable value, such as a class or constructor
  function.
- `EmptyFieldGroup` — A field group that declares no member.

## Erasing in Production

`@produck/es-abstract-token/erase` exposes the same API, but every call is a
passthrough and no check is performed.

```js
import Abstract from '@produck/es-abstract-token/erase';
```

Alias `@produck/es-abstract-token` to `@produck/es-abstract-token/erase` in a
production build to strip all runtime checks.

## License

MIT

## Author

Produck
