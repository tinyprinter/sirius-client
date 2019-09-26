declare module 'escpos' {
  type Density = 'd8' | 's8' | 'd24' | 's24';

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
    hardware(command: string): Printer;
    newLine(): Printer;

    image(image: Image, density: Density): Promise<Printer>;
    raster(image: Image): Printer;

    buffer: MutableBuffer;
  }

  class Image {
    constructor(pixels: any);
  }
}
