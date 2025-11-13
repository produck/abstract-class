import * as Member from './Member.mjs';

const operators = {
	args: (...parsers) => parsers,
	rest: parser => parser,
	returns: parser => parser,
};

export const defineFunctionMember = () => {
	const schemas = {
		args: [],
		rest: value => value,
		returns: value => value,
	};

	const called = {
		args: false,
		rest: false,
		returns: false,
	};

	return new Proxy(Member.define(function parser(fn) {
		if (typeof fn !== 'function') {
			throw new TypeError('Invalid member, one "function" expected.');
		}

		return function (...args) {
			const finalArgs = [];

			for (const [index, value] of args.entries()) {
				if (index < schemas.length) {
					finalArgs[index] = schemas.args[index](value);
				} else {
					finalArgs[index] = schemas.rest(value);
				}
			}

			return schemas.returns(fn(...finalArgs));
		};
	}), {
		get(target, property, reciever) {
			if (!Object.hasOwn(operators, property)) {
				throw new Error(`Only "${operators.join(', ')}" is available.`);
			}

			if (called[property]) {
				throw new Error(`.${property}() can only be called once.`);
			}

			return function operate(...args) {
				schemas[property] = operators[property](...args);
				called[property] = true;

				return Reflect.get(target, property, reciever);
			};
		},
	});

};
