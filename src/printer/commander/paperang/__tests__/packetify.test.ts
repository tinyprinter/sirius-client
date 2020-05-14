import packetify from '../packetify';

import CRC, { MagicValue } from '../crc';
import * as args from '../args';

describe('packetify', () => {
  it('handshake', () => {
    const crc = new CRC(0x77c40d4d ^ MagicValue);
    const operation = '\x18\x01\x04\x00';
    const data = crc.ivBytes;
    const checksum = new CRC(MagicValue);

    const packet = packetify(operation, data, checksum);

    expect(packet).toEqual(
      Buffer.from(
        '\x02\x18\x01\x04\x00\x4d\x0d\xc4\x77\x69\x92\x95\xed\x03',
        'ascii'
      )
    );
  });

  it('noop', () => {
    const crc = new CRC(0x77c40d4d ^ MagicValue);
    const operation = '\x06\x00\x02\x00';
    const data = Buffer.from('\x00\x00', 'ascii');
    const checksum = crc;

    const packet = packetify(operation, data, checksum);

    expect(packet).toEqual(
      Buffer.from('\x02\x06\x00\x02\x00\x00\x00\x90\x6f\x45\x76\x03', 'ascii')
    );
  });

  it('line feed: 0', () => {
    const crc = new CRC(0x77c40d4d ^ MagicValue);
    const operation = '\x1a\x00\x02\x00';
    const data = args.lineFeed(0);
    const checksum = crc;

    const packet = packetify(operation, data, checksum);

    expect(packet).toEqual(
      Buffer.from('\x02\x1a\x00\x02\x00\x00\x00\x90\x6f\x45\x76\x03', 'ascii')
    );
  });

  it('line feed: 200', () => {
    const crc = new CRC(0x77c40d4d ^ MagicValue);
    const operation = '\x1a\x00\x02\x00';
    const data = args.lineFeed(200);
    const checksum = crc;

    const packet = packetify(operation, data, checksum);

    expect(packet).toEqual(
      Buffer.from('\x02\x1A\x00\x02\x00\xC8\x00\xD6\x32\x66\x75\x03', 'ascii')
    );
  });

  it('small image', () => {
    const crc = new CRC(0x77c40d4d ^ MagicValue);
    const image = Buffer.from('\x11\x22\x33\x44\x55\x66\x77\x88\x99', 'ascii');

    expect(image.length).toEqual(9);

    const operation = args.print(image.length);
    const data = image;
    const checksum = crc;

    const packet = packetify(operation, data, checksum);

    expect(packet).toEqual(
      Buffer.from(
        '\x02\x00\x01\x09\x00\x11\x22\x33\x44\x55\x66\x77\x88\x99\x0a\x57\x62\x9d\x03',
        'ascii'
      )
    );
  });
});
