import yargs from 'yargs';
import logger from '../../../logger';
import scan from '../../../scan/usb';

type CommandArguments = {};

const commander: yargs.CommandModule<{}, CommandArguments> = {
  command: 'usb',
  describe: 'Scan for valid USB devices.',
  handler: async () => {
    logger.info('starting USB scan');

    try {
      const results = await scan();

      const resultsWithHex = results.map((result) => {
        return {
          ...result,
          vid: `${result.vid.toString(10)} (0x${result.vid.toString(16)})`,
          pid: `${result.pid.toString(10)} (0x${result.pid.toString(16)})`,
        };
      });

      logger.info('found printers: %O', resultsWithHex);
    } catch (error) {
      logger.error('%O', error);
    }
  },
};

export default commander;
