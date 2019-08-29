declare module 'escpos' {
  class MutableBuffer {
    write(string: string): void;
    write(buffer: Buffer): void;
    writeUInt8(number: number): void;
  }

  abstract class Device {
    open(callback: () => void): void;
  }

  class USB extends Device {}

  class Printer {
    constructor(device: Device);

    flush(callback: () => void): void;
    close(): Printer;
    cut(): Printer;
    newLine(): Printer;

    raster(image: Image): Printer;

    buffer: MutableBuffer;
  }

  class Image {
    constructor(pixels: any);
  }
}
