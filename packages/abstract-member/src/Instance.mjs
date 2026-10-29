import { isConstructor } from '@produck/is-constructor';
import { ThrowTypeError, instanceOf } from '@produck/argot';

export function Instance(constructor) {
  if (!isConstructor(constructor)) {
    ThrowTypeError('args[0]', 'constructible');
  }

  return function parseObject(value) {
    if (instanceOf(value, constructor)) {
      return value;
    }

    ThrowTypeError('member', constructor.name);
  };
}
