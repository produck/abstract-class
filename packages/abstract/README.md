# @produck/es-abstract

Convenience entry that re-exports the abstract-class toolkit.

## Installation

```bash
npm install @produck/es-abstract
```

## Usage

<!-- prettier-ignore -->
```js
import Abstract, {
  Member as M,
  SubConstructorProxy,
} from '@produck/es-abstract';

export default Abstract(class Sample {
  get bar() {
    return 'hello';
  }
}, ...[
  Abstract({ foo: M.String }),
  Abstract.Static('qux', M.Boolean)
]);
```

## Exports

- default export — `Abstract`, re-exported from
  `@produck/es-abstract-token`.
- `SubConstructorProxy` — re-exported from `@produck/es-abstract-token`.
- `ShadowThis` — re-exported from `@produck/es-abstract-token`.
- `enableSubConstructorProxyCheck` / `disableSubConstructorProxyCheck` —
  re-exported from `@produck/es-abstract-token`.
- `Member` — the namespace of `@produck/es-abstract-member`.

## Packages

- [`@produck/es-abstract-token`](https://www.npmjs.com/package/@produck/es-abstract-token)
  — the abstract constructor and field groups.
- `@produck/es-abstract-member` — ready-made member parsers.
- `@produck/es-abstract-member-zod` — member parsers built from zod schemas.

## License

MIT

## Author

Produck
