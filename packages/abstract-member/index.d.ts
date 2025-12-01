/* eslint-disable @typescript-eslint/no-empty-object-type */

import {
	ConstructorLike,
	NormalFunction,
	Any,
} from '@produck/es-abstract-token';

export function Instance<C extends ConstructorLike = ObjectConstructor>(
	constructor: C
): NormalFunction<InstanceType<C>>;

export const Undefined: NormalFunction<undefined>;
export const Object: NormalFunction<object>;
export const Boolean: NormalFunction<boolean>;
export const Number: NormalFunction<number>;
export const BigInt: NormalFunction<bigint>;
export const String: NormalFunction<string>;
export const Symbol: NormalFunction<symbol>;
export const Function: NormalFunction<NormalFunction>;

export { Any, Any as Unknown };

type ExtractReturnTypes<T extends readonly NormalFunction[]> = {
	[K in keyof T]: T[K] extends NormalFunction<infer R> ? R : never;
};

type MethodMember<
	HArg extends boolean = true,
	HRes extends boolean = true,
	HRet extends boolean = true,
	TArg extends readonly unknown[] = [],
	TRes = unknown,
	TRet = unknown
> = NormalFunction<(..._: [...TArg, ...TRes[]]) => TRet> &
	(HArg extends true
		? {
				args<PT extends readonly NormalFunction[]>(
					...parsers: PT
				): MethodMember<false, HRes, HRet, ExtractReturnTypes<PT>, TRes, TRet>;
		  }
		: {}) &
	(HRes extends true
		? {
				rest<P extends NormalFunction>(
					parser: P
				): MethodMember<HArg, false, HRet, TArg, ReturnType<P>, TRet>;
		  }
		: {}) &
	(HRet extends true
		? {
				returns<P extends NormalFunction>(
					parser: P
				): MethodMember<HArg, HRes, false, TArg, TRes, ReturnType<P>>;
		  }
		: {});

export const Method: () => MethodMember;
