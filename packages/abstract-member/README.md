# @produck/es-abstract-member

Ready-made parsers for declaring the members of an abstract constructor built
with `@produck/es-abstract-token`.

## Installation

```bash
npm install @produck/es-abstract-member
```

## Usage

```js
import Abstract from '@produck/es-abstract-token';
import * as _ from '@produck/es-abstract-member';

const AbstractSample = Abstract(
  class Sample {},
  ...[
    Abstract({
      foo: _.String,
      count: _.Number,
      createdAt: _.Instance(Date),
      check: _.Method().args(_.Number).returns(_.Boolean),
      pending: _.OrPromise(_.Number),
    }),
    Abstract.Static('qux', _.Boolean),
  ],
);

class SubSample extends AbstractSample {
  foo = 'implemented';
  count = 1;
  createdAt = new Date();
  pending = Promise.resolve(1);
  static qux = true;

  check(value) {
    return value > 10;
  }
}

const sample = new SubSample();

sample.foo; // 'implemented'
sample.check(25); // true
await sample.pending; // 1
```

## API

### Primitives

Each of them asserts the type of the member value.

- `Undefined` — Asserts value is `undefined`.
- `Object` — Asserts value is of type `object` (including `null`).
- `Boolean` — Asserts value is of type `boolean`.
- `Number` — Asserts value is of type `number`.
- `BigInt` — Asserts value is of type `bigint`.
- `String` — Asserts value is of type `string`.
- `Symbol` — Asserts value is of type `symbol`.
- `Function` — Asserts value is of type `function`.

### `Instance(constructor)`

Asserts value is an instance of `constructor`.

```js
_.Instance(Date);
```

### `Method()`

Creates a member parser for a function member, with chainable operators:

- `.args(...parsers)` — a parser for each positional argument.
- `.rest(parser)` — the parser applied to every extra argument.
- `.returns(parser)` — the parser applied to the return value.

Each operator may be called once, and none of them may be called after the
member has been used.

```js
_.Method().args(_.Number).returns(_.Boolean);
```

### `Promise(parser?)` / `OrPromise(parser?)`

- `Promise(parser?)` — asserts the value is a `Promise`, then applies `parser`
  to the resolved value.
- `OrPromise(parser?)` — accepts a `Promise` or a plain value, and applies
  `parser` accordingly.

### `PromiseLike(parser?)` / `OrPromiseLike(parser?)`

The same as `Promise` / `OrPromise`, but accepting any thenable instead of a
`Promise` instance.

### `Any` / `Unknown`

A parser that passes any value through without validation. It is also the
default parser when a declared member has none.

## License

MIT

## Author

Produck
