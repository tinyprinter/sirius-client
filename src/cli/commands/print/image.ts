import { promises as fs } from 'fs';
import yargs from 'yargs';
import { printer as makePrinter } from '../../../configuration/index';
import PrintableImage from '../../../printable-image';
import logger from '../../../logger';

type CommandArguments = {
  files: string | string[];
  config: string;
  printer?: string;
};

const commander: yargs.CommandModule<{}, CommandArguments> = {
  command: 'image <files...>',
  describe: 'Print an image (or multiple images) to a printer',
  builder: (yargs) => {
    return yargs
      .positional('files', {
        describe: 'images to print (png, jpg, etc)',
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
      const buffer = await fs.readFile(file);
      const image = new PrintableImage(buffer);
      image.dither();

      await printer.print(image, undefined);
    }

    await printer.close();
  },
};

export default commander;
