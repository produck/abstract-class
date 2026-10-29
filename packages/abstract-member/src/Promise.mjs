import { Any } from '@produck/es-abstract-token';
import { Is, ThrowTypeError } from '@produck/argot';

function assertParser(parser) {
  if (!Is.Type.Function(parser)) {
    ThrowTypeError('args[0]', 'function');
  }
}

function PromiseParser(parser = Any) {
  assertParser(parser);

  return function parsePromise(value) {
    if (!Is.Instance.Promise(value)) {
      ThrowTypeError('member', 'Promise');
    }

    return value.then(parser);
  };
}

export function OrPromise(parser = Any) {
  assertParser(parser);

  return function parseOrPromise(value) {
    if (Is.Instance.Promise(value)) {
      return value.then(parser);
    }

    return parser(value);
  };
}

export function PromiseLike(parser = Any) {
  assertParser(parser);

  return function parsePromiseLike(value) {
    if (!Is.Thenable(value)) {
      ThrowTypeError('member', 'PromiseLike');
    }

    return value.then(parser);
  };
}

export function OrPromiseLike(parser = Any) {
  assertParser(parser);

  return function parseOrPromiseLike(value) {
    if (Is.Thenable(value)) {
      return value.then(parser);
    }

    return parser(value);
  };
}

export { PromiseParser as Promise };
