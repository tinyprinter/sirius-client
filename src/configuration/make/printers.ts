import { PrinterParameters } from '../index';
import { PrintableImageHandler } from '../../printer/printable-image-wrapper';
import areParametersValid from './are-parameters-valid';
import fromParameters from './from-parameters';
import { all } from '../../printer';

export type PrinterConfiguration = {
  driver: string;
  parameters?: PrinterParameters;
};

type PrinterMap = { [key: string]: PrintableImageHandler };

/* eslint-disable @typescript-eslint/no-explicit-any */
// Since static functions don't work in interfaces, we wrap it here
interface ConfigurablePrinterClassRef {
  new (...args: any[]): any;
  areParametersValid(parameters: PrinterParameters): boolean;
  fromParameters(parameters: PrinterParameters): any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default async (config: {
  [key: string]: PrinterConfiguration;
}): Promise<PrinterMap> => {
  const printers: { [key: string]: PrintableImageHandler } = {};
  for (const name in config) {
    const printerConfig = config[name];

    const printerClass: ConfigurablePrinterClassRef =
      all[printerConfig.driver.toLowerCase()];

    if (printerClass == null) {
      console.log(
        `can't find printer driver with name: ${printerConfig.driver}`
      );
      continue;
    }

    if (!areParametersValid(printerClass, printerConfig.parameters)) {
      console.log(`invalid config for printer: ${printerConfig.driver}`);
      continue;
    }

    printers[name] = fromParameters(printerClass, printerConfig.parameters);
  }
  return printers;
};
