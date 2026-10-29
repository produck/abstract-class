import * as Zod from 'zod';

/**
 * Builds a parser from a zod schema.
 *
 * @typeParam T - The zod schema being used.
 * @param type - The zod schema describing the member value.
 * @returns A parser that validates the value with the given schema and returns
 * it unchanged, typed as the input type of the schema.
 */
export function zodParserFactory<T extends Zod.ZodType>(
  type: T,
): (value: unknown) => Zod.input<T>;

export { zodParserFactory as Zod };
