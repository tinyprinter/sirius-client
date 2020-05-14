import termImg from 'term-img';
import { BergPrinterPayload } from '../berger/device/printer/payload-decoder';
import { BergPrinterPrinterPrinter } from '../berger/device/printer';
import bitmapify from '../bitmapify';

export default class ConsolePrinter implements BergPrinterPrinterPrinter {
  print(bits: Buffer, payload: BergPrinterPayload): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('printing image: ', payload);

      const bitmap = bitmapify(bits);
      termImg(bitmap);
      resolve(true);
    });
  }
}
