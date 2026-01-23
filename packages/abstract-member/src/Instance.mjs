import { ThrowTypeError } from '@produck/type-error';

export function Instance(constructor) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		(class extends constructor {});
	} catch {
		ThrowTypeError('args[0]', 'constructible');
	}

	return function parseObject(value) {
		if (value instanceof constructor) {
			return value;
		}

		ThrowTypeError('member', constructor.name);
	};
}
