import * as Ow from '@produck/ow';

import { assertKeywords, normalizeOptions, toOptions } from './Descriptor.mjs';
import { assertDescriptorAndOptions } from './Validator.mjs';
import { Assert, Is } from '@produck/idiom';

export const abstract = (constructor, abstractMembers = {}) => {
	Assert.Type.Function(constructor, 'constructor', 'function as constructor');
	Assert.Type.Object(abstractMembers, 'abstractMembers');

	const CHECKED_CONSTRUCTOR = new WeakSet();
	const { name } = constructor;

	const propertyKeys = [
		...Object.getOwnPropertyNames(abstractMembers),
		...Object.getOwnPropertySymbols(abstractMembers),
	];

	const membersOptions = {};

	for (const propertyKey of propertyKeys) {
		const keywords = abstractMembers[propertyKey];

		assertKeywords(keywords, propertyKey);
		membersOptions[propertyKey] = normalizeOptions(toOptions(keywords));
	}

	function assertImplementedAll(instance) {
		const unimplemented = new Set(propertyKeys);
		let current = instance;

		do {
			for (const propertyKey of unimplemented) {
				const descriptor = Object.getOwnPropertyDescriptor(current, propertyKey);

				if (Is.Type.Object(descriptor)) {
					const options = membersOptions[propertyKey];

					assertDescriptorAndOptions(descriptor, options, propertyKey);
					unimplemented.delete(propertyKey);
				}
			}

			current = Object.getPrototypeOf(current.constructor);
		} while (current !== abstract);

		for (const memberName of unimplemented) {
			Ow.Error.Common(`Abstract member "${name}.${memberName}" is NOT implemented`);
		}
	}

	const abstract = new Proxy(constructor, {
		construct: (target, args, newTarget) => {
			if (abstract === newTarget) {
				Ow.Error.Common(`Cannot create an instance of the abstract class '${name}'.`);
			}

			const instance = Reflect.construct(target, args, newTarget);

			if (!CHECKED_CONSTRUCTOR.has(newTarget)) {
				assertImplementedAll(instance);
				CHECKED_CONSTRUCTOR.add(newTarget);
			}

			return instance;
		},
	});

	return abstract;
};
