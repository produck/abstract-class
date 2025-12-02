/** @param {import('zod').ZodType} type */
function zodParserFactory(type) {
	if (
		typeof type !== 'object' ||
		type === null ||
		type['~standard']?.vendor !== 'zod'
	) {
		throw TypeError('Invalid "args[0]", one "ZodType" expected.');
	}

	return function parseByZod(value) {
		type.parse(value);

		return value;
	};
}

export { zodParserFactory as Zod };
