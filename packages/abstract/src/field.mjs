export const MemberSymbol = Symbol();

export function MemberAccessor(get, set) {
	return Object.freeze({ get, set, [Symbol]: true });
}

export function isMemberAccessor(anyValue) {
	if (typeof anyValue !== 'object' || anyValue === null) {
		return false;
	}

	return Object.hasOwn(anyValue, MemberSymbol);
}

const ANY_MEMBER = MemberAccessor(v => v, () => {});

const VALID_PROPERTY_TYPE_LIST = ['number', 'string', 'symbol'];
const VALID_PROPERTY_TYPE_NAME = VALID_PROPERTY_TYPE_LIST.join(' | ');

function assertProperty(value, role) {
	if (!VALID_PROPERTY_TYPE_LIST.includes(value)) {
		const message = [
			`Invalid "${role}", `,
			`one "${VALID_PROPERTY_TYPE_NAME}" expected.`,
		].join('');

		throw new TypeError(message);
	}
}

function assertMember(member, role) {
	if (!isMemberAccessor(member)) {
		throw new TypeError(`Invalid "${role}", one "MemberAccessor" expected.`);
	}
}

export function AbstractFieldGroupFactory(identity) {
	function AbstractFieldGroupByNamedMember(property, member = ANY_MEMBER) {
		assertProperty(property, 'arg[0]');
		assertMember(member, 'arg[1]');

		return Object.freeze({ [identity]: Object.freeze({ [property]: member }) });
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

		return Object.freeze({ [identity]: Object.freeze(record) });
	}

	function AbstractFieldGroup(...operands) {
		if (operands[0] === 'object') {
			return AbstractFieldGroupByMemberRecord(...operands);
		}

		return AbstractFieldGroupByNamedMember(...operands);
	}

	return Object.freeze(AbstractFieldGroup);
}
