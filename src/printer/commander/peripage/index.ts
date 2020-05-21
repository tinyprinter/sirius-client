import struct from 'python-struct';

const handshake = async (): Promise<Buffer[]> => {
  return [
    // 16, -1, -2, 1, 27, 64, 0
    Buffer.from(`\x10\xff\xfe\x01\x1b\x40\x00`, 'ascii'),
  ];
};

const image = async (bits: Buffer, width: number): Promise<Buffer[]> => {
  const w = width / 8;
  const h = (bits.length / width) * 8;

  const header = Buffer.concat([
    Buffer.from(`\x0a\x0a`), // TODO: could probably move this out, when we're running other commands
    Buffer.from('\x1d\x76\x30\x00', 'ascii'),
    struct.pack('<H', w),
    struct.pack('<H', h),
  ]);

  return [header, bits];
};

const feed = async (lines: number): Promise<Buffer[]> => {
  return Array(lines).fill(Buffer.from('\n', 'ascii'));
};

export { image, feed, handshake };
