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

// I've had problems printing > 64k in a single command to a P2S via bluetooth, ymmv
const MAX_PACKET_LENGTH = 65_536;

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
  slices: Buffer[] | Buffer,
  command: Command,
  crc: CRC = sharedCRC
): Buffer[] => {
  slices = Array.isArray(slices) ? slices : [slices];

  const packets: Buffer[] = [];
  const current = new MutableBuffer(
    slices.length > 1 ? MAX_PACKET_LENGTH : slices[0].length,
    128
  );

  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];

    const buffer = new MutableBuffer(slice.length + 8, 128);

    buffer.write(struct.pack('<BBB', Packet.Start, command, i));
    buffer.write(struct.pack('<H', slice.length));
    buffer.write(slice);
    buffer.write(struct.pack('<I', crc.checksum(slice)));
    buffer.write(struct.pack('<B', Packet.End));

    if (current.size + slice.length > MAX_PACKET_LENGTH) {
      packets.push(Buffer.from(current.flush()));
      current.clear();
    }

    current.write(buffer.flush());

    // if it's the last, just append it
    if (i === slices.length - 1) {
      packets.push(Buffer.from(current.flush()));
    }
  }

  return packets;
};

const handshake = async (): Promise<Buffer[]> => {
  const key = 0x6968634 ^ 0x2e696d;
  const message = struct.pack('<I', key ^ MagicValue);

  return packeting(message, Command.SetCrcKey, new CRC(MagicValue));
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
  return packeting(slice(buffer, width), Command.PrintData);
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
