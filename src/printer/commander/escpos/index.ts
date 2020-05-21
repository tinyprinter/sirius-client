import struct from 'python-struct';

const ESC = '\x1b';
const GS = `\x1d`;

const EOL = '\x0a';

enum Density {
  SingleDensity8Dot = 0,
  DoubleDensity8Dot = 1,
  SingleDensity24Dot = 32,
  DoubleDensity24Dot = 33,
}

enum RasterMode {
  Normal = 0,
  DoubleWidth = 1,
  DoubleHeight = 2,
  DoubleWidthDoubleHeight = 3,
}

const slice = (input: Buffer, width: number): Buffer[] => {
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

const handshake = async (): Promise<Buffer[]> => {
  return [
    Buffer.from(`${ESC}\x40`, 'ascii'),
    Buffer.from(`${GS}\x49\x01`, 'ascii'), // ask for printer model, maybe this resets the buffers? :(
    Buffer.from(`${ESC}\x74\x00`, 'ascii'), // set code page to default, since we're only printing images anyway
  ];
};

const lineSpace = async (lineSpace?: number): Promise<Buffer[]> => {
  if (lineSpace == null) {
    return [Buffer.from(`${ESC}\x32`, 'ascii')];
  } else {
    return [
      Buffer.concat([
        Buffer.from(`${ESC}\x33`, 'ascii'),
        struct.pack('<B', lineSpace),
      ]),
    ];
  }
};

// gs v 0
const raster = async (
  bits: Buffer,
  width: number,
  rasterMode: RasterMode = RasterMode.Normal
): Promise<Buffer[]> => {
  // XXX: 8k buffer is fairly conservative, but could be configurable if necessary?
  const COMMAND_BUFFER_LENGTH = 8192 - 8; // add space for header!

  if (width > COMMAND_BUFFER_LENGTH) {
    throw new Error(
      `image too wide to print! no room in buffer to draw a row. (buffer: ${COMMAND_BUFFER_LENGTH}, width: ${width}).`
    );
  }

  const maximumRowsThatCanFitInBuffer = Math.floor(
    COMMAND_BUFFER_LENGTH / width
  );

  const blobs = slice(bits, width * maximumRowsThatCanFitInBuffer);

  return blobs.map((blob) => {
    const w = width / 8;
    const h = (blob.length / width) * 8;

    const header = Buffer.concat([
      Buffer.from(`${GS}\x76\x30`, 'ascii'),
      struct.pack('<B', rasterMode),
      struct.pack('<H', w),
      struct.pack('<H', h),
    ]);

    return Buffer.concat([header, blob]);
  });
};

// TODO: this is extremely broken:
//  -> convert buffer from bits to bitmap format (see: https://github.com/song940/node-escpos/blob/v3/packages/printer/image.js)
// esc *
const imageesc = async (
  bits: Buffer,
  width: number,
  density: Density = Density.SingleDensity8Dot
): Promise<Buffer[]> => {
  const is24Dot = (density: Density): boolean => {
    return (
      density === Density.SingleDensity24Dot ||
      density === Density.DoubleDensity24Dot
    );
  };

  const n = is24Dot(density) ? 3 : 1;
  const w = width / 8;

  const header = Buffer.concat([
    Buffer.from(`${ESC}\x2a`, 'ascii'),
    struct.pack('<B', density),
    struct.pack('<H', w),
  ]);

  const rows = slice(bits, w * n).map((row) => {
    return Buffer.concat([header, row, Buffer.from(EOL, 'ascii')]);
  });

  return [...(await lineSpace(0)), ...rows, ...(await lineSpace())];
};

const feed = async (lines = 1): Promise<Buffer[]> => {
  return Array(lines).fill(Buffer.from(EOL, 'ascii'));
};

export { handshake, raster, imageesc, feed, lineSpace };
