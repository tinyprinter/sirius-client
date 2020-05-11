import { PrinterDriverInterface, PrintingResult } from '.';
import fs from 'fs';
import os from 'os';
import path from 'path';
// import bitmapify from '../decoder/parser/bitmapify';
// import termImg from 'term-img';

export default class FilesystemPrinterDriver implements PrinterDriverInterface {
  async print(buffer: Buffer): Promise<PrintingResult> {
    return new Promise(resolve => {
      const tempDir = path.join(os.tmpdir(), 'sirius-client');
      fs.mkdirSync(tempDir, { recursive: true });

      const tempFile = path.join(tempDir, 'to_print.bmp');

      fs.writeFileSync(tempFile, buffer);
      console.log(`Written: ${tempFile}`);
      // const bitmap = bitmapify(buffer);
      //termImg(buffer);
      resolve();
    });
  }
}
