import { IPrinterDriver, PrintingResult } from '.';

import termImg from 'term-img';

export default class ConsolePrinterDriver implements IPrinterDriver {
  async print(buffer: Buffer): Promise<PrintingResult> {
    return new Promise(resolve => {
      termImg(buffer);
      resolve();
    });
  }
}
