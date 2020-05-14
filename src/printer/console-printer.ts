import termImg from 'term-img';
import { BergPrinterPayload } from '../berger/device/printer/payload-decoder';
import { BergPrinterPrinterPrinter } from '../berger/device/printer';
import PrintableImage from '../printable-image';

export default class ConsolePrinter implements BergPrinterPrinterPrinter {
  async print(
    image: PrintableImage,
    payload: BergPrinterPayload
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      console.log('printing image: ', payload);

      const bitmap = await image.asPNG();
      termImg(bitmap);

      resolve(true);
    });
  }
}
