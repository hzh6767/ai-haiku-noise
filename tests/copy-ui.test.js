const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const core = require('../haiku-core.js');

function loadPage(writeText) {
  const nodes = new Map();
  function element(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: '', textContent: '', children: [],
      addEventListener(type, listener) { this[type] = listener; },
      replaceChildren(...children) { this.children = children; },
      querySelectorAll() { return this.children; }
    });
    return nodes.get(selector);
  }
  const document = {
    querySelector: element,
    querySelectorAll: () => [],
    createElement: () => ({})
  };
  vm.runInNewContext(readFileSync(join(__dirname, '..', 'app.js'), 'utf8'), {
    document, HaikuCore: core, navigator: { clipboard: { writeText } },
    setTimeout: () => 1, clearTimeout() {}
  });
  return element;
}

test('generating a poem invalidates a pending clipboard fallback', async () => {
  let rejectCopy;
  const element = loadPage(() => new Promise((resolve, reject) => { rejectCopy = reject; }));
  const pending = element('#copy').click();
  element('#prompt').value = 'another poem';
  element('#generate').click();
  rejectCopy(new Error('permission denied'));
  await pending;
  assert.equal(element('#copy').textContent, 'Copy haiku');
  assert.equal(element('#copy-status').textContent, '');
});

test('only the latest copy attempt updates feedback', async () => {
  let finishCopy;
  const element = loadPage(() => new Promise((resolve) => { finishCopy = resolve; }));
  const first = element('#copy').click();
  const finishFirst = finishCopy;
  const second = element('#copy').click();
  finishFirst();
  await first;
  assert.equal(element('#copy-status').textContent, '');
  finishCopy();
  await second;
  assert.equal(element('#copy').textContent, 'Copied');
  element('#generate').click();
  assert.equal(element('#copy').textContent, 'Copy haiku');
  assert.equal(element('#copy-status').textContent, '');
});
