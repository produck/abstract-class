import { AbstractConstructor, Instance, Static } from './constructor.mjs';
import { AbstractFieldGroupFactory, MemberValueTransformer } from './field.mjs';

const AbstractInstanceFieldGroup = AbstractFieldGroupFactory(Instance);
const AbstractStaticFieldGroup = AbstractFieldGroupFactory(Static);

function AbstractToken(...operands) {
	const { length } = operands;

	if (length < 1) {
		throw new SyntaxError('At least 1 operand is required.');
	}

	if (typeof operands[0] === 'function') {
		return AbstractConstructor(...operands);
	}

	return AbstractInstanceFieldGroup(...operands);
}

Object.assign(AbstractToken, {
	Static: AbstractStaticFieldGroup,
	static: AbstractStaticFieldGroup,
});

Object.freeze(AbstractToken);

export {
	AbstractToken as default,
	MemberValueTransformer,
};
