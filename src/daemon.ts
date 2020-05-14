import BergBridge from './berger/bridge';
import BergBridgeNetworkWS from './berger/bridge/network/ws';
import BergPrinter from './berger/device/printer';

import ConsolePrinter from './printer/console-printer';
import USBPaperangPrinter from './printer/usb-paperang-printer';

const network = new BergBridgeNetworkWS(
  'wss://littleprinter.nordprojects.co/api/v1/connection'
);

const printer = new USBPaperangPrinter();

const printer1 = new BergPrinter({ address: '11cc0f6aaeb07dad' }, printer);
const printer2 = new BergPrinter({ address: '2cadfa9fdad2c46a' }, printer);

const bridge = new BergBridge(
  {
    address: 'eda10fe5b042c000',
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
