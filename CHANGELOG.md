# Changelog

All notable changes to this project are documented here. Versions match the
number printed in the page footer and in the `index.html` header comment.

## [1.1.0] — 2026-09-12

- QR hint now carries an explicit air-gapped transfer warning: scan the
  SeedQR only with an offline, trusted device (e.g. SeedSigner) — never
  with a phone or camera app connected to the internet. 
- "Good practice" list now names a concrete offline-generation example:
  a Tails OS USB stick on an air-gapped machine.

  [1.1.0]: https://github.com/Solo-in-Code/bip39-seed-generator/releases/tag/v1.1.0

## [1.0.0] — 2026-09-11

Initial release.

- BIP-39 mnemonic generation (12 / 15 / 18 / 21 / 24 words) using
  `crypto.getRandomValues`
- Word-by-word masked display with an explicit reveal step
- Optional BIP-39 passphrase field, with its own random-word generator
  (8 / 10 / 12 words) drawn from the same wordlist
- Physical dice-roll entropy input — required roll count tracks the selected
  word count (50 for 12 words, up to 100 for 24), entropy derived as
  `SHA-256(rolls)` truncated to length, no device randomness mixed in
- Standard SeedQR export (SeedSigner-compatible numeric format), rendered
  with the embedded `qrcode-generator` library (MIT, Kazuhiko Arase)
- Phrase checksum verifier, for checking a hand-transcribed backup
- Derived seed (PBKDF2-HMAC-SHA512, 2048 rounds) display
- Live online/offline status badge
- Self-test against the official BIP-39 test vectors, runs on page load
- Strict Content-Security-Policy (`default-src 'none'`); no network requests
- MIT License

[1.0.0]: https://github.com/Solo-in-Code/bip39-seed-generator/releases/tag/v1.0.0
