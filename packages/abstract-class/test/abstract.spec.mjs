import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { abstract, Keyword as K } from '../src/index.mjs';

describe('::abstract()', function () {
	it('should throw if bad constructor.', () => {
		assert.throws(() => abstract(null), {
			name: 'TypeError',
			message: 'Invalid "constructor", one "function as constructor" expected.',
		});
	});

	it('should throw if bad abstractMembers.', () => {
		assert.throws(() => abstract(function () {}, true), {
			name: 'TypeError',
			message: 'Invalid "abstractMembers", one "object" expected.',
		});
	});

	it('should generate a abstract class.', () => {
		const Mock = abstract(class Mock {});

		assert.equal(Mock.name, 'Mock');
	});

	describe('::<abstract> Class', () => {
		class Mock {}

		it('should throw if new().', () => {
			const AstMock = abstract(Mock);

			assert.throws(() => new AstMock(), {
				name: 'Error',
				message: 'Cannot create an instance of the abstract class \'Mock\'.',
			});
		});

		it('should throw if bad abstract member keywords term.', () => {
			assert.throws(() => abstract(Mock, {
				foo: [null],
			}), {
				name: 'Error',
				message: 'Bad term at foo[0]. It MUST be from keywords.',
			});
		});

		it('should throw if value & function.', () => {
			for (const keywords of [
				[K.GET, K.FUNCTION],
				[K.SET, K.FUNCTION],
			]) {
				assert.throws(() => abstract(Mock, {
					foo: keywords,
				}), {
					name: 'Error',
					message: 'A member CAN NOT be property value and funtion at once.',
				});
			}
		});

		it('should throw if neither value nor function.', () => {
			assert.throws(() => abstract(Mock, { foo: [] }), {
				name: 'Error',
				message: 'A member MUST be one of property value or funtion.',
			});
		});

		it('should throw if member NOT implemented.', () => {
			const AbstractMock = abstract(class Mock {}, {
				foo: [K.GET, K.SET],
			});

			class Foo extends AbstractMock {}

			assert.throws(() => new Foo(), {
				name: 'Error',
				message: 'Abstract member "Mock.foo" is NOT implemented',
			});
		});

		it('should throw if options.func bad function implementd.', () => {
			const AbstractMock = abstract(class Mock {}, {
				foo: [K.FUNCTION],
			});

			class Foo extends AbstractMock {
				get foo () {
					return 1;
				}
			}

			assert.throws(() => new Foo(), {
				name: 'Error',
				message: 'There MUST be ".value" in descriptor if abstract member(foo) is a function.',
			});
		});

		it('should throw if options.func bad not function.', () => {
			const AbstractMock = abstract(class Mock {}, {
				foo: [K.FUNCTION],
			});

			class Foo extends AbstractMock {}

			Foo.prototype.foo = 1;

			assert.throws(() => new Foo(), {
				name: 'Error',
				message: 'A ".value" MUST be a function if abstract member(foo) is a function.',
			});
		});

		it('should throw if options.func bad not function.', () => {
			const AbstractMock = abstract(class Mock {}, {
				foo: [K.GET],
			});

			class Foo extends AbstractMock {
				foo() {}
			}

			assert.throws(() => new Foo(), {
				name: 'Error',
				message: 'A ".value" MUST NOT be a function if abstract member is a value and there is ".value" in descriptor.',
			});
		});

		it('should throw if options.func bad not function.', () => {
			const AbstractMock = abstract(class Mock {}, {
				foo: [K.SET],
			});

			class Foo extends AbstractMock {}
			Foo.prototype.foo = 1;

			assert.throws(() => new Foo(), {
				name: 'Error',
				message: 'It CAN NOT be readonly value if abstract member is a value and there is ".value" in descriptor.',
			});
		});

		it('should new from a concrete class.', () => {
			const AbstractMock = abstract(class Mock {}, {
				foo: [K.GET, K.SET],
				bar: [K.FUNCTION],
			});

			class Foo extends AbstractMock {
				get foo() {
					return 1;
				}

				set foo(v) {
					v();
				}

				bar() {}
			}

			new Foo();
			new Foo();
		});
	});
});
