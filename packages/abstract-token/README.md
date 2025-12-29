# @produck/es-abstract-token

An easy way to define abstract constructor (or class) in Javascript.

## Installation

```bash
npm install @produck/es-abstract-token
```

## Features

- **Following Convention**

  Providing methods to represent `abstract` & `static` opertators like other
	major programming languages. Making a native constructable function to be
	abstract in `Abstract`.

- **Abstract Constructor**

- **Abstract Member** Defining members in a way like traditional. There are
  classical reserved word

- **Member Field Instance/Static** Members to instances or members to a
  constructable.

- **NO Instantiation** There has been a mechanism to ensure that instantiation
  of an abstract constructable is prohibited.

- **Runtime Checking** Members implementation will be checked when they are
  accessed. Even if it is not fully implemented or incorrectly.

- **Reserved Word Style**

- **Erasing in Production**

## Quick Start

```js
import Abstract, { Any } from "@produck/es-abstract-token";

const AbstractSample = Abstract(
	class Sample {
		superMember = "foo";
	},
	...[
		Abstract({
			foo: Any,
		}),
		Abstract("bar"),
		Abstract.Static({
			baz: Any,
		}),
		Abstract.Static("qux"),
	]
);

// ❌ Error: Illegal construction on an abstract constructor.
new AbstractSample();

class Sample extends AbstractSample {
	foo = "implemented";
	static baz = "implemented";
}

// ✔ Creating a new instance is OK.
const sample = new Sample();

// ❌ Error: Instance member "bar" is NOT implemented.
sample.bar;

// ✔ Accessing `.foo` OK.
sample.foo;

// ❌ Error: Instance member "qux" is NOT implemented.
Sample.qux;

// ✔ Accessing `::baz` OK.
Sample.baz;
```

##

## API

## License

MIT

## Author

Produck
