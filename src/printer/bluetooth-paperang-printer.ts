import Bluetooth from 'escpos-bluetooth';
import { promisify } from 'util';

import { BergPrinterPrinterPrinter } from '../berger/device/printer';

import * as paperang from './commander/paperang';
import PrintableImage from '../printable-image';

import BluetoothSerialPort from 'bluetooth-serial-port';

const rfcomm = new BluetoothSerialPort.BluetoothSerialPort();

export default class BluetoothPaperangPrinter
  implements BergPrinterPrinterPrinter {
  async findyfind(address: string): Promise<number> {
    return new Promise((resolve, reject) => {
      rfcomm.findSerialPortChannel(
        address,
        (channel: number) => {
          console.log('yup', channel);
          resolve(channel);
        },
        () => {
          console.log('nope');

          reject();
        }
      );
    });
  }
  async print(image: PrintableImage): Promise<boolean> {
    console.log('scanning...');
    const address = '00-15-82-90-1d-76';
    const channel = await this.findyfind(address);

    // console.log('???', channel);
    // const devices = await Bluetooth.findPrinters();

    // if (devices == null) {
    //   console.log('error scanning bluetooth');
    //   return false;
    // }

    // console.log('found:');
    // console.log({ devices });

    // const device = devices[0];

    // if (device == null) {
    //   console.log('no devices found');
    //   return false;
    // }

    try {
      const bluetooth = await Bluetooth.getDevice(address, channel);

      const open = promisify(bluetooth.open).bind(bluetooth);
      const close = promisify(bluetooth.close).bind(bluetooth);
      const write = promisify(bluetooth.write).bind(bluetooth);

      // note: p2 lines need to be 72 bytes wide (576px), input by default is 48 (384px) wide
      image.resize(576);

      // console.log('opening bluetooth');
      // await open();
      // console.log('...bluetooth open!');

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
