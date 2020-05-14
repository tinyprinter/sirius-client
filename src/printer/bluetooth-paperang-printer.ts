import Bluetooth from 'escpos-bluetooth';
import { promisify } from 'util';

import { BergPrinterPrinterPrinter } from '../berger/device/printer';

import * as paperang from './commander/paperang';
import PrintableImage from '../printable-image';

const bluetooth = new Bluetooth();
const open = promisify(usb.open).bind(usb);
const close = promisify(usb.close).bind(usb);
const write = promisify(usb.write).bind(usb);

export default class USBPaperangPrinter implements BergPrinterPrinterPrinter {
  async print(image: PrintableImage): Promise<boolean> {
    // for now, I only know we support P2S, so let's do some checking here...
    const VENDOR_ID = 0x20d1;
    const P2S_PRODUCT_ID = 0x7008;

    const { idVendor, idProduct } = usb.device.deviceDescriptor;

    if (idVendor !== VENDOR_ID || idProduct !== P2S_PRODUCT_ID) {
      console.log(
        "⚠️ warning! this only officially supports Paperang P2S, and this ain't one. there may be dragons!"
      );
    } else {
      console.log("found Paperang P2S, let's disco!");
    }

    // note: p2 lines need to be 72 bytes wide (576px), input by default is 48 (384px) wide
    image.resize(576);

    console.log('opening usb');
    await open();
    console.log('...usb open!');

    try {
      console.log('writing commands');

      await write(paperang.handshake());
      await write(paperang.noop());
      await write(paperang.feed(0));
      await write(paperang.noop());

      const segments = await paperang.imageSegments(image);
      for (let i = 0; i < segments.length; i++) {
        await write(segments[i]);
      }

      console.log('...commands written');
    } catch (error) {
      console.log('uh oh', error);
    }

    console.log('closing usb');
    await close();
    console.log('...usb closed!');

    return true;
  }
}
