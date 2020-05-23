import { promises as fs, mkdir } from 'fs';
import Path from 'path';
import { BergPrinterPayload } from '../berger/device/printer/payload-decoder';
import PrintableImage from '../printable-image';
import { PrintableImageHandler } from './printable-image-wrapper';
import { PrinterParameters } from '../configuration';
import { is, assertType } from 'typescript-is';
import logger from '../logger';

enum Format {
  BIN = 'bin',
  PNG = 'png',
}

export type FileWriterParameters = {
  image: {
    width: number;
  };
  directory: string;
  format: Format;
};

export default class implements PrintableImageHandler {
  static type = 'file_writer';

  private parameters: FileWriterParameters;

  constructor(parameters: FileWriterParameters) {
    this.parameters = parameters;
  }

  static areParametersValid(parameters: PrinterParameters): boolean {
    return is<FileWriterParameters>(parameters);
  }

  static fromParameters(parameters: PrinterParameters): PrintableImageHandler {
    return new this(assertType<FileWriterParameters>(parameters));
  }

  async open(): Promise<void> {
    this.mkdir(this.parameters.directory);
  }

  async close(): Promise<void> {}

  async print(
    image: PrintableImage,
    payload: BergPrinterPayload
  ): Promise<boolean> {
    try {
      // if we've come from a payload, it must be upside down
      if (payload != null) {
        image.rotate(180);
      }

      image.resize(this.parameters.image.width);

      const buffer = await this.bufferise(image);

      // TODO: obvioussssly a name based on date this won't play well with a
      // lot of connections, but it's fine for now
      const now = new Date();
      const filename = `${now.toISOString().replace(/[^0-9]/g, '-')}.${
        this.parameters.format
      }`;

      const path = Path.join(this.parameters.directory, filename);

      logger.debug(`writing to: %s`, path);

      await fs.writeFile(path, buffer);

      return true;
    } catch (error) {
      logger.error('FileWriter error: %O', error);
      return false;
    }
  }

  private async mkdir(path: string): Promise<void> {
    try {
      await fs.mkdir(path);
    } catch (error) {
      if (error.code === 'EEXIST') {
        // Something already exists, but is it a file or directory?
        const lstat = await fs.lstat(path);

        if (!lstat.isDirectory()) {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  private async bufferise(image: PrintableImage): Promise<Buffer> {
    switch (this.parameters.format) {
      case Format.PNG:
        return await image.asPNG();
      case Format.BIN:
        return await image.asBIN();
    }
  }
}
