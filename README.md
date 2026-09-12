# BIP-39 Seed Phrase Generator

[![tests](https://github.com/Solo-in-Code/bip39-seed-generator/actions/workflows/test.yml/badge.svg)](https://github.com/Solo-in-Code/bip39-seed-generator/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-bf9257.svg)](LICENSE)

A single self-contained HTML file that generates BIP-39 Bitcoin seed phrases
entirely in your browser — no server, no build step, no network requests.
Takes cues from [SeedSigner](https://github.com/SeedSigner/seedsigner) and
the [seQRets](https://github.com/seQRets) tools (My-Passphrase, ittybitz).

> ⚠️ **Use this tool at your own risk.** It is provided "as is", without
> warranty of any kind, express or implied. You are solely responsible for how
> you use it and for the safety of your funds.
>
> 🔍 **Don't trust, verify.** Check that the built-in self-test passes on every
> load, and independently verify your phrases and seeds with other tools before
> trusting them — never rely on any single tool, including this one.

## What it does

- Generates a 12/15/18/21/24-word BIP-39 mnemonic using `crypto.getRandomValues`
- Optional BIP-39 passphrase (the "25th word"), with its own random-word
  generator and a live bit-strength readout
- Generates from physical dice rolls instead of the device's RNG, if you'd
  rather not trust that at all
- Exports the phrase as a Standard SeedQR (SeedSigner-compatible) for
  scanning into a signing device
- Verifies a hand-transcribed phrase's checksum
- Shows the derived seed (PBKDF2-HMAC-SHA512)
- Self-tests against the official BIP-39 test vectors on every page load
- Zero network requests — enforced by the page's own Content-Security-Policy,
  not just a promise in this README

## Quick start

1. Download `index.html` (and ideally verify its hash — see
   [Trust & verification](#trust--verification) below).
2. For anything beyond testing, move it to a device that is offline and will
   stay offline — this page never calls out, but you're still trusting the
   device it runs on.
3. Open the file directly in a browser (double-click it — no server needed).
4. Generate, write the words down by hand, verify the backup using the
   "Check an existing phrase" tool, then import into your wallet of choice.

## Security model

- **No network access.** The `<meta http-equiv="Content-Security-Policy">`
  tag sets `default-src 'none'`, which blocks outbound requests at the
  browser level — this holds even if the JavaScript were modified, not only
  if you trust it not to try.
- **No storage.** Nothing is written to localStorage, cookies, or disk.
  Closing the tab clears everything.
- **Masked by default.** Words render as bullets until you explicitly reveal
  them, so a screen share or shoulder-surf doesn't leak anything by accident.
- **Copy-to-clipboard clears itself after 45 seconds.**

None of this makes the device trustworthy — only the page.

## Trust & verification

**Don't trust, verify.** Be honest with yourself about what "AI-assisted,
tested code" does and doesn't prove. This tool passed its own test suite (see
below) and matches official test vectors — that's real evidence, but it is not
the same category of trustworthy as software with a multi-year history of
independent contributors, public scrutiny, and ideally a paid audit. This is a
first release, from one author, with no independent review yet. Treat it that
way.

Concretely, before trusting this — or any single-author wallet tool — with
funds that matter:

- **Read the source.** It's one unminified file with no build step. The
  cryptographic logic is a few hundred commented lines; the only large
  embedded blocks are the third-party QR library and the BIP-39
  wordlist/test-vector data, both clearly marked and diffable against their
  original sources.
- **Run the tests yourself** rather than trust this README's word for it:

  ```bash
  cd tests
  npm install
  npm test
  ```

  This re-derives the exact logic embedded in `index.html` — not a
  reimplementation — and checks it against the official BIP-39 test vectors,
  against the independent `bip39` npm package, and against SeedSigner's own
  published SeedQR test vector. CI runs this on every push; check the badge
  above before trusting a given commit.
- **Cross-check the output against a second, separately-built tool** — e.g.
  compare a generated phrase and its derived seed against Ian Coleman's BIP39
  tool run offline, or an actual hardware wallet — using a throwaway phrase,
  never a funded one, purely to compare outputs.
- **Verify your copy is unmodified.** Check the file's SHA-256 against the
  hash listed on each GitHub Release. A mismatch means the file changed
  somewhere between release and download.
- If you host this live for others to use as a website rather than a
  download, say so loudly and publish the hash — a server can serve different
  code to different visitors in a way a file on someone's own disk cannot.
  Downloading and running locally is the safer default this tool is built for.

## Limitations & future maintenance

**Likely to stay stable:** the Web Crypto API this relies on
(`crypto.getRandomValues`, `crypto.subtle`) is a mature, standardized part of
every browser, and browsers are conservative about breaking standardized
APIs. BIP-39, PBKDF2-HMAC-SHA512, and SHA-256 are the same primitives every
current BIP-39 wallet uses — if they were broken, the whole ecosystem would
need to respond, not just this file.

**What could actually need attention over time:**

- The embedded QR library (`qrcode-generator` v2.0.4, MIT) is a frozen copy.
  It won't receive upstream patches automatically; its job here is narrow
  (encode a known-good string into an image), so exposure is small, but
  someone should periodically check upstream for fixes.
- BIP-39's fixed 2048 PBKDF2 iterations is low by 2026 password-hashing
  standards. That's the BIP-39 spec itself, not a bug in this file — every
  BIP-39 wallet shares it — but it means passphrase strength is doing real
  work; a weak passphrase is more brute-forceable than the wordlist math
  alone suggests.
- Browser behavior around `navigator.onLine` and clipboard permissions has
  shifted before and could again. Both are convenience features here, not
  security boundaries, and fail safe — worst case the badge is wrong, or copy
  silently fails and you type the phrase instead.
- There is deliberately no update-check mechanism (that would require a
  network call). A downloaded copy does not know if a bug was found in it
  later. Watching this repo, or re-checking it before high-stakes use, is
  the only way to know.

**Current state, plainly:** no maintainer with a long public track record yet,
no second reviewer, no independent security audit. `tests/` and CI exist so
that can change over time — so a future pull request gets reviewed against a
green test run instead of against nothing.


## Project structure

```
.
├── index.html                    the tool — this is the only file you need to run it
├── LICENSE                       MIT
├── README.md                     this file
├── CHANGELOG.md
├── CONTRIBUTING.md
├── .github/workflows/test.yml    CI: runs tests/ on every push and PR
└── tests/
    ├── package.json
    └── verify.test.js            extracts index.html's embedded logic and validates it
```

## Credits

- [SeedSigner](https://github.com/SeedSigner/seedsigner) — MIT — general
  design inspiration and the Standard SeedQR format this tool exports
- [My-Passphrase](https://github.com/seQRets/My-Passphrase) /
  [mypassphrase.app](https://mypassphrase.app) — MIT — inspiration for the
  passphrase generator
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by
  Kazuhiko Arase — MIT — embedded in full in `index.html`, no CDN
- [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) —
  the standard this implements; wordlist and official test vectors sourced
  from the [bitcoin/bips](https://github.com/bitcoin/bips) repository
- [Claude](https://www.anthropic.com/claude) (Anthropic) — AI assistant that
  helped turn the author's ideas into the original implementation, project
  layout, test suite, and documentation
- [Qwen](https://qwen.ai) (Alibaba Cloud) — AI assistant that independently
  reviewed the code, corrected security and publishing details, and guided the
  author step by step through releasing this project

The author directed every decision; the assistants wrote and reviewed code
under that direction. Trust should still rest on what is verifiable in this
repository — the source, the official BIP-39 test vectors, and `tests/` — not
on any AI's word, including ours.

## Maintainer

Solo-in-Code — open a GitHub issue for anything public. For security-sensitive
reports, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Disclaimer

This tool is provided "as is", without warranty of any kind, express or
implied. Use it at your own risk. The authors are not liable for any loss of
funds, data, or other damages arising from its use.

**Don't trust, verify.** The tool runs a self-test against the official BIP-39
test vectors on every page load — confirm that it passes before using it.
Independently cross-check your phrases and seeds with other tools. A passing
self-test is evidence, not a guarantee, and it does not replace your own
diligence.

## License

MIT — see [LICENSE](LICENSE).
