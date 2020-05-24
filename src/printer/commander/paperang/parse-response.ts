import Command from './command';
import struct from 'python-struct';
import { assertType } from 'typescript-is';
import { Packet } from './const';

type Response = {
  command: Command;
  name: string;
  length: number;
  payload: Buffer;
  payloadAscii: string;
  crc32: Buffer;
};

const lookupCommandName = (command: Command): string => {
  let commandKey: string | null = null;

  for (const key in Command) {
    const v = Command[key];
    if (((command as unknown) as string) === v) {
      commandKey = key;
      break;
    }
  }

  if (commandKey == null) {
    throw new Error(`unknown command: ${command}`);
  }

  return commandKey;
};

const parseResponse = (buffer: Buffer): Response[] => {
  let base = 0;
  const results: Response[] = [];

  while (base < buffer.length && buffer.readUInt8() === Packet.Start) {
    const unpacked = struct.unpack('<BBBH', buffer.slice(base, base + 5));

    const command = assertType<Command>(unpacked[1]);
    const length = assertType<number>(unpacked[3]);

    const name = lookupCommandName(command);
    const payload = buffer.slice(base + 5, base + 5 + length);
    const crc32 = buffer.slice(base + 5 + length, base + 9 + length);

    const result = {
      command,
      name,
      length,
      payload,
      payloadAscii: payload.toString('ascii'),
      crc32,
    };

    results.push(result);

    base += 10 + length;
  }

  return results;
};

const parseResponseForCommand = (
  buffer: Buffer,
  command: Command
): Response => {
  const response = parseResponse(buffer).find((r) => r.command == command);

  if (response == null) {
    throw new Error(`could not find ${lookupCommandName(command)} in response`);
  }

  return response;
};

export default parseResponse;

export { parseResponseForCommand };
