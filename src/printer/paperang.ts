import * as paperang from './commander/paperang';
import PrintableImage from '../printable-image';
import { PrintableImageHandler } from './printable-image-wrapper';
import { PrinterParameters } from '../configuration';
import { assertType, is } from 'typescript-is';
import {
  TransportAdapter,
  TransportConfiguration,
  makeTransportAdapter,
} from '../transport';

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
  }

  async close(): Promise<void> {
    await this.transport.disconnect();
  }

  async print(image: PrintableImage): Promise<boolean> {
    image.resize(this.parameters.image.width);

    try {
      await this.transport.write(paperang.handshake());
      await this.transport.write(paperang.noop());

      const segments = await paperang.imageSegments(await image.asPixels());
      for (let i = 0; i < segments.length; i++) {
        await this.transport.write(segments[i]);
      }

      await this.transport.write(paperang.feed(75));
      await this.transport.write(paperang.noop());
    } catch (error) {
      console.log('uh oh', error);
      return false;
    }

    return true;
  }
}
