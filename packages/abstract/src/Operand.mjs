import { Member, Any } from './Member.mjs';
import { isConstructor } from './Constructor.mjs';
import { defineMethodMember } from './OperandMethod.mjs';

function PrimitiveTypeMember(typeName) {
	return Member(function parser(value) {
		if (typeof value !== typeName) {
			throw new TypeError(`Invalid member, one ${typeName} expected.`);
		}

		return value;
	});
}

export const Undefined = PrimitiveTypeMember('undefined');
export const Object = PrimitiveTypeMember('object');
export const Boolean = PrimitiveTypeMember('boolean');
export const Number = PrimitiveTypeMember('number');
export const BigInt = PrimitiveTypeMember('bigint');
export const String = PrimitiveTypeMember('string');
export const Symbol = PrimitiveTypeMember('symbol');
export const Function = PrimitiveTypeMember('function');

export function Instance(constructor) {
	if (!isConstructor(constructor)) {
		throw new TypeError('Invalid "args[0]", one "constructible" expected.');
	}

	return Member(function parser(value) {
		if (value instanceof constructor) {
			return value;
		}

		throw new TypeError(`Invalid member, one ${constructor.name} expected.`);
	});
}

export { Any, Any as Unknown };
export { defineMethodMember as Method };
