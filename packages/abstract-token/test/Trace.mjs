import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Abstract from '../src/index.mjs';
import * as Trace from '../src/Trace.mjs';

describe('Trace', () => {
  it('should have no frame when idle.', () => {
    assert.equal(Trace.current(), null);
    assert.equal(Trace.depth(), 0);
  });

  it('should enter a frame for the base constructor.', () => {
    const observed = [];

    class Mock {
      constructor() {
        observed.push(Trace.depth(), Trace.current().target);
      }
    }

    const AbstractMock = Abstract(Mock);

    class SubMock extends AbstractMock {}

    new SubMock();

    assert.deepEqual(observed, [1, Mock]);
    assert.equal(Trace.depth(), 0);
  });

  it('should nest frames of independent constructions.', () => {
    const observed = [];

    class Inner {
      constructor() {
        observed.push(Trace.depth(), Trace.current().newTarget);
      }
    }

    const AbstractInner = Abstract(Inner);

    class InnerSub extends AbstractInner {}

    class Outer {
      constructor() {
        observed.push(Trace.depth(), Trace.current().newTarget);
        this.inner = new InnerSub();
        observed.push(Trace.depth(), Trace.current().newTarget);
      }
    }

    const AbstractOuter = Abstract(Outer);

    class OuterSub extends AbstractOuter {}

    new OuterSub();

    assert.deepEqual(observed, [1, OuterSub, 2, InnerSub, 1, OuterSub]);
  });

  it('should keep frames apart for reentrant constructions.', () => {
    const depths = [];

    class Rec {
      constructor(next) {
        depths.push([Trace.depth(), Trace.current().newTarget]);

        if (next > 0) {
          this.child = new RecSub(next - 1);
        }
      }
    }

    const AbstractRec = Abstract(Rec);

    class RecSub extends AbstractRec {}

    new RecSub(2);

    assert.deepEqual(depths, [
      [1, RecSub],
      [2, RecSub],
      [3, RecSub],
    ]);
    assert.equal(Trace.depth(), 0);
  });

  it('should exit the frame when the constructor throws.', () => {
    class Boom {
      constructor() {
        throw new Error('boom');
      }
    }

    const AbstractBoom = Abstract(Boom);

    class BoomSub extends AbstractBoom {}

    assert.throws(() => new BoomSub(), { message: 'boom' });
    assert.equal(Trace.depth(), 0);
    assert.equal(Trace.current(), null);
  });

  it('should have no residue when a derived constructor throws.', () => {
    class Boom {}

    const AbstractBoom = Abstract(Boom);

    class BoomSub extends AbstractBoom {
      constructor() {
        super();

        throw new Error('derived boom');
      }
    }

    assert.throws(() => new BoomSub(), { message: 'derived boom' });
    assert.equal(Trace.depth(), 0);
  });

  it('should exit both frames when a nested construction throws.', () => {
    const observed = [];

    class Inner {
      constructor() {
        observed.push([Trace.depth(), Trace.current().newTarget]);

        throw new Error('inner boom');
      }
    }

    const AbstractInner = Abstract(Inner);

    class InnerSub extends AbstractInner {}

    class Outer {
      constructor() {
        new InnerSub();
      }
    }

    const AbstractOuter = Abstract(Outer);

    class OuterSub extends AbstractOuter {}

    assert.throws(() => new OuterSub(), { message: 'inner boom' });
    assert.deepEqual(observed, [[2, InnerSub]]);
    assert.equal(Trace.depth(), 0);
    assert.equal(Trace.current(), null);
  });

  it('should exit the outer frame when it throws after a nested one.', () => {
    class Inner {}

    const AbstractInner = Abstract(Inner);

    class InnerSub extends AbstractInner {}

    class Outer {
      constructor() {
        this.inner = new InnerSub();

        throw new Error('outer boom');
      }
    }

    const AbstractOuter = Abstract(Outer);

    class OuterSub extends AbstractOuter {}

    assert.throws(() => new OuterSub(), { message: 'outer boom' });
    assert.equal(Trace.depth(), 0);
    assert.equal(Trace.current(), null);
  });
});
