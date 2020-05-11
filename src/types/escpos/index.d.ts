declare module 'escpos' {
  import { MutableBuffer } from 'mutable-buffer';
  import { OutEndpoint } from 'usb';

  type Density = 'd8' | 's8' | 'd24' | 's24';

  abstract class Device {
    endpoint: OutEndpoint;

    open(callback: (err: Error) => void): void;
    close(callback: (err: Error) => void): void;
    write(data: Buffer, callback: (err: Error) => void): void;
  }

  export class USB extends Device {}

  export class Printer {
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
