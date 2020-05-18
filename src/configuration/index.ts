import BergBridge from '../berger/bridge';
import parse from './parse';
import make, { ConfigurationInFile } from './make';
import makePrinters from './make/printers';
import { assertType } from 'typescript-is';
import { PrintableImageHandler } from '../printer/printable-image-wrapper';

export type PrinterParameters = object | undefined;

export type Configuration = {
  bridge: BergBridge;
  printers: { [key: string]: PrintableImageHandler };
};

const printer = async (
  path: string,
  name: string | undefined
): Promise<PrintableImageHandler> => {
  const obj = await parse(path);
  const configuration = assertType<ConfigurationInFile>(obj);
  const printers = await makePrinters(configuration.printers);

  const keys = Object.keys(printers);

  if (keys.length === 0) {
    throw new Error(`no printers defined in config file at ${path}`);
  }

  if (name == null) {
    const printer = printers[keys[0]];

    if (printer == null) {
      throw new Error(`no printer configurations found`);
    }

    return printer;
  } else {
    const printer = printers[name];

    if (printer == null) {
      throw new Error(`can not find configuration for printer named ${name}`);
    }

    return printer;
  }
};

export default async (path: string): Promise<Configuration> => {
  const configuration = await parse(path);
  return await make(configuration);
};

export { printer };
