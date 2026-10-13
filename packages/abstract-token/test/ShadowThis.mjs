import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { types } from 'node:util';

import Abstract, { ShadowThis } from '../src/index.mjs';

describe('ShadowThis()', () => {
  it('should give the caller object from the base constructor body.', () => {
    const set = new Set();
    let fromBody;

    class Base {
      constructor() {
        fromBody = ShadowThis(this);
        set.add(fromBody);
      }
    }

    const AbstractBase = Abstract(Base);

    class Sub extends AbstractBase {}

    const instance = new Sub();

    assert.equal(fromBody, instance);
    assert.ok(set.has(instance));
    assert.ok(types.isProxy(instance));
  });

  it('should give the caller object from an abstract layer body.', () => {
    const seen = [];
    let fromMiddle;

    class Base {}

    const Inner = Abstract(Base);

    class Mid extends Inner {
      constructor() {
        super();
        fromMiddle = ShadowThis(this);
        seen.push(this);
      }
    }

    const Outer = Abstract(Mid);

    class Leaf extends Outer {}

    const instance = new Leaf();

    assert.equal(types.isProxy(seen[0]), false);
    assert.equal(fromMiddle, instance);
  });

  it('should be idempotent for the returned instance.', () => {
    class Base {}

    const AbstractBase = Abstract(Base);

    class Sub extends AbstractBase {}

    const instance = new Sub();

    assert.equal(ShadowThis(instance), instance);
  });

  it('should validate members read through a shadow of the body.', () => {
    let fromBody;

    const AbstractBase = Abstract(
      class Base {
        constructor() {
          fromBody = ShadowThis(this);
        }
      },
      ...[
        Abstract({
          missing: (value) => value,
        }),
      ],
    );

    class Sub extends AbstractBase {}

    const instance = new Sub();

    assert.equal(fromBody, instance);
    assert.throws(() => fromBody.missing, {
      name: 'Error',
      message: 'Instance member "missing" must be implemented.',
    });
  });

  it('should throw if the argument is not an object.', () => {
    for (const badValue of [1, 'text', null, undefined, Symbol()]) {
      assert.throws(() => ShadowThis(badValue), {
        name: 'Error',
        message: 'ShadowThis() requires an object.',
      });
    }
  });

  it('should throw if the object is not of an abstract class.', () => {
    assert.throws(() => ShadowThis({}), {
      name: 'Error',
      message: 'ShadowThis() requires an instance of an abstract class.',
    });
  });
});
