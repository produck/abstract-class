import * as assert from 'node:assert/strict';
import { it } from 'node:test';

import Abstract, { Member } from '../index.mjs';

it('should ok.', () => {
	const AbstractMock = Abstract(class extends WeakMap {
		foo() {
			return 'AbstractMockFoo';
		}

		getName() {
			return `is${this.name}`;
		}

		static Baz() {
			return 'AbstractMockStaticBaz';
		}
	}, ...[
		Abstract.Static({
			Foo: Member.Any,
			Bar: Member.Any,
		}),
		Abstract({
			name: Member.Any,
			bar: Member.Any,
		}),
	]);

	const AbstractSubMock = Abstract(class extends AbstractMock {

		static Foo() {
			return 'AbstractSubMockStaticFoo';
		}
	}, ...[

	]);

	class LooseSubMock extends AbstractSubMock {

	}

	class FullSubMock extends AbstractSubMock {
		name = 'full';

		bar() {
			return 'FullSubMockBar';
		}

		static Foo() {
			return 'FullSubMockStaticFoo';
		}

		static Bar() {
			return 'FullSubMockStaticBar';
		}
	}

	const loose = new LooseSubMock();
	const full = new FullSubMock();

	assert.ok(full instanceof FullSubMock);
	assert.ok(full instanceof AbstractSubMock);
	assert.ok(full instanceof AbstractMock);
	assert.ok(full instanceof WeakMap);

	assert.ok(loose instanceof LooseSubMock);
	assert.ok(loose instanceof AbstractSubMock);
	assert.ok(loose instanceof AbstractMock);
	assert.ok(loose instanceof WeakMap);

	loose.name = 'qux';
	assert.equal(loose.getName(), 'isqux');
});
