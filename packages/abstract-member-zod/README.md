# @produck/es-abstract-member-zod

Declare the members of an abstract constructor with
[zod](https://zod.dev) schemas.

## Installation

```bash
npm install @produck/es-abstract-member-zod
```

`zod` (`^4.0.0`) is a peer dependency and has to be installed as well.

## Usage

```js
import Abstract from '@produck/es-abstract-token';
import { Zod } from '@produck/es-abstract-member-zod';
import * as zod from 'zod';

const AbstractSample = Abstract(
  class Sample {},
  ...[
    Abstract({
      config: Zod(
        zod.object({
          name: zod.string(),
          port: zod.int(),
        }),
      ),
    }),
  ],
);

class SubSample extends AbstractSample {
  config = { name: 'sample', port: 8080 };
}
```

## API

### `Zod(schema)` / `zodParserFactory(schema)`

Returns a parser validating a member against the given zod schema.

- Throws a `TypeError` when `schema` is not a zod type.
- The parser runs `schema.parse(value)` and returns `value` unchanged, so a
  member is typed as the **input** type of the schema, not its output type.
  For a schema using `.transform()` or `z.coerce`, that is the value the member
  actually holds.

## License

MIT

## Author

Produck
