import { CommandLineParser } from '@rushstack/ts-command-line';

import RunAction from './daemon/run';

class Print extends CommandLineParser {
  public constructor() {
    super({
      toolFilename: 'print',
      toolDescription: 'Helpers for printing',
    });

    this.addAction(new RunAction());
  }

  onDefineParameters(): void {
    // TODO: implement me?
  }

  protected onExecute(): Promise<void> {
    return super.onExecute();
  }
}

export default Print;
