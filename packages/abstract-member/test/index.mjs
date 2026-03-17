import * as assert from 'node:assert/strict';
import { it } from 'node:test';

import { Any, Unknown } from '../src/index.mjs';

it('should export Any, Unknown', () => {
	assert.ok(Any === Unknown);
	assert.ok(typeof Any === 'function');
});

import './Primitive.spec.mjs';
import './Instance.spec.mjs';
import './Method.spec.mjs';
import './Promise.spec.mjs';
