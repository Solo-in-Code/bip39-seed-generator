/**
 * Validation suite for the BIP-39 Seed Phrase Generator.
 *
 * This does NOT re-implement the tool's logic and hope it matches — it extracts
 * the exact wordlist, exact test-vector data, and exact core functions embedded
 * in ../index.html and exercises THAT code, so a green run here means the file
 * you're about to trust, not a copy of it, passed.
 *
 * Run:  cd tests && npm install && npm test
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const bip39ref = require('bip39');
const qrcodeRef = require('qrcode-generator');

const HTML_PATH = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

function between(src, startMarker, endMarker, fromIndex) {
  const s = src.indexOf(startMarker, fromIndex) + startMarker.length;
  const e = src.indexOf(endMarker, s);
  if (s < startMarker.length || e < 0) throw new Error('marker not found: ' + startMarker);
  return { text: src.slice(s, e), end: e };
}

// --- Extract the exact embedded core functions, wordlist, and official test vectors ---
const coreStart = html.indexOf('// BIP-39 core logic');
const coreEnd = html.indexOf('\nconst WORDLIST');
if (coreStart < 0 || coreEnd < 0) throw new Error('could not locate embedded core logic in index.html');
const coreSrc = html.slice(coreStart, coreEnd);

const wl = between(html, 'const WORDLIST = "', '".split', 0);
const WORDLIST = wl.text.split(' ');

const tv = between(html, 'const TEST_VECTORS = ', ';\n', wl.end);
const TEST_VECTORS = JSON.parse(tv.text);

// Evaluate the exact embedded core function source in this scope (not a re-typed copy)
eval(coreSrc);

let passed = 0;
function ok(label) { passed++; console.log('  [ok] ' + label); }

async function main() {
  console.log('Testing:', HTML_PATH);
  console.log('Embedded wordlist length:', WORDLIST.length);
  console.log('Embedded official test-vector count:', TEST_VECTORS.length);
  console.log('');

  // 1. Wordlist identity
  assert.strictEqual(WORDLIST.length, 2048);
  assert.deepStrictEqual(WORDLIST, bip39ref.wordlists.english);
  ok('embedded wordlist matches the bip39 npm reference package, same order, no drift');

  // 2. Official BIP-39 test vectors (bip-0039 spec), passphrase "TREZOR"
  for (const [entropyHex, expectedMnemonic, expectedSeedHex] of TEST_VECTORS) {
    const entropy = hexToBytes(entropyHex);
    const words = await entropyToMnemonicWords(entropy, WORDLIST);
    assert.strictEqual(words.join(' '), expectedMnemonic);

    const val = await validateMnemonicWords(words, WORDLIST);
    assert.strictEqual(val.valid, true);
    assert.strictEqual(bytesToHex(val.entropyBytes), entropyHex);

    const seed = await mnemonicToSeed(expectedMnemonic, 'TREZOR');
    assert.strictEqual(bytesToHex(seed), expectedSeedHex);
  }
  ok(`all ${TEST_VECTORS.length} official BIP-39 test vectors pass (mnemonic + checksum + PBKDF2 seed)`);

  // 3. Randomized cross-check against the bip39 reference package, every valid entropy length
  const byteLengths = [16, 20, 24, 28, 32];
  const trials = 40;
  for (const len of byteLengths) {
    for (let t = 0; t < trials; t++) {
      const entropy = new Uint8Array(len);
      crypto.getRandomValues(entropy);
      const entropyHex = bytesToHex(entropy);

      const mine = (await entropyToMnemonicWords(entropy, WORDLIST)).join(' ');
      assert.strictEqual(mine, bip39ref.entropyToMnemonic(entropyHex));

      const val = await validateMnemonicWords(mine.split(' '), WORDLIST);
      assert.strictEqual(val.valid, true);
      assert.strictEqual(bip39ref.validateMnemonic(mine), true);

      const pass = t % 2 === 0 ? '' : 'correct horse battery staple';
      const mySeed = bytesToHex(await mnemonicToSeed(mine, pass));
      assert.strictEqual(mySeed, bip39ref.mnemonicToSeedSync(mine, pass).toString('hex'));
    }
  }
  ok(`${byteLengths.length * trials} randomized trials match the bip39 reference package (mnemonic + validate + seed)`);

  // 4. Negative cases: corrupted mnemonics must be rejected
  const zeroWords = await entropyToMnemonicWords(new Uint8Array(16), WORDLIST);
  const wrongWord = [...zeroWords]; wrongWord[0] = wrongWord[0] === 'zoo' ? 'abandon' : 'zoo';
  assert.strictEqual((await validateMnemonicWords(wrongWord, WORDLIST)).valid, false);
  assert.strictEqual((await validateMnemonicWords(zeroWords.slice(0, 11), WORDLIST)).valid, false);
  const notAWord = [...zeroWords]; notAWord[3] = 'notarealbip39word';
  assert.strictEqual((await validateMnemonicWords(notAWord, WORDLIST)).valid, false);
  ok('corrupted / wrong-length / unknown-word mnemonics are correctly rejected');

  // 5. Standard SeedQR: cross-check against SeedSigner's own published test vector
  // https://github.com/SeedSigner/seedsigner/blob/main/docs/seed_qr/README.md
  const ssMnemonic = 'attack pizza motion avocado network gather crop fresh patrol unusual wild holiday candy pony ranch winter theme error hybrid van cereal salon goddess expire';
  const ssExpectedDigits = '011513251154012711900771041507421289190620080870026613431420201617920614089619290300152408010643';
  const ssWords = ssMnemonic.split(' ');
  const ssDigits = ssWords.map((w) => String(WORDLIST.indexOf(w)).padStart(4, '0')).join('');
  assert.strictEqual(ssDigits, ssExpectedDigits);
  const qr = qrcodeRef(0, 'L');
  qr.addData(ssDigits, 'Numeric');
  qr.make();
  assert.strictEqual(qr.getModuleCount(), 29);
  ok('Standard SeedQR digit encoding matches SeedSigner\'s published 24-word test vector exactly (96 digits, 29x29 QR)');

  console.log(`\nALL CHECKS PASSED (${passed}/${passed}). index.html's embedded logic is verified against official BIP-39 test vectors,\nan independent reference implementation, and SeedSigner's own SeedQR test vector.`);
}

main().catch((e) => {
  console.error('\nVALIDATION FAILED:', e);
  process.exit(1);
});
