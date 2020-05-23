import WebSocket from 'ws';
import {
  BergBridgeNetwork,
  BergBridgeNetworkMessage,
  BergBridgeNetworkDelegate,
} from './index';
import logger from '../../../logger';

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
      logger.debug('ws:open');

      await this.delegate?.onConnect(this);
    });

    ws.addEventListener('close', async (event) => {
      logger.debug('ws:close: %d %s', event.code, event.reason);

      await this.delegate?.onDisconnect(this);

      this.ws = undefined;
    });

    ws.addEventListener('message', async (event) => {
      logger.debug('ws:message: %s', typeof event.data);

      try {
        const stringIn =
          typeof event.data === 'string' ? event.data : event.data.toString();

        const command = JSON.parse(stringIn);
        const response = await this.delegate?.onMessage(this, command);

        if (response != null) {
          await this.send(response);
        }
      } catch (error) {
        logger.debug('ws:oh no: %O', error);
        throw error;
      }
    });

    ws.addEventListener('error', (error) => {
      logger.debug('ws:error: %O', error);
    });

    // I guess these aren't available in the browser?
    // Or at least, not via mocks in testing.
    // So, only run these when available.
    if (ws.addListener) {
      ws.addListener('ping', () => {
        logger.debug('ws:ping');
      });

      ws.addListener('pong', () => {
        logger.debug('ws:pong');
      });

      ws.addListener('unexpected-response', (param) => {
        logger.debug('ws:unexpected-response: %O', param);
      });

      ws.addListener('upgrade', () => {
        logger.debug('ws:upgrade');
      });
    }

    this.ws = ws;
  }

  async disconnect(): Promise<void> {
    logger.debug('debug: network:disconnect');

    if (this.ws == null) {
      return;
    }

    this.ws.close();
  }

  async send(message: BergBridgeNetworkMessage): Promise<void> {
    logger.debug('debug: network:send');

    if (this.ws == null) {
      throw new Error('not connected, bailing');
    }

    const string = JSON.stringify(message);

    this.ws.send(string, {
      compress: false,
      binary: false,
      mask: true,
      fin: true,
    });
  }
}

export default BergBridgeNetworkWS;
