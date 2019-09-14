import { IDevice } from '../';
import { CommandResponse } from '../../types';
import { BinaryPayload } from '../../decoder/types';
import assert from 'assert';

interface IPrinter extends IDevice {
  print(buffer: Buffer): Promise<CommandResponse>;
}

export default abstract class Printer implements IPrinter {
  encryptionKey?: string;
  address: string;

  constructor(address: string) {
    this.address = address;
  }

  async handlePayload(payload: BinaryPayload): Promise<CommandResponse> {
    assert(
      payload.header.deviceId === 0x1,
      "Payload isn't for a printer, so we can't really handle it here :<"
    );

    return await this.print(payload.payload.bitmap);
  }

  async print(buffer: Buffer): Promise<CommandResponse> {
    throw new Error('Method not implemented.');
  }
}
