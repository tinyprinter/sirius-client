import { all } from '../printer';
import {
  isConfigurationValid,
  PrinterConfiguration,
  fromConfiguration,
} from '.';
import PrintableImageWrapper, {
  PrintableImageHandler,
} from '../printer/printable-image-wrapper';
import { is } from 'typescript-is';
import BergPrinter from '../berger/device/printer';
import { BergDeviceParameters } from '../berger/device';
import BergBridge, { BergBridgeParamaters } from '../berger/bridge';
import BergBridgeNetworkWS from '../berger/bridge/network/ws';

type PrinterConfig = {
  driver: string;
  parameters?: PrinterConfiguration;
};
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

type Config = {
  printers: { [key: string]: PrinterConfig };
  network: NetworkConfig;
  bridge: BridgeConfig;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
// Since static functions don't work in interfaces, we wrap it here
interface ConfigurablePrinterClassRef {
  new (...args: any[]): any;
  isConfigurationValid(configuration: PrinterConfiguration): boolean;
  fromConfiguration(configuration: PrinterConfiguration): any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// TODO: parse section-by-section, so errors are more localised
// TODO: validate inputs, i.e. that addresses aren't empty strings, etc
const parse = async (config: object): Promise<BergBridge> => {
  if (!is<Config>(config)) {
    throw new Error('config malformed, bailing');
  }

  // set up actual printers
  const printers: { [key: string]: PrintableImageHandler } = {};
  for (const name in config.printers) {
    const printerConfig = config.printers[name];

    const printerClass: ConfigurablePrinterClassRef =
      all[printerConfig.driver.toLowerCase()];

    if (printerClass == null) {
      console.log(
        `can't find printer driver with name: ${printerConfig.driver}`
      );
      continue;
    }

    if (!isConfigurationValid(printerClass, printerConfig.parameters)) {
      console.log(`invalid config for printer: ${printerConfig.driver}`);
      continue;
    }

    printers[name] = fromConfiguration(printerClass, printerConfig.parameters);
  }

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

  const bridge = new BergBridge(parameters, network, devices);

  return bridge;
};

export default parse;
