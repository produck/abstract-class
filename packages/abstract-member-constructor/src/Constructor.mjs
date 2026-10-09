import { ThrowTypeError } from '@produck/argot';
import { isConstructor } from '@produck/is-constructor';

export function Constructor(value) {
  if (isConstructor(value)) {
    return value;
  }

  ThrowTypeError('member', 'constructible');
}
