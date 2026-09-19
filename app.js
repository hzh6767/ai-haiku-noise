const prompt = document.querySelector('#prompt');
const count = document.querySelector('#char-count');
const output = document.querySelector('#haiku-output');
const meter = document.querySelector('#meter');
const stamp = document.querySelector('#stamp');
const copyButton = document.querySelector('#copy');

const openings = ['Neon turnips bloom', 'A velvet thunderclap', 'Small planets rehearse', 'The hallway sighs once', 'Paper comets descend', 'Blue potatoes hum'];
const middles = ['while your idea folds inward', 'my left shoe negotiates', 'and the kettle learns jazz', 'as invisible ducks vote', 'beneath a polite eclipse', 'where passwords grow whiskers'];
const endings = ['Tuesday forgets your name', 'the moon requests a receipt', 'nothing is technically soup', 'a spoon applauds itself', 'tomorrow wears mittens', 'the floor keeps the secret'];

function hash(text) {
  let value = 17;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

function generate() {
  const text = prompt.value.trim() || 'A thought with no luggage';
  const seed = hash(text);
  const pick = (items, offset) => items[(seed + offset) % items.length];
  const lines = [pick(openings, 3), pick(middles, 11), pick(endings, 23)];
  output.replaceChildren(...lines.map((line) => { const p = document.createElement('p'); p.textContent = line; return p; }));
  const absurdity = 61 + (seed % 39);
  meter.textContent = `absurdity: ${absurdity}%`;
  stamp.textContent = `seed ${String(seed).slice(-4)} / just now`;
}

prompt.addEventListener('input', () => { count.textContent = `${prompt.value.length} / 240`; });
document.querySelector('#generate').addEventListener('click', generate);
document.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', () => { prompt.value = button.dataset.sample; prompt.dispatchEvent(new Event('input')); generate(); }));
copyButton.addEventListener('click', async () => {
  const text = [...output.querySelectorAll('p')].map((line) => line.textContent).join('\n');
  try { await navigator.clipboard.writeText(text); copyButton.textContent = 'Copied'; setTimeout(() => { copyButton.textContent = 'Copy haiku'; }, 1400); } catch { copyButton.textContent = 'Select to copy'; }
});
prompt.dispatchEvent(new Event('input'));
