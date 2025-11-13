import { AbstractConstructor } from './Constructor.mjs';
import * as NamedFieldGroup from './NamedFieldGroup.mjs';

const Token = Object.assign(function AbstractToken(...operands) {
	const { length } = operands;

	if (length < 1) {
		throw new SyntaxError('At least 1 operand is required.');
	}

	if (typeof operands[0] === 'function') {
		return AbstractConstructor(...operands);
	}

	return NamedFieldGroup.Instance(...operands);
}, { Static: NamedFieldGroup.Static });

Object.defineProperty(Token, 'static', { get: () => Token.Static });
Object.freeze(Token);

export default Token;
export * as Member from './Member.mjs';
export { defineFunctionMember as fn } from './Function.mjs';
export { Any as any } from './Member.mjs';
