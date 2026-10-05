/* Tests for the deterministic core in haiku-core.js.
   Run with: npm test   (or directly: node --test tests/) */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const core = require('../haiku-core.js');

const OPENINGS = core.openings;
const MIDDLES = core.middles;
const ENDINGS = core.endings;

test('hash matches hand-computed vectors', () => {
  // value starts at 17; each code point adds value * 31 + charCode
  assert.equal(core.hash(''), 17);
  assert.equal(core.hash('a'), 17 * 31 + 97);
  assert.equal(core.hash('a'), 624);
  assert.equal(core.hash('é'), 17 * 31 + 233);
  assert.equal(core.hash('é'), 760);
});

test('hash iterates by code point, so an astral character counts once', () => {
  assert.equal('\u{1F600}'.length, 2, 'sanity: surrogate pair has length 2');
  assert.equal(core.hash('\u{1F600}'), 17 * 31 + 0xd83d);
  assert.equal(core.hash('\u{1F600}'), 55884);
});

test('hash is a pure unsigned 32-bit function of its input', () => {
  const phrase = 'I forgot why I walked into the kitchen';
  const seed = core.hash(phrase);
  assert.ok(Number.isInteger(seed));
  assert.ok(seed >= 0 && seed <= 0xffffffff);
  assert.equal(seed, core.hash(phrase));
  assert.equal(core.hash('a'), core.hash('a'));
});

test('linesFor picks exactly the documented lines for a known seed', () => {
  // seed 624 -> indices [3, 5, 5] and seed 17 -> indices [5, 4, 4]
  assert.deepEqual(core.linesFor(624), [
    'The hallway sighs once',
    'where passwords grow whiskers',
    'the floor keeps the secret'
  ]);
  assert.deepEqual(core.linesFor(17), [
    'Small planets rehearse',
    'beneath a polite eclipse',
    'tomorrow wears mittens'
  ]);
});

test('linesFor always returns three non-empty lines from the fixed word lists', () => {
  const seeds = [0, 1, 2, 3, 5, 11, 17, 23, 624, 411453547, 4122987913, 2147483647, 4294967295];
  for (const seed of seeds) {
    const lines = core.linesFor(seed);
    assert.equal(lines.length, 3, `seed ${seed} produced ${lines.length} lines`);
    assert.ok(OPENINGS.includes(lines[0]), `opening not from list: ${lines[0]}`);
    assert.ok(MIDDLES.includes(lines[1]), `middle not from list: ${lines[1]}`);
    assert.ok(ENDINGS.includes(lines[2]), `ending not from list: ${lines[2]}`);
    for (const line of lines) assert.ok(line.length > 0);
  }
});

test('absurdityFor stays inside the advertised 61-99 range', () => {
  assert.equal(core.absurdityFor(624), 61);
  assert.equal(core.absurdityFor(17), 78);
  for (let seed = 0; seed < 1000; seed += 1) {
    const value = core.absurdityFor(seed);
    assert.ok(Number.isInteger(value), `not an integer: ${value}`);
    assert.ok(value >= 61 && value <= 99, `out of range for seed ${seed}: ${value}`);
  }
  assert.equal(core.absurdityFor(0xffffffff), 61 + (0xffffffff % 39));
});

test('the documented sample sentence maps to its locked-in haiku', () => {
  const seed = core.hash('I forgot why I walked into the kitchen');
  assert.equal(seed, 4122987913);
  assert.deepEqual(core.linesFor(seed), [
    'Paper comets descend',
    'while your idea folds inward',
    'Tuesday forgets your name'
  ]);
  assert.equal(core.absurdityFor(seed), 92);
});

test('the same sentence always produces the same haiku', () => {
  const phrase = 'The moon is buffering again';
  assert.deepEqual(core.linesFor(core.hash(phrase)), core.linesFor(core.hash(phrase)));
  assert.equal(core.absurdityFor(core.hash(phrase)), core.absurdityFor(core.hash(phrase)));
});

test('different sentences generally produce different haikus', () => {
  const a = core.linesFor(core.hash('A pigeon owes me a small apology'));
  const b = core.linesFor(core.hash('My socks have formed a committee'));
  assert.notDeepEqual(a, b);
});

test('empty input falls back to the documented placeholder phrase', () => {
  assert.equal(core.FALLBACK_TEXT, 'A thought with no luggage');
  assert.equal(core.linesFor(core.hash(core.FALLBACK_TEXT)).length, 3);
});

test('MAX_CHARS matches the textarea maxlength in index.html', () => {
  assert.equal(core.MAX_CHARS, 240);
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /maxlength="240"/);
});

test('index.html loads the core before app.js and keeps the ids app.js needs', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.indexOf('haiku-core.js') < html.indexOf('app.js'), 'core must load first');
  for (const id of ['prompt', 'char-count', 'haiku-output', 'meter', 'stamp', 'copy', 'copy-status', 'limit-status', 'generate']) {
    assert.ok(html.includes(`id="${id}"`), `index.html is missing #${id}`);
  }
  for (const file of ['index.html', 'app.js', 'haiku-core.js', 'style.css']) {
    assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  }
});
