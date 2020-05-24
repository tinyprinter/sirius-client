import BergBridge from './berger/bridge';

import makeConfiguration from './configuration';
import { PrintableImageHandler } from './printer/printable-image-wrapper';
import logger from './logger';

class Daemon {
  private timer: NodeJS.Timeout | undefined = undefined;
  private isShuttingDown = false;

  private bridge: BergBridge | undefined;
  private printers: { [key: string]: PrintableImageHandler } | undefined;

  async configure(configurationPath: string): Promise<void> {
    if (this.bridge != null) {
      logger.warn("reconfiguring isn't supported (yet!), ignoring request");
      return;
    }

    if (this.printers != null) {
      const printers = this.printers;

      await Promise.all(
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
      logger.warn('no bridge configured, bailing');
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

      await Promise.all(
        Object.keys(this.printers).map(
          async (key) => await printers[key].close()
        )
      );
    }
  }

  private async runServer(): Promise<void> {
    if (this.bridge == null) {
      logger.warn('no bridge configured, bailing');
      return;
    }

    if (this.printers == null) {
      logger.warn('no printers configured, bailing');
      return;
    }

    try {
      if (!this.bridge.isOnline) {
        if (this.printers != null) {
          // TODO: filter by only printers actively used by devices, not just present in config
          const printers = this.printers;

          await Promise.all(
            Object.keys(this.printers).map(
              async (key) => await printers[key].open()
            )
          );
        }

        logger.info('starting bridge!');
        logger.verbose('bridge address: %s', this.bridge.parameters.address);
        for (let i = 0; i < this.bridge.devices.length; i++) {
          const device = this.bridge.devices[i];
          logger.verbose(
            ` - device #%d address: %s`,
            i + 1,
            device.parameters.address
          );
        }
        await this.bridge.start();
      }
    } catch (error) {
      logger.error(`error, daemon bailed: %O`, error);
    }
  }
}

const daemon = new Daemon();

process.on('SIGINT', async () => {
  logger.info('shutting down...');
  await daemon.shutdown();
  process.exit();
});

export default daemon;
