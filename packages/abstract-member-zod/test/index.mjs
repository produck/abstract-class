import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as zod from 'zod';
import * as _ from '../src/index.mjs';

const mock = zod.object({
	foo: zod.boolean(),
	bar: zod.string(),
	baz: zod.int(),
});

describe('::Zod', () => {
	it('should throw if bad zod type.', () => {
		for (const sample of [null, 1, {}, [], new Date(), () => {}, true, 'foo']) {
			assert.throws(() => _.Zod(sample), {
				name: 'TypeError',
				message: 'Invalid "args[0]", one "ZodType" expected.',
			});
		}
	});

	it('should get a member.', () => {
		assert.ok(typeof _.Zod(mock) === 'function');
	});

	describe('>()', () => {
		it('should ok', () => {
			const sample = {
				foo: true,
				bar: 'qux',
				baz: 1,
			};

			assert.equal(_.Zod(mock)(sample), sample);

			assert.throws(() => _.Zod(mock)({}));
		});
	});
});
