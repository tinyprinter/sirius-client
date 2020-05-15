declare module 'escpos-bluetooth' {
  import { EventEmitter } from 'events';

  export default class Bluetooth extends EventEmitter {
    constructor(address: string, channel: number);

    static findPrinters(): Promise<
      [{ address: string; name: string; channel: number } | undefined]
    >;
    static getDevice(address: string, channel: number): Promise<Bluetooth>;

    open(cb: (error: Error | null) => void): Bluetooth;
    write(data: Buffer, cb: (error: Error | null) => void): Bluetooth;
    close(cb: (error: Error | null) => void): Bluetooth;
  }
}
