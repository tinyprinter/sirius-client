import yargs from 'yargs';

const commander: yargs.CommandModule<{}, {}> = {
  command: 'scan <command>',
  describe: 'Scan commands',
  builder: (yargs) => {
    return yargs.commandDir('scan', {
      extensions: ['js', 'ts'],
      visit: (commandModule) => {
        return commandModule.default;
      },
    });
  },

  handler: async () => {},
};

export default commander;
