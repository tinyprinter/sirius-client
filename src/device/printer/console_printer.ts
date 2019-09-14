import Printer from '.';
import { CommandResponse } from '../../types';

import termImg from 'term-img';

export default class ConsolePrinter extends Printer {
  async print(buffer: Buffer): Promise<CommandResponse> {
    return new Promise(resolve => {
      termImg(buffer);
      resolve();
    });
  }
}
