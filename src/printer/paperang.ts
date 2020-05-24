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

    await this.dumpStatus();
  }

  async close(): Promise<void> {
    await this.transport.disconnect();
  }

  async print(image: PrintableImage): Promise<boolean> {
    image.resize(this.parameters.image.width);
    try {
      await this.write(
        await paperang.image(await image.asBIN(), this.parameters.image.width),
        false
      );
      await this.write(await paperang.lineFeed(75));
    } catch (error) {
      logger.error('uh oh: %O', error);
      return false;
    }
    return true;
  }

  private async write(buffers: Buffer[], waitForRead = true): Promise<void> {
    for (const buffer of buffers) {
      await this.transport.write(buffer);
      if (waitForRead) {
        await this.transport.read();
      }
    }
  }

  private async dumpStatus(): Promise<void> {
    const commands = [
      {
        name: 'battery status',
        query: paperang.queryBatteryStatus,
        parse: paperang.parseBatteryStatus,
      },
      {
        name: 'bluetooth MAC',
        query: paperang.queryBluetoothMAC,
        parse: paperang.parseBluetoothMAC,
      },
      {
        name: 'board version',
        query: paperang.queryBoardVersion,
        parse: paperang.parseBoardVersion,
      },
      {
        name: 'country name',
        query: paperang.queryCountryName,
        parse: paperang.parseCountryName,
      },
      {
        name: 'factor status',
        query: paperang.queryFactoryStatus,
        parse: paperang.parseFactoryStatus,
      },
      {
        name: 'hardware information',
        query: paperang.queryHardwareInformation,
        parse: paperang.parseHardwareInformation,
      },
      {
        name: 'maximum gap length',
        query: paperang.queryMaximumGapLength,
        parse: paperang.parseMaximumGapLength,
      },
      { name: 'model', query: paperang.queryModel, parse: paperang.parseModel },
      {
        name: 'paper type',
        query: paperang.queryPaperType,
        parse: paperang.parsePaperType,
      },
      {
        name: 'power off time',
        query: paperang.queryPowerOffTime,
        parse: paperang.parsePowerOffTime,
      },
      {
        name: 'print density',
        query: paperang.queryPrintDensity,
        parse: paperang.parsePrintDensity,
      },
      {
        name: 'serial number',
        query: paperang.querySerialNumber,
        parse: paperang.parseSerialNumber,
      },
      {
        name: 'status',
        query: paperang.queryStatus,
        parse: paperang.parseStatus,
      },
      {
        name: 'temperature',
        query: paperang.queryTemperature,
        parse: paperang.parseTemperature,
      },
      {
        name: 'version',
        query: paperang.queryVersion,
        parse: paperang.parseVersion,
      },
      {
        name: 'voltage',
        query: paperang.queryVoltage,
        parse: paperang.parseVoltage,
      },
    ];

    for (const command of commands) {
      await this.write(await command.query(), false);
      try {
        const result = command.parse(await this.transport.read());

        logger.debug('%s: %s', command.name, result);
      } catch (error) {
        logger.debug('%s: unknown', command.name);
      }
    }
  }
}
