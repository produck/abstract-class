import * as FieldGroup from './FieldGroup.mjs';
import * as NamedFieldGroup from './NamedFieldGroup.mjs';

export function isConstructor(value) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		(class extends value{});

		return true;
	} catch {
		return false;
	}
}

const RESERVED_PROPERTY_LIST = ['prototype', 'constructor'];

function ProxyHandler(members, fieldName) {
	return {
		get(target, property, receiver) {
			if (RESERVED_PROPERTY_LIST.includes(property)) {
				return Reflect.get(target, property, receiver);
			}

			if (!Object.hasOwn(members, property)) {
				return Reflect.get(target, property, receiver);
			}

			if (property in target) {
				const value = Reflect.get(target, property, receiver);

				return members[property].get(value, receiver);
			}

			throw new Error(`${fieldName} member "${property}" is NOT implemented.`);
		},
	};
}

export function AbstractConstructor(Constructor, ...fieldGroupList) {
	if (!isConstructor(Constructor)) {
		throw new TypeError('Invalid "args[0]", one "constructible" expected.');
	}

	for (const [index, fieldGroup] of Object.entries(fieldGroupList)) {
		if (!FieldGroup.isFieldGroup(fieldGroup)) {
			const role = `args[${Number(index) + 1}]`;

			throw new TypeError(`Invalid "${role}", one "FieldGroup" expcected.`);
		}
	}

	const Field = NamedFieldGroup.merge(fieldGroupList);
	const INSTANCE_PROXY_HANDLER = ProxyHandler(Field.Instance, 'Instance');

	const ConstructorProxy = new Proxy(Constructor, {
		...ProxyHandler(Field.Static, 'Static'),
		construct(target, argumentList, newTarget) {
			if (newTarget === ConstructorProxy) {
				throw new Error('Illegal construction on an abstract constructor.');
			}

			const instance = Reflect.construct(target, argumentList, newTarget);

			return new Proxy(instance, INSTANCE_PROXY_HANDLER);
		},
	});

	return ConstructorProxy;
}
