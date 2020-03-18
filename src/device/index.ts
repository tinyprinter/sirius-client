import { CommandResponse } from '../types';
import { BinaryPayload } from '../decoder/types';

export interface DeviceInterface {
  address: string;
  encryptionKey?: string;

  handlePayload(payload: BinaryPayload): Promise<CommandResponse>;
}
