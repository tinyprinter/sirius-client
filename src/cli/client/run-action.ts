import {
  CommandLineAction,
  CommandLineStringParameter,
} from '@microsoft/ts-command-line';

import fs from 'fs';
import wsclient from '../../wsclient';

import Bridge from '../../bridge';
import ConsolePrinter from '../../device/printer/console-printer';

export default class RunAction extends CommandLineAction {
  private _uri?: CommandLineStringParameter;

  public constructor() {
    super({
      actionName: 'run',
      summary: 'Run the sirius-client process',
      documentation: 'Connect to a Sirius instance, and wait for commands.',
    });
  }

  protected onExecute(): Promise<void> {
    if (this._uri == null) {
      throw new Error('_uri not defined on action');
    }

    if (this._uri.value == null) {
      throw new Error('_uri has no value');
    }

    const uri = this._uri.value;

    // TODO: connect this to websocketing
    console.log('will eventually connect to', uri);

    const printerDataPath = 'fixtures/2cadfa9fdad2c46a.printer';
    const printerData = fs.readFileSync(printerDataPath).toString();

    console.log('Contacting', this._uri.value);
    console.log(printerData);
    console.log('-----------------------------');

    // Parse data from printer file
    const deviceAddressMaybe = printerData.match(/address: ([a-f0-9]{16})/);

    if (deviceAddressMaybe == null) {
      throw new Error(`couldn't find device address in ${printerDataPath}`);
    }
    const deviceAddress = deviceAddressMaybe[1];

    const bridgeAddress = Math.floor(
      Math.random() * Math.floor(Math.pow(2, 64))
    )
      .toString(16)
      .padStart(16, '0');

    const device = new ConsolePrinter(deviceAddress);
    const bridge = new Bridge(bridgeAddress, device);

    wsclient(uri, bridge);

    return Promise.resolve();
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
  }
}
