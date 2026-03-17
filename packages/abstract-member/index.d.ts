/* eslint-disable @typescript-eslint/no-empty-object-type */

import { ConstructorLike, Parser, Any } from '@produck/es-abstract-token';

/**
 * Asserts value is an instance of the given constructor.
 *
 * @param constructor - The constructor to check against.
 * @returns A parser that validates the value is an instance of the constructor.
 */
export function Instance<C extends ConstructorLike = ObjectConstructor>(
	constructor: C,
): Parser<InstanceType<C>>;

/** Asserts value is `undefined`. */
export const Undefined: Parser<undefined>;

/** Asserts value is of type `object` (including `null`). */
export const Object: Parser<object>;

/** Asserts value is of type `boolean`. */
export const Boolean: Parser<boolean>;

/** Asserts value is of type `number`. */
export const Number: Parser<number>;

/** Asserts value is of type `bigint`. */
export const BigInt: Parser<bigint>;

/** Asserts value is of type `string`. */
export const String: Parser<string>;

/** Asserts value is of type `symbol`. */
export const Symbol: Parser<symbol>;

/** Asserts value is of type `function`. */
export const Function: Parser<(...args: unknown[]) => unknown>;

/** Passes any value through without validation. */
export { Any, Any as Unknown };

/**
 * Extracts the return types from a tuple of parsers.
 */
type ExtractReturnTypes<T extends readonly Parser[]> = {
	[K in keyof T]: T[K] extends Parser<infer R> ? R : never;
};

/**
 * A method member parser with chainable operators.
 *
 * @typeParam HArg - Whether `.args()` is still available.
 * @typeParam HRes - Whether `.rest()` is still available.
 * @typeParam HRet - Whether `.returns()` is still available.
 * @typeParam TArg - The parsed argument types.
 * @typeParam TRes - The parsed rest argument type.
 * @typeParam TRet - The parsed return type.
 */
type MethodMember<
	HArg extends boolean = true,
	HRes extends boolean = true,
	HRet extends boolean = true,
	TArg extends readonly unknown[] = [],
	TRes = unknown,
	TRet = unknown,
> = Parser<(..._: [...TArg, ...TRes[]]) => TRet> &
	(HArg extends true
		? {
				/**
				 * Defines parsers for positional arguments.
				 *
				 * @param parsers - A parser for each positional argument.
				 * @returns The method member for chaining.
				 */
				args<PT extends readonly Parser[]>(
					...parsers: PT
				): MethodMember<false, HRes, HRet, ExtractReturnTypes<PT>, TRes, TRet>;
			}
		: {}) &
	(HRes extends true
		? {
				/**
				 * Defines a parser for rest (extra) arguments.
				 *
				 * @param parser - The parser applied to each rest argument.
				 * @returns The method member for chaining.
				 */
				rest<P extends Parser>(
					parser: P,
				): MethodMember<HArg, false, HRet, TArg, ReturnType<P>, TRet>;
			}
		: {}) &
	(HRet extends true
		? {
				/**
				 * Defines a parser for the return value.
				 *
				 * @param parser - The parser applied to the return value.
				 * @returns The method member for chaining.
				 */
				returns<P extends Parser>(
					parser: P,
				): MethodMember<HArg, HRes, false, TArg, TRes, ReturnType<P>>;
			}
		: {});

/**
 * Creates a method member with chainable `.args()`, `.rest()`, `.returns()`
 * operators.
 *
 * @returns A new method member parser.
 */
export const Method: () => MethodMember;

/**
 * Asserts value is a `Promise` and applies the parser to the resolved value.
 *
 * @param parser - The parser to apply to the resolved value.
 * @returns A parser that validates a `Promise` member.
 */
export function Promise<P extends Parser>(
	parser: P,
): Parser<globalThis.Promise<ReturnType<P>>>;

/**
 * Accepts a `Promise` or a plain value; applies the parser accordingly.
 *
 * @param parser - The parser to apply to the value.
 * @returns A parser that accepts either a `Promise` or a direct value.
 */
export function OrPromise<P extends Parser>(
	parser: P,
): Parser<ReturnType<P> | globalThis.Promise<ReturnType<P>>>;

/**
 * Asserts value is a thenable (PromiseLike) and applies the parser to the
 * resolved value.
 *
 * @param parser - The parser to apply to the resolved value.
 * @returns A parser that validates a thenable member.
 */
export function PromiseLike<P extends Parser>(
	parser: P,
): Parser<globalThis.PromiseLike<ReturnType<P>>>;

/**
 * Accepts a thenable or a plain value; applies the parser accordingly.
 *
 * @param parser - The parser to apply to the value.
 * @returns A parser that accepts either a thenable or a direct value.
 */
export function OrPromiseLike<P extends Parser>(
	parser: P,
): Parser<ReturnType<P> | globalThis.PromiseLike<ReturnType<P>>>;
