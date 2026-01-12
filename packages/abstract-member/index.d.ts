/* eslint-disable @typescript-eslint/no-empty-object-type */

import {
	ConstructorLike,
	Parser,
	Any,
} from '@produck/es-abstract-token';

export function Instance<C extends ConstructorLike = ObjectConstructor>(
	constructor: C
): Parser<InstanceType<C>>;

export const Undefined: Parser<undefined>;
export const Object: Parser<object>;
export const Boolean: Parser<boolean>;
export const Number: Parser<number>;
export const BigInt: Parser<bigint>;
export const String: Parser<string>;
export const Symbol: Parser<symbol>;
export const Function: Parser<Parser>;

export { Any, Any as Unknown };

type ExtractReturnTypes<T extends readonly Parser[]> = {
	[K in keyof T]: T[K] extends Parser<infer R> ? R : never;
};

type MethodMember<
	HArg extends boolean = true,
	HRes extends boolean = true,
	HRet extends boolean = true,
	TArg extends readonly unknown[] = [],
	TRes = unknown,
	TRet = unknown
> = Parser<(..._: [...TArg, ...TRes[]]) => TRet> &
	(HArg extends true
		? {
				args<PT extends readonly Parser[]>(
					...parsers: PT
				): MethodMember<false, HRes, HRet, ExtractReturnTypes<PT>, TRes, TRet>;
		  }
		: {}) &
	(HRes extends true
		? {
				rest<P extends Parser>(
					parser: P
				): MethodMember<HArg, false, HRet, TArg, ReturnType<P>, TRet>;
		  }
		: {}) &
	(HRet extends true
		? {
				returns<P extends Parser>(
					parser: P
				): MethodMember<HArg, HRes, false, TArg, TRes, ReturnType<P>>;
		  }
		: {});

export const Method: () => MethodMember;
