import Bluetooth from 'escpos-bluetooth';
import { promisify } from 'util';

import { BergPrinterPrinterPrinter } from '../berger/device/printer';

import * as paperang from './commander/paperang';
import PrintableImage from '../printable-image';

export type BluetoothProperties = {
  address: string;
  channel: number;
};

export default class BluetoothPaperangPrinter
  implements BergPrinterPrinterPrinter {
  properties: BluetoothProperties | null;
  constructor(properties: BluetoothProperties | null = null) {
    this.properties = properties;
  }

  private async scan(): Promise<
    { address: string; name: string; channel: number } | undefined
  > {
    const devices = (await Bluetooth.findPrinters()).filter((device) => {
      if (device == null) {
        return false;
      }

      return device.name.toLowerCase().includes('paperang');
    });

    if (devices.length === 0) {
      console.log('found zero compatible devices, bailing');
      return undefined;
    } else if (devices.length > 1) {
      console.log(
        `found ${devices.length} compatible devices, will choose the first one`
      );
    }

    return devices[0];
  }
  async print(image: PrintableImage): Promise<boolean> {
    if (this.properties == null) {
      console.log(
        `address/channel not supplied, scanning for device (note: this can be slow!)`
      );

      const device = await this.scan();

      if (device != null) {
        this.properties = {
          address: device.address,
          channel: device.channel,
        };
      }
    }

    if (this.properties == null) {
      console.log('no properties set, bailing');
      return false;
    }

    console.log(`using properties`, this.properties);

    try {
      const bluetooth = new Bluetooth(
        this.properties.address,
        this.properties.channel
      );

      const open = promisify(bluetooth.open).bind(bluetooth);
      const close = promisify(bluetooth.close).bind(bluetooth);
      const write = promisify(bluetooth.write).bind(bluetooth);

      // note: p2 lines need to be 72 bytes wide (576px), input by default is 48 (384px) wide
      image.resize(576);

      console.log('opening bluetooth');
      await open();
      console.log('...bluetooth open!');

      console.log('writing commands');

      await write(paperang.handshake());
      await write(paperang.noop());
      await write(paperang.feed(0));
      await write(paperang.noop());

      // const segments = await paperang.imageSegments(image);
      // for (let i = 0; i < segments.length; i++) {
      //   await write(segments[i]);

      //   // add a pause here to allow printing to finish before the buffer flushes thru
      //   await new Promise((resolve) => setTimeout(resolve, 5));
      // }

      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('...commands written');
      console.log('closing bluetooth');
      await close();
      console.log('...bluetooth closed!');

      return true;
    } catch (error) {
      console.log('uh oh', error);
    }

    return false;
  }
}
