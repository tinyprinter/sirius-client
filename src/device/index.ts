import { CommandResponse } from '../types';
import { BinaryPayload } from '../decoder/types';

export interface IDevice {
  address: string;
  encryptionKey?: string;

  handlePayload(payload: BinaryPayload): Promise<CommandResponse>;
}
