/* eslint-disable @typescript-eslint/no-empty-object-type */

export type NormalFunction<V = unknown> = (...args: unknown[]) => V;

type Field = Record<string | number | symbol, NormalFunction>;

declare const Instance: unique symbol;
declare const Static: unique symbol;

type Instance = typeof Instance;
type Static = typeof Static;

interface FieldGroup {
	[Instance]?: Field;
	[Static]?: Field;
}

type EmptyFieldGroup = { [Instance]: {}; [Static]: {} };
export type ConstructorLike = abstract new (...args: unknown[]) => unknown;

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
	[P in keyof FG[Instance]]: ReturnType<FG[Instance][P]>;
}) & {
	[P in keyof C]: C[P];
} & {
	[P in keyof FG[Static]]: ReturnType<FG[Static][P]>;
}

interface FieldGroupGenerator<N extends Instance | Static> {
	<F extends Field>(field: F): { [key in N]: F };

	<P extends number | symbol | string, M extends NormalFunction>(
		property: P,
		parser?: M
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

export const Any: NormalFunction;
