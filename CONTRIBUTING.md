# Contributing

Thanks for taking the time — this is a small, security-sensitive tool, so the
bar for changes is a bit different from a typical web project. A few rules
that keep it trustworthy:

## Hard rules

- **No network calls, ever.** The page's Content-Security-Policy is
  `default-src 'none'`. Don't add a CDN import, a font, an analytics snippet,
  or a `fetch`/`XHR` call — even a well-intentioned one (update checks
  included). The entire value of this tool is that it works fully offline and
  can never phone home. A PR that needs to relax the CSP will be rejected
  unless there's a very good reason and it's discussed in an issue first.
- **No new third-party dependencies without discussion.** Every dependency is
  an audit burden and an attack-surface increase. The one exception in this
  repo (`qrcode-generator`) was chosen deliberately and is embedded in full,
  not pulled from a CDN. Open an issue before adding another.
- **Any change to `entropyToMnemonicWords`, `validateMnemonicWords`,
  `mnemonicToSeed`, or the embedded wordlist/test vectors must pass
  `tests/`, no exceptions.** These are the functions where a subtle bug
  means real funds at risk. If your change alters behavior here, add a test
  vector that would have caught the bug, not just a passing case.
- **Keep it a single HTML file.** No build step, no bundler, no minification
  of the tool's own logic (the embedded third-party library is the one
  exception, already minified upstream). Anyone should be able to open this
  file in a text editor and read exactly what it does — that's a feature.

## Before opening a PR

```bash
cd tests
npm install
npm test
```

All checks should pass locally before you push — CI runs the same suite and
will block merging otherwise.

## Suggesting a feature

Open an issue first for anything beyond a small fix, especially UI changes.
Small, focused PRs are much easier to review carefully than large ones — and
careful review is the whole point here.

## Reporting a security issue

If you find something that could lead to a predictable, weak, or otherwise
compromised seed/passphrase, please don't open a public issue with exploit
details. Open a minimal issue asking for a private channel, or contact the
maintainer directly (see README). Everything else — UI bugs, typos, feature
requests — is fine as a normal public issue.
