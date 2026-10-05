/* Pure deterministic core for AI Haiku Noise.
   No DOM access here, so the same file works as a classic browser script
   (exposing globalThis.HaikuCore) and as a CommonJS module under node. */

const openings = ['Neon turnips bloom', 'A velvet thunderclap', 'Small planets rehearse', 'The hallway sighs once', 'Paper comets descend', 'Blue potatoes hum'];
const middles = ['while your idea folds inward', 'my left shoe negotiates', 'and the kettle learns jazz', 'as invisible ducks vote', 'beneath a polite eclipse', 'where passwords grow whiskers'];
const endings = ['Tuesday forgets your name', 'the moon requests a receipt', 'nothing is technically soup', 'a spoon applauds itself', 'tomorrow wears mittens', 'the floor keeps the secret'];

const FALLBACK_TEXT = 'A thought with no luggage';
const MAX_CHARS = 240;

function hash(text) {
  if (text == null || typeof text !== 'string') {
    throw new TypeError('hash expects a string');
  }
  let value = 17;
  // for..of iterates by code point; codePointAt(0) hashes the whole code point so
  // astral characters (emoji, rare CJK) do not collapse onto their high surrogate.
  for (const char of text) value = (value * 31 + char.codePointAt(0)) >>> 0;
  return value;
}

function linesFor(seed) {
  if (typeof seed !== 'number' || !Number.isFinite(seed)) {
    seed = 0;
  }
  seed = Math.floor(seed);
  const pick = (items, offset) => {
    let index = (seed + offset) % items.length;
    if (index < 0) index += items.length;
    return items[index];
  };
  return [pick(openings, 3), pick(middles, 11), pick(endings, 23)];
}

function absurdityFor(seed) {
  if (typeof seed !== 'number' || !Number.isFinite(seed)) {
    seed = 0;
  }
  seed = Math.floor(seed);
  return 61 + ((seed % 39 + 39) % 39);
}

const HaikuCore = Object.freeze({ hash, linesFor, absurdityFor, openings, middles, endings, FALLBACK_TEXT, MAX_CHARS });

if (typeof module === 'object' && module.exports) module.exports = HaikuCore;
else globalThis.HaikuCore = HaikuCore;
