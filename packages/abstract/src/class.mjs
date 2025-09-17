import * as Member from './member.mjs';

export const Static = Symbol('abstract static member');
export const Instance = Symbol('abstract instance member');

function MemberDescriptorRecordAssertor(namespace) {
	const NAME = `${namespace}DescriptorRecord`;

	return function assertNamespaceMemberDescriptorRecord(value) {
		if (typeof value !== 'object' || value === null) {
			throw new TypeError(`Invalid "${NAME}", one "plain object" expected.`);
		}

		for (const property in value) {
			const descriptor = value[property];

			if (!Member.isDescriptor(descriptor)) {
				const LOCATOR = `${NAME}["${String(property)}"]`;
				throw new TypeError(`Invalid "${LOCATOR}", one "member descriptor" expected.`);
			}
		}
	};
}

const AssertMemberDescriptorRecord = {
	Instance: MemberDescriptorRecordAssertor('Instance'),
	Static: MemberDescriptorRecordAssertor('Static'),
};

function ProxyHandler(members) {
	return {
		get(target, property, receiver) {
			if (!Object.hasOwn(members, property)) {
				return Reflect.get(target, property, receiver);
			}

			if (property in target) {
				const finalValue = members[property].get(target[property]);

				return Reflect.get(finalValue, property, receiver) ;
			}

			throw new Error(`Property "${property}" is NOT implemented.`);
		},
		set(target, property, value, receiver) {
			const finalValue = Object.hasOwn(members, property)
				? members[property].set(value) : value;

			return Reflect.set(target, property, finalValue, receiver);
		},
	};
}

function MergeFieldFromList(fieldList) {
	return {
		[Instance]: {},
		[Static]: {},
	};
}

export function AbstractClass(Constructor, ...fieldList) {
	if (typeof Constructor !== 'function') {
		throw new TypeError('Invalid "Constructor", one "function" expected.');
	}

	const {
		[Static]: StaticField = {},
		[Instance]: InstanceField = {},
	} = MergeFieldFromList(fieldList);

	AssertMemberDescriptorRecord.Instance(InstanceField);
	AssertMemberDescriptorRecord.Static(StaticField);

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
