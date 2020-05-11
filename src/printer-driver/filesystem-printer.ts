import { PrinterDriverInterface, PrintingResult } from '.';
import fs from 'fs';
// import bitmapify from '../decoder/parser/bitmapify';
// import termImg from 'term-img';

export default class FilesystemPrinterDriver implements PrinterDriverInterface {
  async print(buffer: Buffer): Promise<PrintingResult> {
    return new Promise(resolve => {
      fs.writeFileSync('/root/tmp/to_print.bmp', buffer);
      console.log("Written.");
      // const bitmap = bitmapify(buffer);
      //termImg(buffer);
      resolve();
    });
  }
}
