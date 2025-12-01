const operators = {
	args: (...parsers) => {
		for (const [index, parser] of parsers.entries()) {
			if (typeof parser !== 'function') {
				throw new TypeError(
					`Invalid "args[${index}]", one "function" expected.`,
				);
			}
		}

		return parsers;
	},
	rest: (parser) => {
		if (typeof parser !== 'function') {
			throw new TypeError('Invalid "args[0]", one "function" expected.');
		}

		return parser;
	},
	returns: (parser) => {
		if (typeof parser !== 'function') {
			throw new TypeError('Invalid "args[0]", one "function" expected.');
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

	return new Proxy(function parseMember(functionMember) {
		if (typeof functionMember !== 'function') {
			throw new TypeError('Invalid member, one "function" expected.');
		}

		return function parsedFunctionMember(...args) {
			used = true;

			const finalArgs = [];

			for (const [index, value] of args.entries()) {
				if (index < schemas.args.length) {
					finalArgs[index] = schemas.args[index](value);
				} else {
					finalArgs[index] = schemas.rest(value);
				}
			}

			return schemas.returns(functionMember.apply(this, finalArgs));
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
