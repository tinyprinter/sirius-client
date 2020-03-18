import { CommandLineParser } from '@rushstack/ts-command-line';

import ImageAction from './print/image-action';
import PayloadAction from './print/payload-action';

export default class PrintCommandLine extends CommandLineParser {
  public constructor() {
    super({
      toolFilename: 'print',
      toolDescription:
        'Helpers for printing bits and pieces. Just for fun, but sometimes for profit.',
    });

    this.addAction(new ImageAction());
    this.addAction(new PayloadAction());
  }

  onDefineParameters(): void {
    // TODO: implement me?
  }

  protected onExecute(): Promise<void> {
    return super.onExecute();
  }
}
