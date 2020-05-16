import { promises as fs } from 'fs';

import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';

import printer from '../../default-printer';
import { BergDeviceCommandJSON } from '../../berger/commands/device-command';
import { assertType } from 'typescript-is';
import PrintableImage from '../../printable-image';
import unrle from '../../berger/device/printer/unrle';
import devicePayloadDecoder from '../../berger/device/payload-decoder';
import printerPayloadDecoder from '../../berger/device/printer/payload-decoder';

export default class PayloadAction extends CommandLineAction {
  private _payloadPath?: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'payload',
      summary: 'Print the contents from an event payload.',
      documentation:
        'It will first decode the event payload, fish out the bitmap data, and send it to a printer.',
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._payloadPath == null) {
      throw new Error('_payloadPath not defined on action');
    }

    if (this._payloadPath.value == null) {
      throw new Error('_payloadPath has no value');
    }

    // load file
    const string = await fs.readFile(this._payloadPath.value, 'ascii');
    const payload = assertType<BergDeviceCommandJSON>(JSON.parse(string));

    // process file as though it's a command
    const buffer = Buffer.from(payload.binary_payload, 'base64');
    const devicePayload = await devicePayloadDecoder(buffer);
    const printerPayload = await printerPayloadDecoder(devicePayload.blob);

    // turn buffer into image
    const bits = await unrle(printerPayload.rle.data);
    const image = PrintableImage.fromBits(bits);

    // print
    await printer.print(image, printerPayload);
  }

  protected onDefineParameters(): void {
    this._payloadPath = this.defineStringParameter({
      argumentName: 'FILE',
      description: 'Path to payload file to be printed.',
      defaultValue: '/path/to/payload',
      parameterLongName: '--file',
      parameterShortName: '-f',
    });
  }
}
