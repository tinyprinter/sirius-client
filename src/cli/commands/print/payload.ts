import { promises as fs } from 'fs';
import { assertType } from 'typescript-is';
import yargs from 'yargs';
import { BergDeviceCommandJSON } from '../../../berger/commands/device-command';
import devicePayloadDecoder from '../../../berger/device/payload-decoder';
import printerPayloadDecoder from '../../../berger/device/printer/payload-decoder';
import unrle from '../../../berger/device/printer/unrle';
import { printer as makePrinter } from '../../../configuration/index';
import logger from '../../../logger';
import PrintableImage from '../../../printable-image';

type CommandArguments = {
  files: string | string[];
  config: string;
  printer?: string;
};

const commander: yargs.CommandModule<{}, CommandArguments> = {
  command: 'payload <files...>',
  describe: 'Print a payload (or multiple payloads) to a printer',
  builder: (yargs) => {
    return yargs
      .positional('files', {
        describe: 'payload to print',
        type: 'string',
        demandOption: true,
      })
      .option('config', {
        alias: 'c',
        type: 'string',
        describe: 'Path to config file.',
        default: 'config/default.yaml',
      })
      .option('printer', {
        alias: 'p',
        type: 'string',
        describe: 'Identifier of printer to use.',
      });
  },

  handler: async (argv) => {
    argv.files = Array.isArray(argv.files) ? argv.files : [argv.files];

    logger.info('reading from configuration file: %s', argv.config);

    if (argv.printer != null) {
      logger.info('using printer: %s', argv.printer);
    } else {
      logger.info('using default printer');
    }

    // find printer
    const printer = await makePrinter(argv.config, argv.printer);

    await printer.open();

    // print 'em
    for (const file of argv.files) {
      logger.info('printing file: %s', file);

      // load file
      const string = await fs.readFile(file, 'ascii');
      const payload = assertType<BergDeviceCommandJSON>(JSON.parse(string));

      // process file as though it's a command
      const buffer = Buffer.from(payload.binary_payload, 'base64');
      const devicePayload = await devicePayloadDecoder(buffer);
      const printerPayload = await printerPayloadDecoder(devicePayload.blob);

      // turn buffer into image
      const bits = await unrle(printerPayload.rle.data);
      const image = PrintableImage.fromBits(bits);

      await printer.print(image, printerPayload);
    }

    await printer.close();
  },
};

export default commander;
