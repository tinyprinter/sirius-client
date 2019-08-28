declare module 'escpos' {
  abstract class Device {
    open(callback: () => void): void;
  }

  class USB extends Device {}

  class Printer {
    constructor(device: Device);

    close(): Printer;
    cut(): Printer;
    newLine(): Printer;

    raster(image: Image): Printer;
  }

  class Image {
    constructor(pixels: any);
  }
}
