import BergBridge from './berger/bridge';
import BergBridgeNetworkWS from './berger/bridge/network/ws';
import BergPrinter from './berger/device/printer';

import PrintableImageWrapper from './printer/printable-image-handler';

const network = new BergBridgeNetworkWS(
  'wss://littleprinter.nordprojects.co/api/v1/connection'
);

import printer from './default-printer';

const printer1 = new BergPrinter(
  { address: '11cc0f6aaeb07dad' },
  new PrintableImageWrapper(printer)
);
const printer2 = new BergPrinter(
  { address: '2cadfa9fdad2c46a' },
  new PrintableImageWrapper(printer)
);

const bridge = new BergBridge(
  {
    address: 'eda10fe5b042c000',
  },
  network,
  [printer1, printer2]
);

class Daemon {
  private timer: NodeJS.Timeout | undefined = undefined;
  private isShuttingDown = false;

  async run(): Promise<void> {
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

    await bridge.stop();

    // TODO: close bt/usb
  }

  private async runServer(): Promise<void> {
    try {
      if (!bridge.isOnline) {
        // TODO: open bt/usb

        console.log('starting bridge!');
        await bridge.start();
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
