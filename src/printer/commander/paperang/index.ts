import CRC from './crc';
import packetify from './packetify';
import segmenter from './segmenter';
import * as args from './args';
import ndarray from 'ndarray';

// via sharperang:
// public enum Model {
//   None,
//   P1, // Original model; 57mm feed, 48-byte lines (200DPI), LiPo battery (1Ah)
//   P1S,// Original "special edition" model; identical to P1 but in different colours
//   T1, // Label printer model; 15mm feed, unknown-byte lines, 4xAAA battery
//   P2, // Hi-DPI model; 57mm feed, 96-byte lines (300DPI), LiPo battery (1Ah)
//   P2S // Hi-DPI "special edition" model; identical to P2 but includes Pomodoro timer functionality
// }

const Opcodes = {
  NoOp: '\x06\x00\x02\x00',
  Print: '\x00\x01\x00\x00',
  LineFeed: '\x1a\x00\x02\x00',
  TransmitCrc: '\x18\x01\x04\x00',
};

const OperLen = 4;

const MagicValue = 0x35769521;

const crc = new CRC(0x77c40d4d ^ MagicValue);

const handshake = (): Buffer => {
  return packetify(Opcodes.TransmitCrc, crc.ivBytes, new CRC(MagicValue));
};

const feed = (ms: number): Buffer => {
  return packetify(Opcodes.LineFeed, args.lineFeed(ms), crc);
};

const noop = (): Buffer => {
  return packetify(Opcodes.NoOp, Buffer.from('\x00\x00', 'ascii'), crc);
};

const imageSegments = async (pixels: ndarray): Promise<Buffer[]> => {
  const segments = await segmenter(pixels);

  const joined = segments.map((segment) => {
    // note: p2 lines need to be 72 bytes wide (576px), input by default is 48 (384px) wide
    // we've resized to full width by now hopefully, so np, but keep this here for now
    // TODO: check width, pad if necessary
    const additional = 0; //72 - segment.length;

    if (additional > 0) {
      const white = Buffer.from('\x00'.repeat(additional));
      return Buffer.concat([segment, white]);
    }

    return segment;
  });

  return joined.map((segment) => {
    return packetify(args.print(segment.length), segment, crc);
  });
};

export { handshake, feed, imageSegments, noop };
