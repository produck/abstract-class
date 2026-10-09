/**
 * A parser that asserts a value is of type `V`.
 *
 * `V` is the validated result type, while the raw input is always `unknown`
 * because the check happens at runtime.
 *
 * @typeParam V - The validated value type.
 * @typeParam T - The value the member is checked against.
 */
export type Parser<V = unknown, T = unknown> = (
  value?: unknown,
  target?: T,
) => V;

/** A map from member name to the parser checking that member. */
export type Field = Record<string | number | symbol, Parser>;

declare const Instance: unique symbol;
declare const Static: unique symbol;

/** The field group key holding the members defined on instances. */
export type Instance = typeof Instance;
/** The field group key holding the members defined on the constructor. */
export type Static = typeof Static;

/**
 * A set of parsers keyed by member name, split into the instance group and
 * the static group.
 *
 * Build one with `Abstract({ ... })`, `Abstract('name')` or
 * `Abstract.Static(...)` and pass it to `Abstract(Constructor, ...groups)`.
 */
export interface FieldGroup {
  [Instance]?: Field;
  [Static]?: Field;
}

/** A field group that declares no member. */
export type EmptyFieldGroup = {
  [Instance]: Record<never, never>;
  [Static]: Record<never, never>;
};

/** Any constructable value, such as a class or constructor function. */
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
          ...infer Rest extends readonly FieldGroup[],
        ]
      ? MergeFieldGroup<First, MergeAllFieldGroup<Rest>>
      : EmptyFieldGroup;

type MixinConstructor<
  C extends ConstructorLike,
  FG extends FieldGroup,
> = (abstract new (...args: ConstructorParameters<C>) => {
  [P in keyof InstanceType<C>]: InstanceType<C>[P];
} & {
  [P in keyof NonNullable<FG[Instance]>]: ReturnType<
    NonNullable<FG[Instance]>[P]
  >;
}) & {
  [P in keyof C]: C[P];
} & {
  [P in keyof NonNullable<FG[Static]>]: ReturnType<NonNullable<FG[Static]>[P]>;
};

interface FieldGroupGenerator<N extends Instance | Static> {
  /** Declares every member described by a field map. */
  <F extends Field>(field: F): { [key in N]: F };

  /**
   * Declares a single member.
   *
   * @param property - The member name.
   * @param parser - The parser checking the member value; omit it to only
   * require that the member is implemented.
   */
  <K extends number | symbol | string, P extends Parser>(
    property: K,
    parser?: P,
  ): {
    [key in N]: { [key in K]: P };
  };
}

type StaticFieldGroupGenerator = FieldGroupGenerator<Static>;

type AbstractToken = FieldGroupGenerator<Instance> & {
  /**
   * Defines an abstract constructor from a base constructor and field groups.
   *
   * @param Constructor - The base constructor to make abstract.
   * @param fieldList - The field groups describing the members to check.
   * @returns The abstract constructor; instantiating it directly throws.
   */
  <C extends ConstructorLike, FL extends readonly FieldGroup[]>(
    Constructor: C,
    ...fieldList: FL
  ): MixinConstructor<C, MergeAllFieldGroup<FL>>;

  /** Declares members on the constructor rather than on instances. */
  Static: StaticFieldGroupGenerator;
  /** Alias of `Static`. */
  static: StaticFieldGroupGenerator;
};

/**
 * Defines an abstract constructor (or class).
 *
 * Given a base constructor, it makes that constructor abstract. Given a field
 * map or a member name, it builds a field group.
 *
 * @example
 * ```js
 * import Abstract, { Any } from '@produck/es-abstract-token';
 *
 * const AbstractSample = Abstract(
 *   class Sample {},
 *   ...[Abstract({ foo: Any }), Abstract.Static('baz')],
 * );
 * ```
 */
declare const Abstract: AbstractToken;

export default Abstract;

/**
 * A parser that passes any value through without validation. Used as the
 * default parser when a declared member has none.
 */
export const Any: Parser;

/**
 * Creates the guarded proxy of a class extending an abstract constructor.
 *
 * Throws when `subConstructor` is not constructable, does not extend an
 * abstract constructor, or already has a proxy.
 *
 * @param subConstructor - A class extending an abstract constructor.
 * @returns The guarded proxy for the given constructor.
 */
export function SubConstructorProxy<C extends ConstructorLike>(
  subConstructor: C,
): C;
