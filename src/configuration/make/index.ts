import PrintableImageWrapper, {
  PrintableImageHandler,
} from '../../printer/printable-image-wrapper';
import { is } from 'typescript-is';
import BergPrinter, { BergPrinterHandler } from '../../berger/device/printer';
import { BergDeviceParameters } from '../../berger/device';
import BergBridge, { BergBridgeParamaters } from '../../berger/bridge';
import BergBridgeNetworkWS from '../../berger/bridge/network/ws';
import makePrinters, { PrinterConfiguration } from './printers';
import { Configuration } from '../index';
import logger from '../../logger';

type DeviceConfig = {
  type: string;
  address: string;
  handler: string;
};
type NetworkConfig = {
  uri: string;
};
type BridgeConfig = {
  address: string;
  devices: { [key: string]: DeviceConfig };
};

export type ConfigurationInFile = {
  printers: { [key: string]: PrinterConfiguration };
  network: NetworkConfig;
  bridge: BridgeConfig;
};

// TODO: parse section-by-section, so errors are more localised
// TODO: validate inputs, i.e. that addresses aren't empty strings, etc
export default async (config: object): Promise<Configuration> => {
  if (!is<ConfigurationInFile>(config)) {
    throw new Error('config malformed, bailing');
  }

  // set up actual printers
  const printers = await makePrinters(config.printers);

  const printersInUse: typeof printers = {};

  // set up virtual devices
  const devices = [];
  for (const name in config.bridge.devices) {
    const deviceConfig = config.bridge.devices[name];

    if (deviceConfig.type !== 'littleprinter') {
      logger.error(
        'only supported device is littleprinter, %s is %s',
        name,
        deviceConfig.type
      );
      continue;
    }

    const handler = printers[deviceConfig.handler];

    if (handler == null) {
      logger.error(
        'can\'t find handler named "%s" (valid handlers are: %s)',
        deviceConfig.handler,
        Object.keys(printers)
          .map((s) => `"${s}"`)
          .join(', ')
      );
      continue;
    }

    const parameters: BergDeviceParameters = {
      address: deviceConfig.address,
    };

    const littleprinter = new BergPrinter(
      parameters,
      new PrintableImageWrapper(handler)
    );

    printersInUse[deviceConfig.handler] = handler;
    devices.push(littleprinter);
  }

  // set up a network
  const network = new BergBridgeNetworkWS(config.network.uri);

  // dump it all onto the bridge!
  const parameters: BergBridgeParamaters = {
    address: config.bridge.address,
  };

  return {
    bridge: new BergBridge(parameters, network, devices),
    printers: printersInUse,
  };
};
