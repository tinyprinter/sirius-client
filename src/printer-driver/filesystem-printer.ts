import { PrinterDriverInterface, PrintingResult } from '.';
import fs from 'fs';
import os from 'os';
import path from 'path';
import bitmapify from '../decoder/parser/bitmapify';

export default class FilesystemPrinterDriver implements PrinterDriverInterface {
  async print(buffer: Buffer): Promise<PrintingResult> {
    return new Promise(resolve => {
      const tempDir = path.join(os.tmpdir(), 'sirius-client');
      fs.mkdirSync(tempDir, { recursive: true });

      const name = new Date().toISOString().replace(/\D/g, '');
      const tempFile = path.join(tempDir, `${name}.bmp`);

      fs.writeFileSync(tempFile, bitmapify(buffer));
      console.log(`Written: ${tempFile}`);
      resolve();
    });
  }
}
