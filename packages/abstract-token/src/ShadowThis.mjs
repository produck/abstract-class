import { Ow, ThrowTypeError } from '@produck/argot';

import * as Instance from './Instance.mjs';
import * as Layer from './Layer.mjs';

export function resolveShadowThis(instance) {
  if (typeof instance !== 'object' || instance === null) {
    ThrowTypeError('args[0]', 'object');
  }

  if (Instance.isProxy(instance)) {
    return instance;
  }

  const layer = Layer.nearestOf(instance.constructor);

  if (layer === null) {
    Ow.Error.Common('ShadowThis() requires an instance of an abstract class.');
  }

  return Instance.proxyOf(instance, layer.field.Instance);
}
