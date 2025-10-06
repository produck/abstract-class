export function isConstructor(value) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		(class extends value{});

		return true;
	} catch {
		return false;
	}
}

const PROPERTY_TYPE_LIST = ['number', 'string', 'symbol'];

export function assertProperty(value, role) {
	if (!PROPERTY_TYPE_LIST.includes(value)) {
		const message = [
			`Invalid "${role}", `,
			`one "${PROPERTY_TYPE_LIST.join(' | ')}" expected.`,
		].join('');

		throw new TypeError(message);
	}
}
