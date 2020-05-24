import terminalImage from 'terminal-image';
import { BergPrinterPayload } from '../berger/device/printer/payload-decoder';
import PrintableImage from '../printable-image';
import { PrintableImageHandler } from './printable-image-wrapper';
import { PrinterParameters } from '../configuration';
import logger from '../logger';

class Console implements PrintableImageHandler {
  static type = 'console';

  static areParametersValid(parameters: PrinterParameters): boolean {
    return true;
  }

  static fromParameters(parameters: PrinterParameters): PrintableImageHandler {
    return new this();
  }

  async open(): Promise<void> {}
  async close(): Promise<void> {}

  async print(
    image: PrintableImage,
    payload: BergPrinterPayload
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      logger.debug('printing image: %O', payload);

      // if we've come from a payload, it must be upside down
      if (payload != null) {
        image.rotate(180).resize(750);
      }

      const png = await image.asPNG();
      console.log(
        await terminalImage.buffer(png, {
          width: 60,
          height: 40,
          preserveAspectRatio: false,
        })
      );

      resolve(true);
    });
  }
}

export default Console;
