export function Instance(constructor) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		(class extends constructor {});
	} catch {
		throw new TypeError('Invalid "args[0]", one "constructible" expected.');
	}

	return function parseObject(value) {
		if (value instanceof constructor) {
			return value;
		}

		throw new TypeError(`Invalid member, one "${constructor.name}" expected.`);
	};
}
