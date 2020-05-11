import { PrinterDriverInterface, PrintingResult } from '.';

import { USB } from 'escpos';
import { promisify } from 'util';
import getPixels from 'get-pixels';
import gm from 'gm';
import ndarray from 'ndarray';

import StarCommander, {
  PrinterSpeed,
  PageCut,
  DocumentCut,
} from './commander/star-commander';

const im = gm.subClass({ imageMagick: true });

const usb = new USB();
const open = promisify(usb.open).bind(usb);
const close = promisify(usb.close).bind(usb);
const write = promisify(usb.write).bind(usb);

const commander = new StarCommander();
commander.initialise();
commander.setPrintableWidth(1);
commander.initialiseRasterMode();
commander.setPrintSpeed(PrinterSpeed.High);
commander.setPageLength();
commander.setPageCut(PageCut.None);
commander.setDocumentCut(DocumentCut.Partial);
commander.startPage();

const headerBuffer = commander.fetchBuffer();

commander.lineFeed(1);
commander.executeFormFeed();
commander.lineFeed(1);
commander.executeEOT();
commander.endRasterMode();

const footerBuffer = commander.fetchBuffer();

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

export default class StarPrinterDriver implements PrinterDriverInterface {
  async print(image: Buffer): Promise<PrintingResult> {
    const pixels = await pixeler(await pnger(image));

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

    await write(headerBuffer);
    buffers.forEach(async buffer => await write(buffer));
    await write(footerBuffer);

    console.log('...commands written');

    console.log('closing usb');
    await close();
    console.log('...usb closed!');
  }
}
