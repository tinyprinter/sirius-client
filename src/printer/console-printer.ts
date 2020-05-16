import termImg from 'term-img';
import { BergPrinterPayload } from '../berger/device/printer/payload-decoder';
import { BergPrinterHandler } from '../berger/device/printer';
import PrintableImage from '../printable-image';
import { PrintableImageHandler } from './printable-image-handler';

export default class ConsolePrinter implements PrintableImageHandler {
  async print(
    image: PrintableImage,
    payload: BergPrinterPayload
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      console.log('printing image: ', payload);

      // if we've come from a payload, it must be upside down
      if (payload != null) {
        image.rotate(180).resize(752);
      }

      const bitmap = await image.asPNG();
      termImg(bitmap);

      resolve(true);
    });
  }
}
