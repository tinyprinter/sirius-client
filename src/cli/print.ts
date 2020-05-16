import { CommandLineParser } from '@rushstack/ts-command-line';

import ImageAction from './print/image';
import PayloadAction from './print/payload';

class Print extends CommandLineParser {
  public constructor() {
    super({
      toolFilename: 'print',
      toolDescription: 'Helpers for printing',
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

export default Print;
