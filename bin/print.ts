#!/usr/bin/env ts-node-script

import Path from 'path';

const extension = Path.extname(__filename);
const idx = process.argv.indexOf(__filename);
const task = Path.basename(__filename).replace(extension, '');

console.log(
  `\n\n *** WARNING: this command is deprecated, please use:\n *** $ bin/cli.sh ${task} ${process.argv
    .slice(idx + 1)
    .filter((arg) => arg !== '-f')
    .join(' ')}\n\n`
);

const argv = process.argv.filter((arg) => arg !== '-f');
argv[idx] = Path.join(__dirname, `cli${extension}`);
argv.splice(idx + 1, 0, task);

process.argv = argv;

import cli from '../src/cli';

cli();
