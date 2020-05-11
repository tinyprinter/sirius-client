import {
  CommandLineParser,
  CommandLineFlagParameter,
} from '@rushstack/ts-command-line';

import RunAction from './client/run-action';

export default class ClientCommandLine extends CommandLineParser {
  private _verbose?: CommandLineFlagParameter;

  public constructor() {
    super({
      toolFilename: 'client',
      toolDescription:
        'The sirius-client runner, for connecting to a hosted Sirius instance',
    });

    this.addAction(new RunAction());
  }

  protected onDefineParameters(): void {
    // abstract
    this._verbose = this.defineFlagParameter({
      parameterLongName: '--verbose',
      parameterShortName: '-v',
      description: 'Show extra logging detail',
    });
  }

  protected onExecute(): Promise<void> {
    // TODO: set up verbose logging
    return super.onExecute();
  }
}
