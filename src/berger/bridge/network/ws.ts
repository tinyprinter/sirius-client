import WebSocket from 'ws';
import {
  BergBridgeNetwork,
  BergBridgeNetworkMessage,
  BergBridgeNetworkDelegate,
} from './index';

class BergBridgeNetworkWS implements BergBridgeNetwork {
  uri: string;
  delegate?: BergBridgeNetworkDelegate;

  private ws?: WebSocket;

  constructor(uri: string) {
    this.uri = uri;
  }

  async connect(): Promise<void> {
    if (this.ws != null) {
      throw new Error('Connection already up, please reset first!');
    }

    const ws = new WebSocket(this.uri);

    ws.addEventListener('open', async () => {
      console.log('ws:open');

      await this.delegate?.onConnect(this);
    });

    ws.addEventListener('close', async (event) => {
      console.log('ws:close', `${event.code} ${event.reason}`);

      await this.delegate?.onDisconnect(this);

      this.ws = undefined;
    });

    ws.addEventListener('message', async (event) => {
      console.log('ws:message', typeof event.data);

      try {
        const stringIn =
          typeof event.data === 'string' ? event.data : event.data.toString();

        const command = JSON.parse(stringIn);
        const response = await this.delegate?.onMessage(this, command);

        if (response != null) {
          await this.send(response);
        }
      } catch (error) {
        console.log('ws:oh no:', error);
        throw error;
      }
    });

    ws.addEventListener('error', (error) => {
      console.log('ws:error', { error });
    });

    // I guess these aren't available in the browser?
    // Or at least, not via mocks in testing.
    // So, only run these when available.
    if (ws.addListener) {
      ws.addListener('ping', () => {
        console.log('ws:ping');
      });

      ws.addListener('pong', () => {
        console.log('ws:pong');
      });

      ws.addListener('unexpected-response', (param) => {
        console.log('ws:unexpected-response', { param });
      });

      ws.addListener('upgrade', () => {
        console.log('ws:upgrade');
      });
    }

    this.ws = ws;
  }

  async disconnect(): Promise<void> {
    console.log('debug: network:disconnect');

    if (this.ws == null) {
      return;
    }

    this.ws.close();
  }

  async send(message: BergBridgeNetworkMessage): Promise<void> {
    console.log('debug: network:send');

    if (this.ws == null) {
      throw new Error('not connected, bailing');
    }

    const string = JSON.stringify(message);

    // console.log('-> send', { string });

    this.ws.send(string, {
      compress: false,
      binary: false,
      mask: true,
      fin: true,
    });
  }
}

export default BergBridgeNetworkWS;
