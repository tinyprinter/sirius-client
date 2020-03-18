import fs from 'fs';
import { promisify } from 'util';

import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';
import ConsolePrinterDriver from '../../printer-driver/console';
import decoder from '../../decoder';

const readFile = promisify(fs.readFile);

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

    const payloadPath = this._payloadPath.value;

    try {
      const payload = await readFile(payloadPath);
      const json = JSON.parse(payload.toString('utf-8'));
      const decoded = await decoder(json.binary_payload);

      const driver = new ConsolePrinterDriver();

      return await driver.print(decoded.payload.bytes);
    } catch (error) {
      console.log({ error });
    }
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
