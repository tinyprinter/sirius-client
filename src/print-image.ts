import { promises as fs } from 'fs';

import USBPaperangPrinter from './printer/usb-paperang-printer';
import PrintableImage from './printable-image';
import { BergPrinterPrinterPrinter } from './berger/device/printer';
import ConsolePrinter from './printer/console-printer';

const printer: BergPrinterPrinterPrinter = new USBPaperangPrinter();

const printImage = async (path: string): Promise<void> => {
  // load file
  const buffer = await fs.readFile(path);

  const image = new PrintableImage(buffer);
  image.dither();

  // print 'em
  await (printer as BergPrinterPrinterPrinter).print(image, undefined);
};

const path = '/Users/joshua/Desktop/Messages Image(3152827289).jpeg';

printImage(path);
