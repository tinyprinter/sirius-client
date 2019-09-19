import fs from 'fs';
import { promisify } from 'util';

import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@microsoft/ts-command-line';
import ConsolePrinterDriver from '../../printer-driver/console';

const readFile = promisify(fs.readFile);

export default class ImageAction extends CommandLineAction {
  private _imagePath?: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'image',
      summary: 'Print an image!',
      documentation:
        "Pass in whatever image, it'll figure out a way to print it.",
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._imagePath == null) {
      throw new Error('_imagePath not defined on action');
    }

    if (this._imagePath.value == null) {
      throw new Error('_imagePath has no value');
    }

    const imagePath = this._imagePath.value;
    const buffer = await readFile(imagePath);

    // xtreme TODO: resize to 384px, black/white

    const driver = new ConsolePrinterDriver();

    return await driver.print(buffer);
  }

  protected onDefineParameters(): void {
    this._imagePath = this.defineStringParameter({
      argumentName: 'FILE',
      description: 'Path to image file to be printed.',
      defaultValue: '/path/to/image.bmp',
      parameterLongName: '--file',
      parameterShortName: '-f',
    });
  }
}
