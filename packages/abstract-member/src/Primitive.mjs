import { defineMember } from '@produck/es-abstract-token';

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
	return defineMember(function parser(value) {
		if (typeof value !== typeName) {
			throw new TypeError(`Invalid member, one "${typeName}" expected.`);
		}

		return value;
	});
});
