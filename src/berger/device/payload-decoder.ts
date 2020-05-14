import { Parser } from 'binary-parser';

export type BergDeviceCommandPayload = {
  header: {
    deviceId: number;
    command: number;
    commandId: number;
    crc: number; // unused
    length: number;
  };
  blob: Buffer;
};

const payloadDecoder = async (
  buf: Buffer,
  offset = 0
): Promise<BergDeviceCommandPayload> => {
  const parser = new Parser()
    .endianess('little')
    .skip(offset)
    .uint8('deviceId')
    .uint8('unused', {
      // reserved byte, was never used afaik
      assert: 0x0,
    })
    .uint16('command')
    .uint32('commandId')
    .uint32('crc', {
      assert: 0x0,
    })
    .uint32('length')
    .buffer('blob', {
      length: 'length',
    });

  const result = parser.parse(buf);

  return {
    header: {
      deviceId: result.deviceId,
      command: result.command,
      commandId: result.commandId,
      crc: result.crc,
      length: result.length,
    },
    blob: result.blob,
  };
};

export default payloadDecoder;
