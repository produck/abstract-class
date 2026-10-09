import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SubConstructorOf } from '../src/index.mjs';

class Animal {}
class Dog extends Animal {}
class Bulldog extends Dog {}

const INVALID_BASE_LIST = [
  undefined,
  null,
  1,
  'Animal',
  {},
  [],
  () => {},
  Symbol(),
];

const INVALID_MEMBER_LIST = [
  Animal,
  Object,
  Number,
  1,
  'Animal',
  null,
  {},
  [],
  () => {},
];

describe('::SubConstructorOf()', () => {
  it('should throw when the base is not a constructor.', () => {
    for (const Base of INVALID_BASE_LIST) {
      assert.throws(() => SubConstructorOf(Base), {
        name: 'TypeError',
        message: 'Invalid "args[0]", one "constructible" expected.',
      });
    }
  });

  describe('>()', () => {
    it('should get the member itself when it derives from the base.', () => {
      const memberList = [Dog, Bulldog, class Cat extends Animal {}];

      for (const member of memberList) {
        assert.equal(SubConstructorOf(Animal)(member), member);
      }
    });

    it('should accept a built-in constructor as the base.', () => {
      assert.equal(SubConstructorOf(Object)(Array), Array);
    });

    it('should throw when the member does not derive from the base.', () => {
      for (const member of INVALID_MEMBER_LIST) {
        assert.throws(() => SubConstructorOf(Animal)(member), {
          name: 'TypeError',
          message:
            'Invalid "member", one "sub-constructor of Animal" expected.',
        });
      }
    });
  });
});
