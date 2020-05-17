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
    const bits = await unrle(payload.rle.data);

    const image = PrintableImage.fromBits(bits);

    const success = await this.handler.print(image, payload);

    return success;
  }
}

export default PrintableImageWrapper;
