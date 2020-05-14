import { WsClientListener } from '../wsclient';

class BridgeState {
  isOnline = false;
  needsKey = true;
}

interface Commander {
  handle: (command: Command) => Promise<CommandResponse>;
}

class Handler implements WsClientListener {
  state: BridgeState;
  bridge: BridgeInterface;
  commander: Commander;

  constructor(bridge: BridgeInterface, commander: Commander) {
    this.state = new BridgeState();
    this.bridge = bridge;
    this.commander = commander;
  }

  async onHeartbeat(): Promise<any> {
    if (this.state.isOnline === false) {
      console.log('Connection is offline, sleeping heartbeat');
      return Promise.resolve(null);
    }

    return Promise.resolve(heartbeater);
  }

  async onOpen(): Promise<void> {
    this.state.isOnline = true;

    return Promise.resolve();
  }

  async onClose(): Promise<void> {
    this.state.isOnline = false;
  }

  async onMessage(command: Command): Promise<any> {
    // not a message for us, for some reason
    if (this.bridge.address !== command.bridge_address) {
      return Promise.resolve();
    }

    const response = await this.commander.handle(command);

    if (response != null) {
      console.log('sending response');
      return Promise.resolve(response);
    }

    return Promise.resolve();
  }
}

export default Handler;
