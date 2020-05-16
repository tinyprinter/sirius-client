import { CommandLineAction } from '@rushstack/ts-command-line';

import daemon from '../../daemon';

class Run extends CommandLineAction {
  public constructor() {
    super({
      actionName: 'run',
      documentation:
        'It should be fairly self-contained at this point, you know?',
      summary: 'Runs a sirius-client daemon',
    });
  }

  protected onDefineParameters(): void {}

  protected async onExecute(): Promise<void> {
    await daemon();
  }
}

export default Run;
