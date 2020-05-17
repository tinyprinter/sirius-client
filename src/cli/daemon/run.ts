import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';
import { promises as fs } from 'fs';
import Path from 'path';

import daemon from '../../daemon';

class Run extends CommandLineAction {
  private _path!: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'run',
      documentation:
        'It should be fairly self-contained at this point, you know?',
      summary: 'Runs a sirius-client daemon',
    });
  }

  protected onDefineParameters(): void {
    this._path = this.defineStringParameter({
      parameterLongName: '--config-path',
      parameterShortName: '-c',
      argumentName: 'PATH',
      description: 'Path to configuration file.',
      defaultValue: 'config/default.yml',
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._path.value == null) {
      throw new Error('configuration path not set!');
    }

    const path = await fs.realpath(Path.join(process.cwd(), this._path.value));

    await daemon.configure(path);
    await daemon.run();
  }
}

export default Run;
