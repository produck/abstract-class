import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Constructor } from '../src/index.mjs';

const VALID_MEMBER_LIST = [
  Object,
  Array,
  Date,
  Error,
  Symbol,
  BigInt,
  class Sample {},
  class {},
  function sample() {},
];

const INVALID_MEMBER_LIST = [
  undefined,
  null,
  1,
  0,
  'sample',
  true,
  Symbol(),
  Math.min,
  new Date(),
  {},
  [],
  () => {},
];

describe('::Constructor()', () => {
  it('should get the member itself when it is a constructor.', () => {
    for (const member of VALID_MEMBER_LIST) {
      assert.equal(Constructor(member), member);
    }
  });

  it('should throw when the member is not a constructor.', () => {
    for (const member of INVALID_MEMBER_LIST) {
      assert.throws(() => Constructor(member), {
        name: 'TypeError',
        message: 'Invalid "member", one "constructible" expected.',
      });
    }
  });
});
