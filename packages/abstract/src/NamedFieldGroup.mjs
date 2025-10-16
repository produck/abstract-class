import * as FieldGroup from './FieldGroup.mjs';

const Instance = Symbol.for('field.instance');
const Static = Symbol.for('field.static');

export function mergeFieldGroup(list) {
	const final = { [Instance]: {}, [Static]: {} };

	for (const { [Instance]: _instance = {}, [Static]: _static = {} } of list) {
		Object.assign(final[Instance], _instance);
		Object.assign(final[Static], _static);
	}

	return final;
}

export { mergeFieldGroup as merge };

export const InstanceFieldGroup = FieldGroup.Provider(Instance);
export const StaticFieldGroup = FieldGroup.Provider(Static);

export {
	InstanceFieldGroup as Instance,
	StaticFieldGroup as Static,
};
