const passthrough = any => any;

Object.assign(passthrough, {
	Static: passthrough,
	static: passthrough,
});

Object.freeze(passthrough);

export default passthrough;
export { passthrough as MemberAccessor };
