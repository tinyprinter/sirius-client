import { promises as fs } from 'fs';

export default async (path: string): Promise<object> => {
  return JSON.parse(await fs.readFile(path, 'utf8'));
};
