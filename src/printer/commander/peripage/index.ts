import struct from 'python-struct';

import fs from 'fs';

const COMMAND_CHAR = '\x10';

enum BarcodeKind {}
enum Orientation {}

export enum Thickness {
  Light = 0,
  Medium = 1,
  Dark = 2,
}

const DEFAULT_SLICE_WIDTH = 185;

const CRLF = '\r\n';

const slice = (
  input: Buffer,
  width: number = DEFAULT_SLICE_WIDTH
): Buffer[] => {
  const output: Buffer[] = [];

  let remaining = input.length;
  let current = 0;

  do {
    output.push(Buffer.from(input.slice(current, current + width)));

    current += width;
    remaining -= width;
  } while (remaining > 0);

  return output;
};

const drawBarCode = async (
  x: number,
  y: number,
  str: string,
  kindEnum: BarcodeKind,
  orientation: Orientation,
  width: number,
  height: number
): Promise<Buffer[]> => {
  return [];
};

const drawBox = async (
  lineWidth: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): Promise<Buffer[]> => {
  if (x0 > 575) {
    x0 = 575;
  }

  if (x1 > 575) {
    x1 = 575;
  }

  const command = Buffer.from(
    `BOX ${x0} ${y0} ${x1} ${y1} ${lineWidth}${CRLF}`
  );

  return slice(command);
};

const drawGraphic = async (
  i2: number,
  i3: number,
  width: number,
  height: number,
  bits: Buffer
): Promise<Buffer[]> => {
  return [];
};

const drawLine = async (
  lineWidth: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  z2: boolean
): Promise<Buffer[]> => {
  return [];
};

const drawQrCode = async (
  i2: number,
  i3: number,
  str: string,
  i4: number,
  i5: number,
  i6: number
): Promise<Buffer[]> => {
  return [];
};

const drawText = async (
  r19: number,
  r20: number,
  r21: string,
  r22: number,
  r23: number,
  r24: number,
  r25: boolean,
  r26: boolean
): Promise<Buffer[]> => {
  return [];
};

const feed = async (): Promise<Buffer[]> => {
  const message = Buffer.from(
    '! 0 200 200 0 1\r\nPAGE-WIDTH 576\r\nGAP-SENSE\r\nFORM\r\nPRINT\r\n'
  );

  return slice(message);
};

const pageSetup = async (width: number, height: number): Promise<Buffer[]> => {
  const message = Buffer.from(
    `! 0 200 200 ${height} 1${CRLF}PAGE-WIDTH ${width}${CRLF}`
  );

  return slice(message);
};

const setFeedLength = async (feedLength: number): Promise<Buffer[]> => {
  return [];
};

const setFeedMode = async (feedMode: number): Promise<Buffer[]> => {
  return [];
};

const setPowerOffTime = async (minutes: number): Promise<Buffer[]> => {
  if (minutes < 0 || minutes >= 256) {
    throw new RangeError(
      `invalid poweroffTime (${minutes}), must be >= 0, < 256`
    );
  }

  const message = Buffer.from(
    `${COMMAND_CHAR}\xff\x12${minutes / 256}${minutes % 256}`
  );

  return slice(message);
};

const setThickness = async (thickness: Thickness): Promise<Buffer[]> => {
  const message = Buffer.from(`${COMMAND_CHAR}\xff${COMMAND_CHAR}${thickness}`);

  return slice(message);
};

const stopPrint = async (): Promise<Buffer[]> => {
  return [];
};

const handshake = async (): Promise<Buffer[]> => {
  return [
    // Buffer.from(`\x01\x00`),
    // Buffer.from(`\x01\x00`),

    // Buffer.from(`${COMMAND_CHAR}\xff\x20\xf0`, 'ascii'), // grab model ?
    // Buffer.from(`${COMMAND_CHAR}\xff\x20\xf1`, 'ascii'), // grab version ?
    // Buffer.from(`${COMMAND_CHAR}\xff\x50\xf1`, 'ascii'), // grab ..something else?
    // Buffer.from(`${COMMAND_CHAR}\xff\x20\xf2`, 'ascii'), // grab serial number?

    // 16, -1, -2, 1, 27, 64, 0
    Buffer.from(`\x10\xff\xfe\x01\x1b\x40\x00`, 'ascii'),
  ];
};

const image = async (bits: Buffer, width: number): Promise<Buffer[]> => {
  const w = width / 8;
  const h = (bits.length / width) * 8;

  const header = Buffer.concat([
    // Buffer.from(`${COMMAND_CHAR}\xff\xfe\x01`, 'ascii'),
    // Buffer.from(`\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00`, 'ascii'),
    // Buffer.from(`${COMMAND_CHAR}\xff\x10\x00\x01`, 'ascii'),
    // Buffer.from(`${COMMAND_CHAR}\xff\xfe\x01`, 'ascii'),
    // Buffer.from(`\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00`, 'ascii'),
    Buffer.from(`\x0a\x0a`),
  ]);

  // const lineheader = Buffer.concat([
  //   Buffer.from('\x1b\x2a\x00'),
  //   struct.pack('<H', width),
  // ]);

  // const lines = slice(bits, width / 8).map((line) => {
  //   return Buffer.concat([lineheader, line, Buffer.from('\n', 'ascii')]);
  // });

  // console.log(lines.length);

  // return [header, ...lines];

  const header2 = Buffer.concat([
    Buffer.from('\x1d\x76\x30\x00', 'ascii'),
    struct.pack('<H', w),
    struct.pack('<H', h),
  ]);

  console.log(bits.length, header2, { w, h });

  // fs.writeFileSync('bits.raw', bits);

  // return [];

  return [header, header2, bits];
};

export { drawBox, pageSetup, setPowerOffTime, setThickness, image, handshake };
