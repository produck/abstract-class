import { Is } from '@produck/argot';

export const LAYER_DESCRIPTOR = Symbol('abstract.layer');

function layerOf(owner) {
  if (!Object.hasOwn(owner, LAYER_DESCRIPTOR)) {
    return null;
  }

  return owner[LAYER_DESCRIPTOR];
}

export function nearestLayerOf(constructor) {
  if (!Is.Type.Function(constructor)) {
    return null;
  }

  let current = Object.getPrototypeOf(constructor);

  while (Is.Type.Function(current)) {
    const layer = layerOf(current);

    if (layer !== null) {
      return layer;
    }

    current = Object.getPrototypeOf(current);
  }

  return null;
}

export {
  layerOf as of,
  nearestLayerOf as nearestOf,
  LAYER_DESCRIPTOR as DESCRIPTOR,
};
