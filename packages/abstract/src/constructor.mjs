import * as Field from './field.mjs';
import * as Utils from './utils.mjs';

export const Instance = Symbol.for('abstract.member.field.instance');
export const Static = Symbol.for('abstract.member.field.static');

function MemberDescriptorRecordAssertor(namespace) {
	const NAME = `${namespace}DescriptorRecord`;

	return function assertNamespaceMemberDescriptorRecord(value) {
		if (typeof value !== 'object' || value === null) {
			throw new TypeError(`Invalid "${NAME}", one "plain object" expected.`);
		}

		for (const property in value) {
			const transformer = value[property];

			if (!Field.isMemberValueTransformer(transformer)) {
				const messageSpanList = [
					`Invalid "${NAME}["${String(property)}"]". `,
					'one "member value transformer" expected.',
				];

				throw new TypeError(messageSpanList.join(''));
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

function MergeFieldGroup(list) {
	const final = { [Instance]: {}, [Static]: {} };

	for (const { [Instance]: _instance = {}, [Static]: _static = {} } of list) {
		Object.assign(final[Instance], _instance);
		Object.assign(final[Static], _static);
	}

	return final;
}

export function AbstractConstructor(Constructor, ...fieldGroupList) {
	if (!Utils.isConstructor(Constructor)) {
		throw new TypeError('Invalid "args[0]", one "constructible" expected.');
	}

	for (const [index, fieldGroup] of Object.entries(fieldGroupList)) {
		AssertMemberDescriptorRecord.Instance(InstanceField);
		AssertMemberDescriptorRecord.Static(StaticField);
	}

	const {
		[Static]: StaticField,
		[Instance]: InstanceField,
	} = MergeFieldGroup(fieldGroupList);

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
