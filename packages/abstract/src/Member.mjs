const MEMBER_VALUE_TRANSFORMER_TAG = Symbol.for('abstract.member.transform');

export function Member(get) {
	if (typeof get !== 'function') {
		throw new TypeError('Invalid "arg[0] as get", one "function" expected.');
	}

	return Object.freeze({ get, [MEMBER_VALUE_TRANSFORMER_TAG]: true });
}

export function isMember(anyValue) {
	if (typeof anyValue !== 'object' || anyValue === null) {
		return false;
	}

	return Object.hasOwn(anyValue, MEMBER_VALUE_TRANSFORMER_TAG);
}

export const PROPERTY_TYPE_LIST = ['number', 'string', 'symbol'];

export function isProperty(value) {
	return PROPERTY_TYPE_LIST.includes(typeof value);
}

export { Member as define };
export const Any = Member(any => any);
