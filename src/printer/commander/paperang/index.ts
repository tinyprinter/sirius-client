import { USB } from 'escpos';
import CRC from './crc';
import packetify from './packetify';
import segmenter from './segmenter';
import * as args from './args';

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

const initialise = (usb: USB) => {
  // for now, I only know we support P2S, so let's do some checking here...
  const VENDOR_ID = 0x20d1;
  const P2S_PRODUCT_ID = 0x7008;

  const some = usb as any;
  const { idVendor, idProduct } = some.device.deviceDescriptor;

  if (idVendor !== VENDOR_ID || idProduct !== P2S_PRODUCT_ID) {
    console.log(
      "⚠️ warning! this only officially supports Paperang P2S, and this ain't one. there may be dragons!"
    );
  } else {
    console.log("found Paperang P2S, let's disco!");
  }
};

const handshake = (): Buffer => {
  return packetify(Opcodes.TransmitCrc, crc.ivBytes, new CRC(MagicValue));
};

const feed = (ms: number): Buffer => {
  return packetify(Opcodes.LineFeed, args.lineFeed(ms), crc);
};

const noop = (): Buffer => {
  return packetify(Opcodes.NoOp, Buffer.from('\x00\x00', 'ascii'), crc);
};

const imageSegments = async (image: Buffer): Promise<Buffer[]> => {
  // note: p2 lines need to be 72 bytes wide (576px), where we only plan on 48 (384px) wide. let's pad it with whitespace if necessary.
  const segments = await segmenter(image);

  const joined = segments.map((segment) => {
    const additional = 72 - segment.length;

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

export { handshake, initialise, feed, imageSegments, noop };
