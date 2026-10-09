import { Common } from '@produck/argot';

export const PROPERTY_TYPE_LIST = ['number', 'string', 'symbol'];

export function isProperty(value) {
  return PROPERTY_TYPE_LIST.includes(typeof value);
}

export const Any = Common.passthrough;
