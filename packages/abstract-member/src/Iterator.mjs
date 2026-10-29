import { Is, ThrowTypeError } from '@produck/argot';

export function Iterator(value) {
  if (!Is.Iterator(value)) {
    ThrowTypeError('member', 'Iterator');
  }

  return value;
}

export function WellFormedIterator(value) {
  if (!Is.WellFormedIterator(value)) {
    ThrowTypeError('member', 'WellFormedIterator');
  }

  return value;
}
