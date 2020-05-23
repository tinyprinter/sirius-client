import yargs from 'yargs';

const commander: yargs.CommandModule<{}, {}> = {
  command: 'print <command>',
  describe: 'Print something to a printer',
  builder: (yargs) => {
    return yargs.commandDir('print', {
      extensions: ['js', 'ts'],
      visit: (commandModule) => {
        return commandModule.default;
      },
    });
  },

  handler: async (argv) => {},
};

export default commander;
