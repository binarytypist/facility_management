#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_EXT = new Set(['.ts', '.js', '.tsx', '.jsx', '.html']);
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git', '.angular', 'coverage']);

const emojiRegex = /[\p{Extended_Pictographic}]/u;
const consoleRegex = /\bconsole\.(log|debug|info|trace)\s*\(([\s\S]*?)\)/g;

const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(full);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!TARGET_EXT.has(ext)) continue;

    const content = fs.readFileSync(full, 'utf8');

    let match;
    while ((match = consoleRegex.exec(content)) !== null) {
      const msg = match[2] || '';
      failures.push({
        file: full,
        reason: `Disallowed console.${match[1]} usage`,
      });

      if (emojiRegex.test(msg)) {
        failures.push({
          file: full,
          reason: `Emoji found in console.${match[1]} message`,
        });
      }
    }

    if (emojiRegex.test(content)) {
      failures.push({
        file: full,
        reason: 'Emoji character found in source',
      });
    }
  }
}

walk(ROOT);

if (failures.length) {
  console.error('\nCode quality check failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.reason}`);
  }
  console.error('\nRemove disallowed console usage/emojis and keep code clean/readable.\n');
  process.exit(1);
}

console.log('No disallowed console usage or emoji content found.');
