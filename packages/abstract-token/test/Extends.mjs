import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Abstract, {
  SCP,
  SubConstructorProxy,
  enableSubConstructorProxyCheck,
  disableSubConstructorProxyCheck,
} from '../src/index.mjs';

describe('::ExtendsProxy()', () => {
  it('should alias SCP to SubConstructorProxy.', () => {
    assert.equal(SCP, SubConstructorProxy);
  });
  it('should throw if not constructable.', () => {
    assert.throws(() => SubConstructorProxy(null), {
      name: 'TypeError',
      message: 'Invalid "args[0]", one "constructible" expected.',
    });
  });

  it('should throw if not abstract consturctor.', () => {
    assert.throws(() => SubConstructorProxy(class {}), {
      name: 'Error',
      message: 'This constructor is NOT extended from an abstract one.',
    });
  });

  it('should throw if repeat creating extended proxy.', () => {
    const AbstractMock = Abstract(class Mock {});

    class SubMock extends AbstractMock {}

    SubConstructorProxy(SubMock);

    assert.throws(() => SubConstructorProxy(SubMock), {
      name: 'Error',
      message: 'Extending proxy has already been created',
    });
  });

  it('should not check SCP by default.', () => {
    const AbstractMock = Abstract(class Mock {}, ...[Abstract.Static('foo')]);

    class SubMock extends AbstractMock {
      static foo = 1;
    }

    assert.doesNotThrow(() => new SubMock());
  });

  it('should throw if constructing the original class when check enabled.', () => {
    const AbstractMock = Abstract(class Mock {}, ...[Abstract.Static('foo')]);

    class SubMock extends AbstractMock {
      static foo = 1;
    }

    SubConstructorProxy(SubMock);
    enableSubConstructorProxyCheck();

    try {
      assert.throws(() => new SubMock(), {
        name: 'Error',
        message: 'It MUST SubConstructorProxy("SubMock").',
      });
    } finally {
      disableSubConstructorProxyCheck();
    }
  });

  it('should access target when parse.', () => {
    const nonce = Math.trunc(Math.random() * 1000);
    const fooFlags = [false, false];
    let flag = false;

    const AbstractMock = Abstract(
      class Mock {
        static nonce = nonce;
      },
      ...[
        Abstract.Static({
          foo: (value, target) => {
            assert.equal(target.nonce, nonce);
            flag = true;

            return value;
          },
        }),
      ],
    );

    const SubMock = SubConstructorProxy(
      class SubMock extends AbstractMock {
        // static foo = nonce;
        static get foo() {
          fooFlags[0] = true;

          return nonce;
        }
      },
    );

    assert.equal(SubMock.foo, nonce);
    assert.deepEqual(fooFlags, [true, false]);
    assert.ok(flag);

    const SubSubMock = SubConstructorProxy(
      class SubSubMock extends SubMock {
        static get foo() {
          fooFlags[1] = true;

          return nonce;
        }
      },
    );

    assert.equal(SubSubMock.foo, nonce);
    assert.deepEqual(fooFlags, [true, true]);
  });
});
