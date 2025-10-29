const passthrough = any => any;

export default Object.freeze(Object.assign(passthrough, {
	Static: passthrough,
	static: passthrough,
}));

export const Member = Object.freeze({ Any: {} });
