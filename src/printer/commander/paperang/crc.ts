// via sharperang:

export const MagicValue = 0x35769521;
const Poly = 0xedb88320;

class CRC {
  private iv: number;
  private crctable: number[];

  constructor(iv: number) {
    this.iv = iv;
    this.crctable = [];

    this.initialise();
  }

  private initialise = (): void => {
    for (let i = 0; i < 256; i++) {
      let e = i;
      for (let eb = 0; eb < 8; eb++) {
        e = ((e & 1) != 0 ? Poly ^ (e >>> 1) : e >>> 1) >>> 0;
      }
      this.crctable[i] = e;
    }
  };

  private getBytes = (int: number): Buffer => {
    const b = Buffer.alloc(4);
    b[0] = int;
    b[1] = int >> 8;
    b[2] = int >> 16;
    b[3] = int >> 24;
    return b;
  };

  get ivBytes(): Buffer {
    const iv = this.iv == MagicValue ? this.iv : this.iv ^ MagicValue;
    return this.getBytes(iv);
  }

  checksum = (data: Buffer): number => {
    const out =
      ~[...data].reduce((acc, curr) => {
        const idx = (acc & 0xff) ^ curr;
        return this.crctable[idx] ^ (acc >>> 8);
      }, ~this.iv >>> 0) >>> 0;

    return out;
  };

  checksumBytes = (data: Buffer): Buffer => {
    return this.getBytes(this.checksum(data));
  };
}

export default CRC;
