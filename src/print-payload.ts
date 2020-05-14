import { promises as fs } from 'fs';
import { assertType } from 'typescript-is';

import USBPaperangPrinter from './printer/usb-paperang-printer';
import ConsolePrinter from './printer/console-printer';

import devicePayloadDecoder from './berger/device/payload-decoder';
import printerPayloadDecoder from './berger/device/printer/payload-decoder';
import unrle from './berger/device/printer/unrle';
import { BergDeviceCommandJSON } from './berger/commands/device-command';
import PrintableImage from './printable-image';
import { BergPrinterPrinterPrinter } from './berger/device/printer';

const printer: BergPrinterPrinterPrinter = new USBPaperangPrinter();

const printPayload = async (path: string): Promise<void> => {
  // load file
  const string = await fs.readFile(path, 'ascii');
  const payload = assertType<BergDeviceCommandJSON>(JSON.parse(string));

  // process file as though it's a command
  const buffer = Buffer.from(payload.binary_payload, 'base64');
  const devicePayload = await devicePayloadDecoder(buffer);
  const printerPayload = await printerPayloadDecoder(devicePayload.blob);

  // turn buffer into image
  const bits = await unrle(printerPayload.rle.data);
  const image = PrintableImage.fromBits(bits);

  // print
  await (printer as BergPrinterPrinterPrinter).print(image, printerPayload);
};

const path = __dirname + '/../fixtures/events/DeviceCommand.json';

printPayload(path);
