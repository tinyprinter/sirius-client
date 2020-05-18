import Path from 'path';

import js from './js';
import json from './json';
import yaml from './yaml';

const parse = async (path: string): Promise<object> => {
  const extension = Path.extname(path);

  switch (extension) {
    case '.js':
      return await js(path);
    case '.json':
      return await json(path);
    case '.yaml':
    case '.yml':
      return await yaml(path);

    default:
      throw new Error(`unknown configuration file type: ${extension}`);
  }
};

export default parse;
