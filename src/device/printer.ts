import { DeviceInterface } from './';
import { PrinterDriverInterface } from '../printer-driver';
import { CommandResponse } from '../types';
import { BinaryPayload } from '../decoder/types';
import assert from 'assert';

interface PrinterInterface extends DeviceInterface {
  print(buffer: Buffer): Promise<CommandResponse>;
}

export default class Printer implements PrinterInterface {
  encryptionKey?: string;
  address: string;
  printerDriver: PrinterDriverInterface;

  constructor(address: string, printerDriver: PrinterDriverInterface) {
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
