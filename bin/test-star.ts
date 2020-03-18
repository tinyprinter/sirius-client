import { USB } from 'escpos';
import { promisify } from 'util';
import fs from 'fs';
import decoder from '../src/decoder';
import getPixels from 'get-pixels';
import gm from 'gm';
import ndarray from 'ndarray';

const im = gm.subClass({ imageMagick: true });

const readFile = promisify(fs.readFile);

const usb = new USB();
const open = promisify(usb.open).bind(usb);
const close = promisify(usb.close).bind(usb);
const write = promisify(usb.write).bind(usb);

// const getCircularReplacer = () => {
//   const seen = new WeakSet();
//   return (key: string, value: any) => {
//     if (typeof value === 'object' && value !== null) {
//       if (seen.has(value)) {
//         return;
//       }
//       seen.add(value);
//     }
//     return value;
//   };
// };

// const write = async (buffer: Buffer) => {
//   const transfer = promisify(usb.endpoint.transfer).bind(usb.endpoint);

//   console.log(JSON.stringify(usb.endpoint, getCircularReplacer(), 2));
//   // console.log({ timeout: usb.endpoint.timeout });
//   return Promise.resolve();

//   return await transfer(buffer);
// };

// const open = () => {
//   return Promise.resolve();
// };
// const close = () => {
//   return Promise.resolve();
// };
// const write = (buffer: Buffer): Promise<void> => {
//   return new Promise(resolve => {
//     console.log(buffer);
//     resolve();
//   });
// };

const header =
  '\x1b\x40\x1b\x1e\x41\x00\x1b\x07\x14\x14\x1b\x2a\x72\x52\x1b\x2a' +
  '\x72\x41\x1b\x2a\x72\x51\x32\x00\x1b\x2a\x72\x44\x30\x00\x1b\x2a' +
  '\x72\x50\x30\x00\x1b\x2a\x72\x46\x31\x00\x1b\x2a\x72\x45\x31' +
  '\x00\x00';

const footer =
  '\x1b\x2a\x72\x59' +
  '\x31\x00\x1b\x0c\x00\x1b\x2a\x72\x59\x31\x00\x1b\x0c\x04\x1b\x2a' +
  '\x72\x42';

// const phoneBitmap = [
//   /*'\x1b' + */ 'b' + '\x02\x00\x00\x00',
//   /*'\x1b' + */ 'b' + '\x02\x00\x1F\xF8',
//   /*'\x1b' + */ 'b' + '\x02\x00\x3F\xFC',
//   /*'\x1b' + */ 'b' + '\x02\x00\x77\xEE',
//   /*'\x1b' + */ 'b' + '\x02\x00\xF8\x1F',
//   /*'\x1b' + */ 'b' + '\x02\x00\xF8\x1F',
//   /*'\x1b' + */ 'b' + '\x02\x00\xF8\x1F',
//   /*'\x1b' + */ 'b' + '\x02\x00\x0F\xF0',
//   /*'\x1b' + */ 'b' + '\x02\x00\x1F\xF8',
//   /*'\x1b' + */ 'b' + '\x02\x00\x1F\xF8',
//   /*'\x1b' + */ 'b' + '\x02\x00\x3E\x7C',
//   /*'\x1b' + */ 'b' + '\x02\x00\x38\x1C',
//   /*'\x1b' + */ 'b' + '\x02\x00\x79\x9E',
//   /*'\x1b' + */ 'b' + '\x02\x00\x73\xCE',
//   /*'\x1b' + */ 'b' + '\x02\x00\x73\xCE',
//   /*'\x1b' + */ 'b' + '\x02\x00\xF9\x9F',
//   /*'\x1b' + */ 'b' + '\x02\x00\xF8\x1F',
//   /*'\x1b' + */ 'b' + '\x02\x00\xFE\x7F',
//   /*'\x1b' + */ 'b' + '\x02\x00\xFF\xFF',
//   /*'\x1b' + */ 'b' + '\x02\x00\xFF\xFF',
//   /*'\x1b' + */ 'b' + '\x02\x00\x00\x00',
//   /*'\x1b' + */ 'b' + '\x02\x00\x00\x00',
//   /*'\x1b' + */ 'b' + '\x02\x00\x00\x00',
//   /*'\x1b' + */ 'b' + '\x02\x00\x00\x00',
// ];

// const buffers = bitmap.map(blob => {
//   return Buffer.from(blob, 'ascii');
// });

const payloadPath = './fixtures/events/DeviceCommand.json';

const pnger = async (buf: Buffer): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    im(buf)
      .colors(2)
      .define('png:bit-depth=1')
      .toBuffer('PNG', (err, out) => {
        if (err) {
          return reject(err);
        }

        return resolve(out);
      });
  });
};

const pixeler = async (buf: Buffer): Promise<ndarray> => {
  return new Promise((resolve, reject) => {
    getPixels(buf, 'image/png', (err, pixels) => {
      if (err) {
        return reject(err);
      }
      resolve(pixels);
    });
  });
};

