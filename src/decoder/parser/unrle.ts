const TRANSLATE = [
  [1536, 255],
  [1152, 254],
  [768, 253],
  [384, 252],
  [251, 251],
];

const bloop = (input: number[]): number[] => {
  const output = [] as number[];

  input.forEach((item, idx) => {
    // evens are white:
    const value = idx % 2 == 0 ? 1 : 0;

    const run = Array(item).fill(value);

    // doin' some fun hacks, since `output.push(...run);` will overflow on longlonglong runs
    const length = output.length;
    output.length += run.length;

    for (let i = 0; i < run.length; i++) {
      output[length + i] = run[i];
    }
  });

  return output;
};

const decompress = (input: number[]): number[] => {
  const output = [] as number[];

  let carry = 0;

  for (let i = 0; i < input.length; i++) {
    const n = input[i];

    if (n < 251) {
      carry += n;

      output.push(carry);

      carry = 0;
    } else {
      // find key in lookup
      const tx = TRANSLATE.find(v => v[1] === n);
      const v = tx ? tx[0] : 0;

      carry += v;

      const next = i < input.length - 1 ? input[i + 1] : 0xff;
      const nextnext = i < input.length - 2 ? input[i + 2] : null;

      if (next === 0x0 && nextnext !== null) {
        i += 1;
      } else {
        output.push(carry);
        carry = 0;
      }
    }
  }

  return output;
};

export { bloop, decompress };

export default async (input: number[]): Promise<Buffer> => {
  const decompressed = decompress(input);
  const output = bloop(decompressed);
  return Buffer.from(output);
};
