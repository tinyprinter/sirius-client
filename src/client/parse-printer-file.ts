import fs from 'fs';
import { promisify } from 'util';
import { ClientConfig } from './client-config';

const readFile = promisify(fs.readFile);

const parsePrinterDataFile = async (
  printerDataPath: string
): Promise<ClientConfig> => {
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

export default parsePrinterDataFile;
