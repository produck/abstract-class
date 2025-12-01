import { AbstractConstructor } from './Constructor.mjs';
import * as NamedFieldGroup from './NamedFieldGroup.mjs';
import { define as defineMember, Any, isMember } from './Member.mjs';

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
export { defineMember, isMember, Any, Any as Unknown };
