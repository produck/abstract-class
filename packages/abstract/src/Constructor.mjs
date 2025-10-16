import * as FieldGroup from './FieldGroup.mjs';
import * as NamedFieldGroup from './NamedFieldGroup.mjs';

function isConstructor(value) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		(class extends value{});

		return true;
	} catch {
		return false;
	}
}

const RESERVED_PROPERTY_LIST = ['prototype', 'constructor'];

function ProxyHandler(members) {
	return {
		get(target, property, receiver) {
			if (RESERVED_PROPERTY_LIST.includes(property)) {
				return Reflect.get(target, property, receiver);
			}

			if (!Object.hasOwn(members, property)) {
				return Reflect.get(target, property, receiver);
			}

			if (property in target) {
				const finalValue = members[property].get(target[property]);

				return Reflect.get(finalValue, property, receiver) ;
			}

			throw new Error(`Property "${property}" is NOT implemented.`);
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

	const {
		[FieldGroup.Static]: StaticField,
		[FieldGroup.Instance]: InstanceField,
	} = NamedFieldGroup.merge(fieldGroupList);

	const INSTANCE_PROXY_HANDLER = ProxyHandler(InstanceField);

	const ConstructorProxy = new Proxy(Constructor, {
		...ProxyHandler(StaticField),
		construct(target, argumentList, newTarget) {
			if (newTarget === ConstructorProxy) {
				throw new Error('Illegal construction on an abstract constructor.');
			}

			return new Proxy(new target(...argumentList), INSTANCE_PROXY_HANDLER);
		},
	});

	return ConstructorProxy;
}
