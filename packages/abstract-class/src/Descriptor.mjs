import * as Ow from '@produck/ow';
import { Assert } from '@produck/idiom';

const MARKED = new WeakSet();

export function mark(part) {
	MARKED.add(part);

	return Object.freeze(part);
}

function assertTerm(term, index) {
	if (!MARKED.has(term)) {
		Ow.Error.Common(`Bad term at ${this}[${index}]. It MUST be from keywords.`);
	}
}

export function assertKeywords(tuple, role) {
	Assert.Array(tuple, role);
	tuple.forEach(assertTerm, role);
}

export function normalizeOptions(options) {
	const _options = {
		static: false,
		get: false,
		set: false,
		func: false,
	};

	const {
		get: _get = _options.get,
		set: _set = _options.set,
		func: _func = _options.func,
		static: _static = _options.static,
	} = options;

	if ((_get || _set) && _func) {
		Ow.Error.Common('A member CAN NOT be property value and funtion at once.');
	}

	if (!_get && !_set && !_func) {
		Ow.Error.Common('A member MUST be one of property value or funtion.');
	}

	_options.get = _get;
	_options.set = _set;
	_options.func = _func;
	_options.static = _static;

	return _options;
}

const ASSIGN_OPTIOS_PART = (options, part) => Object.assign(options, part);
export const toOptions = keywords => keywords.reduce(ASSIGN_OPTIOS_PART, {});
