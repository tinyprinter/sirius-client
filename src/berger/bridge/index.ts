import { assertType } from 'typescript-is';
import { BergBridgeNetwork } from './network';
import * as pf from '../protocol-fragments';
import BergDevice from '../device';
import BergBridgeCommand, {
  BergBridgeCommandJSON,
  BergBridgeCommandJSONParamsAddDeviceEncryptionKey,
} from '../commands/bridge-command';
import BergDeviceCommand, {
  BergDeviceCommandJSON,
} from '../commands/device-command';
import logger from '../../logger';
import { promises as fs } from 'fs';

export type BergBridgeParamaters = {
  address: string;
};

type State = {
  isOnline: boolean;
  devices: BergDevice[];
};

enum BergCommandType {
  BridgeCommand = 'BridgeCommand',
  DeviceCommand = 'DeviceCommand',
}

type BergCommandJSON = BergBridgeCommandJSON | BergDeviceCommandJSON;

enum BergBridgeCommandName {
  AddDeviceEncryptionKey = 'add_device_encryption_key',
  // set_cloud_log_level
  // leave
  // form
  // pjoin
  // restart
  // reboot
}

// TODO: what's a response need?
type BergBridgeCommandResponseJSON = object;

class BergBridge {
  private state: State;
  private network: BergBridgeNetwork;

  parameters: BergBridgeParamaters;

  constructor(
    parameters: BergBridgeParamaters,
    network: BergBridgeNetwork,
    devices: BergDevice[] = []
  ) {
    this.state = {
      isOnline: false,
      devices: devices,
    };

    this.parameters = parameters;
    this.network = network;

    this.network.delegate = {
      onConnect: this.onConnect,
      onDisconnect: this.onDisconnect,
      onMessage: this.onMessage,
    };
  }

  get isOnline(): boolean {
    return this.state.isOnline;
  }

  get devices(): BergDevice[] {
    return this.state.devices;
  }

  async addDevice(device: BergDevice): Promise<void> {
    if (this.state.devices.includes(device)) {
      return;
    }

    this.state.devices.push(device);

    if (this.state.isOnline) {
      await device.onConnect({
        parameters: this.parameters,
        send: this.network.send,
      });
    }
  }

  async removeDevice(device: BergDevice): Promise<void> {
    const index = this.state.devices.indexOf(device);
    if (index == -1) {
      throw new Error('device not registered with bridge');
    }

    this.state.devices.splice(index, 1);

    if (this.state.isOnline) {
      await device.onDisconnect();
    }
  }

  deviceAt(address: string): BergDevice | null | undefined {
    return this.state.devices.find(
      (device) => device.parameters.address === address
    );
  }

  async start(): Promise<void> {
    await this.network.connect();
  }

  async stop(): Promise<void> {
    await this.network.disconnect();
  }

  async execute(
    command: BergBridgeCommand
  ): Promise<BergBridgeCommandResponseJSON | null> {
    if (command.bridgeAddress !== this.parameters.address) {
      logger.warn(
        'bridge address does not match: sent (%s) !== us (%s)',
        command.bridgeAddress,
        this.parameters.address
      );
      return null;
    }

    logger.debug('bridge command: %s', command.commandName);

    switch (command.commandName) {
      case BergBridgeCommandName.AddDeviceEncryptionKey: {
        try {
          const params = assertType<
            BergBridgeCommandJSONParamsAddDeviceEncryptionKey
          >(command.params);

          const device = this.deviceAt(params.device_address);

          if (device != null) {
            logger.debug(
              'saving encryption key for device %s',
              params.device_address
            );
            device.state.encryptionKey = params.encryption_key;
          }
        } catch (error) {
          logger.error(
            `error processing BergBridgeCommandName.AddDeviceEncryptionKey: %O`,
            error
          );
        }

        break;
      }
      default:
        logger.warn('unknown bridge command of name: %s', command.commandName);
    }

    return null;
  }

  private onConnect = async (network: BergBridgeNetwork): Promise<void> => {
    this.state.isOnline = true;

    const message = pf.CONNECT(this.parameters.address);
    await this.network.send(message);

    this.state.devices.forEach(
      async (device) =>
        await device.onConnect({
          parameters: this.parameters,
          send: (message) => network.send(message),
        })
    );
  };

  private onDisconnect = async (): Promise<void> => {
    this.state.isOnline = false;

    this.state.devices.forEach(async (device) => await device.onDisconnect());
  };

  private onMessage = async (
    network: BergBridgeNetwork,
    message: BergCommandJSON
  ): Promise<void> => {
    try {
      switch (message.type) {
        case BergCommandType.BridgeCommand:
          {
            const json = assertType<BergBridgeCommandJSON>(message);
            const command = new BergBridgeCommand(json);

            const response = await this.execute(command);

            if (response != null) {
              await network.send(response);
            }
          }

          break;

        case BergCommandType.DeviceCommand:
          {
            if (false) {
              // handy lil debug dump
              const filename = `DeviceCommand.${Math.round(
                new Date().getTime() / 1000
              )}.json`;
              logger.debug('writing command to file: %s', filename);
              await fs.writeFile(
                filename,
                Buffer.from(JSON.stringify(message, null, 2))
              );
            }

            const json = assertType<BergDeviceCommandJSON>(message);
            const command = new BergDeviceCommand(json);

            const device = this.deviceAt(command.deviceAddress);

            if (device != null) {
              const response = await device.execute(command);

              if (response != null) {
                await network.send(response);
              }
            }
          }

          break;

        default:
          logger.warn('Unknown command type: %s: %O', message.type, message);
          break;
      }
    } catch (error) {
      // no message needs to be sent if there's an error, so we'll just log it
      logger.error(`Error processing command: %O`, error);
    }
  };
}

export default BergBridge;
