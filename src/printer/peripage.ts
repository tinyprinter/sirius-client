import * as peripage from './commander/peripage';
import PrintableImage from '../printable-image';
import { PrintableImageHandler } from './printable-image-wrapper';
import { PrinterParameters } from '../configuration';
import { assertType, is } from 'typescript-is';
import {
  TransportAdapter,
  TransportConfiguration,
  makeTransportAdapter,
} from '../transport';

export type PeripageParameters = {
  image: {
    width: number;
  };
  transport: TransportConfiguration;
};

export default class PeripagePrinter implements PrintableImageHandler {
  static type = 'peripage';

  parameters: PeripageParameters;
  transport: TransportAdapter;

  constructor(parameters: PeripageParameters) {
    this.parameters = parameters;

    this.transport = makeTransportAdapter(parameters.transport);
  }

  static areParametersValid(parameters: PrinterParameters): boolean {
    return is<PeripageParameters>(parameters);
  }

  static fromParameters(parameters: PrinterParameters): PrintableImageHandler {
    return new this(assertType<PeripageParameters>(parameters));
  }

  async open(): Promise<void> {
    await this.transport.connect();

    await this.write(await peripage.handshake());
  }

  async close(): Promise<void> {
    await this.transport.disconnect();
  }

  async print(image: PrintableImage): Promise<boolean> {
    image.resize(this.parameters.image.width);

    try {
      const bits = await image.asBIN();

      await this.write(await peripage.image(bits, this.parameters.image.width));
      await this.write(await peripage.feed(3));
    } catch (error) {
      console.log('uh oh', error);
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
