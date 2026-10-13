import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { types } from 'node:util';

import Abstract from '../src/index.mjs';

describe('layered abstraction', () => {
  describe('>this identity', () => {
    it('should wrap at the most abstract layer when bare.', () => {
      const seen = [];

      class Base {
        constructor() {
          seen.push(this);
        }
      }

      const Inner = Abstract(Base);

      class Mid extends Inner {
        constructor() {
          super();
          seen.push(this);
        }
      }

      const Outer = Abstract(Mid);

      class Leaf extends Outer {
        constructor() {
          super();
          seen.push(this);
        }
      }

      const instance = new Leaf();
      const [baseThis, midThis, leafThis] = seen;

      assert.equal(baseThis, midThis);
      assert.equal(types.isProxy(midThis), false);
      assert.equal(leafThis, instance);
      assert.ok(types.isProxy(instance));
      assert.notEqual(midThis, leafThis);
    });

    it('should validate members through the returned instance.', () => {
      const Outer = Abstract(
        class Base {},
        ...[
          Abstract({
            missing: (value) => value,
          }),
        ],
      );

      class Leaf extends Outer {}

      const instance = new Leaf();

      assert.throws(() => instance.missing, {
        name: 'Error',
        message: 'Instance member "missing" must be implemented.',
      });
    });
  });

  describe('>member override', () => {
    it('should let the most specific layer win.', () => {
      const calls = [];

      class Base {}

      const Inner = Abstract(
        Base,
        ...[
          Abstract({
            foo: (value) => {
              calls.push('inner');

              return `inner:${value}`;
            },
          }),
        ],
      );

      class Mid extends Inner {}

      const Outer = Abstract(
        Mid,
        ...[
          Abstract({
            foo: (value) => {
              calls.push('outer');

              return `outer:${value}`;
            },
          }),
        ],
      );

      class Leaf extends Outer {
        foo = 'x';
      }

      const leaf = new Leaf();

      assert.equal(leaf.foo, 'outer:x');
      assert.deepEqual(calls, ['outer']);
    });

    it('should walk up when the most specific layer lacks the member.', () => {
      const calls = [];

      class Base {}

      const Inner = Abstract(
        Base,
        ...[
          Abstract({
            foo: (value) => {
              calls.push('inner');

              return `inner:${value}`;
            },
          }),
        ],
      );

      class Mid extends Inner {}

      const Outer = Abstract(
        Mid,
        ...[
          Abstract({
            bar: (value) => {
              calls.push('outer');

              return `outer:${value}`;
            },
          }),
        ],
      );

      class Leaf extends Outer {
        foo = 'x';
        bar = 'y';
      }

      const leaf = new Leaf();

      assert.equal(leaf.foo, 'inner:x');
      assert.equal(leaf.bar, 'outer:y');
      assert.deepEqual(calls, ['inner', 'outer']);
    });
  });
});
