import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@rushstack/ts-command-line';

import client from '../../client';

export default class RunAction extends CommandLineAction {
  private _uri?: CommandLineStringParameter;
  private _printerDataPath?: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'run',
      summary: 'Run the sirius-client process',
      documentation: 'Connect to a Sirius instance, and wait for commands.',
    });
  }

  protected async onExecute(): Promise<void> {
    if (this._uri == null) {
      throw new Error('_uri not defined on action');
    }

    if (this._printerDataPath == null) {
      throw new Error('_printerDataPath not defined on action');
    }

    if (this._uri.value == null) {
      throw new Error('_uri has no value');
    }

    const uri = this._uri.value;
    const printerDataPath = this._printerDataPath.value;

    return await client(uri, printerDataPath);
  }

  protected onDefineParameters(): void {
    this._uri = this.defineStringParameter({
      argumentName: 'URI',
      environmentVariable: 'SIRIUS_SERVER_URI',
      description: 'URI of the Sirius server endpoitn',
      defaultValue: 'wss://littleprinter.nordprojects.co/api/v1/connection',
      parameterLongName: '--uri',
      parameterShortName: '-u',
    });

    this._printerDataPath = this.defineStringParameter({
      argumentName: 'PATH',
      environmentVariable: 'PRINTER_DATA_PATH',
      description: 'Path to .printer data file (relative to project root)',
      parameterLongName: '--printer-data-path',
      parameterShortName: '-p',
    });
  }
}
