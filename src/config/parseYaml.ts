import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import BergBridge from '../berger/bridge';
import parse from './parse';

const parseYaml = async (path: string): Promise<BergBridge> => {
  try {
    const string = await fs.readFile(path, 'utf8');
    const doc = yaml.safeLoad(string);

    return await parse(doc);
  } catch (error) {
    console.log('error parsing config:', error);

    throw error;
  }
};

export default parseYaml;
