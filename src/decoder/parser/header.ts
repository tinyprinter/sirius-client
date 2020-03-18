import { Parser } from 'binary-parser';

import { CommandHeader } from '../types';

const header = (buf: Buffer, offset = 0): CommandHeader => {
  const parser = new Parser()
    .endianess('little')
    .skip(offset)
    .uint8('deviceId')
    .uint8('unused', {
      assert: 0x0,
    })
    .uint16('commandId')
    .uint32('printId')
    .uint32('crc', {
      assert: 0x0,
    })
    .uint32('length');

  const result = parser.parse(buf);

  return {
    deviceId: result.deviceId,
    commandName: result.commandId,
    printId: result.printId,
    crc: result.crc,
    length: result.length,
  };
};

export default header;
