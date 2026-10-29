import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as _ from '../src/index.mjs';

function* generator() {
  yield 1;
}

async function* asyncGenerator() {
  yield 1;
}

describe('::Iterable', () => {
  it('should pass with an array, a set, a string and a generator.', () => {
    for (const value of [[], new Set(), '', 'ab', generator()]) {
      assert.equal(_.Iterable(value), value);
    }
  });

  it('should throw if value is not an iterable.', () => {
    for (const value of [
      null,
      undefined,
      1,
      true,
      {},
      () => {},
      { next: () => ({ done: true }) },
    ]) {
      assert.throws(() => _.Iterable(value), {
        name: 'TypeError',
        message: 'Invalid "member", one "Iterable" expected.',
      });
    }
  });
});

describe('::AsyncIterable', () => {
  it('should pass with an async generator.', () => {
    const value = asyncGenerator();

    assert.equal(_.AsyncIterable(value), value);
  });

  it('should throw if value is not an async iterable.', () => {
    for (const value of [null, undefined, 1, '', [], generator()]) {
      assert.throws(() => _.AsyncIterable(value), {
        name: 'TypeError',
        message: 'Invalid "member", one "AsyncIterable" expected.',
      });
    }
  });
});

describe('::Iterator', () => {
  it('should pass with an array iterator and a generator.', () => {
    for (const value of [[][Symbol.iterator](), generator()]) {
      assert.equal(_.Iterator(value), value);
    }
  });

  it('should pass with a bare `next` object.', () => {
    const value = { next: () => ({ done: true }) };

    assert.equal(_.Iterator(value), value);
  });

  it('should throw if value is not an iterator.', () => {
    for (const value of [null, undefined, 1, {}, [], 'ab', () => {}]) {
      assert.throws(() => _.Iterator(value), {
        name: 'TypeError',
        message: 'Invalid "member", one "Iterator" expected.',
      });
    }
  });
});

describe('::WellFormedIterator', () => {
  it('should pass with an array iterator and a generator.', () => {
    for (const value of [[][Symbol.iterator](), generator()]) {
      assert.equal(_.WellFormedIterator(value), value);
    }
  });

  it('should throw if value has `next` but no returning `Symbol.iterator`.', () => {
    for (const value of [
      { next: () => ({ done: true }) },
      asyncGenerator(),
      null,
      [],
    ]) {
      assert.throws(() => _.WellFormedIterator(value), {
        name: 'TypeError',
        message: 'Invalid "member", one "WellFormedIterator" expected.',
      });
    }
  });
});

describe('::Generator', () => {
  it('should pass with a generator function.', () => {
    assert.equal(_.Generator(generator), generator);
  });

  it('should throw if value is not a generator function.', () => {
    for (const value of [
      null,
      function () {},
      async function () {},
      async function* () {},
      () => {},
      class {},
      generator(),
    ]) {
      assert.throws(() => _.Generator(value), {
        name: 'TypeError',
        message: 'Invalid "member", one "GeneratorFunction" expected.',
      });
    }
  });
});

describe('::AsyncGenerator', () => {
  it('should pass with an async generator function.', () => {
    assert.equal(_.AsyncGenerator(asyncGenerator), asyncGenerator);
  });

  it('should throw if value is not an async generator function.', () => {
    for (const value of [
      null,
      function () {},
      async function () {},
      function* () {},
      () => {},
      class {},
      asyncGenerator(),
    ]) {
      assert.throws(() => _.AsyncGenerator(value), {
        name: 'TypeError',
        message: 'Invalid "member", one "AsyncGeneratorFunction" expected.',
      });
    }
  });
});
