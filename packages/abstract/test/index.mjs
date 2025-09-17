import { describe, it } from 'node:test';
import { Abstract } from '../src/index.mjs';

describe('abstract()', function () {
	it('should define an abstract class', () => {
		const AbstractMock = Abstract(class Mock {

		});
	});
});
