import bmp from 'fast-bmp';

// prettier-ignore
const colorTable = Buffer.from([
  0x00, 0x00, 0x00, 0x00,
  0xff, 0xff, 0xff, 0x00,
]);

const setBit = (buffer: Uint8Array, i: number, bit: number, value: number) => {
  if (value == 0) {
    buffer[i] &= ~(1 << bit);
  } else {
    buffer[i] |= 1 << bit;
  }
};

const packem = (input: number[], width: number, height: number): Uint8Array => {
  // pack grid into bytes
  const buf = new Uint8Array(width * height);

  let ptr = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = width * y + x;

      const byte = Math.floor(ptr / 8);
      const shift = ptr % 8;

      setBit(buf, byte, 8 - shift - 1, input[i]);

      ptr++;
    }

    // let's poke every. single. bit. because that's probably efficient.
    const paddingRequired = 32 - width;

    for (let pad = 0; pad < paddingRequired; pad++) {
      const i = ptr;

      const byte = Math.floor(i / 8);
      const shift = i % 8;

      setBit(buf, byte, 8 - shift - 1, 0);

      ptr++;
    }
  }

  return buf;
};

export default (input: number[]): Buffer => {
  const width = 384;
  const height = input.length / 384;

  return bmp.encode({
    width,
    height,
    data: Buffer.from(packem(input, width, height)),
    bitDepth: 1,
    components: 1,
    channels: 1,
  });
};
