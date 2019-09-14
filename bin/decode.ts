#!/usr/bin/env node

// import commander from '../src/commander';

// commander(process.argv.slice(2)).then(
//   () => {
//     // noop
//   },
//   err => {
//     console.error(err);
//     process.exit(123);
//   }
// );

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

(async () => {
  const string = await readFile(path);
  const json = JSON.parse(string.toString('utf-8'));
  const result = await decoder(json.binary_payload);

  console.log('header:', result.header);

  await writeFile('out.bmp', result.payload.bitmap);
  console.log('wrote to out.bmp');

  termImg(result.payload.bitmap);

  return Promise.resolve();
})();
