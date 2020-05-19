import { BluetoothSerialPortNative } from './index';
import { promisify } from 'util';

export default class {
  private port: BluetoothSerialPortNative | undefined;
  private address: string;

  constructor(port: BluetoothSerialPortNative, address: string) {
    this.port = port;
    this.address = address;

    // TODO: watch for incoming data blobs
    const read = (): void => {
      if (this.port != null) {
        this.port.read((err, chunk) => {
          process.nextTick(read);
          // self.emit('data', chunk);
        });
      }
    };

    read();
  }

  get isOpen(): boolean {
    return this.port == null;
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
