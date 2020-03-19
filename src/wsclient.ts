import WebSocket from 'ws';

import { BridgeInterface, Command } from './bridge';
import assert from 'assert';

class BridgeState {
  isOnline = true;
  needsKey = true;
  bridge: BridgeInterface;

  constructor(bridge: BridgeInterface) {
    this.bridge = bridge;
  }
}

// TODO: should we be responsible in here for reconnecting on failed connections?

export default (uri: string, bridge: BridgeInterface): void => {
  // Check websocket connection URL for likely correctness:
  if (!uri.endsWith('/api/v1/connection')) {
    console.log("Websocket URL must end with '/api/v1/connection'");
    console.log(`Maybe you meant ${uri}/api/v1/connection ?`);

    throw new Error('invalid websocket URI');
  }

  const ws = new WebSocket(uri);

  let heartbeatRef: NodeJS.Timeout | null = null;

  const state = new BridgeState(bridge);

  console.log(
    `connecting to ${uri} as: bridge: ${bridge.address}, device: ${bridge.device.address}`
  );

  const heartbeat = async (): Promise<void> => {
    if (state.isOnline) {
      ws.send(await state.bridge.heartbeat());
    } else {
      console.log('Connection is offline, sleeping heartbeat');
    }
  };

  ws.on('open', async () => {
    console.log('open');
    ws.send(await bridge.connect(), {
      compress: false,
      binary: false,
      mask: true,
      fin: true,
    });

    heartbeatRef = setInterval(heartbeat, 10_000);
    await heartbeat();
  });

  ws.on('close', (...param) => {
    console.log('close', { param });

    if (heartbeatRef) {
      clearInterval(heartbeatRef);
    }
  });

  ws.on('error', error => {
    console.log('error', { error });
  });

  ws.on('message', async data => {
    console.log('got message');

    const command = JSON.parse(data.toString()) as Command;
    console.log({ command: JSON.stringify(command) });

    assert(state.bridge.address === command.bridge_address);

    const response = await bridge.handle(command);

    if (response != null) {
      console.log('sending response');
      ws.send(JSON.stringify(response));
    }
  });

  ws.on('ping', () => {
    console.log('ping');
  });

  ws.on('pong', () => {
    console.log('pong');
  });

  ws.on('unexpected-response', param => {
    console.log('unexpected-response', { param });
  });

  ws.on('upgrade', () => {
    console.log('upgrade');
  });
};
