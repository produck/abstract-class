import { ThrowTypeError } from '@produck/type-error';
import * as FieldGroup from './FieldGroup.mjs';
import * as NamedFieldGroup from './NamedFieldGroup.mjs';

export function isConstructor(value) {
	if (value === null) {
		return false;
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		(class extends value{});

		return true;
	} catch {
		return false;
	}
}

const RESERVED_PROPERTY_LIST = ['prototype', 'constructor'];
const EXTENDS_PROXY = Symbol();

function ProxyHandler(members, fieldName) {
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

			throw new Error(`${fieldName} member "${property}" is NOT implemented.`);
		},
	};
}

function assertConstructor(value, role) {
	if (!isConstructor(value)) {
		ThrowTypeError(role, 'constructible');
	}
}

export function SubConstructorProxy(subConstructor) {
	assertConstructor(subConstructor, 'args[0]');

	const proxy = subConstructor[EXTENDS_PROXY];

	if (proxy === undefined) {
		throw new Error('This constructor is NOT extend from an abstract one.');
	}

	return proxy;
}

export function AbstractConstructor(constructor, ...fieldGroupList) {
	assertConstructor(constructor, 'args[0]');

	for (const [index, fieldGroup] of Object.entries(fieldGroupList)) {
		if (!FieldGroup.isFieldGroup(fieldGroup)) {
			ThrowTypeError(`args[${Number(index) + 1}]`, 'FieldGroup');
		}
	}

	const Field = NamedFieldGroup.merge(fieldGroupList);
	const instanceProxyHandler = ProxyHandler(Field.Instance, 'Instance');
	const staticProxyHandler = ProxyHandler(Field.Static, 'Static');
	const extendingProxySet = new WeakSet();

	const ConstructorProxy = new Proxy(constructor, {
		construct(target, argumentList, newTarget) {
			if (newTarget === ConstructorProxy) {
				throw new Error('Illegal construction on an abstract constructor.');
			}

			const instance = Reflect.construct(target, argumentList, newTarget);

			return new Proxy(instance, instanceProxyHandler);
		},
		get(...args) {
			const [, property, receiver] = args;

			// For abstract static members.
			if (property !== EXTENDS_PROXY) {
				return staticProxyHandler.get(...args);
			}

			if (extendingProxySet.has(receiver)) {
				throw new Error('Creating extending proxy at most once');
			}

			extendingProxySet.add(receiver);

			// Creating a sub consturctor.
			return new Proxy(receiver, staticProxyHandler);
		},
	});

	return ConstructorProxy;
}
