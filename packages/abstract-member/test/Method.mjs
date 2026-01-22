import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Abstract, { SubConstructorProxy } from '@produck/es-abstract-token';
import * as _ from '../src/index.mjs';

describe('::_.Method()', () => {
	it('should create a _.Method member.', () => {
		assert.ok(typeof _.Method() === 'function');
	});

	describe('.<operate>', function () {
		it('should throw if bad operate.', () => {
			assert.throws(() => _.Method().bad, {
				name: 'Error',
				message: 'Only "args, rest, returns" is available.',
			});
		});

		it('should be able to access `.get`', () => {
			assert.ok(typeof _.Method() === 'function');
		});

		describe('args()', () => {
			it('should throw if _.Any bad parser.', () => {
				assert.throws(() => _.Method().args(v => v, null), {
					name: 'TypeError',
					message: 'Invalid "args[1]", one "function" expected.',
				});
			});

			it('should get the member itself.', () => {
				assert.ok(typeof _.Method().args(v => v) === 'function');
			});

			it('should throw if called exceed once.', () => {
				assert.throws(() => _.Method().args(v => v).args(v => v), {
					name: 'Error',
					message: 'Operator .args() can only be called once.',
				});
			});
		});

		describe('rest()', () => {
			it('should throw if bad parser.', () => {
				assert.throws(() => _.Method().rest(null), {
					name: 'TypeError',
					message: 'Invalid "args[0]", one "function" expected.',
				});
			});

			it('should get the member itself.', () => {
				assert.ok(typeof _.Method().rest(v => v) === 'function');
			});

			it('should throw if called exceed once.', () => {
				assert.throws(() => _.Method().rest(v => v).rest(v => v), {
					name: 'Error',
					message: 'Operator .rest() can only be called once.',
				});
			});
		});

		describe('returns()', () => {
			it('should throw if bad parser.', () => {
				assert.throws(() => _.Method().returns(null), {
					name: 'TypeError',
					message: 'Invalid "args[0]", one "function" expected.',
				});
			});

			it('should get the member itself.', () => {
				assert.ok(typeof _.Method().returns(v => v) === 'function');
			});

			it('should throw if called exceed once.', () => {
				assert.throws(() => _.Method().returns(v => v).returns(v => v), {
					name: 'Error',
					message: 'Operator .returns() can only be called once.',
				});
			});
		});

		describe('~AbstractMember', () => {
			const AbstractMock = Abstract(class Mock {}, ...[
				Abstract({
					foo: _.Method(),
				}),
			]);

			it('should throw if bad implementation.', () => {
				class BadSubMock extends AbstractMock {
					foo = null;
				}

				const mock = new BadSubMock();

				assert.throws(() => mock.foo, {
					name: 'TypeError',
					message: 'Invalid member, one "function" expected.',
				});
			});

			it('should be checked by default schemas.', () => {
				class SubMock extends AbstractMock {
					foo() {};
				}

				const mock = new SubMock();

				mock.foo(null);
			});

			it('should be checked by schemas.', () => {
				const checked = {
					args: [false, false],
					rest: false,
					returns: false,
				};

				const AbstractMock = Abstract(class Mock {}, ...[
					Abstract({
						foo: _.Method()
							.args(...[
								() => checked.args[0] = true,
								() => checked.args[1] = true,
							])
							.rest(() => checked.rest = true)
							.returns(() => checked.returns = true),
					}),
				]);

				class SubMock extends AbstractMock {
					foo() {};
				}

				const mock = new SubMock();

				mock.foo(1, 2, 3);

				assert.deepEqual(checked, {
					args: [true, true],
					rest: true,
					returns: true,
				});
			});

			it('should access target when checking.', () => {
				const checked = {
					args: [false, false],
					rest: false,
					returns: false,
					static: {
						args: [false, false],
						rest: false,
						returns: false,
					},
				};

				const AbstractMock = Abstract(class Mock {}, ...[
					Abstract({
						foo: _.Method()
							.args((_, target) => {
								checked.args[0] = true;
								assert.equal(target, mock);
							})
							.rest((_, target) => {
								checked.rest = true;
								assert.equal(target, mock);
							})
							.returns((_, target) => {
								checked.returns = true;
								assert.equal(target, mock);
							}),
					}),
					Abstract.Static({
						foo: _.Method()
							.args((_, target) => {
								checked.static.args[0] = true;
								assert.equal(target, SubMock);
							})
							.rest((_, target) => {
								checked.static.rest = true;
								assert.equal(target, SubMock);
							})
							.returns((_, target) => {
								checked.static.returns = true;
								assert.equal(target, SubMock);
							}),
					}),
				]);

				const SubMock = SubConstructorProxy(class SubMock extends AbstractMock {
					foo() {};
					static foo() {};
				});

				const mock = new SubMock();

				mock.foo(1, 2, 3);
				SubMock.foo(1, 2, 3);

				assert.deepEqual(checked, {
					args: [true, false],
					rest: true,
					returns: true,
					static: {
						args: [true, false],
						rest: true,
						returns: true,
					},
				});
			});

			it.only('should throw throw if modifying used member.', () => {
				const member = _.Method();

				const AbstractMock = Abstract(class Mock {
					#private = 1;

					getPrivate() {
						return this.#private;
					}
				}, ...[
					Abstract({
						foo: member,
					}),
				]);

				class SubMock extends AbstractMock {
					foo() {
						this.getPrivate();
					};
				}

				const mock = new SubMock();

				mock.foo();

				assert.throws(() => member.args, {
					name: 'Error',
					message: 'This member is used then can not be modified.',
				});
			});

			it('should throw if called by invalid arguments.', () => {
				const AbstractMock = Abstract(class Mock {}, ...[
					Abstract({
						foo: _.Method().args(...[
							v => v,
							() => {
								throw new Error('foo');
							},
						]),
						bar: _.Method().args(...[
							v => v,
							v => v,
						]).rest(() => {
							throw new Error('foo');
						}),
					}),
				]);

				class SubMock extends AbstractMock {
					foo = () => {};
					bar = () => {};
				};

				const mock = new SubMock();

				assert.throws(() => mock.foo(1, 2), {
					name: 'Error',
					message: 'Invalid "args[1]".',
				});

				assert.throws(() => mock.foo(), {
					name: 'Error',
					message: 'Invalid "args[1]".',
				});

				assert.throws(() => mock.bar(1, 2, 3), {
					name: 'Error',
					message: 'Invalid "args[2]".',
				});
			});
		});
	});
});
