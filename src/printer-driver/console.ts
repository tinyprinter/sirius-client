import { PrinterDriverInterface, PrintingResult } from '.';

import bitmapify from '../decoder/parser/bitmapify';

import termImg from 'term-img';

export default class ConsolePrinterDriver implements PrinterDriverInterface {
  async print(buffer: Buffer): Promise<PrintingResult> {
    return new Promise(resolve => {
      const bitmap = bitmapify(buffer);
      termImg(bitmap);
      resolve();
    });
  }
}
