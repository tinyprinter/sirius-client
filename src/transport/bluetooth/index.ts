import bindings from 'bindings';

export declare class BluetoothSerialPortNative {
  constructor(
    address: string,
    channel: number,
    success: () => void,
    error: (error?: Error) => void
  );
  read(callback: (error?: Error, buffer?: Buffer) => void): void;
  write(
    buffer: Buffer,
    address: string,
    callback: (error?: Error) => void
  ): void;
  close(address: string): void;
}

const BTSerialPortBinding = bindings('BluetoothSerialPort.node')
  .BTSerialPortBinding as typeof BluetoothSerialPortNative;

import { TransportAdapter } from '../index';
import Connection from './connection';

export type BluetoothParameters = {
  address: string;
  channel: number;
};

export type BluetoothTransportConfiguration = {
  type: 'bluetooth';
  parameters: BluetoothParameters;
};

export default class implements TransportAdapter {
  private parameters: BluetoothParameters;

  private connection: Connection | undefined;

  constructor(parameters: BluetoothParameters) {
    this.parameters = parameters;
  }

  async connect(): Promise<void> {
    console.log('...connecting bt');
    const port = await new Promise<BluetoothSerialPortNative>(
      (resolve, reject) => {
        const port = new BTSerialPortBinding(
          this.parameters.address,
          this.parameters.channel,
          () => {
            resolve(port);
          },
          (error) => {
            reject(error);
          }
        );
      }
    );

    this.connection = new Connection(port, this.parameters.address);
  }

  async disconnect(): Promise<void> {
    await this.connection?.close();
    this.connection = undefined;
  }

  async write(buffer: Buffer): Promise<void> {
    await this.connection?.write(buffer);

    // XXX: add a pause here to allow printing to finish before the buffer flushes thru, and process exits/whatever
    // TODO: this feels unnecessary, investigate why it's failing (on macOS only?) occasionally
    // the delay is based on the length of the command sent, but that's pretty hand-wavy
    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(buffer.length / 5))
    );
  }
}
