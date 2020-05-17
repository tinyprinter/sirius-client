import BergBridge from '../berger/bridge';
import parse from './parse';
import make from './make';

export type PrinterConfiguration = object | undefined;

export default async (path: string): Promise<BergBridge> => {
  const configuration = await parse(path);
  return await make(configuration);
};
