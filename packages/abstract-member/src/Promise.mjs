import { ThrowTypeError } from '@produck/type-error';

function isPromiseLike(value) {
	return typeof value?.then === 'function';
}

function assertParser(parser) {
	if (typeof parser !== 'function') {
		ThrowTypeError('args[0]', 'function');
	}
}

function PromiseParser(parser) {
	assertParser(parser);

	return function parsePromise(value) {
		if (!(value instanceof Promise)) {
			ThrowTypeError('member', 'Promise');
		}

		return value.then(parser);
	};
}

export function OrPromise(parser) {
	assertParser(parser);

	return function parseOrPromise(value) {
		if (value instanceof Promise) {
			return value.then(parser);
		}

		return parser(value);
	};
}

export function PromiseLike(parser) {
	assertParser(parser);

	return function parsePromiseLike(value) {
		if (!isPromiseLike(value)) {
			ThrowTypeError('member', 'PromiseLike');
		}

		return value.then(parser);
	};
}

export function OrPromiseLike(parser) {
	assertParser(parser);

	return function parseOrPromiseLike(value) {
		if (isPromiseLike(value)) {
			return value.then(parser);
		}

		return parser(value);
	};
}

export { PromiseParser as Promise };
