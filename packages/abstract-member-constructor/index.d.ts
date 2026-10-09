import { ConstructorLike, Parser } from '@produck/es-abstract-token';

/**
 * Asserts value is a constructor: a class, a `function` declaration, or a
 * built-in constructor such as `Array`.
 *
 * A value qualifies when it can be used in `class X extends value {}`. Arrow
 * functions and other non-constructable functions do not.
 */
export const Constructor: Parser<ConstructorLike>;

/**
 * Asserts value is a sub-constructor (derived class) of `Base`.
 *
 * `Base` itself does not pass: the value has to derive from it.
 *
 * @typeParam C - The base constructor being derived from.
 * @param Base - The constructor the value has to derive from.
 * @returns A parser that validates the value is a sub-constructor of `Base`.
 */
export function SubConstructorOf<C extends ConstructorLike>(
  Base: C,
): Parser<ConstructorLike>;
