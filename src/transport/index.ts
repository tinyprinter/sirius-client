import Bluetooth, { BluetoothTransportConfiguration } from './bluetooth';
import USB, { USBTransportConfiguration } from './usb';

export interface TransportAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  write(bytes: Buffer): Promise<void>;
  read(): Promise<Buffer>;
}

export type TransportConfiguration =
  | BluetoothTransportConfiguration
  | USBTransportConfiguration;

const makeTransportAdapter = (
  configuration: TransportConfiguration
): TransportAdapter => {
  switch (configuration.type) {
    case 'usb':
      return new USB(configuration.parameters);
    case 'bluetooth':
      return new Bluetooth(configuration.parameters);
  }
};

export { makeTransportAdapter };
