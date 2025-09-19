import { AbstractClass, Instance, Static } from './class.mjs';
import { AbstractFieldGroupFactory, MemberAccessor } from './field.mjs';

const AbstractInstanceFieldGroup = AbstractFieldGroupFactory(Instance);
const AbstractStaticFieldGroup = AbstractFieldGroupFactory(Static);

function AbstractToken(...operands) {
	if (operands.length === 0) {
		throw new Error('At least 1 operand is required.');
	}

	if (operands.length > 2) {
		throw new Error('The number of operand MUST NOT exceed 2.');
	}

	if (typeof operands[0] === 'function') {
		return AbstractClass(...operands);
	}

	return AbstractInstanceFieldGroup(...operands);
}

Object.assign(AbstractToken, {
	Static: AbstractStaticFieldGroup,
	static: AbstractStaticFieldGroup,
});

Object.freeze(AbstractToken);

export { AbstractToken as default };
export { MemberAccessor };
