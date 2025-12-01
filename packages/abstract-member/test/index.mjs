import * as assert from 'node:assert/strict';
import { it } from 'node:test';

import { Any, Unknown } from '../src/index.mjs';

it('should export Any, Unknown', () => {
	assert.ok(Any === Unknown);
	assert.ok(typeof Any === 'function');
});

import './Primitive.mjs';
import './Instance.mjs';
import './Method.mjs';
