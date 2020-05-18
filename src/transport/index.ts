import USB, { USBTransportConfiguration } from './usb';

export interface TransportAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  write(bytes: Buffer): Promise<void>;
}

export type TransportConfiguration = USBTransportConfiguration;

const makeTransportAdapter = (
  configuration: TransportConfiguration
): TransportAdapter => {
  switch (configuration.type) {
    case 'usb':
      return new USB(configuration.parameters);
  }

  throw new Error(`unknown transport type: ${configuration.type}`);
};

export { makeTransportAdapter };
