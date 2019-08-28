import escpos from 'escpos';
import getPixels from 'get-pixels';
import gm from 'gm';

interface Pixels {}

const im = gm.subClass({ imageMagick: true });

const device = new escpos.USB();
const printer = new escpos.Printer(device);

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

const pixeler = async (buf: Buffer): Promise<Pixels> => {
  return new Promise((resolve, reject) => {
    getPixels(buf, 'image/png', (err, pixels) => {
      if (err) {
        return reject(err);
      }
      resolve(pixels);
    });
  });
};

const printr = async (pixels: Pixels): Promise<void> => {
  return new Promise((resolve, reject) => {
    const image = new escpos.Image(pixels);

    device.open(() => {
      printer
        .newLine()
        .raster(image)
        .cut()
        .close();

      resolve();
    });
  });
};

export default async (buf: Buffer) => {
  // convert to PNG, because `get-pixels` doesn't support 1bit BMPs
  const png = await pnger(buf);

  // create pixels from png
  const pixels = await pixeler(png);

  // print 'em
  await printr(pixels);
};