(async (): Promise<void> => {
  try {
    const payload = await readFile(payloadPath);
    const json = JSON.parse(payload.toString('utf-8'));
    const decoded = await decoder(json.binary_payload);

    const bitmap = decoded.payload.bitmap;

    const pixels = await pixeler(await pnger(bitmap));

    let data = [];
    function rgb(
      pixel: number[]
    ): { r: number; g: number; b: number; a: number } {
      return {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        a: pixel[3],
      };
    }

    for (let i = 0; i < pixels.data.length; i += pixels.shape[2]) {
      data.push(
        rgb(
          new Array(pixels.shape[2]).fill(0).map(function(_, b) {
            return pixels.data[i + b];
          })
        )
      );
    }

    data = data.map(pixel => {
      if (pixel.a == 0) {
        return 0;
      }
      const shouldBeWhite = pixel.r > 200 && pixel.g > 200 && pixel.b > 200;
      return shouldBeWhite ? 0 : 1;
    });

    const buffers: Buffer[] = [];

    const width = pixels.shape[0];
    const rowCount = pixels.shape[1];

    for (let row = 0; row < rowCount; row++) {
      const begin = row * width;
      const rowBits = data.slice(begin, begin + width);
      const rowBytes = new Uint8Array(width / 8);
      for (let b = 0; b < rowBytes.length; b++) {
        rowBytes[b] =
          (rowBits[b * 8 + 0] << 7) |
          (rowBits[b * 8 + 1] << 6) |
          (rowBits[b * 8 + 2] << 5) |
          (rowBits[b * 8 + 3] << 4) |
          (rowBits[b * 8 + 4] << 3) |
          (rowBits[b * 8 + 5] << 2) |
          (rowBits[b * 8 + 6] << 1) |
          (rowBits[b * 8 + 7] << 0);
      }
      const preamble = Buffer.from(
        '\x62' + String.fromCharCode(rowBytes.length) + '\x00'
      );
      // console.log(rowBytes.length, rowBits.length);
      buffers.push(Buffer.concat([preamble, rowBytes]));
    }

    // console.log(
    //   // bytes.toString('hex'),
    //   buffers.length,
    //   JSON.stringify(buffers.map(buf => buf.toString('hex')), null, 2)
    // );

    // process.exit(0);

    console.log('opening usb');
    await open();
    console.log('...usb open!');

    console.log('writing commands');

    await write(Buffer.from(header, 'ascii'));
    buffers.forEach(async buffer => await write(buffer));
    await write(Buffer.from(footer, 'ascii'));

    console.log('...commands written');

    console.log('closing usb');
    await close();
    console.log('...usb closed!');
  } catch (e) {
    console.error(e);
    process.exit(99);
  }
})();

/*
char printerInitializeCommand [] = {0x1b,'@'};
char formFeed[] = "\x1B\x0C\x00";
char printableWidthCommand[] = {0x1b,0x1e,'A',0x00};
char setRasterPageLengthCommand [] = {0x1b,'*','r','P','0',0x00};
char startPageCommand [] = {0x00};
char printDensityCommand [] = {0x1b,0x1e,'d','3' };
char rasterModeStartCommand [] = {0x1b,'*','r','R',0x1b,'*','r','A'};
char printSpeedCommand [] = {0x1b,'*','r','Q','0',0x00};
char docCutTypeCommand [] = {0x1b,'*','r','E','9',0x00};
char rasterImage [] = {
        //          n1  n2 d1    d2..
        0x1b, 'b', 0x2, 0, 0x00, 0x00, // data
        0x1b, 'b', 0x2, 0, 0x1F, 0xF8,
        0x1b, 'b', 0x2, 0, 0x3F, 0xFC,
        0x1b, 'b', 0x2, 0, 0x77, 0xEE,
        0x1b, 'b', 0x2, 0, 0xF8, 0x1F,
        0x1b, 'b', 0x2, 0, 0xF8, 0x1F,
        0x1b, 'b', 0x2, 0, 0xF8, 0x1F,
        0x1b, 'b', 0x2, 0, 0x0F, 0xF0,
        0x1b, 'b', 0x2, 0, 0x1F, 0xF8,
        0x1b, 'b', 0x2, 0, 0x1F, 0xF8,
        0x1b, 'b', 0x2, 0, 0x3E, 0x7C,
        0x1b, 'b', 0x2, 0, 0x38, 0x1C,
        0x1b, 'b', 0x2, 0, 0x79, 0x9E,
        0x1b, 'b', 0x2, 0, 0x73, 0xCE,
        0x1b, 'b', 0x2, 0, 0x73, 0xCE,
        0x1b, 'b', 0x2, 0, 0xF9, 0x9F,
        0x1b, 'b', 0x2, 0, 0xF8, 0x1F,
        0x1b, 'b', 0x2, 0, 0xFE, 0x7F,
        0x1b, 'b', 0x2, 0, 0xFF, 0xFF,
        0x1b, 'b', 0x2, 0, 0xFF, 0xFF,
        0x1b, 'b', 0x2, 0, 0x00, 0x00,
        0x1b, 'b', 0x2, 0, 0x00, 0x00,
        0x1b, 'b', 0x2, 0, 0x00, 0x00,
        0x1b, 'b', 0x2, 0, 0x00, 0x00};
char endPageCommand [] = {0x1b,'*','r','Y','1',0x00,0x1b,0x0c};
char endJobCommand [] = {0x04,0x1b,'*','r','B'};
*/
