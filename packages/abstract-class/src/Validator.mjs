import * as Ow from '@produck/ow';
import { Is } from '@produck/idiom';

/**
 * @param {PropertyDescriptor} descriptor
 * @param {{ get: boolean, set: boolean, func: boolean }} options
 * @param {string | symbol} memberName
*/
export function assertDescriptorAndOptions(descriptor, options, memberName) {
	const hasValue = Object.hasOwn(descriptor, 'value');
	const { value, get, set } = descriptor;

	if (options.func) {
		const IF = `if abstract member(${memberName}) is a function`;

		if (!hasValue) {
			Ow.Error.Common(`There MUST be ".value" in descriptor ${IF}.`);
		}

		if (!Is.Type.Function(value)) {
			Ow.Error.Common(`A ".value" MUST be a function ${IF}.`);
		}

		return;
	}

	const IF_IS_VALUE = 'abstract member is a value';

	if (hasValue) {
		const IF = `if ${IF_IS_VALUE} and there is ".value" in descriptor`;

		if (Is.Type.Function(value)) {
			Ow.Error.Common(`A ".value" MUST NOT be a function ${IF}.`);
		}

		if (!options.get) {
			Ow.Error.Common(`It CAN NOT be readonly value ${IF}.`);
		}

		const { writable } = descriptor;

		if (options.set && !writable) {
			Ow.Error.Common(`A ".writable" MUST be true ${IF} and value is writalbe.`);
		}

		if (!options.set && writable) {
			Ow.Error.Common(`A ".writable" MUST be falue ${IF} and value is readonly.`);
		}

		return;
	}

	const IF = `if ${IF_IS_VALUE} and NO "descriptor.value"`;

	if (options.get && Is.Type.Undefined(get)) {
		Ow.Error.Common(`A ".get" MUST be defined ${IF} and value is readable.`);
	}

	if (!options.get && Is.Type.Function(get)) {
		Ow.Error.Common(`A ".get" MUST NOT be defined ${IF} and value is NOT readable.`);
	}

	if (options.set && Is.Type.Undefined(set)) {
		Ow.Error.Common(`A ".set" MUST be defined ${IF} and value is writable.`);
	}

	if (!options.set && Is.Type.Function(set)) {
		Ow.Error.Common(`A ".set" MUST NOT be defined ${IF} and value is NOT writable.`);
	}
}
