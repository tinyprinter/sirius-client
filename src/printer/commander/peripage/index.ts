import * as escpos from '../escpos';

const handshake = async (): Promise<Buffer[]> => {
  return [
    // 16, -1, -2, 1, 27, 64, 0
    Buffer.from(`\x10\xff\xfe\x01\x1b\x40\x00`, 'ascii'),
  ];
};

export { handshake };

export { feed, raster as image } from '../escpos';
