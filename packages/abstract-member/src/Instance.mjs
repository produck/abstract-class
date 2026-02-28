import { isConstructor } from '@produck/is-constructor';
import { ThrowTypeError } from '@produck/type-error';

export function Instance(constructor) {
	if (!isConstructor(constructor)) {
		ThrowTypeError('args[0]', 'constructible');
	}

	return function parseObject(value) {
		if (value instanceof constructor) {
			return value;
		}

		ThrowTypeError('member', constructor.name);
	};
}
