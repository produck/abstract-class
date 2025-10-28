import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Abstract, { Member } from '../src/index.mjs';

const FIELD_GROUP_TAG = Symbol.for('abstract.member.field.group');

const GOOD_PROPERTY_LIST = [
	'foo', 0, Symbol(),
];

const BAD_PROPERTY_LIST = [
	true, null, undefined, BigInt(1),
	[], {}, new Date(), () => {},
];

const BAD_MEMBER_LIST = [
	true, null, BigInt(1),
	[], {}, new Date(), () => {},
];

describe('::Member', () => {
	describe('::Member()~define()', () => {
		it('should throw if bad get.', () => {
			assert.throws(() => Member.Member(), {
				name: 'TypeError',
				message: 'Invalid "arg[0] as get", one "function" expected.',
			});
		});

		it('should throw if bad get.', () => {
			assert.throws(() => Member.Member(null), {
				name: 'TypeError',
				message: 'Invalid "arg[0] as get", one "function" expected.',
			});
		});

		it('should create a member', () => {
			assert.ok(typeof Member.Member(_ => _) === 'object');
		});
	});

	describe('.isMember()', () => {
		it('should be false.', () => {
			for (const badMember of BAD_MEMBER_LIST) {
				assert.equal(Member.isMember(badMember), false);
			}
		});

		it('should be true.', () => {
			assert.equal(Member.isMember(Member.Any), true);
		});
	});

	describe('.isProperty()', () => {
		it('should be false.', () => {
			for (const badProperty of BAD_PROPERTY_LIST) {
				assert.equal(Member.isProperty(badProperty), false);
			}
		});

		it('should be true.', () => {
			for (const goodProperty of GOOD_PROPERTY_LIST) {
				assert.equal(Member.isProperty(goodProperty), true);
			}
		});
	});

	describe('.Any', () => {
		it('should be a member as any type existed.', () => {
			assert.ok('Any' in Member);
		});
	});
});

describe('AbstractToken', () => {
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
						message: 'Invalid "arg[0][\'foo\']", one "Member" expected.',
					});
				}

				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract({
						[Symbol('bar')]: badMember,
					}), {
						name: 'TypeError',
						message: 'Invalid "arg[0][\'Symbol(bar)\']", one "Member" expected.',
					});
				}
			});

			it('should return a FieldGroup.', () => {
				const group = Abstract({ foo: Member.Any });

				assert.ok(Object.hasOwn(group, FIELD_GROUP_TAG));
			});
		});

		describe('(property, member)', () => {
			it('should throw if bad property.', () => {
				for (const badProperty of BAD_PROPERTY_LIST) {
					if (typeof badProperty === 'function') {
						continue;
					}

					assert.throws(() => Abstract(badProperty, Member.Any), {
						name: 'TypeError',
						message: 'Invalid "args[0] as property", one "number | string | symbol" expected.',
					});
				}
			});

			it('should throw if bad member.', () => {
				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract('foo', badMember), {
						name: 'TypeError',
						message: 'Invalid "arg[1]", one "Member" expected.',
					});
				}
			});

			it('should return a FieldGroup.', () => {
				const group = Abstract('foo', Member.Any);

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
						message: 'Invalid "arg[0][\'foo\']", one "Member" expected.',
					});
				}

				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract.Static({
						[Symbol('bar')]: badMember,
					}), {
						name: 'TypeError',
						message: 'Invalid "arg[0][\'Symbol(bar)\']", one "Member" expected.',
					});
				}
			});

			it('should return a FieldGroup.', () => {
				const group = Abstract.Static({ foo: Member.Any });

				assert.ok(Object.hasOwn(group, FIELD_GROUP_TAG));
			});
		});

		describe('(property, member)', () => {
			it('should throw if bad property.', () => {
				for (const badProperty of BAD_PROPERTY_LIST) {
					assert.throws(() => Abstract.Static(badProperty, Member.Any), {
						name: 'TypeError',
						message: 'Invalid "args[0] as property", one "number | string | symbol" expected.',
					});
				}
			});

			it('should throw if bad member.', () => {
				for (const badMember of BAD_MEMBER_LIST) {
					assert.throws(() => Abstract.Static('foo', badMember), {
						name: 'TypeError',
						message: 'Invalid "arg[1]", one "Member" expected.',
					});
				}
			});

			it('should return a FieldGroup.', () => {
				const group = Abstract.Static('foo', Member.Any);

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
					message: 'Invalid "args[1]", one "FieldGroup" expcected.',
				});
			}
		});

		it('should define an abstract class without field groups.', () => {
			Abstract(Mock);
		});

		it('should define an abstract class with field groups.', () => {
			Abstract(Mock, ...[
				Abstract({
					foo: Member.Any,
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
