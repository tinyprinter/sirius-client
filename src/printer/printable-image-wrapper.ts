import { BergPrinterHandler } from '../berger/device/printer';
import { BergPrinterPayload } from '../berger/device/printer/payload-decoder';
import PrintableImage from '../printable-image';
import unrle from '../berger/device/printer/unrle';

export interface PrintableImageHandler {
  open(): Promise<void>;
  close(): Promise<void>;
  print(
    image: PrintableImage,
    payload: BergPrinterPayload | undefined
  ): Promise<boolean>;
}

class PrintableImageWrapper implements BergPrinterHandler {
  handler: PrintableImageHandler;

  constructor(handler: PrintableImageHandler) {
    this.handler = handler;
  }

  async print(payload: BergPrinterPayload): Promise<boolean> {
    const bits = await (async (): Promise<Buffer> => {
      if (payload.rle.isCompressed) {
        return await unrle(payload.rle.data);
      } else {
        return Buffer.from(payload.rle.data);
      }
    })();

    const image = PrintableImage.fromBits(bits);

    return await this.handler.print(image, payload);
  }
}

export default PrintableImageWrapper;
