import yargs from 'yargs';
import logger from '../../../logger';
import scan from '../../../scan/bluetooth';

type CommandArguments = {
  config: string;
};

const commander: yargs.CommandModule<{}, CommandArguments> = {
  command: 'bluetooth',
  describe: 'Scan for valid Bluetooth devices.',
  handler: async () => {
    logger.info('starting Bluetooth scan');

    try {
      const results = await scan();

      logger.info('found printers: %O', results);
    } catch (error) {
      logger.error('%O', error);
    }
  },
};

export default commander;
