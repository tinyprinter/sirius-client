#!/usr/bin/env ts-node-script

import parseYaml from '../src/config/parseYaml';
import { promises as fs } from 'fs';
import Path from 'path';

const filename = process.argv[process.argv.length - 1];

if (filename == null || filename.includes(__filename)) {
  console.log('no filename provided');
  process.exit(1);
}

const run = async (): Promise<void> => {
  const path = await fs.realpath(Path.join(process.cwd(), filename));

  const config = await parseYaml(path);

  // console.log({ config });
};

run();
