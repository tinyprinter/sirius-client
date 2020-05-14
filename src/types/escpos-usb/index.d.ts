declare module 'escpos-usb' {
  import { EventEmitter } from 'events';
  import { Device } from 'usb';

  export default class USB extends EventEmitter {
    constructor();
    constructor(vid: number);
    constructor(vid: number, pid: number);

    device: Device;

    static findPrinter(): Device;
    static getDevice(vid: number, pid: number): Promise<USB>;

    open(cb: (error: Error | null, usb: USB) => void): USB;
    write(data: Buffer, cb: (error: Error | null) => void): USB;
    close(cb: (error: Error | null) => void): USB;
  }
}
