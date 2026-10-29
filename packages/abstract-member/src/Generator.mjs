import { Is, ThrowTypeError } from '@produck/argot';

export function Generator(value) {
  if (!Is.Instance.GeneratorFunction(value)) {
    ThrowTypeError('member', 'GeneratorFunction');
  }

  return value;
}

export function AsyncGenerator(value) {
  if (!Is.Instance.AsyncGeneratorFunction(value)) {
    ThrowTypeError('member', 'AsyncGeneratorFunction');
  }

  return value;
}
