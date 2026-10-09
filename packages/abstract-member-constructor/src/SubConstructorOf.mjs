import { ThrowTypeError } from '@produck/argot';
import { isConstructor } from '@produck/is-constructor';
import { isSubConstructor } from '@produck/is-sub-constructor';

export function SubConstructorOf(Base) {
  if (!isConstructor(Base)) {
    ThrowTypeError('args[0]', 'constructible');
  }

  return function parseSubConstructor(value) {
    if (isSubConstructor(value, Base)) {
      return value;
    }

    ThrowTypeError('member', `sub-constructor of ${Base.name}`);
  };
}
