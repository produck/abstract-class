import { ThrowTypeError } from '@produck/type-error';

/** @param {import('zod').ZodType} type */
function zodParserFactory(type) {
	if (
		typeof type !== 'object' ||
		type === null ||
		type['~standard']?.vendor !== 'zod'
	) {
		ThrowTypeError('args[0]', 'ZodType');
	}

	return function parseByZod(value) {
		type.parse(value);

		return value;
	};
}

export { zodParserFactory as Zod };
