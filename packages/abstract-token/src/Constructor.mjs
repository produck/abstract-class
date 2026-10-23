import { Ow, ThrowTypeError } from '@produck/argot';
import { isConstructor } from '@produck/is-constructor';

import * as Trace from './Trace.mjs';
import * as FieldGroup from './FieldGroup.mjs';
import * as Instance from './Instance.mjs';
import * as Layer from './Layer.mjs';
import * as NamedFieldGroup from './NamedFieldGroup.mjs';

const EXTENDING_PROXY = Symbol();
const PROXY_REGISTERED = new WeakSet();
let subConstructorProxyCheckEnabled = false;

function assertConstructor(value, role) {
  if (!isConstructor(value)) {
    ThrowTypeError(role, 'constructible');
  }
}

export function enableSubConstructorProxyCheck() {
  subConstructorProxyCheckEnabled = true;
}

export function disableSubConstructorProxyCheck() {
  subConstructorProxyCheckEnabled = false;
}

export function SubConstructorProxy(subConstructor) {
  assertConstructor(subConstructor, 'args[0]');

  const proxy = subConstructor[EXTENDING_PROXY];

  if (proxy === undefined) {
    Ow.Error.Common('This constructor is NOT extended from an abstract one.');
  }

  return proxy;
}

export function AbstractConstructor(constructor, ...fieldGroupList) {
  assertConstructor(constructor, 'args[0]');

  if (Object.hasOwn(constructor, Layer.DESCRIPTOR)) {
    Ow.Error.Common('This constructor has already been abstracted');
  }

  for (const [index, fieldGroup] of Object.entries(fieldGroupList)) {
    if (!FieldGroup.isFieldGroup(fieldGroup)) {
      ThrowTypeError(`args[${Number(index) + 1}]`, 'FieldGroup');
    }
  }

  const ownField = NamedFieldGroup.merge(fieldGroupList);
  const inherited = Layer.nearestOf(constructor);

  const finalField = Object.freeze({
    Instance: { ...inherited?.field.Instance, ...ownField.Instance },
    Static: { ...inherited?.field.Static, ...ownField.Static },
  });

  const layer = Object.freeze({ target: constructor, field: finalField });
  const staticMemberList = Reflect.ownKeys(finalField.Static);
  const staticProxyHandler = Instance.ProxyHandler('Static', finalField.Static);
  const extendingProxySet = new WeakSet();
  const isRootLayer = inherited === null;

  const ConstructorProxy = new Proxy(constructor, {
    construct(target, argumentList, newTarget) {
      if (newTarget === ConstructorProxy) {
        Ow.Error.Common('Illegal construction on an abstract constructor.');
      }

      const isOuterMost = Layer.nearestOf(newTarget) === layer;

      if (
        isOuterMost &&
        subConstructorProxyCheckEnabled &&
        staticMemberList.length > 0 &&
        !PROXY_REGISTERED.has(newTarget)
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

        return Instance.proxyOf(instance, layer.field.Instance);
      } finally {
        if (isRootLayer) {
          Trace.leave();
        }
      }
    },
    get(...args) {
      const [, property, receiver] = args;

      // For abstract static members.
      if (property !== EXTENDING_PROXY) {
        return staticProxyHandler.get(...args);
      }

      if (extendingProxySet.has(receiver)) {
        Ow.Error.Common('Extending proxy has already been created');
      }

      extendingProxySet.add(receiver);

      // Creating a sub constructor.
      const wrapper = new Proxy(receiver, staticProxyHandler);

      PROXY_REGISTERED.add(wrapper);

      return wrapper;
    },
  });

  Object.defineProperty(constructor, Layer.DESCRIPTOR, {
    value: layer,
    configurable: true,
  });

  return ConstructorProxy;
}
