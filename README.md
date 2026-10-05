# AI Haiku Noise

A no-dependency browser toy that turns any sentence into a three-line absurd haiku. The generator is a pure function of the text you type: the same sentence always produces the same three lines and the same absurdity score, so two people can compare results without a server.

## Run

Open `index.html` in any modern browser. No build step, network request, or API key is required.

## Controls

- Type or paste up to 240 characters. The counter warns you (via a screen-reader announcement) when 20 or fewer characters remain.
- Select a sample prompt or press **Generate noise**.
- Use **Copy haiku** to place the three generated lines on the clipboard.

## How the output is derived

Every input string is mapped to an unsigned 32-bit hash, and that hash selects one line from each of three fixed word lists and sets the absurdity score. The stamp above the haiku shows the full hash, so two people who type the same sentence see the identical stamp, and anyone can confirm at a glance that they ran the same input.

To reproduce someone else's haiku, type the same sentence. The hash is not a seed you can enter on its own, and the words come from fixed lists, so the output is a lookup rather than generated text.

## Tests

The deterministic core lives in `haiku-core.js` and is covered by node's built-in test runner:

```
npm test
```

## License

MIT. See `LICENSE`.
