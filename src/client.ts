import fs from 'fs';
import { promisify } from 'util';
import wsclient from './wsclient';
import Bridge from './bridge';
import Printer from './device/printer';
import ConsolePrinterDriver from './printer-driver/console';

const readFile = promisify(fs.readFile);

type Config = {
  deviceAddress: string;
  bridgeAddress: string;
  claimCode: string;
};

const parsePrinterDataFile = async (
  printerDataPath: string
): Promise<Config> => {
  const printerDataBuffer = await readFile(printerDataPath, {
    encoding: 'utf-8',
  });
  const printerData = printerDataBuffer.toString();

  // Parse data from printer file
  const deviceAddressMaybe = printerData.match(/address: ([a-f0-9]{16})/);

  if (deviceAddressMaybe == null) {
    throw new Error(`couldn't find device address in ${printerDataPath}`);
  }
  const deviceAddress = deviceAddressMaybe[1];

  const claimCodeMaybe = printerData.match(
    /claim code: ([a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})/
  );

  if (claimCodeMaybe == null) {
    throw new Error(`couldn't find claim code in ${printerDataPath}`);
  }
  const claimCode = claimCodeMaybe[1];

  // TODO: should the bridge address be the MAC of the host system?
  // for now just generate something random, it's not too important - only the device address _really_ matters
  const bridgeAddress = Math.floor(Math.random() * Math.floor(Math.pow(2, 64)))
    .toString(16)
    .padStart(16, '0');

  return {
    deviceAddress,
    bridgeAddress,
    claimCode,
  };
};

export default async (uri: string, printerDataPath?: string): Promise<void> => {
  let config: Config | null = null;

  if (printerDataPath == null) {
    // check default location
    // if no data, generate new printer
    // print out claim code
    /*
    const deviceAddress = 'x';
    const bridgeAddress = 'y';
    const claimCode = 'z';

    // config = {
    //   deviceAddress,
    //   bridgeAddress,
    //   claimCode,
    // };
    */
  } else {
    config = await parsePrinterDataFile(printerDataPath);
  }

  if (config == null) {
    throw new Error(
      'Printer config data is null, did you forget to set up a printer?'
    );
  }

  console.log('Contacting', uri);
  console.log(config);
  console.log('-----------------------------');

  const printerDriver = new ConsolePrinterDriver();
  const device = new Printer(config.deviceAddress, printerDriver);
  const bridge = new Bridge(config.bridgeAddress, device);

  wsclient(uri, bridge);
};
