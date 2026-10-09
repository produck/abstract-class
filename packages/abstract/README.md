# @produck/es-abstract

Convenience entry that re-exports the abstract-class toolkit.

## Installation

```bash
npm install @produck/es-abstract
```

## Usage

```js
import Abstract, {
  Member as _,
  SubConstructorProxy,
} from '@produck/es-abstract';

const AbstractSample = Abstract(
  class Sample {},
  ...[Abstract({ foo: _.String }), Abstract.Static('qux', _.Boolean)],
);
```

## Exports

- default export — `Abstract`, re-exported from
  `@produck/es-abstract-token`.
- `SubConstructorProxy` — re-exported from `@produck/es-abstract-token`.
- `Member` — the namespace of `@produck/es-abstract-member`.

## Packages

- `@produck/es-abstract-token` — the abstract constructor and field groups.
- `@produck/es-abstract-member` — ready-made member parsers.
- `@produck/es-abstract-member-zod` — member parsers built from zod schemas.

## License

MIT

## Author

Produck
