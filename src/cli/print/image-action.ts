import fs from 'fs';
import { promisify } from 'util';

import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';
import ConsoleDriver from '../../printer-driver/console';

import process from '../../image-processor';

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
    const source = await readFile(imagePath);
    const processed = await process(source);

    const driver = new ConsoleDriver();

    return await driver.print(processed);
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
