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
  }
}
