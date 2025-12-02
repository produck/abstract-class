import * as Zod from 'zod';

export function zodParserFactory<T extends Zod.ZodType>(
	type: T
): (value: unknown) => Zod.infer<T>;

export { zodParserFactory as Zod };
