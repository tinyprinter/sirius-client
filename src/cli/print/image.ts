import { promises as fs } from 'fs';

import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';
import PrintableImage from '../../printable-image';
import { PrintableImageHandler } from '../../printer/printable-image-handler';
// import ConsoleDriver from '../../printer-driver/console';

// import process from '../../image-processor';

// const readFile = promisify(fs.readFile);

import printer from '../../default-printer';

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

    const path = this._imagePath.value;

    // load file
    const buffer = await fs.readFile(path);

    const image = new PrintableImage(buffer);
    image.dither();

    // print 'em
    await (printer as PrintableImageHandler).print(image, undefined);
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
