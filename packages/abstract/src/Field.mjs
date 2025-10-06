import * as Utils from './utils.mjs';

const MEMBER_VALUE_TRANSFORMER_TAG = Symbol.for('abstract.member.transform');

export function MemberValueTransformer(get, set = get) {
	return Object.freeze({ get, set, [MEMBER_VALUE_TRANSFORMER_TAG]: true });
}

export function isMemberValueTransformer(anyValue) {
	if (typeof anyValue !== 'object' || anyValue === null) {
		return false;
	}

	return Object.hasOwn(anyValue, MEMBER_VALUE_TRANSFORMER_TAG);
}

const ANY_MEMBER = MemberValueTransformer(v => v);

function assertMember(member, role) {
	if (!isMemberValueTransformer(member)) {
		throw new TypeError(`Invalid "${role}", one "MemberAccessor" expected.`);
	}
}

export function AbstractFieldGroupFactory(symbol) {
	function AbstractFieldGroupByNamedMember(property, member = ANY_MEMBER) {
		Utils.assertProperty(property, 'arg[0]');
		assertMember(member, 'arg[1]');

		return Object.freeze({ [symbol]: Object.freeze({ [property]: member }) });
	}

	function AbstractFieldGroupByMemberRecord(memberRecord) {
		const record = {};

		for (const property of [
			...Object.getOwnPropertyNames(memberRecord),
			...Object.getOwnPropertySymbols(memberRecord),
		]) {
			const member = memberRecord[member];

			assertMember(member, `arg[0][${String(property)}]`);
			record[property] = member;
		}

		return Object.freeze({ [symbol]: Object.freeze(record) });
	}

	function AbstractFieldGroup(...operands) {
		if (operands[0] === 'object') {
			return AbstractFieldGroupByMemberRecord(...operands);
		}

		return AbstractFieldGroupByNamedMember(...operands);
	}

	return Object.freeze(AbstractFieldGroup);
}
