import { Is, Ow, ThrowTypeError } from '@produck/argot';

const operators = {
  args: (...parsers) => {
    for (const [index, parser] of parsers.entries()) {
      if (!Is.Type.Function(parser)) {
        ThrowTypeError(`args[${index}]`, 'function');
      }
    }

    return parsers;
  },
  rest: (parser) => {
    if (!Is.Type.Function(parser)) {
      ThrowTypeError('args[0]', 'function');
    }

    return parser;
  },
  returns: (parser) => {
    if (!Is.Type.Function(parser)) {
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

  return new Proxy(
    function parseMember(functionMember, target) {
      if (!Is.Type.Function(functionMember)) {
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
            Ow.Error.Common(`Invalid "args[${index}]".`, { cause });
          }
        }

        return schemas.returns(functionMember.apply(target, finalArgs), target);
      };
    },
    {
      get(_target, property, receiver) {
        if (!Object.hasOwn(operators, property)) {
          Ow.Error.Common(`Only "${OPERATORS_DESCRIPTION}" is available.`);
        }

        if (called[property]) {
          Ow.Error.Common(`Operator .${property}() can only be called once.`);
        }

        if (used) {
          Ow.Error.Common('This member is used then can not be modified.');
        }

        return function operate(...args) {
          schemas[property] = operators[property](...args);
          called[property] = true;

          return receiver;
        };
      },
    },
  );
};
