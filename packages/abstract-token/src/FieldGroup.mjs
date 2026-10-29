import { Is, Ow, ThrowTypeError } from '@produck/argot';

import * as Member from './Member.mjs';

const FIELD_GROUP_TAG = Symbol('abstract.member.field.group');

export function isFieldGroup(value) {
  if (!Is.PlainObject(value)) {
    return false;
  }

  return FIELD_GROUP_TAG in value;
}

const PROPERTY_EXPECTED = Member.PROPERTY_TYPE_LIST.join(' | ');

export function FieldGroupProvider(symbol) {
  function assertMember(member, role) {
    if (!Is.Type.Function(member)) {
      ThrowTypeError(role, 'function');
    }
  }

  const By = {
    NamedMember(property, member = Member.Any) {
      if (!Member.isProperty(property)) {
        ThrowTypeError('args[0] as property', PROPERTY_EXPECTED);
      }

      assertMember(member, 'args[1]');

      return Object.freeze({
        [symbol]: Object.freeze({ [property]: member }),
      });
    },
    MemberRecord(memberRecord) {
      const record = {};

      for (const property of [
        ...Object.getOwnPropertyNames(memberRecord),
        ...Object.getOwnPropertySymbols(memberRecord),
      ]) {
        const member = memberRecord[property];

        assertMember(member, `args[0]['${String(property)}']`);
        record[property] = member;
      }

      return Object.freeze({ [symbol]: Object.freeze(record) });
    },
  };

  return Object.freeze(function AbstractFieldGroup(...operands) {
    if (operands.length < 1) {
      Ow.Error.Syntax('At least 1 operand is required.');
    }

    if (operands.length > 2) {
      Ow.Error.Syntax('The number of operands cannot exceed 2.');
    }

    const [first] = operands;

    return Object.freeze({
      [FIELD_GROUP_TAG]: true,
      ...(Is.PlainObject(first) && operands.length === 1
        ? By.MemberRecord(...operands)
        : By.NamedMember(...operands)),
    });
  });
}

export { FieldGroupProvider as Provider };
