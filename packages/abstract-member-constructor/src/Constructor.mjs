import { ThrowTypeError } from '@produck/argot';
import { isClassLike } from '@produck/is-constructor';

export function Constructor(value) {
  if (isClassLike(value)) {
    return value;
  }

  ThrowTypeError('member', 'constructible');
}
