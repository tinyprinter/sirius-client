#!/usr/bin/env node

import ConsolePrinter from '../src/device/printer/console_printer';

import decoder from '../src/decoder';
import fs from 'fs';
import { promisify } from 'util';

import termImg from 'term-img';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const args = process.argv.slice(2);
const path = args[0];

if (path == null) {
  console.error('required arg: /path/to/file');
  process.exit(1);
}

const printer = new ConsolePrinter('');

(async () => {
  const string = await readFile(path);
  const json = JSON.parse(string.toString('utf-8'));
  const result = await decoder(json.binary_payload);

  printer.handlePayload(result);

  return Promise.resolve();
})();
