import { promises as fs } from 'fs';

import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';

import { BergDeviceCommandJSON } from '../../berger/commands/device-command';
import { assertType } from 'typescript-is';
import PrintableImage from '../../printable-image';
import unrle from '../../berger/device/printer/unrle';
import devicePayloadDecoder from '../../berger/device/payload-decoder';
import printerPayloadDecoder from '../../berger/device/printer/payload-decoder';
import { printer as makePrinter } from '../../configuration/index';

export default class PayloadAction extends CommandLineAction {
  private _configPath!: CommandLineStringParameter;
  private _payloadPath!: CommandLineStringParameter;
  private _printerName!: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'payload',
      summary: 'Print the contents from an event payload.',
      documentation:
        'It will first decode the event payload, fish out the bitmap data, and send it to a printer.',
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._configPath.value == null) {
      throw new Error('config path parameter has no value');
    }

    if (this._payloadPath.value == null) {
      throw new Error('file parameter has no value');
    }

    // find printer
    const printer = await makePrinter(
      this._configPath.value,
      this._printerName.value
    );

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
    await printer.open();
    await printer.print(image, printerPayload);

    // let commands finish executing (printing is slow!)
    console.log('commands sent, allowing a moment to finish up...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log('...done!');

    await printer.close();
  }

  protected onDefineParameters(): void {
    this._configPath = this.defineStringParameter({
      parameterLongName: '--config-path',
      parameterShortName: '-c',
      argumentName: 'PATH',
      description: 'Path to configuration file.',
      defaultValue: 'config/default.yaml',
    });

    this._printerName = this.defineStringParameter({
      parameterLongName: '--printer-name',
      parameterShortName: '-p',
      argumentName: 'NAME',
      description:
        'Name of printer key in config file. Will use the first printer if omitted.',
    });

    this._payloadPath = this.defineStringParameter({
      argumentName: 'FILE',
      description: 'Path to payload file to be printed.',
      parameterLongName: '--file',
      parameterShortName: '-f',
      required: true,
    });
  }
}
