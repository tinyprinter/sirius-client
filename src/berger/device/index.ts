import * as pf from '../protocol-fragments';
import { BergBridgeParamaters } from '../bridge';
import BergDeviceCommand from '../commands/device-command';
import payloadDecoder, { BergDeviceCommandPayload } from './payload-decoder';

export type BergDeviceParameters = {
  address: string;
};

export enum BergDeviceCommandResponseCode {
  SUCCESS = 0,
  EUI64_NOT_FOUND = 0x01,
  FAILED_NETWORK = 0x02,
  INVALID_SEQUENCE = 0x20,
  BUSY = 0x30,
  INVALID_SIZE = 0x80,
  INVALID_DEVICETYPE = 0x81,
  FILESYSTEM_ERROR = 0x82,
  FILESYSTEM_INVALID_ID = 0x90,
  FILESYSTEM_NO_FREE_FILEHANDLES = 0x91,
  FILESYSTEM_WRITE_ERROR = 0x92,
  BRIDGE_ERROR = 0xff,
}

export type BergDeviceCommandResponseJSON = {
  device_address: string;
  timestamp: string;
  transfer_time: number;
  bridge_address: string;
  return_code: BergDeviceCommandResponseCode;
  rssi_stats: number[];
  type: 'DeviceCommandResponse';
  command_id: number;
};

type BergDeviceBridge = {
  parameters: BergBridgeParamaters;
  send(message: object): Promise<void>;
};

interface BergDevice {
  deviceTypeId: number;

  parameters: BergDeviceParameters;
  state: BergDeviceState;

  onConnect(bridge: BergDeviceBridge): Promise<void>;
  onDisconnect(): Promise<void>;

  execute(
    command: BergDeviceCommand
  ): Promise<BergDeviceCommandResponseJSON | null>;
}

export type BergDeviceOptions = {
  heartbeatInterval: number;
};

const defaultOptions: BergDeviceOptions = {
  heartbeatInterval: 10_000,
};

type BergDeviceState = {
  isOnline: boolean;
  encryptionKey?: string;
};

export abstract class BaseBergDevice implements BergDevice {
  parameters: BergDeviceParameters;
  state: BergDeviceState;

  deviceTypeId = -1;

  private options: BergDeviceOptions;
  private heartbeatRef?: NodeJS.Timeout;

  protected bridge?: BergDeviceBridge;

  constructor(
    parameters: BergDeviceParameters,
    argOptions: Partial<BergDeviceOptions> = {}
  ) {
    this.parameters = parameters;

    this.options = {
      ...defaultOptions,
      ...argOptions,
    };

    this.heartbeatRef = undefined;

    this.state = {
      isOnline: false,
    };
  }

  async onConnect(bridge: BergDeviceBridge): Promise<void> {
    this.heartbeatRef = setInterval(
      this.heartbeat,
      this.options.heartbeatInterval
    );

    this.bridge = bridge;
    this.state.isOnline = true;

    await this.heartbeat();
  }

  async onDisconnect(): Promise<void> {
    if (this.heartbeatRef == null) {
      return;
    }

    clearInterval(this.heartbeatRef);
    this.heartbeatRef = undefined;

    this.bridge = undefined;
    this.state.isOnline = false;
    this.state.encryptionKey = undefined;
  }

  private heartbeat = async (): Promise<void> => {
    if (!this.state.isOnline) {
      console.log(
        `[device #${this.parameters.address}] Connection is offline, sleeping heartbeat`
      );
      return;
    }

    if (this.bridge == null) {
      console.log(
        `[device #${this.parameters.address}] No bridge parameters, sleeping heartbeat`
      );
      return;
    }

    const needsKey = this.state.encryptionKey == null;

    if (needsKey) {
      console.log(
        `[device #${this.parameters.address}] Asked for encryption key`
      );
      const message = pf.ENCRYPTION_KEY_REQUIRED(
        this.bridge.parameters.address,
        this.parameters.address
      );

      await this.bridge.send(message);
    } else {
      console.log(`[device #${this.parameters.address}] Heartbeat. Pom pom.`);
      const message = pf.HEARTBEAT(
        this.bridge.parameters.address,
        this.parameters.address
      );

      await this.bridge.send(message);
    }
  };

  async execute(
    command: BergDeviceCommand
  ): Promise<BergDeviceCommandResponseJSON | null> {
    if (command.deviceAddress !== this.parameters.address) {
      console.log(
        `warn: device address does not match: sent (${command.deviceAddress}) !== us (${this.parameters.address})`
      );

      return this.makeCommandResponseWithCode(
        BergDeviceCommandResponseCode.INVALID_DEVICETYPE,
        command.commandId
      );
    }

    const buffer = Buffer.from(command.payload, 'base64');

    const payload = await payloadDecoder(buffer);

    if (payload.header.deviceId != this.deviceTypeId) {
      console.log(
        `warn: device ID does not match: sent (${payload.header.deviceId}) !== us (${this.deviceTypeId})`
      );

      return this.makeCommandResponseWithCode(
        BergDeviceCommandResponseCode.BRIDGE_ERROR,
        payload.header.commandId
      );
    }

    return await this.handlePayload(payload);
  }

  abstract handlePayload(
    payload: BergDeviceCommandPayload
  ): Promise<BergDeviceCommandResponseJSON | null>;

  protected makeCommandResponseWithCode(
    code: BergDeviceCommandResponseCode,
    commandId: number
  ): BergDeviceCommandResponseJSON | null {
    if (this.bridge == null) {
      console.log(
        `warn: printer got a payload, but doesn't have a bridge. bailing.`
      );
      return null;
    }

    return {
      device_address: this.parameters.address,
      timestamp: '0',
      transfer_time: 0,
      bridge_address: this.bridge.parameters.address,
      return_code: code,
      rssi_stats: [0, 0, 0],
      type: 'DeviceCommandResponse',
      command_id: commandId,
    };
  }
}

export default BergDevice;
