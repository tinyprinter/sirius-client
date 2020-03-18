import { DeviceInterface } from '../device';
import * as pf from '../protocol-fragments';
import assert from 'assert';
import decoder from '../decoder';
import { CommandResponse } from '../types';

enum CommandType {
  BridgeCommand = 'BridgeCommand',
  DeviceCommand = 'DeviceCommand',
}

export type Command = {
  timestamp: string; // presumably supposed to be ISO-8601, but I usually just see '0'
  type: CommandType;
  bridge_address: string;
  command_id: number; // index of command, used for responding later
};

/**
 * Interface for BERG Bridge.
 *
 * For simplicity right now, it only handles one device, but (TODO:!) we should support multiple devices on a single bridge.
 */
export interface BridgeInterface {
  address: string;

  device: DeviceInterface;

  connect(): Promise<CommandResponse>;
  heartbeat(): Promise<CommandResponse>;
  handle(command: Command): Promise<CommandResponse>;
}

enum BridgeCommandName {
  AddDeviceEncryptionKey = 'add_device_encryption_key',
  // set_cloud_log_level
  // leave
  // form
  // pjoin
  // restart
  // reboot
}

type AddDeviceEncryptionKeyPayloadParams = {
  device_address: string;
  encryption_key: string;
};

type BridgeCommand = Command & {
  json_payload: {
    params: AddDeviceEncryptionKeyPayloadParams;
    name: BridgeCommandName;
  };
};

type DeviceCommand = Command & {
  binary_payload: string; // base64
  device_address: string;
};

export default class Bridge implements BridgeInterface {
  address: string;
  device: DeviceInterface;

  constructor(address: string, device: DeviceInterface) {
    this.address = address;
    this.device = device;
  }

  connect = async (): Promise<CommandResponse> => {
    return pf.CONNECT(this.address);
  };

  heartbeat = async (): Promise<CommandResponse> => {
    const needsKey = this.device.encryptionKey == null;

    if (needsKey) {
      console.log('Asked for encryption key');
      return pf.ENCRYPTION_KEY_REQUIRED(this.address, this.device.address);
    }

    console.log('Heartbeat. Pom pom.');
    return pf.HEARTBEAT(this.address, this.device.address);
  };

  handle = async (command: Command): Promise<CommandResponse> => {
    switch (command.type) {
      case CommandType.BridgeCommand:
        return this.handleBridgeCommand(command as BridgeCommand);
      case CommandType.DeviceCommand:
        return this.handleDeviceCommand(command as DeviceCommand);
      default:
        console.log(`[warn] unknown command type: ${command.type}`);
      // case 'DeviceCommand':
      //   break;
    }

    return null;
  };

  handleBridgeCommand = async (
    command: BridgeCommand
  ): Promise<CommandResponse> => {
    switch (command.json_payload.name) {
      case BridgeCommandName.AddDeviceEncryptionKey:
        const params = command.json_payload
          .params as AddDeviceEncryptionKeyPayloadParams;

        if (this.device.address !== params.device_address) {
          console.log(
            `warn: device address does not match: ${this.device.address} !== ${params.device_address}`
          );
        }
        this.device.encryptionKey = params.encryption_key;
        break;
      default:
        console.log(
          `warn: unknown BridgeCommand of name: ${command.json_payload.name}`
        );
    }
  };

  handleDeviceCommand = async (
    command: DeviceCommand
  ): Promise<CommandResponse> => {
    assert(this.device.address === command.device_address);

    const payload = await decoder(command.binary_payload);

    return await this.device.handlePayload(payload);
  };
}
