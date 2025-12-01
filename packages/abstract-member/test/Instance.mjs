import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as _ from '../src/index.mjs';

describe('::Instance()', () => {
	it('should throw if bad constructor.', () => {
		for (const sample of [
			() => {},
			1,
			async () => {},
			async function() {},
			function *() {},
		]) {
			assert.throws(() => _.Instance(sample), {
				name: 'TypeError',
				message: 'Invalid "args[0]", one "constructible" expected.',
			});
		}
	});

	it('should pass.', () => {
		_.Instance(Date).get(new Date());
	});

	it('should throw if instance-constructor not matched.', () => {
		assert.throws(() => _.Instance(Date).get([]), {
			name: 'TypeError',
			message: 'Invalid member, one "Date" expected.',
		});
	});
});
