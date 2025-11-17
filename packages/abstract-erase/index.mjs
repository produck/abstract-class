const passthrough = any => any;

export default Object.freeze(Object.assign(passthrough, {
	Static: passthrough,
	static: passthrough,
}));

const FN = {
	args: () => FN,
	rest: () => FN,
	returns: () => FN,
};

export { passthrough as defineMember };
export const fn = () => FN;
export { passthrough as any, passthrough as unknown };
