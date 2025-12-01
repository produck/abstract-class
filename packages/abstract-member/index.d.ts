/* eslint-disable @typescript-eslint/no-empty-object-type */

import {
	MemberOperand,
	ConstructorLike,
	NormalFunction,
	Any,
	Unknown,
} from '@produck/es-abstract-token';

export function Instance<C extends ConstructorLike = ObjectConstructor>(
	constructor: C
): MemberOperand<InstanceType<C>>;

export const Undefined: MemberOperand<undefined>;
export const Object: MemberOperand<object>;
export const Boolean: MemberOperand<boolean>;
export const Number: MemberOperand<number>;
export const BigInt: MemberOperand<bigint>;
export const String: MemberOperand<string>;
export const Symbol: MemberOperand<symbol>;
export const Function: MemberOperand<NormalFunction>;

export { Any, Unknown };

type ExtractReturnTypes<T extends readonly NormalFunction[]> = {
	[K in keyof T]: T[K] extends NormalFunction<infer R> ? R : never;
};

type MethodMemberOperand<
	HArg extends boolean = true,
	HRes extends boolean = true,
	HRet extends boolean = true,
	TArg extends readonly unknown[] = [],
	TRes = unknown,
	TRet = unknown
> = MemberOperand<(...args: [...TArg, ...TRes[]]) => TRet> &
	(HArg extends true
		? {
				args<PT extends readonly NormalFunction[]>(
					...parsers: PT
				): MethodMemberOperand<
					false,
					HRes,
					HRet,
					ExtractReturnTypes<PT>,
					TRes,
					TRet
				>;
		  }
		: {}) &
	(HRes extends true
		? {
				rest<P extends NormalFunction>(
					parser: P
				): MethodMemberOperand<HArg, false, HRet, TArg, ReturnType<P>, TRet>;
		  }
		: {}) &
	(HRet extends true
		? {
				returns<P extends NormalFunction>(
					parser: P
				): MethodMemberOperand<HArg, HRes, false, TArg, TRes, ReturnType<P>>;
		  }
		: {});

export const Method: () => MethodMemberOperand;
