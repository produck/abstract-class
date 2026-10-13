import { Ow } from '@produck/argot';

const RESERVED_PROPERTY_LIST = ['prototype', 'constructor'];
const INSTANCE_PROXY_MAP = new WeakMap();
const PROXY_REGISTRY = new WeakSet();

export function InstanceProxyHandler(fieldName, members) {
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

      Ow.Error.Common(
        `${fieldName} member "${String(property)}" must be implemented.`,
      );
    },
  };
}

export function isInstanceProxy(value) {
  return PROXY_REGISTRY.has(value);
}

export function proxyOfInstance(instance, members) {
  const registered = INSTANCE_PROXY_MAP.get(instance);

  if (registered !== undefined) {
    return registered;
  }

  const proxy = new Proxy(instance, InstanceProxyHandler('Instance', members));

  INSTANCE_PROXY_MAP.set(instance, proxy);
  PROXY_REGISTRY.add(proxy);

  return proxy;
}

export {
  InstanceProxyHandler as ProxyHandler,
  isInstanceProxy as isProxy,
  proxyOfInstance as proxyOf,
};
