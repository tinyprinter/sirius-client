import ndarray from 'ndarray';
import struct from 'python-struct';
import { MutableBuffer } from 'mutable-buffer';

import Command from './command';
import CRC from './crc';
import segmenter from './segmenter';

export enum PaperType {
  Receipt = 0,
  Label = 1,
}

enum Packet {
  Start = 0x02,
  End = 0x03,
}

const MagicValue = 0x35769521;

const sharedCRC = new CRC(0x6968634 ^ 0x2e696d);

const MAX_SLICE_LENGTH = 1152;

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

const packeting = (
  bytes: Buffer,
  command: Command,
  width: number = MAX_SLICE_LENGTH,
  crc: CRC = sharedCRC
): Buffer[] => {
  const slices = slice(bytes, width);

  return slices.map((slice, i) => {
    const buffer = new MutableBuffer(slice.length + 128, 128);

    buffer.write(struct.pack('<BBB', Packet.Start, command, i));
    buffer.write(struct.pack('<H', slice.length));
    buffer.write(slice);
    buffer.write(struct.pack('<I', crc.checksum(slice)));
    buffer.write(struct.pack('<B', Packet.End));

    return buffer.flush();
  });
};

const handshake = async (): Promise<Buffer[]> => {
  const key = 0x6968634 ^ 0x2e696d;
  const message = struct.pack('<I', key ^ MagicValue);

  return packeting(message, Command.SetCrcKey, undefined, new CRC(MagicValue));
};

const lineFeed = async (ms: number): Promise<Buffer[]> => {
  const message = struct.pack('<H', ms);

  return packeting(message, Command.FeedLine);
};

const selfTest = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 0);

  return packeting(message, Command.PrintTestPage);
};

const setPaperType = async (paperType: PaperType): Promise<Buffer[]> => {
  const message = struct.pack('<B', paperType);

  return packeting(message, Command.SetPaperType);
};

const setPowerOffTime = async (time: number): Promise<Buffer[]> => {
  const message = struct.pack('<H', time);

  return packeting(message, Command.SetPowerDownTime);
};

const setPrintDensity = async (density: number): Promise<Buffer[]> => {
  const message = struct.pack('<B', density);

  return packeting(message, Command.SetHeatDensity);
};

const imagePixels = async (pixels: ndarray<number>): Promise<Buffer[]> => {
  const segments = await segmenter(pixels);

  return segments.map((s) => packeting(s, Command.PrintData)[0]);
};

const image = async (buffer: Buffer, width: number): Promise<Buffer[]> => {
  const message = buffer;
  return packeting(message, Command.PrintData, width);
};

export {
  handshake,
  lineFeed,
  selfTest,
  image,
  imagePixels,
  setPaperType,
  setPowerOffTime,
  setPrintDensity,
};
