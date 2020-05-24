import bindings from 'bindings';

export declare class BluetoothSerialPortNative {
  constructor(
    address: string,
    channel: number,
    success: () => void,
    error: (error?: Error) => void
  );
  read(callback: (error: Error, buffer?: Buffer) => void): void;
  read(callback: (error: Error | undefined, buffer: Buffer) => void): void;
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
import logger from '../../logger';

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
    logger.info(
      '...connecting bt (%s, channel: %d)',
      this.parameters.address,
      this.parameters.channel
    );

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
    logger.info('...disconnecting bt (%s)', this.parameters.address);

    await this.connection?.close();
    this.connection = undefined;
  }

  async write(buffer: Buffer): Promise<void> {
    logger.debug(
      '...writing bt (%s), %d bytes',
      this.parameters.address,
      buffer.length
    );

    await this.connection?.write(buffer);
  }

  async read(): Promise<Buffer> {
    if (this.connection == null) {
      throw new Error('no bluetooth connection found!');
    }

    logger.debug('...reading bt (%s)', this.parameters.address);

    const result = await this.connection.read();

    logger.debug(
      '...reading bt (%s): got %d bytes',
      this.parameters.address,
      result.length
    );

    return result;
  }
}
