import USB from 'escpos-usb';
import { promisify } from 'util';

import * as paperang from './commander/paperang';
import PrintableImage from '../printable-image';
import { PrintableImageHandler } from './printable-image-wrapper';
import { PrinterConfiguration } from '../config';
import { assertType, is } from 'typescript-is';

export type PaperangParameters = {
  image: {
    width: number;
  };
};

export default class PaperangPrinter implements PrintableImageHandler {
  static type = 'paperang';

  parameters: PaperangParameters;
  usb: USB | undefined;

  constructor(parameters: PaperangParameters) {
    this.parameters = parameters;
  }

  static isConfigurationValid(configuration: PrinterConfiguration): boolean {
    return is<PaperangParameters>(configuration);
  }

  static fromConfiguration(
    configuration: PrinterConfiguration
  ): PrintableImageHandler {
    return new this(assertType<PaperangParameters>(configuration));
  }

  async open(): Promise<void> {
    this.usb = new USB();

    const open = promisify(this.usb.open).bind(this.usb);

    console.log('opening usb');
    await open();
    console.log('...usb open!');
  }

  async close(): Promise<void> {
    if (this.usb == null) {
      return;
    }

    const close = promisify(this.usb.close).bind(this.usb);

    console.log('closing usb');
    await close();
    console.log('...usb closed!');

    this.usb = undefined;
  }

  async print(image: PrintableImage): Promise<boolean> {
    if (this.usb == null) {
      return false;
    }

    const write = promisify(this.usb.write).bind(this.usb);

    // for now, I only know we support P2S, so let's do some checking here...
    const VENDOR_ID = 0x20d1;
    const P2S_PRODUCT_ID = 0x7008;

    const { idVendor, idProduct } = this.usb.device.deviceDescriptor;

    if (idVendor !== VENDOR_ID || idProduct !== P2S_PRODUCT_ID) {
      console.log(
        "⚠️ warning! this only officially supports Paperang P2S, and this ain't one. there may be dragons!"
      );
    } else {
      console.log("found Paperang P2S, let's disco!");
    }

    // note: p2 lines need to be 72 bytes wide (576px), input by default is 48 (384px) wide
    image.resize(this.parameters.image.width);

    try {
      console.log('writing commands');

      await write(paperang.handshake());
      await write(paperang.noop());
      await write(paperang.feed(0));
      await write(paperang.noop());

      const segments = await paperang.imageSegments(await image.asPixels());
      for (let i = 0; i < segments.length; i++) {
        await write(segments[i]);
      }

      console.log('...commands written');
    } catch (error) {
      console.log('uh oh', error);
      return false;
    }

    return true;
  }
}
