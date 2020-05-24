import struct from 'python-struct';
import { MutableBuffer } from 'mutable-buffer';

import Command from './command';
import CRC, { MagicValue } from './crc';
import { assertType } from 'typescript-is';
import { Packet, PaperType } from './const';
import parseResponse, { parseResponseForCommand } from './parse-response';

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

const queryPowerOffTime = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetPowerDownTime);
};

const setPowerOffTime = async (time: number): Promise<Buffer[]> => {
  const message = struct.pack('<H', time);

  return packeting(message, Command.SetPowerDownTime);
};

const queryPrintDensity = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetHeatDensity);
};

const setPrintDensity = async (density: number): Promise<Buffer[]> => {
  const message = struct.pack('<B', density);

  return packeting(message, Command.SetHeatDensity);
};

const queryBatteryStatus = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetBatStatus);
};

const querySerialNumber = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetSn);
};

const queryHardwareInformation = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetHwInfo);
};

const queryPaperType = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetPaperType);
};

const queryVersion = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetVersion);
};

const queryCountryName = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetCountryName);
};

const queryMaximumGapLength = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetMaxGapLength);
};

const queryBoardVersion = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetBoardVersion);
};

const queryFactoryStatus = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetFactoryStatus);
};

const queryTemperature = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetTemp);
};

const queryVoltage = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetVoltage);
};

const queryStatus = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetStatus);
};

const queryBluetoothMAC = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetBtMac);
};

const queryModel = async (): Promise<Buffer[]> => {
  const message = struct.pack('<B', 1);

  return packeting(message, Command.GetModel);
};

const parseBatteryStatus = (buffer: Buffer): number => {
  const response = parseResponseForCommand(buffer, Command.SentBatStatus);

  const unpacked = struct.unpack('<B', response.payload);
  return assertType<number>(unpacked[0]);
};

const parseBluetoothMAC = (buffer: Buffer): string => {
  const response = parseResponseForCommand(buffer, Command.SentBtMac);

  return response.payload.toString('ascii');
};

const parseBoardVersion = (buffer: Buffer): string => {
  const response = parseResponseForCommand(buffer, Command.SentBoardVersion);

  return response.payload.toString('ascii');
};

const parseCountryName = (buffer: Buffer): string => {
  const response = parseResponseForCommand(buffer, Command.SentCountryName);

  return response.payload.toString('ascii');
};

const parseFactoryStatus = (buffer: Buffer): number => {
  const response = parseResponseForCommand(buffer, Command.SentFactoryStatus);

  const unpacked = struct.unpack('<B', response.payload);

  return assertType<number>(unpacked[0]);
};

const parseHardwareInformation = (): void => {
  // haven't seen this in the wild, not sure how responses look
  throw new Error('not implemented');
};

const parseMaximumGapLength = (buffer: Buffer): number => {
  const response = parseResponseForCommand(buffer, Command.SentMaxGapLength);

  const unpacked = struct.unpack('<B', response.payload);

  return assertType<number>(unpacked[0]);
};

const parseModel = (buffer: Buffer): string => {
  const response = parseResponseForCommand(buffer, Command.SentModel);

  return response.payload.toString('ascii');
};

const parsePaperType = (buffer: Buffer): PaperType => {
  const response = parseResponseForCommand(buffer, Command.SentPaperType);

  const unpacked = struct.unpack('<B', response.payload);

  return assertType<PaperType>(unpacked[0]);
};

const parsePowerOffTime = (buffer: Buffer): number => {
  const response = parseResponseForCommand(buffer, Command.SentPowerDownTime);

  const unpacked = struct.unpack('<B', response.payload);

  return assertType<number>(unpacked[0]);
};

const parsePrintDensity = (buffer: Buffer): number => {
  const response = parseResponseForCommand(buffer, Command.SentHeatDensity);

  const unpacked = struct.unpack('<B', response.payload);

  return assertType<number>(unpacked[0]);
};

const parseSerialNumber = (buffer: Buffer): string => {
  const response = parseResponseForCommand(buffer, Command.SentSn);

  return response.payload.toString('ascii');
};

const parseStatus = (buffer: Buffer): number => {
  const response = parseResponseForCommand(buffer, Command.SentStatus);

  const unpacked = struct.unpack('<BB', response.payload);

  assertType<number>(unpacked[0]);
  assertType<number>(unpacked[1]);

  return 0;
};

const parseTemperature = (): void => {
  // haven't seen this in the wild, not sure how responses look
  throw new Error('not implemented');
};

const parseVersion = (buffer: Buffer): string => {
  const response = parseResponseForCommand(buffer, Command.SentVersion);

  const unpacked = struct.unpack('<BBB', response.payload);

  assertType<number>(unpacked[0]);
  assertType<number>(unpacked[1]);
  assertType<number>(unpacked[2]);

  return unpacked.join('.');
};

const parseVoltage = (): void => {
  // haven't seen this in the wild, not sure how responses look
  throw new Error('not implemented');
};

const image = async (buffer: Buffer, width: number): Promise<Buffer[]> => {
  return packeting(slice(buffer, width), Command.PrintData);
};

export {
  handshake,
  image,
  lineFeed,
  queryBatteryStatus,
  queryBluetoothMAC,
  queryBoardVersion,
  queryCountryName,
  queryFactoryStatus,
  queryHardwareInformation,
  queryMaximumGapLength,
  queryModel,
  queryPaperType,
  queryPowerOffTime,
  queryPrintDensity,
  querySerialNumber,
  queryStatus,
  queryTemperature,
  queryVersion,
  queryVoltage,
  parseBatteryStatus,
  parseBluetoothMAC,
  parseBoardVersion,
  parseCountryName,
  parseFactoryStatus,
  parseHardwareInformation,
  parseMaximumGapLength,
  parseModel,
  parsePaperType,
  parsePowerOffTime,
  parsePrintDensity,
  parseSerialNumber,
  parseStatus,
  parseTemperature,
  parseVersion,
  parseVoltage,
  selfTest,
  setPaperType,
  setPowerOffTime,
  setPrintDensity,
};
