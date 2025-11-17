/* eslint-disable @typescript-eslint/no-empty-object-type */

type NormalFunction<V = unknown> = (...args: unknown[]) => V;

interface MemberOperand<V = unknown> {
	get: NormalFunction<V>;
}

type Field = Record<string | number | symbol, MemberOperand>;

declare const Instance: unique symbol;
declare const Static: unique symbol;

type Instance = typeof Instance;
type Static = typeof Static;

interface FieldGroup {
	[Instance]?: Field;
	[Static]?: Field;
}

type EmptyFieldGroup = { [Instance]: {}; [Static]: {} };
type ConstructorLike = abstract new (...args: unknown[]) => unknown;

type MergeFieldGroup<LFG extends FieldGroup, RFG extends FieldGroup> = {
	[Instance]: {} & LFG[Instance] & RFG[Instance];
	[Static]: {} & LFG[Static] & RFG[Static];
};

type MergeAllFieldGroup<T extends readonly FieldGroup[]> = T extends readonly []
	? EmptyFieldGroup
	: T extends readonly [infer First extends FieldGroup]
		? First
		: T extends readonly [
				infer First extends FieldGroup,
				...infer Rest extends readonly FieldGroup[]
			]
			? MergeFieldGroup<First, MergeAllFieldGroup<Rest>>
			: EmptyFieldGroup;

type MixinConstructor<
	C extends ConstructorLike,
	FG extends FieldGroup
> = (abstract new (...args: ConstructorParameters<C>) => {
	[P in keyof InstanceType<C>]: InstanceType<C>[P];
} & {
	[P in keyof FG[Instance]]: ReturnType<FG[Instance][P]['get']>;
}) & {
	[P in keyof C]: C[P];
} & {
	[P in keyof FG[Static]]: ReturnType<FG[Static][P]['get']>;
}

interface FieldGroupGenerator<N extends Instance | Static> {
	<F extends Field>(field: F): { [key in N]: F };

	<P extends number | symbol | string, M extends MemberOperand>(
		property: P,
		accessor?: M
	): {
		[key in N]: { [key in P]: M };
	};
}

type StaticFieldGroupGenerator = FieldGroupGenerator<Static>;

type AbstractToken = FieldGroupGenerator<Instance> & {
	<
		C extends ConstructorLike,
		FL extends readonly FieldGroup[]
	>(
		Constructor: C,
		...fieldList: FL
	): MixinConstructor<C, MergeAllFieldGroup<FL>>;

	Static: StaticFieldGroupGenerator;
	static: StaticFieldGroupGenerator;
};

declare const Abstract: AbstractToken;

export default Abstract;

export namespace Member {
	export function Member<T>(
		transform: (value: T) => T
	): MemberOperand<T>;

	export function isMember(value: unknown): boolean;
	export function isProperty(value: unknown): boolean;
	export const PROPERTY_TYPE_LIST: ['number', 'string', 'symbol'];
	export { Member as define };
	export const Any: MemberOperand;
}

export const any: MemberOperand;

type FnMemberOperand<
	HArg extends boolean = true,
	HRes extends boolean = true,
	HRet extends boolean = true
> = {
	get(value: NormalFunction): NormalFunction;
} & (
	HArg extends true ? { args(): FnMemberOperand<false, HRes, HRet> } : {}
) & (
	HRes extends true ? { rest(): FnMemberOperand<HArg, false, HRet> } : {}
) & (
	HRet extends true ? { returns(): FnMemberOperand<HArg, HRes, false> } : {}
) & MemberOperand;

type FunctionMemberOperandFactory = () => FnMemberOperand;

export const fn: FunctionMemberOperandFactory;
