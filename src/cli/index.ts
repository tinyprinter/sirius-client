import yargs from 'yargs';

export default async (): Promise<void> => {
  yargs
    .commandDir('commands', {
      extensions: ['js', 'ts'],
      visit: (commandModule) => {
        return commandModule.default;
      },
    })
    .strict()
    .demandCommand()
    .showHelpOnFail(true)
    .help().argv;
};
