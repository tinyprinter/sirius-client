import yargs from 'yargs';
import daemon from '../../../daemon';
import logger from '../../../logger';

type CommandArguments = {
  config: string;
};

const commander: yargs.CommandModule<{}, CommandArguments> = {
  command: 'run',
  describe: 'Print an image (or multiple images) to a printer',
  builder: (yargs) => {
    return yargs.option('config', {
      alias: 'c',
      type: 'string',
      describe: 'Runs a sirius-client daemon.',
      default: 'config/default.yaml',
    });
  },

  handler: async (argv) => {
    logger.info(
      'starting daemon, reading from configuration file: %s',
      argv.config
    );

    await daemon.configure(argv.config);
    await daemon.run();
  },
};

export default commander;
