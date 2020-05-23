import * as escpos from './commander/escpos';
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

export type EscPosParameters = {
  image: {
    width: number;
  };
  transport: TransportConfiguration;
};

export default class implements PrintableImageHandler {
  static type = 'escpos';

  parameters: EscPosParameters;
  transport: TransportAdapter;

  constructor(parameters: EscPosParameters) {
    this.parameters = parameters;

    this.transport = makeTransportAdapter(parameters.transport);
  }

  static areParametersValid(parameters: PrinterParameters): boolean {
    return is<EscPosParameters>(parameters);
  }

  static fromParameters(parameters: PrinterParameters): PrintableImageHandler {
    return new this(assertType<EscPosParameters>(parameters));
  }

  async open(): Promise<void> {
    await this.transport.connect();

    await this.write(await escpos.handshake());
  }

  async close(): Promise<void> {
    await this.transport.disconnect();
  }

  async print(image: PrintableImage): Promise<boolean> {
    image.resize(this.parameters.image.width);

    try {
      const bits = await image.asBIN();

      await this.write(await escpos.feed());
      await this.write(await escpos.raster(bits, this.parameters.image.width));
      await this.write(await escpos.feed(5));
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
