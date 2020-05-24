import { BluetoothSerialPortNative } from './index';
import { promisify } from 'util';

export default class {
  private port: BluetoothSerialPortNative | undefined;
  private address: string;

  constructor(port: BluetoothSerialPortNative, address: string) {
    this.port = port;
    this.address = address;
  }

  get isOpen(): boolean {
    return this.port == null;
  }

  async read(): Promise<Buffer> {
    if (this.port == null) {
      throw new Error('no port to write from');
    }

    const read = promisify(this.port.read).bind(this.port);
    return await read();
  }

  async write(buffer: Buffer): Promise<void> {
    if (this.port == null) {
      throw new Error('no port to write to');
    }

    const write = promisify(this.port.write).bind(this.port);
    return await write(buffer, this.address);
  }

  async close(): Promise<void> {
    this.port?.close(this.address);
    this.port = undefined;
  }
}
