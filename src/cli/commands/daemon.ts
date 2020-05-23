import yargs from 'yargs';

const commander: yargs.CommandModule<{}, {}> = {
  command: 'daemon <command>',
  describe: 'Daemon-related commands',
  builder: (yargs) => {
    return yargs.commandDir('daemon', {
      extensions: ['js', 'ts'],
      visit: (commandModule) => {
        return commandModule.default;
      },
    });
  },

  handler: async () => {},
};

export default commander;
