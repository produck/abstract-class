import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as _ from '../src/index.mjs';

for (const { typeName, sample, parse } of [
	{ typeName: 'undefined', sample: {
		valid: [undefined],
		invalid: [[], {}, 1, true, Symbol(), 'bad', () => {}],
	}, parse: _.Undefined },
	{ typeName: 'object', sample: {
		valid: [{}, new Date(), [], null],
		invalid: [undefined, 1, 'bad', Symbol(), BigInt(1), true, () => {}],
	}, parse: _.Object },
	{ typeName: 'boolean', sample: {
		valid: [true, false],
		invalid: [undefined, 1, 'bad', Symbol(), BigInt(1), () => {}],
	}, parse: _.Boolean },
	{ typeName: 'number', sample: {
		valid: [1, NaN, 0.1, -1],
		invalid: [undefined, 'bad', Symbol(), BigInt(1), true, () => {}],
	}, parse: _.Number },
	{ typeName: 'bigint', sample: {
		valid: [],
		invalid: [],
	}, parse: _.BigInt },
	{ typeName: 'string', sample: {
		valid: [],
		invalid: [],
	}, parse: _.String },
	{ typeName: 'symbol', sample: {
		valid: [],
		invalid: [],
	}, parse: _.Symbol },
	{ typeName: 'function', sample: {
		valid: [],
		invalid: [],
	}, parse: _.Function },
]) {
	describe(`::${typeName}()`, () => {
		it('should pass with valid values.', () => {
			for (const value of sample.valid) {
				parse(value);
			}
		});

		it('should throw if invalid values.', () => {
			for (const value of sample.invalid) {
				assert.throws(() => parse(value), {
					name: 'TypeError',
					message: `Invalid member, one "${typeName}" expected.`,
				});
			}
		});
	});
}
