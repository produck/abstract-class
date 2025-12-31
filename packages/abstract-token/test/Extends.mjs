import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Abstract, { SubConstructorProxy } from '../src/index.mjs';

describe('::ExtendsProxy()', () => {
	it('should throw if not constructable.', () => {
		assert.throws(() => SubConstructorProxy(null), {
			name: 'TypeError',
			message: 'Invalid "args[0]", one "constructible" expected.',
		});
	});

	it('should throw if not abstract consturctor.', () => {
		assert.throws(() => SubConstructorProxy(class {}), {
			name: 'Error',
			message: 'This constructor is NOT extend from an abstract one.',
		});
	});

	it('should throw if repeat creating extended proxy.', () => {
		const AbstractMock = Abstract(class Mock {});

		class SubMock extends AbstractMock {}

		SubConstructorProxy(SubMock);

		assert.throws(() => SubConstructorProxy(SubMock), {
			name: 'Error',
			message: 'Creating extending proxy at most once',
		});
	});

	it('should access target when parse.', () => {
		const nonce = Math.trunc(Math.random() * 1000);
		const fooFlags = [false, false];
		let flag = false;

		const AbstractMock = Abstract(class Mock {
			static nonce = nonce;
		}, ...[
			Abstract.Static({
				foo: (value, target) => {
					assert.equal(target.nonce, nonce);
					flag = true;

					return value;
				},
			}),
		]);

		const SubMock = SubConstructorProxy(class SubMock extends AbstractMock {
			// static foo = nonce;
			static get foo() {
				fooFlags[0] = true;

				return nonce;
			}
		});

		assert.equal(SubMock.foo, nonce);
		assert.deepEqual(fooFlags, [true, false]);
		assert.ok(flag);

		const SubSubMock = SubConstructorProxy(class SubSubMock extends SubMock {
			static get foo() {
				fooFlags[1] = true;

				return nonce;
			}
		});

		assert.equal(SubSubMock.foo, nonce);
		assert.deepEqual(fooFlags, [true, true]);
	});
});
