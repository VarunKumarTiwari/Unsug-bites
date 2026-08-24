// Minimal self-check for withMock — run: node lib/api/_client.test.mjs
// Reimplements withMock's contract (the .ts imports RN/env, can't load in bare node).
import assert from 'node:assert';

async function withMock(useMock, live, mock) {
  if (useMock) return mock();
  try {
    return await live();
  } catch {
    return mock();
  }
}

// live success → live value
assert.equal(await withMock(false, async () => 'live', () => 'mock'), 'live');
// live throws → mock value
assert.equal(await withMock(false, async () => { throw new Error('500'); }, () => 'mock'), 'mock');
// forced mock → never calls live
let called = false;
assert.equal(await withMock(true, async () => { called = true; return 'live'; }, () => 'mock'), 'mock');
assert.equal(called, false);
// empty array from live passes through (not treated as failure)
assert.deepEqual(await withMock(false, async () => [], () => ['mock']), []);

console.log('ok');
