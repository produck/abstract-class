import * as assert from 'node:assert/strict';
import { it } from 'node:test';

import Abstract, { SubConstructorProxy } from '@produck/es-abstract-token';

import { Constructor, SubConstructorOf } from '../src/index.mjs';

it('should declare constructor members of an abstract class.', () => {
  class Loader {}

  const AbstractSource = Abstract(
    class Source {},
    ...[
      Abstract({ Parser: Constructor }),
      Abstract.Static('Loader', SubConstructorOf(Loader)),
    ],
  );

  class JsonSource extends AbstractSource {
    Parser = class JsonParser {};

    static Loader = class JsonLoader extends Loader {};
  }

  class BadSource extends AbstractSource {
    Parser = () => {};

    static Loader = Loader;
  }

  const JsonProxy = SubConstructorProxy(JsonSource);
  const BadProxy = SubConstructorProxy(BadSource);

  assert.ok(typeof new JsonSource().Parser === 'function');
  assert.ok(typeof JsonProxy.Loader === 'function');

  assert.throws(() => new BadSource().Parser, {
    name: 'TypeError',
    message: 'Invalid "member", one "constructible" expected.',
  });

  assert.throws(() => BadProxy.Loader, {
    name: 'TypeError',
    message: 'Invalid "member", one "sub-constructor of Loader" expected.',
  });
});

import './Constructor.spec.mjs';
import './SubConstructorOf.spec.mjs';
