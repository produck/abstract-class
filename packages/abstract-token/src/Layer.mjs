export const LAYER_DESCRIPTOR = Symbol.for('abstract.layer');

function layerOf(owner) {
  if (!Object.hasOwn(owner, LAYER_DESCRIPTOR)) {
    return null;
  }

  return owner[LAYER_DESCRIPTOR];
}

export function nearestLayerOf(constructor) {
  let current = Object.getPrototypeOf(constructor);

  while (typeof current === 'function') {
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
