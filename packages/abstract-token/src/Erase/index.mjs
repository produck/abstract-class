const passthrough = (any) => any;

export default Object.freeze(
	Object.assign(passthrough, {
		Static: passthrough,
		static: passthrough,
	}),
);

export {
	passthrough as Any,
	passthrough as Unknown,
	passthrough as SubConstructorProxy,
};
