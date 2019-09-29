import { IPrinterDriver, PrintingResult } from '.';

import {
  printer as ThermalPrinter,
  types as PrinterTypes,
} from 'node-thermal-printer';

import printer from 'printer';

const tprinter = new ThermalPrinter({
  type: PrinterTypes.STAR, // Printer type: 'star' or 'epson'
  interface: 'printer:Star_TSP143__STR_T_001_', // Printer interface
  driver: printer,
  // characterSet: 'SLOVENIA', // Printer character set - default: SLOVENIA
  // removeSpecialCharacters: false, // Removes special characters - default: false
  // lineCharacter: '=', // Set character for lines - default: "-"
  options: {
    // Additional options
    // timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
  },
});

export default class StarPrinterDriver implements IPrinterDriver {
  async print(buffer: Buffer): Promise<PrintingResult> {
    tprinter.alignCenter();
    tprinter.println('Hello world');
    await tprinter.printImageBuffer(buffer);
    tprinter.cut();

    try {
      const execute = await tprinter.execute();
      console.error('Print done!', { execute });

      return execute;
    } catch (error) {
      console.log('Print failed:', error);
    }

    return false;
  }
}
