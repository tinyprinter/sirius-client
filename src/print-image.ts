import { promises as fs } from 'fs';

import { PrintableImageHandler } from './printer/printable-image-handler';

import PrintableImage from './printable-image';

import printer from './default-printer';

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
