import ndarray from 'ndarray';
import gm, { State as GmState } from 'gm';

import bitmapify from './bitmapify';
import getPixels from 'get-pixels';

const im = gm.subClass({ imageMagick: true });

class PrintableImage {
  private bitmap: Buffer;

  private gmState?: GmState;

  constructor(bitmap: Buffer) {
    this.bitmap = bitmap;
  }

  private gm(): GmState {
    if (this.gmState != null) {
      return this.gmState;
    }

    const gmState = im(this.bitmap).colors(2).define('png:bit-depth=1');

    this.gmState = gmState;

    return gmState;
  }

  static fromBits(bits: Buffer): PrintableImage {
    const bitmap = bitmapify(bits);

    return new PrintableImage(bitmap);
  }

  async asBMP(): Promise<Buffer> {
    // TODO: we'd need to return gmState as bmp if it's been touched. so. only return source safely

    if (this.gmState != null) {
      throw new Error(
        `image has been manipulated, and can't be returned as a bitmap`
      );
    }

    return this.bitmap;
  }

  async asPNG(): Promise<Buffer> {
    const gm = await this.gm();

    return new Promise((resolve, reject) => {
      gm.toBuffer('PNG', (err, out) => {
        if (err) {
          return reject(err);
        }

        return resolve(out);
      });
    });
  }

  async asPixels(): Promise<ndarray> {
    return new Promise(async (resolve, reject) => {
      const png = await this.asPNG();
      getPixels(png, 'image/png', (err, pixels) => {
        if (err) {
          return reject(err);
        }
        resolve(pixels);
      });
    });
  }

  resize(width: number): PrintableImage {
    const gm = this.gm();
    this.gmState = gm.resize(width);

    return this;
  }

  dither(): PrintableImage {
    const gm = this.gm();

    this.gmState = gm
      .colorspace('gray')
      .colors(2) // automatically applies dithering
      .out('-type', 'bilevel'); // putting this here forces it at the end of the command (otherwise `gm` will push it to the start, ruining the effect)

    return this;
  }
}

export default PrintableImage;
