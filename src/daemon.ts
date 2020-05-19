import BergBridge from './berger/bridge';

import makeConfiguration from './configuration';
import { PrintableImageHandler } from './printer/printable-image-wrapper';

class Daemon {
  private timer: NodeJS.Timeout | undefined = undefined;
  private isShuttingDown = false;

  private bridge: BergBridge | undefined;
  private printers: { [key: string]: PrintableImageHandler } | undefined;

  async configure(configurationPath: string): Promise<void> {
    if (this.bridge != null) {
      console.log("reconfiguring isn't supported (yet!), ignoring request");
      return;
    }

    if (this.printers != null) {
      const printers = this.printers;

      await Promise.allSettled(
        Object.keys(this.printers).map(
          async (key) => await printers[key].close()
        )
      );
    }

    const configuration = await makeConfiguration(configurationPath);

    this.bridge = configuration.bridge;
    this.printers = configuration.printers;
  }

  async run(): Promise<void> {
    if (this.bridge == null) {
      console.log('no bridge configured, bailing');
      return;
    }

    if (this.timer != null) {
      return;
    }

    this.timer = setInterval(async () => await this.runServer(), 5000);
    await this.runServer();
  }

  async shutdown(): Promise<void> {
    if (this.timer != null) {
      clearInterval(this.timer);
    }

    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    await this.bridge?.stop();

    if (this.printers != null) {
      const printers = this.printers;

      await Promise.allSettled(
        Object.keys(this.printers).map(
          async (key) => await printers[key].close()
        )
      );
    }
  }

  private async runServer(): Promise<void> {
    if (this.bridge == null) {
      console.log('no bridge configured, bailing');
      return;
    }

    if (this.printers == null) {
      console.log('no printers configured, bailing');
      return;
    }

    try {
      if (!this.bridge.isOnline) {
        if (this.printers != null) {
          const printers = this.printers;

          await Promise.allSettled(
            Object.keys(this.printers).map(
              async (key) => await printers[key].open()
            )
          );
        }

        console.log('starting bridge!');
        console.log(`bridge address: ${this.bridge.parameters.address}`);
        for (let i = 0; i < this.bridge.devices.length; i++) {
          const device = this.bridge.devices[i];
          console.log(
            ` - device #${i + 1} address: ${device.parameters.address}`
          );
        }
        await this.bridge.start();
      }
    } catch (error) {
      console.log(`error, daemon bailed`, error);
    }
  }
}

const daemon = new Daemon();

process.on('SIGINT', async () => {
  console.log('shutting down...');
  await daemon.shutdown();
  process.exit();
});

export default daemon;
