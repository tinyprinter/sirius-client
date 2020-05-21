import { promises as fs } from 'fs';

import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';
import PrintableImage from '../../printable-image';
import { printer as makePrinter } from '../../configuration/index';

export default class ImageAction extends CommandLineAction {
  private _configPath!: CommandLineStringParameter;
  private _imagePath!: CommandLineStringParameter;
  private _printerName!: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'image',
      summary: 'Print an image!',
      documentation:
        "Pass in whatever image, it'll figure out a way to print it.",
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._configPath.value == null) {
      throw new Error('config path parameter has no value');
    }

    if (this._imagePath.value == null) {
      throw new Error('file parameter has no value');
    }

    // find printer
    const printer = await makePrinter(
      this._configPath.value,
      this._printerName.value
    );

    // load file
    const buffer = await fs.readFile(this._imagePath.value);
    const image = new PrintableImage(buffer);
    image.dither();

    // print 'em
    await printer.open();
    await printer.print(image, undefined);

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

    this._imagePath = this.defineStringParameter({
      argumentName: 'FILE',
      description: 'Path to image file to be printed.',
      parameterLongName: '--file',
      parameterShortName: '-f',
      required: true,
    });
  }
}
