#!/usr/bin/env node
// Project verification script for AI for Consumer Rights & Legal Aid Guide
// Runs HTML validity, JS syntax, copyright-line, and secret-scan checks.
// Usage: node scripts/verify.js

const fs = require('fs');
const path = require('path');

const root = process.cwd();
let failures = 0;
let passes = 0;

function ok(msg) {
  passes++;
  console.log(`PASS: ${msg}`);
}
function fail(msg) {
  failures++;
  console.error(`FAIL: ${msg}`);
}

// ---------- Required files ----------
const requiredFiles = [
  'LICENSE',
  'README.md',
  'STATUS.md',
  'docs/00-overview.md',
  'docs/01-free-ai-tools.md',
  'docs/02-warranty-claims.md',
  'docs/03-repair-or-replace.md',
  'docs/04-complaint-letters.md',
  'docs/05-small-claims-court.md',
  'docs/06-demand-letter-templates.md',
  'docs/07-deadline-tracker.md',
  'site/index.html',
  'site/warranty-claims.html',
  'site/repair-or-replace.html',
  'site/complaint-letters.html',
  'site/small-claims-court.html',
  'site/demand-letters.html',
  'site/deadline-tracker.html',
  'site/assets/css/style.css',
  'site/assets/js/tracker.js',
];

console.log('\n--- Required files ---');
for (const f of requiredFiles) {
  if (fs.existsSync(path.join(root, f))) ok(`exists: ${f}`);
  else fail(`missing: ${f}`);
}

// ---------- No .github/workflows ----------
console.log('\n--- No GitHub Actions workflows ---');
if (fs.existsSync(path.join(root, '.github'))) {
  const wf = path.join(root, '.github', 'workflows');
  if (fs.existsSync(wf) && fs.readdirSync(wf).length > 0) {
    fail('.github/workflows contains files');
  } else {
    ok('no .github/workflows files');
  }
} else {
  ok('no .github directory');
}

// ---------- LICENSE copyright line ----------
console.log('\n--- LICENSE copyright line ---');
const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
const expected = 'Copyright (c) 2026 Asdale Dynamics, LLC';
if (license.includes(expected)) ok(`LICENSE contains exactly: "${expected}"`);
else fail(`LICENSE missing exact line: "${expected}"`);

// ---------- README credits Asdale Dynamics, LLC ----------
console.log('\n--- README credits ---');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
if (/Asdale Dynamics, LLC/i.test(readme)) ok('README credits Asdale Dynamics, LLC');
else fail('README does not credit Asdale Dynamics, LLC');

// ---------- Education-only disclaimer ----------
console.log('\n--- Education-only disclaimer ---');
if (/not legal advice/i.test(readme)) ok('README contains education-only disclaimer');
else fail('README missing education-only disclaimer');

// ---------- Privacy rules ----------
console.log('\n--- Privacy rules ---');
if (/Social Security|financial|account number/i.test(readme)) ok('README mentions ID/financial data rules');
else fail('README missing ID/financial data privacy rules');

// ---------- No secrets / API keys / personal data ----------
console.log('\n--- Secret / personal-data scan ---');
const secretPatterns = [
  /sk-[A-Za-z0-9]{20,}/,            // OpenAI-style keys
  /AIza[0-9A-Za-z\-_]{35}/,         // Google API keys
  /ghp_[A-Za-z0-9]{36,}/,           // GitHub tokens
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/, // private keys
  /\b\d{3}-\d{2}-\d{4}\b/,          // SSN-like
  /\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b/, // credit-card-like
];
let scanned = 0;
function scanFile(filePath) {
  const rel = path.relative(root, filePath);
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return; }
  scanned++;
  for (const pat of secretPatterns) {
    if (pat.test(content)) {
      fail(`possible secret in ${rel}: ${pat}`);
    }
  }
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '.git' && entry.name !== 'node_modules') walk(full);
    } else {
      scanFile(full);
    }
  }
}
walk(root);
if (scanned > 0) ok(`scanned ${scanned} files for secrets/personal data`);

// ---------- JS syntax ----------
console.log('\n--- JavaScript syntax ---');
const { execSync } = require('child_process');
const jsFiles = [
  path.join(root, 'site', 'assets', 'js', 'tracker.js'),
];
for (const f of jsFiles) {
  try {
    execSync(`node --check ${f}`, { stdio: 'pipe' });
    ok(`syntax OK: ${path.relative(root, f)}`);
  } catch (err) {
    fail(`syntax error in ${path.relative(root, f)}: ${err.message}`);
  }
}

// ---------- HTML validity (lightweight, void-element aware) ----------
console.log('\n--- HTML validity ---');
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const OPTIONAL_CLOSE = new Set(['p','li','td','th','tr','dt','dd','rt','rp','optgroup','option']);
const htmlFiles = fs.readdirSync(path.join(root, 'site')).filter(f => f.endsWith('.html'));
for (const f of htmlFiles) {
  const filePath = path.join(root, 'site', f);
  const raw = fs.readFileSync(filePath, 'utf8');
  const stack = [];
  let fileFailed = false;
  const tagRe = /<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\s*\/?\s*>/g;
  let m;
  while ((m = tagRe.exec(raw)) !== null) {
    const closing = m[0].startsWith('</');
    const tag = m[1].toLowerCase();
    if (VOID.has(tag)) continue;
    if (!closing) {
      if (tag === 'p') { while (stack.length && stack[stack.length - 1] === 'p') stack.pop(); }
      stack.push(tag);
    } else {
      if (OPTIONAL_CLOSE.has(tag)) {
        if (stack.length && stack[stack.length - 1] === tag) stack.pop();
        continue;
      }
      if (stack.length && stack[stack.length - 1] === tag) stack.pop();
      else { fail(`unexpected close </${tag}> in ${f} (stack: ${stack.slice(-5).join(', ')})`); fileFailed = true; break; }
    }
  }
  if (!fileFailed && stack.length) {
    fail(`unclosed tags in ${f}: ${stack.join(', ')}`);
    fileFailed = true;
  }
  if (!fileFailed) ok(`valid structure: ${f}`);
}

// ---------- Required topic coverage ----------
console.log('\n--- Topic coverage ---');
const allDocs = requiredFiles.filter(f => f.startsWith('docs/')).map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const allSite = htmlFiles.map(f => fs.readFileSync(path.join(root, 'site', f), 'utf8')).join('\n');
const combined = allDocs + '\n' + allSite + '\n' + readme;
const topics = ['warranty', 'small-claims', 'repair', 'complaint', 'deadline', 'template'];
for (const t of topics) {
  if (new RegExp(t, 'i').test(combined)) ok(`topic covered: ${t}`);
  else fail(`topic missing: ${t}`);
}

console.log(`\n--- Result: ${passes} passed, ${failures} failed ---`);
process.exit(failures > 0 ? 1 : 0);
