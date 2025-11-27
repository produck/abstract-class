import {
	MemberOperand,
	ConstructorLike,
	NormalFunction,
	Any, Unknown,
} from '@produck/es-abstract-token';

export function Instance<
	C extends ConstructorLike = ObjectConstructor
>(constructor: C): MemberOperand<InstanceType<C>>;

export const Undefined: MemberOperand<undefined>;
export const Object: MemberOperand<object>;
export const Boolean: MemberOperand<boolean>;
export const Number: MemberOperand<number>;
export const BigInt: MemberOperand<bigint>;
export const String: MemberOperand<string>;
export const Symbol: MemberOperand<symbol>;
export const Function: MemberOperand<NormalFunction>;

export { Any, Unknown };
