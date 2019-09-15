import Printer from '.';
import { CommandResponse } from '../../types';
import fs from 'fs';

import termImg from 'term-img';

export default class FilesystemPrinter extends Printer {
  async print(buffer: Buffer): Promise<CommandResponse> {
    return new Promise(resolve => {
      fs.writeFileSync('/Users/ktamas/tmp/to_print.bmp', buffer);
      console.log("Written.");
      termImg(buffer);
      resolve();
    });
  }
}
