import Abstract, { Member as _ } from '@produck/es-abstract';
import { Zod } from '@produck/es-abstract-member-zod';
import * as zod from 'zod';

const numberList = Zod(zod.number().array());

const AbstractSimpleMock = Abstract(class extends Date {
	superMethod() {
		if (this.foo === 'ok') {
			console.log('foo is string');
		}

		if (this.bar.getTime() > 0) {
			console.log('bar is date');
		}

		return this.baz(25);
	}
}, ...[
	Abstract({
		foo: _.String,
		bar: _.Instance(Date),
		baz: _.Method().args(_.Number).returns(_.Boolean),
		list: _.Method().returns(numberList),
	}),
	Abstract.Static('qux', _.Boolean),
]);

class SubSimpleMock extends AbstractSimpleMock {
	get foo() {
		return 'ok';
	}

	bar = new Date(1);

	list() {
		return [true];
	};

	baz(value) {
		return value > 10 && SubSimpleMock.qux;
	}

	static qux = true;

	subMethod() {
		this.superMethod();
	}
}

const instance = new SubSimpleMock();

instance.subMethod();
instance.list();
