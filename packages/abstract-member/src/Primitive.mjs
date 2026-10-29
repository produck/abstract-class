import { Is, ThrowTypeError } from '@produck/argot';

const TYPE_LIST = [
  ['undefined', Is.Type.Undefined],
  ['object', Is.Type.Object],
  ['boolean', Is.Type.Boolean],
  ['number', Is.Type.Number],
  ['bigint', Is.Type.Bigint],
  ['string', Is.Type.String],
  ['symbol', Is.Type.Symbol],
  ['function', Is.Type.Function],
];

export const [
  Undefined,
  Object,
  Boolean,
  Number,
  BigInt,
  String,
  Symbol,
  Function,
] = TYPE_LIST.map(function PrimitiveTypeMember([typeName, isType]) {
  return function parsePrimitive(value) {
    if (!isType(value)) {
      ThrowTypeError('member', typeName);
    }

    return value;
  };
});
