import Bluetooth from 'escpos-bluetooth';
import { promisify } from 'util';

import { BergPrinterPrinterPrinter } from '../berger/device/printer';

import * as paperang from './commander/paperang';
import PrintableImage from '../printable-image';

const bluetooth = new Bluetooth('00-15-82-90-1d-76', 1);
const open = promisify(bluetooth.open).bind(bluetooth);
const close = promisify(bluetooth.close).bind(bluetooth);
const write = promisify(bluetooth.write).bind(bluetooth);

export default class BluetoothPaperangPrinter
  implements BergPrinterPrinterPrinter {
  async print(image: PrintableImage): Promise<boolean> {
    // note: p2 lines need to be 72 bytes wide (576px), input by default is 48 (384px) wide
    image.resize(576);

    console.log('opening bluetooth');
    await open();
    console.log('...bluetooth open!');

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

    console.log('closing bluetooth');
    await close();
    console.log('...bluetooth closed!');

    return true;
  }
}
