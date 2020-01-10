import { IDevice } from './';
import { IPrinterDriver } from '../printer-driver';
import { CommandResponse } from '../types';
import { BinaryPayload } from '../decoder/types';
import assert from 'assert';

interface IPrinter extends IDevice {
  print(buffer: Buffer): Promise<CommandResponse>;
}

export default class Printer implements IPrinter {
  encryptionKey?: string;
  address: string;
  printerDriver: IPrinterDriver;

  constructor(address: string, printerDriver: IPrinterDriver) {
    this.address = address;
    this.printerDriver = printerDriver;
  }

  async handlePayload(payload: BinaryPayload): Promise<CommandResponse> {
    assert(
      payload.header.deviceId === 0x1,
      "Payload isn't for a printer, so we can't really handle it here :<"
    );

    return await this.print(payload.payload.bytes);
  }

  async print(buffer: Buffer): Promise<CommandResponse> {
    const result = await this.printerDriver.print(buffer);

    return Promise.resolve(result);
  }
}
