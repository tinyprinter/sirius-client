const swapWordEndianness = (value: number): number => {
  return (
    ((value & 0x000000ff) << 24) |
    ((value & 0x0000ff00) << 8) |
    ((value & 0x00ff0000) >> 8) |
    ((value & 0xff000000) >> 24)
  );
};

const getBytes = (int: number): Buffer => {
  const b = Buffer.alloc(4);
  b[0] = int;
  b[1] = int >> 8;
  b[2] = int >> 16;
  b[3] = int >> 24;
  return b;
};
const lineFeed = (data: number): Buffer => {
  return getBytes(
    swapWordEndianness(
      0x00000000 | (((((data & 0xff) << 16) | data) & 0xffff00) >>> 8)
    )
  ).slice(2);
};

const print = (data: number): Buffer => {
  return getBytes(
    swapWordEndianness(
      0x00010000 | (((((data & 0xff) << 16) | data) & 0xffff00) >>> 8)
    )
  );
};

export { lineFeed, print };
