import wsclient from '../wsclient';
import Bridge from '../bridge';
import Printer from '../device/printer';
import ConsolePrinterDriver from '../printer-driver/console';
import FilesystemPrinterDriver from '../printer-driver/filesystem-printer';
import { ClientConfig } from './client-config';
import parsePrinterDataFile from './parse-printer-file';
// import EscposPrinter from './printer-driver/escpos';
// import StarPrinterDriver from './printer-driver/star';

export default async (
  uri: string,
  printerDataPath?: string,
  driver?: string
): Promise<void> => {
  let config: ClientConfig | null = null;

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

  let printerDriver = null;
  switch (driver) {
    case 'console':
      printerDriver = new ConsolePrinterDriver();
      break;
    case 'filesystem':
      printerDriver = new FilesystemPrinterDriver();
      break;
    // case 'escpos':
    //   printerDriver = new EscposPrinter();
    //   break;
    // case 'star':
    //   printerDriver = new StarPrinterDriver();
    //   break;
    default:
      printerDriver = new ConsolePrinterDriver();
  }
  const device = new Printer(config.deviceAddress, printerDriver);
  const bridge = new Bridge(config.bridgeAddress, device);

  wsclient(uri, bridge);
};
