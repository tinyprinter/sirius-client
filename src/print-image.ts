import { promises as fs } from 'fs';

import { PrintableImageHandler } from './printer/printable-image-handler';
import BluetoothPaperangPrinter from './printer/bluetooth-paperang-printer';
import USBPaperangPrinter from './printer/usb-paperang-printer';
import ConsolePrinter from './printer/console-printer';

import PrintableImage from './printable-image';

const printer: PrintableImageHandler = new ConsolePrinter();
// const printer: PrintableImageHandler = new USBPaperangPrinter(image: { width: 576 });
// const printer: PrintableImageHandler = new BluetoothPaperangPrinter({
//   image: { width: 576 },
//   bluetooth: {
//     address: '00-15-82-90-1d-76',
//     channel: 6,
//   },
// });

const printImage = async (path: string): Promise<void> => {
  // load file
  const buffer = await fs.readFile(path);

  const image = new PrintableImage(buffer);
  image.dither();

  // print 'em
  await (printer as PrintableImageHandler).print(image, undefined);
};

const path = '/Users/joshua/Desktop/Messages Image(3152827289).jpeg';

printImage(path);
