import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as _ from '../src/index.mjs';

const BAD_PARSERS = [null, undefined, 1, 'bad', true, {}, []];
const identity = v => v;

for (const { name, factory } of [
	{ name: 'Promise', factory: _.Promise },
	{ name: 'OrPromise', factory: _.OrPromise },
	{ name: 'PromiseLike', factory: _.PromiseLike },
	{ name: 'OrPromiseLike', factory: _.OrPromiseLike },
]) {
	describe(`::${name}()`, () => {
		it('should throw if bad parser.', () => {
			for (const value of BAD_PARSERS) {
				assert.throws(() => factory(value), {
					name: 'TypeError',
					message: 'Invalid "args[0]", one "function" expected.',
				});
			}
		});

		it('should return a function.', () => {
			assert.equal(typeof factory(identity), 'function');
		});
	});
}

describe('::Promise()', () => {
	it('should throw if value is not a Promise.', () => {
		for (const value of [null, undefined, 1, 'bad', {}, []]) {
			assert.throws(() => _.Promise(identity)(value), {
				name: 'TypeError',
				message: 'Invalid "member", one "Promise" expected.',
			});
		}
	});

	it('should pass with a Promise and apply parser.', async () => {
		const result = await _.Promise(v => v * 2)(Promise.resolve(5));

		assert.equal(result, 10);
	});
});

describe('::OrPromise()', () => {
	it('should apply parser directly for non-Promise value.', () => {
		assert.equal(_.OrPromise(v => v * 2)(5), 10);
	});

	it('should apply parser via .then() for Promise value.', async () => {
		const result = await _.OrPromise(v => v * 2)(Promise.resolve(5));

		assert.equal(result, 10);
	});
});

describe('::PromiseLike()', () => {
	it('should throw if value is not PromiseLike.', () => {
		for (const value of [null, undefined, 1, 'bad', {}]) {
			assert.throws(() => _.PromiseLike(identity)(value), {
				name: 'TypeError',
				message: 'Invalid "member", one "PromiseLike" expected.',
			});
		}
	});

	it('should pass with a Promise.', async () => {
		const result = await _.PromiseLike(v => v * 2)(Promise.resolve(5));

		assert.equal(result, 10);
	});

	it('should pass with a thenable.', async () => {
		const thenable = { then: (fn) => fn(5) };
		const result = _.PromiseLike(v => v * 2)(thenable);

		assert.equal(result, 10);
	});
});

describe('::OrPromiseLike()', () => {
	it('should apply parser directly for non-thenable value.', () => {
		assert.equal(_.OrPromiseLike(v => v * 2)(5), 10);
	});

	it('should apply parser via .then() for Promise value.', async () => {
		const result = await _.OrPromiseLike(v => v * 2)(Promise.resolve(5));

		assert.equal(result, 10);
	});

	it('should apply parser via .then() for thenable value.', () => {
		const thenable = { then: (fn) => fn(5) };
		const result = _.OrPromiseLike(v => v * 2)(thenable);

		assert.equal(result, 10);
	});
});
