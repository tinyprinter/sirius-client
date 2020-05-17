import termImg from 'term-img';
import { BergPrinterPayload } from '../berger/device/printer/payload-decoder';
import PrintableImage from '../printable-image';
import { PrintableImageHandler } from './printable-image-wrapper';
import { PrinterConfiguration } from '../configuration';

class Console implements PrintableImageHandler {
  static type = 'console';

  static isConfigurationValid(configuration: PrinterConfiguration): boolean {
    return true;
  }

  static fromConfiguration(
    configuration: PrinterConfiguration
  ): PrintableImageHandler {
    return new this();
  }

  async open(): Promise<void> {}
  async close(): Promise<void> {}

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

export default Console;
