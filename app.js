/* UI layer for AI Haiku Noise. Every deterministic value comes from haiku-core.js,
   which must be loaded first and exposes the global `HaikuCore`. */

function init() {
  const core = globalThis.HaikuCore;
  const prompt = document.querySelector('#prompt');
  const count = document.querySelector('#char-count');
  const output = document.querySelector('#haiku-output');
  const meter = document.querySelector('#meter');
  const stamp = document.querySelector('#stamp');
  const copyButton = document.querySelector('#copy');
  const copyStatus = document.querySelector('#copy-status');
  const limitStatus = document.querySelector('#limit-status');
  const generateButton = document.querySelector('#generate');

  if (!core || !prompt || !count || !output || !meter || !stamp || !copyButton || !copyStatus || !limitStatus || !generateButton) return;

  function generate() {
    const text = prompt.value.trim() || core.FALLBACK_TEXT;
    const seed = core.hash(text);
    const lines = core.linesFor(seed);
    output.replaceChildren(...lines.map((line) => { const p = document.createElement('p'); p.textContent = line; return p; }));
    meter.textContent = `absurdity: ${core.absurdityFor(seed)}%`;
    stamp.textContent = `seed ${seed} / just now`;
    limitStatus.textContent = '';
  }

  function updateCount() {
    const length = prompt.value.length;
    count.textContent = `${length} / ${core.MAX_CHARS}`;
    const remaining = core.MAX_CHARS - length;
    limitStatus.textContent = remaining <= 20 ? `${remaining} character${remaining === 1 ? '' : 's'} remaining` : '';
  }

  function selectOutput() {
    const range = document.createRange();
    range.selectNodeContents(output);
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return selection.toString().trim().length > 0;
  }

  let copyFeedbackTimer;
  async function copyHaiku() {
    const text = [...output.querySelectorAll('p')].map((line) => line.textContent).join('\n');
    let copied = false;
    let selected = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      selected = selectOutput();
      if (selected && typeof document.execCommand === 'function') {
        try {
          copied = document.execCommand('copy');
        } catch {
          // Keep the selection available for a manual copy when permission is denied.
        }
      }
    }
    clearTimeout(copyFeedbackTimer);
    if (copied) {
      copyButton.textContent = 'Copied';
      copyStatus.textContent = 'Haiku copied to clipboard.';
    } else if (selected) {
      copyButton.textContent = 'Press Ctrl/Cmd+C';
      copyStatus.textContent = 'Haiku selected. Press Control or Command plus C to copy it.';
    } else {
      copyButton.textContent = 'Copy manually';
      copyStatus.textContent = 'Select the haiku text and copy it manually.';
    }
    copyFeedbackTimer = setTimeout(() => { copyButton.textContent = 'Copy haiku'; copyStatus.textContent = ''; }, 2000);
  }

  prompt.addEventListener('input', updateCount);
  generateButton.addEventListener('click', generate);
  document.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', () => {
    prompt.value = button.dataset.sample;
    updateCount();
    generate();
  }));
  copyButton.addEventListener('click', copyHaiku);

  updateCount();
  generate();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
