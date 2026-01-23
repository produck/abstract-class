import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Abstract, { Any } from '../src/index.mjs';

const FIELD_GROUP_TAG = Symbol.for('abstract.member.field.group');

const BAD_PROPERTY_LIST = [
	true, null, undefined, BigInt(1),
	[], {}, new Date(), () => {},
];

const BAD_MEMBER_LIST = [
	true, null, BigInt(1),
	[], {}, new Date(),
];

describe('::AbstractToken', () => {
	class Mock {};

	describe('()', () => {
		it('should throw if operands length <1', () => {
			assert.throws(() => Abstract(), {
				name: 'SyntaxError',
				message: 'At least 1 operand is required.',
			});
		});
	});

	describe('~AbstractInstanceFieldGroup()', () => {
		// InstanceFieldGroup

		it('should throw if operands number >2.', () => {
			assert.throws(() => Abstract(0, 0, 0), {
				name: 'SyntaxError',
				message: 'The number of operands cannot exceed 2.',
			});
		});

		describe('(memberRecord)', () => {
			it('should throw if bad member record.', () => {
				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract({
						foo: badMember,
					}), {
						name: 'TypeError',
						message: 'Invalid "arg[0][\'foo\']", one "function" expected.',
					});
				}

				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract({
						[Symbol('bar')]: badMember,
					}), {
						name: 'TypeError',
						message: 'Invalid "arg[0][\'Symbol(bar)\']", one "function" expected.',
					});
				}
			});

			it('should return a FieldGroup.', () => {
				const group = Abstract({ foo: Any });

				assert.ok(Object.hasOwn(group, FIELD_GROUP_TAG));
			});
		});

		describe('(property, member)', () => {
			it('should throw if bad property.', () => {
				for (const badProperty of BAD_PROPERTY_LIST) {
					if (typeof badProperty === 'function') {
						continue;
					}

					assert.throws(() => Abstract(badProperty, Any), {
						name: 'TypeError',
						message: 'Invalid "args[0] as property", one "number | string | symbol" expected.',
					});
				}
			});

			it('should throw if bad member.', () => {
				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract('foo', badMember), {
						name: 'TypeError',
						message: 'Invalid "arg[1]", one "function" expected.',
					});
				}
			});

			it('should return a FieldGroup.', () => {
				const group = Abstract('foo', Any);

				assert.ok(Object.hasOwn(group, FIELD_GROUP_TAG));
			});
		});
	});

	describe('.Static()~AbstractStaticFieldGroup()', () => {
		// StaticFieldGroup

		it('should throw if no operand.', () => {
			assert.throws(() => Abstract.Static(), {
				name: 'SyntaxError',
				message: 'At least 1 operand is required.',
			});
		});

		it('should throw if operands number >2.', () => {
			assert.throws(() => Abstract.Static(0, 0, 0), {
				name: 'SyntaxError',
				message: 'The number of operands cannot exceed 2.',
			});
		});

		describe('(memberRecord)', () => {
			it('should throw if bad member record.', () => {
				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract.Static({
						foo: badMember,
					}), {
						name: 'TypeError',
						message: 'Invalid "arg[0][\'foo\']", one "function" expected.',
					});
				}

				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract.Static({
						[Symbol('bar')]: badMember,
					}), {
						name: 'TypeError',
						message: 'Invalid "arg[0][\'Symbol(bar)\']", one "function" expected.',
					});
				}
			});

			it('should return a FieldGroup.', () => {
				const group = Abstract.Static({ foo: Any });

				assert.ok(Object.hasOwn(group, FIELD_GROUP_TAG));
			});
		});

		describe('(property, member)', () => {
			it('should throw if bad property.', () => {
				for (const badProperty of BAD_PROPERTY_LIST) {
					assert.throws(() => Abstract.Static(badProperty, Any), {
						name: 'TypeError',
						message: 'Invalid "args[0] as property", one "number | string | symbol" expected.',
					});
				}
			});

			it('should throw if bad member.', () => {
				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract.Static('foo', badMember), {
						name: 'TypeError',
						message: 'Invalid "arg[1]", one "function" expected.',
					});
				}
			});

			it('should return a FieldGroup.', () => {
				const group = Abstract.Static('foo', Any);

				assert.ok(Object.hasOwn(group, FIELD_GROUP_TAG));
			});
		});
	});

	describe('.static', () => {
		it('should be same to ".Static".', () => {
			assert.equal(Abstract.Static, Abstract.static);
		});
	});

	describe('~AbstractConstructor()', () => {
		it('should throw if unconstructible function.', () => {
			assert.throws(() => Abstract(() => {}), {
				name: 'TypeError',
				message: 'Invalid "args[0]", one "constructible" expected.',
			});
		});

		it('should throw if bad field group.', () => {
			for (const badValue of [
				1, true, null, Symbol(), 'bad',
			]) {
				assert.throws(() => Abstract(Mock, badValue), {
					name: 'TypeError',
					message: 'Invalid "args[1]", one "FieldGroup" expected.',
				});
			}
		});

		it('should define an abstract class without field groups.', () => {
			Abstract(Mock);
		});

		it('should define an abstract class with field groups.', () => {
			Abstract(Mock, ...[
				Abstract({
					foo: Any,
				}),
			]);
		});

		describe('>ConstructorProxy', () => {
			it('should throw if new abstract constructor.', () => {
				assert.throws(() => {
					const AbstractMock = Abstract(Mock);

					new AbstractMock();
				}, {
					name: 'Error',
					message: 'Illegal construction on an abstract constructor.',
				});
			});

			it('should new an instance from sub class.', () => {
				const AbstractMock = Abstract(Mock);

				class SubMock extends AbstractMock {};

				const mock = new SubMock();

				assert.ok(mock instanceof SubMock);
				assert.ok(mock instanceof AbstractMock);
				assert.ok(mock instanceof Mock);
			});

			describe('<AbstractMember>', () => {
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
						Foo: Any,
						Bar: Any,
					}),
					Abstract({
						name: Any,
						bar: Any,
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

				describe('<Instance>', () => {
					it('should throw if not implemented.', () => {
						const loose = new LooseSubMock();

						assert.throws(() => loose.bar, {
							name: 'Error',
							message: 'Instance member "bar" is NOT implemented.',
						});
					});

					it('should call FullSubMock.bar()', () => {
						const full = new FullSubMock();

						assert.equal(full.bar(), 'FullSubMockBar');
					});

					it('should throw if no `.name`.', () => {
						const loose = new LooseSubMock();

						assert.throws(() => loose.getName(), {
							name: 'Error',
							message: 'Instance member "name" is NOT implemented.',
						});
					});

					it('should call .getName() by instance `.name` implementing.', () => {
						const loose = new LooseSubMock();

						loose.name = 'qux';
						assert.equal(loose.getName(), 'isqux');
					});

					it('should access target when parse.', () => {
						const nonce = Math.trunc(Math.random() * 1000);
						let flag = false;

						const AbstractMock = Abstract(class Mock {
							nonce = nonce;
						}, ...[
							Abstract({
								foo: (value, target) => {
									assert.equal(target, mock);
									flag = true;

									return value;
								},
							}),
						]);

						class SubMock extends AbstractMock {}

						const mock = new SubMock();

						mock.foo = nonce;
						assert.equal(mock.foo, nonce);
						assert.ok(flag);
					});
				});

				describe('<Static>', () => {
					it('should throw if not implemented.', () => {
						assert.throws(() => LooseSubMock.Bar, {
							name: 'Error',
							message: 'Static member "Bar" is NOT implemented.',
						});
					});

					it('should call AbstractSubMock.Foo()', () => {
						assert.equal(AbstractSubMock.Foo(), 'AbstractSubMockStaticFoo');
					});
				});
			});

		});
	});
});
