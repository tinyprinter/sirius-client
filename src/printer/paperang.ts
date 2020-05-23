import * as paperang from './commander/paperang/index';
import PrintableImage from '../printable-image';
import { PrintableImageHandler } from './printable-image-wrapper';
import { PrinterParameters } from '../configuration';
import { assertType, is } from 'typescript-is';
import {
  TransportAdapter,
  TransportConfiguration,
  makeTransportAdapter,
} from '../transport';
import logger from '../logger';

export type PaperangParameters = {
  image: {
    width: number;
  };
  transport: TransportConfiguration;
};

export default class PaperangPrinter implements PrintableImageHandler {
  static type = 'paperang';

  parameters: PaperangParameters;
  transport: TransportAdapter;

  constructor(parameters: PaperangParameters) {
    this.parameters = parameters;

    this.transport = makeTransportAdapter(parameters.transport);
  }

  static areParametersValid(parameters: PrinterParameters): boolean {
    return is<PaperangParameters>(parameters);
  }

  static fromParameters(parameters: PrinterParameters): PrintableImageHandler {
    return new this(assertType<PaperangParameters>(parameters));
  }

  async open(): Promise<void> {
    await this.transport.connect();

    await this.write(await paperang.handshake());
    await this.write(await paperang.setPowerOffTime(0));
  }

  async close(): Promise<void> {
    await this.transport.disconnect();
  }

  async print(image: PrintableImage): Promise<boolean> {
    image.resize(this.parameters.image.width);

    try {
      await this.write(
        await paperang.image(await image.asBIN(), this.parameters.image.width)
      );
      await this.write(await paperang.lineFeed(75));
    } catch (error) {
      logger.error('uh oh: %O', error);
      return false;
    }

    return true;
  }

  private async write(buffers: Buffer[]): Promise<void> {
    for (const buffer of buffers) {
      await this.transport.write(buffer);
    }
  }
}
