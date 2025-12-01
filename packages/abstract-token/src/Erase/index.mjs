const passthrough = any => any;

export default Object.freeze(Object.assign(passthrough, {
	Static: passthrough,
	static: passthrough,
}));

export { passthrough as isMember };
export { passthrough as defineMember };
export { passthrough as Any, passthrough as Unknown };
