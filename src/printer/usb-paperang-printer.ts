import { USB } from 'escpos';
import { promisify } from 'util';

import * as paperang from './commander/paperang';
import { BergPrinterPrinterPrinter } from '../berger/device/printer';
import { BergPrinterPayload } from '../berger/device/printer/payload-decoder';

const usb = new USB();
const open = promisify(usb.open).bind(usb);
const close = promisify(usb.close).bind(usb);
const write = promisify(usb.write).bind(usb);

export default class USBPaperangPrinter implements BergPrinterPrinterPrinter {
  async print(bits: Buffer, payload: BergPrinterPayload): Promise<boolean> {
    console.log('opening usb');
    await open();
    console.log('...usb open!');

    console.log('writing commands');

    paperang.initialise(usb);

    await write(paperang.handshake());
    await write(paperang.noop());
    await write(paperang.feed(0));
    await write(paperang.noop());

    const segments = await paperang.imageSegments(bits);
    for (let i = 0; i < segments.length; i++) {
      await write(segments[i]);
    }

    console.log('...commands written');

    console.log('closing usb');
    await close();
    console.log('...usb closed!');

    return true;
  }
}
