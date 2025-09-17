export const Symbol = Symbol();

export function Descriptor(get, set) {
	return Object.freeze({ get, set, [Symbol]: true });
}

export function isDescriptor(anyValue) {
	if (typeof anyValue !== 'object' || anyValue === null) {
		return false;
	}

	return Symbol in anyValue;
}
