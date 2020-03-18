/**
 * This only supports TSP100 ("TSP143"?!) because that's the only printer I have access to. _Most_ of the commands are the same across models, but things like cut options/paper size might not work as expected on other models!
 */

import { MutableBuffer } from 'mutable-buffer';

export enum PrinterSpeed {
  High = '0',
  Medium = '1',
  Low = '2',
}

export enum PageCut {
  None = '1',
  Partial = '13',
}

export enum DocumentCut {
  None = '1',
  Partial = '13',
}

export enum PrintableWidth {
  WIDTH_72MM = 0,
  WIDTH_51MM = 1,
}

export default class StarCommander {
  private buffer: MutableBuffer;

  public constructor() {
    this.buffer = new MutableBuffer(1024, 1024);
  }

  initialise(): this {
    this.buffer.write('\x1b\x40', 'ascii');
    return this;
  }

  /**
   * @param width TSP100: 0 = 80mm paper (72mm print), 1 = 58mm paper (51mm print)
   */
  setPrintableWidth(width: PrintableWidth): this {
    this.buffer.write('\x1b\x1e\x41', 'ascii');
    this.buffer.writeUInt8(width);
    return this;
  }

  initialiseRasterMode(): this {
    // initialise raster mode: ESC * r R
    this.buffer.write('\x1b\x2a\x72\x52', 'ascii');

    // enter raster mode: ESC * r A
    this.buffer.write('\x1b\x2a\x72\x41', 'ascii');

    return this;
  }

  endRasterMode(): this {
    // enter raster mode: ESC * r B
    this.buffer.write('\x1b\x2a\x72\x42', 'ascii');

    return this;
  }

  setPrintSpeed(printerSpeed: PrinterSpeed): this {
    // set raster print quality: ESC * r Q n NUL
    this.buffer.write('\x1b\x2a\x72\x51' + printerSpeed + '\x00', 'ascii');

    return this;
  }

  // note: hard-coded to content length
  setPageLength(): this {
    // set raster page length: ESC * r P n NUL
    this.buffer.write('\x1b\x2a\x72\x50' + '\x30' + '\x00', 'ascii');

    return this;
  }

  setPageCut(pageCut: PageCut = PageCut.None): this {
    // set raster form feed mode: ESC * r F n NUL
    this.buffer.write('\x1b\x2a\x72\x46' + pageCut + '\x00', 'ascii');

    return this;
  }

  setDocumentCut(documentCut: DocumentCut = DocumentCut.Partial): this {
    // set raster EOT mode : ESC * r E n NUL
    this.buffer.write('\x1b\x2a\x72\x45' + documentCut + '\x00', 'ascii');

    return this;
  }

  startPage(): this {
    this.buffer.write('\x00', 'ascii');
    return this;
  }

  endDocument(): this {
    return this;
  }

  printImage(): this {
    return this;
  }

  lineFeed(lines = 1): this {
    this.buffer.write(
      '\x1b\x2a\x72\x59' + lines.toString(10) + '\x00',
      'ascii'
    );
    return this;
  }

  executeFormFeed(): this {
    this.buffer.write('\x1b\x0c\x00', 'ascii');
    return this;
  }

  executeEOT(): this {
    this.buffer.write('\x1b\x0c\x04', 'ascii');
    return this;
  }

  resetBuffer() {
    this.buffer.clear();
  }

  fetchBuffer(): Buffer {
    return Buffer.from(this.buffer.flush());
  }
}
