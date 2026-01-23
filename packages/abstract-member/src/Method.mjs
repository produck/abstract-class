import { ThrowTypeError } from '@produck/type-error';

const operators = {
	args: (...parsers) => {
		for (const [index, parser] of parsers.entries()) {
			if (typeof parser !== 'function') {
				ThrowTypeError(`args[${index}]`, 'function');
			}
		}

		return parsers;
	},
	rest: (parser) => {
		if (typeof parser !== 'function') {
			ThrowTypeError('args[0]', 'function');
		}

		return parser;
	},
	returns: (parser) => {
		if (typeof parser !== 'function') {
			ThrowTypeError('args[0]', 'function');
		}

		return parser;
	},
};

const OPERATORS_DESCRIPTION = Object.keys(operators).join(', ');

export const defineMethodMember = () => {
	const schemas = {
		args: [],
		rest: (value) => value,
		returns: (value) => value,
	};

	const called = {
		args: false,
		rest: false,
		returns: false,
	};

	let used = false;

	return new Proxy(function parseMember(functionMember, target) {
		if (typeof functionMember !== 'function') {
			ThrowTypeError('member', 'function');
		}

		return function parsedFunctionMember(...args) {
			used = true;
			args.push(...new Array(Math.max(schemas.args.length - args.length, 0)));

			const finalArgs = [];

			for (const [index, value] of args.entries()) {
				try {
					if (index < schemas.args.length) {
						finalArgs[index] = schemas.args[index](value, target);
					} else {
						finalArgs[index] = schemas.rest(value, target);
					}
				} catch (cause) {
					throw new Error(`Invalid "args[${index}]".`, { cause });
				}
			}

			return schemas.returns(functionMember.apply(target, finalArgs), target);
		};
	}, {
		get(_target, property, reciever) {
			if (!Object.hasOwn(operators, property)) {
				throw new Error(`Only "${OPERATORS_DESCRIPTION}" is available.`);
			}

			if (called[property]) {
				throw new Error(`Operator .${property}() can only be called once.`);
			}

			if (used) {
				throw new Error('This member is used then can not be modified.');
			}

			return function operate(...args) {
				schemas[property] = operators[property](...args);
				called[property] = true;

				return reciever;
			};
		},
	});
};
