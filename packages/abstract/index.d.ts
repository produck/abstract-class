interface MemberAccessor<V = unknown> {
	get(): V;
	set?(value: V): void;
}

type Field = Record<string | number | symbol, MemberAccessor>;

declare const Instance: unique symbol;
declare const Static: unique symbol;

type Instance = typeof Instance;
type Static = typeof Static;

interface FieldGroup {
	[Instance]?: Field;
	[Static]?: Field;
}

type ConstructorLike = abstract new (...args: unknown[]) => unknown;

type MergeFieldGroup<LFG extends FieldGroup, RFG extends FieldGroup> = {
	[Instance]: {} & LFG[Instance] & RFG[Instance];
	[Static]: {} & LFG[Static] & RFG[Static];
};

type MergeAllFieldGroup<T extends readonly FieldGroup[]> = T extends readonly []
	? Required<FieldGroup>
	: T extends readonly [infer First extends FieldGroup]
		? First
		: T extends readonly [
				infer First extends FieldGroup,
				...infer Rest extends readonly FieldGroup[]
			]
			? MergeFieldGroup<First, MergeAllFieldGroup<Rest>>
			: Required<FieldGroup>;

type MixinConstructor<C extends ConstructorLike, FG extends FieldGroup> = C & {
	[key in keyof FG[Static]]: ReturnType<FG[Static][key]['get']>;
} & {
	new (...args: ConstructorParameters<C>): InstanceType<C> & {
		[key in keyof FG[Instance]]: ReturnType<FG[Instance][key]['get']>;
	};
};

interface FieldGroupGenerator<N extends Instance | Static> {
	<F extends Field>(field: F): { [key in N]: F };

	<P extends number | symbol | string, M extends MemberAccessor>(
		property: P,
		accessor?: M
	): {
		[key in N]: { [key in P]: M };
	};
}

type AbstractToken = FieldGroupGenerator<Instance> & {
	<C extends ConstructorLike, FL extends readonly FieldGroup[]>(
		Constructor: C,
		...fieldList: FL
	): MixinConstructor<C, MergeAllFieldGroup<FL>>;

	Static: FieldGroupGenerator<Static>;
};

export const Abstract: AbstractToken;
