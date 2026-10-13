import { Ow, ThrowTypeError } from '@produck/argot';
import { isConstructor } from '@produck/is-constructor';

import * as FieldGroup from './FieldGroup.mjs';
import * as NamedFieldGroup from './NamedFieldGroup.mjs';
import * as Trace from './Trace.mjs';

const RESERVED_PROPERTY_LIST = ['prototype', 'constructor'];
const EXTENDS_PROXY = Symbol();
const LAYER_TAG = Symbol.for('abstract.layer');
const INSTANCE_PROXY = new WeakSet();
const STATIC_VALIDATED = new WeakSet();

function layerOf(owner) {
  if (!Object.hasOwn(owner, LAYER_TAG)) {
    return null;
  }

  return owner[LAYER_TAG];
}

function nearestLayerOf(constructor) {
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

function ProxyHandler(fieldName, members) {
  return {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);

      if (RESERVED_PROPERTY_LIST.includes(property)) {
        return value;
      }

      if (!Object.hasOwn(members, property)) {
        return value;
      }

      if (property in target) {
        return members[property](value, receiver);
      }

      throw Ow.Error.Common(
        `${fieldName} member "${String(property)}" must be implemented in the subclass.`,
      );
    },
  };
}

function assertConstructor(value, role) {
  if (!isConstructor(value)) {
    ThrowTypeError(role, 'constructible');
  }
}

function proxyOfInstance(instance, newTarget) {
  if (INSTANCE_PROXY.has(instance)) {
    return instance;
  }

  const { field } = nearestLayerOf(newTarget);
  const proxy = new Proxy(instance, ProxyHandler('Instance', field.Instance));

  INSTANCE_PROXY.add(proxy);

  return proxy;
}

export function SubConstructorProxy(subConstructor) {
  assertConstructor(subConstructor, 'args[0]');

  const proxy = subConstructor[EXTENDS_PROXY];

  if (proxy === undefined) {
    Ow.Error.Common('This constructor is NOT extended from an abstract one.');
  }

  return proxy;
}

export function AbstractConstructor(constructor, ...fieldGroupList) {
  assertConstructor(constructor, 'args[0]');

  if (Object.hasOwn(constructor, LAYER_TAG)) {
    Ow.Error.Common('This constructor has already been abstracted');
  }

  for (const [index, fieldGroup] of Object.entries(fieldGroupList)) {
    if (!FieldGroup.isFieldGroup(fieldGroup)) {
      ThrowTypeError(`args[${Number(index) + 1}]`, 'FieldGroup');
    }
  }

  const ownField = NamedFieldGroup.merge(fieldGroupList);
  const inherited = nearestLayerOf(constructor);

  const finalField = Object.freeze({
    Instance: { ...inherited?.field.Instance, ...ownField.Instance },
    Static: { ...inherited?.field.Static, ...ownField.Static },
  });

  const layer = Object.freeze({ target: constructor, field: finalField });
  const staticMemberList = Reflect.ownKeys(finalField.Static);
  const staticProxyHandler = ProxyHandler('Static', finalField.Static);
  const extendingProxySet = new WeakSet();
  const isRootLayer = inherited === null;

  const ConstructorProxy = new Proxy(constructor, {
    construct(target, argumentList, newTarget) {
      if (newTarget === ConstructorProxy) {
        Ow.Error.Common('Illegal construction on an abstract constructor.');
      }

      const isOuterMost = nearestLayerOf(newTarget) === layer;

      if (
        isOuterMost &&
        staticMemberList.length > 0 &&
        !STATIC_VALIDATED.has(newTarget)
      ) {
        Ow.Error.Common(`It MUST SubConstructorProxy("${newTarget.name}").`);
      }

      if (isRootLayer) {
        Trace.enter(target, newTarget);
      }

      try {
        const instance = Reflect.construct(target, argumentList, newTarget);

        if (!isOuterMost) {
          return instance;
        }

        return proxyOfInstance(instance, newTarget);
      } finally {
        if (isRootLayer) {
          Trace.leave();
        }
      }
    },
    get(...args) {
      const [, property, receiver] = args;

      // For abstract static members.
      if (property !== EXTENDS_PROXY) {
        return staticProxyHandler.get(...args);
      }

      if (extendingProxySet.has(receiver)) {
        Ow.Error.Common('Extending proxy has already been created');
      }

      extendingProxySet.add(receiver);
      STATIC_VALIDATED.add(receiver);

      // Creating a sub constructor.
      const wrapper = new Proxy(receiver, staticProxyHandler);

      STATIC_VALIDATED.add(wrapper);

      return wrapper;
    },
  });

  Object.defineProperty(constructor, LAYER_TAG, {
    value: layer,
    configurable: true,
  });

  return ConstructorProxy;
}
