import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';

import daemon from '../../daemon';

class Run extends CommandLineAction {
  private _configPath!: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'run',
      documentation:
        'It should be fairly self-contained at this point, you know?',
      summary: 'Runs a sirius-client daemon',
    });
  }

  protected onDefineParameters(): void {
    this._configPath = this.defineStringParameter({
      parameterLongName: '--config-path',
      parameterShortName: '-c',
      argumentName: 'PATH',
      description: 'Path to configuration file.',
      defaultValue: 'config/default.yaml',
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._configPath.value == null) {
      throw new Error('configuration path not set!');
    }

    await daemon.configure(this._configPath.value);
    await daemon.run();
  }
}

export default Run;
