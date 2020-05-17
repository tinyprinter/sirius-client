import { promises as fs } from 'fs';
import yaml from 'js-yaml';

export default async (path: string): Promise<object> => {
  return yaml.safeLoad(await fs.readFile(path, 'utf8'));
};
