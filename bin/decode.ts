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

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const args = process.argv.slice(2);
const path = args[0];

if (path == null) {
  console.error('required arg: /path/to/file');
  process.exit(1);
}

// const input = [1, 2, 3, 1000000, 10000, 100000];

// const output = [] as number[];

// input.forEach((item, idx) => {
//   // evens are white:
//   const value = idx % 2 == 0 ? 1 : 0;

//   const run = Array(item).fill(value);

//   console.log({ idx, item, value }, output.length + run.length);

//   // doin' some fun hacks, since `output.push(...run);` will overflow on longlonglong runs
//   const length = output.length;
//   output.length += run.length;

//   for (let i = 0; i < run.length; i++) {
//     output[length + i] = run[i];
//   }
// });

// console.log(output.length);
// input.forEach((item, idx) => {});

// return output;

(async () => {
  const string = await readFile(path);
  const json = JSON.parse(string.toString('utf-8'));
  const result = await decoder(json.binary_payload);

  console.log('header:', result.header);

  await writeFile('out.bmp', result.payload.bitmap);
  console.log('wrote to out.bmp');
})();
