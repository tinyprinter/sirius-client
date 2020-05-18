import PrintableImageWrapper from '../../printer/printable-image-wrapper';
import { is } from 'typescript-is';
import BergPrinter from '../../berger/device/printer';
import { BergDeviceParameters } from '../../berger/device';
import BergBridge, { BergBridgeParamaters } from '../../berger/bridge';
import BergBridgeNetworkWS from '../../berger/bridge/network/ws';
import makePrinters, { PrinterConfiguration } from './printers';
import { Configuration } from '../index';

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

  // set up virtual devices
  const devices = [];
  for (const name in config.bridge.devices) {
    const deviceConfig = config.bridge.devices[name];

    if (deviceConfig.type !== 'littleprinter') {
      console.log(
        `only supported device is littleprinter, ${name} is ${deviceConfig.type}`
      );
      continue;
    }

    const handler = printers[deviceConfig.handler];

    if (handler == null) {
      console.log(
        `can't find handler named "${
          deviceConfig.handler
        }" (valid handlers are: ${Object.keys(printers)
          .map((s) => `"${s}"`)
          .join(', ')})`
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
    printers,
  };
};
