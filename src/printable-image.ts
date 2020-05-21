import gm, { State as GmState } from 'gm';

import bitmapify from './bitmapify';

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

    const gmState = im(this.bitmap);

    this.gmState = gmState;

    return gmState;
  }

  static fromBits(bits: Buffer): PrintableImage {
    const bitmap = bitmapify(bits);

    return new PrintableImage(bitmap);
  }

  async asBMP(): Promise<Buffer> {
    const gm = this.gm().colors(2).define('png:bit-depth=1').monochrome();

    return new Promise((resolve, reject) => {
      gm.toBuffer('BMP', (err, out) => {
        if (err) {
          return reject(err);
        }

        return resolve(out);
      });
    });
  }

  async asPNG(): Promise<Buffer> {
    const gm = this.gm().colors(2).define('png:bit-depth=1').monochrome();

    return new Promise((resolve, reject) => {
      gm.toBuffer('PNG', (err, out) => {
        if (err) {
          return reject(err);
        }

        return resolve(out);
      });
    });
  }

  async asBIN(): Promise<Buffer> {
    const gm = this.gm()
      .colors(2) // automatically applies dithering
      .out('-depth', '1')
      .negative();

    return new Promise((resolve, reject) => {
      gm.toBuffer('GRAY', (err, out) => {
        if (err) {
          return reject(err);
        }

        return resolve(out);
      });
    });
  }

  resize(width: number): PrintableImage {
    this.gmState = this.gm().resize(width);

    return this;
  }

  dither(): PrintableImage {
    this.gmState = this.gm()
      .colorspace('gray')
      .colors(2) // automatically applies dithering
      .out('-type', 'bilevel'); // putting this here forces it at the end of the command (otherwise `gm` will push it to the start, ruining the effect)

    return this;
  }

  rotate(degrees: number): PrintableImage {
    this.gmState = this.gm().rotate('white', degrees);

    return this;
  }
}

export default PrintableImage;
