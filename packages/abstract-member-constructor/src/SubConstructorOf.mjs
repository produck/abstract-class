import { ThrowTypeError } from '@produck/argot';
import { isClassLike } from '@produck/is-constructor';
import { isSubConstructor } from '@produck/is-sub-constructor';

export function SubConstructorOf(Base) {
  if (!isClassLike(Base)) {
    ThrowTypeError('args[0]', 'constructible');
  }

  return function parseSubConstructor(value) {
    if (isSubConstructor(value, Base)) {
      return value;
    }

    ThrowTypeError('member', `sub-constructor of ${Base.name}`);
  };
}
