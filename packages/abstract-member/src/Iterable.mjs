import { Is, ThrowTypeError } from '@produck/argot';

export function Iterable(value) {
  if (!Is.Iterable(value)) {
    ThrowTypeError('member', 'Iterable');
  }

  return value;
}

export function AsyncIterable(value) {
  if (!Is.AsyncIterable(value)) {
    ThrowTypeError('member', 'AsyncIterable');
  }

  return value;
}
