import { ThrowTypeError } from '@produck/type-error';

const TYPE_NAME_LIST = [
	'undefined',
	'object',
	'boolean',
	'number',
	'bigint',
	'string',
	'symbol',
	'function',
];

export const [
	Undefined,
	Object,
	Boolean,
	Number,
	BigInt,
	String,
	Symbol,
	Function,
] = TYPE_NAME_LIST.map(function PrimitiveTypeMember(typeName) {
	return function parsePrimitive(value) {
		if (typeof value !== typeName) {
			ThrowTypeError('member', typeName);
		}

		return value;
	};
});
