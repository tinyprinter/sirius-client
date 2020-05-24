const CMD = '\x10';

const handshake = async (): Promise<Buffer[]> => {
  return [
    // 16, -1, -2, 1, 27, 64, 0
    Buffer.from(`${CMD}\xff\xfe\x01\x1b\x40\x00`, 'ascii'),
  ];
};

const queryModel = async (): Promise<Buffer[]> => {
  return [Buffer.from(`${CMD}\xff\x20\xf0`, 'ascii')];
};

const queryVersion = async (): Promise<Buffer[]> => {
  return [Buffer.from(`${CMD}\xff\x20\xf1`, 'ascii')];
};

const querySerialNumber = async (): Promise<Buffer[]> => {
  return [Buffer.from(`${CMD}\xff\x20\xf2`, 'ascii')];
};

export { handshake, queryModel, querySerialNumber, queryVersion };

export { feed, raster as image } from '../escpos';
