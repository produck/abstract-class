# @produck/es-abstract-member-constructor

Constructor parsers for declaring the members of an abstract constructor
built with `@produck/es-abstract-token`.

## Installation

```bash
npm install @produck/es-abstract-member-constructor
```

## Usage

```js
import Abstract, { SubConstructorProxy } from '@produck/es-abstract-token';
import {
  Constructor,
  SubConstructorOf,
} from '@produck/es-abstract-member-constructor';

class Loader {}

const AbstractSource = Abstract(
  class Source {},
  ...[
    Abstract({ Parser: Constructor }),
    Abstract.Static('Loader', SubConstructorOf(Loader)),
  ],
);

class JsonSource extends AbstractSource {
  Parser = class JsonParser {};

  static Loader = class JsonLoader extends Loader {};
}

SubConstructorProxy(JsonSource).Loader; // JsonLoader
```

## API

### `Constructor`

Asserts the member value is a constructor: a class, a `function` declaration,
or a built-in constructor such as `Array`.

A value qualifies when it can be used in `class X extends value {}`. Arrow
functions and other non-constructable functions do not, while `Symbol` and
`BigInt` do — even though `new Symbol()` throws.

### `SubConstructorOf(Base)`

Returns a parser asserting the member value is a sub-constructor (derived
class) of `Base`.

- Throws a `TypeError` when `Base` is not a constructor.
- `Base` itself does not pass: the value has to derive from it.

```js
class Animal {}
class Dog extends Animal {}

SubConstructorOf(Animal)(Dog); // Dog
SubConstructorOf(Animal)(Animal); // throws
```

### Static members

A static member declared on a subclass itself is not checked: the property is
found on the subclass before the abstract constructor proxy is reached. Wrap
the subclass with `SubConstructorProxy` to have its static members validated.

```js
SubConstructorProxy(JsonSource).Loader; // JsonLoader
```

## License

MIT

## Author

Produck
