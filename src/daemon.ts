import BergBridge from './berger/bridge';
import BergBridgeNetworkWS from './berger/bridge/network/ws';
import ConsolePrinter from './printer/console-printer';
import BergPrinter from './berger/device/printer';

const network = new BergBridgeNetworkWS(
  'wss://littleprinter.nordprojects.co/api/v1/connection'
);

const printer1 = new BergPrinter({ address: '' }, new ConsolePrinter());
const printer2 = new BergPrinter({ address: '' }, new ConsolePrinter());

const bridge = new BergBridge(
  {
    address: '',
  },
  network,
  [printer1, printer2]
);

const daemon = async (): Promise<void> => {
  try {
    const tick = async (): Promise<void> => {
      if (!bridge.isOnline) {
        console.log('starting bridge!');
        await bridge.start();
      }
    };

    setInterval(async () => await tick(), 5000);
    await tick();
  } catch (error) {
    console.log(`error, daemon bailed`, error);
  }
};

daemon();
