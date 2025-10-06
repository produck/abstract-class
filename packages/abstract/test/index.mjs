import * as assert from 'node:assert';
import { describe, it } from 'node:test';

import Abstract from '../src/index.mjs';
import { Instance, Static } from '../src/Constructor.mjs';

const MEMBER_VALUE_TRANSFORMER_TAG = Symbol.for('abstract.member.transform');

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
					message: '',
				});
			}
		});

		it('should define an abstract class without field groups.', () => {
			Abstract(Mock);
		});

		it('should define an abstract class with field groups.', () => {
			Abstract(Mock, {
				[Instance]: {
					foo: {
						get: _ => _,
						set: _ => _,
						[MEMBER_VALUE_TRANSFORMER_TAG]: true,
					},
				},
			});
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

				new SubMock();
			});
		});
	});

	describe('~AbstractInstanceFieldGroup()', () => {

	});

	function AbstractStaticFieldGroupDescribe() {

	}

	describe('.Static()', AbstractStaticFieldGroupDescribe);
	describe('.static()', AbstractStaticFieldGroupDescribe);
});

describe('MemberValueTransformer()', () => {

});
