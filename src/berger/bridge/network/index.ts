import ws from './ws';

// TODO: can it be `any`?
export type BergBridgeNetworkMessage = object;

export interface BergBridgeNetworkDelegate {
  onConnect(network: BergBridgeNetwork): Promise<void>;
  onDisconnect(network: BergBridgeNetwork): Promise<void>;

  onMessage(
    network: BergBridgeNetwork,
    message: BergBridgeNetworkMessage
  ): Promise<void>;
}

export interface BergBridgeNetwork {
  delegate?: BergBridgeNetworkDelegate;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: BergBridgeNetworkMessage): Promise<void>;
}

export { ws };
