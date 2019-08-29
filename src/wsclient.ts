import WebSocket from 'ws';
import fs from 'fs';
import * as pf from './protocol_fragments';
import decoder from './decoder';
import thermalise from './thermalise';

// const uri = 'wss://165.227.233.168:443/api/v1/connection';
const uri = 'ws://165.227.233.168/api/v1/connection';
// const uri = 'wss://device.li:443/api/v1/connection';
// const uri = 'ws://device.li/api/v1/connection';

const printerDataPath = 'fixtures/11cc0f6aaeb07dad.printer';
const printerData = fs.readFileSync(printerDataPath).toString();

class State {
  isOnline: boolean = true;
  needsKey: boolean = true;
  deviceAddress: string;
  bridgeAddress: string;

  constructor(deviceAddress: string, bridgeAddress: string) {
    this.deviceAddress = deviceAddress;
    this.bridgeAddress = bridgeAddress;
  }
}

export default () => {
  const ws = new WebSocket(uri);

  let heartbeatRef: NodeJS.Timeout | null = null;

  console.log('Contacting', uri);
  console.log(printerData);
  console.log('-----------------------------');

  // Parse data from printer file
  const deviceAddressMaybe = printerData.match(/address: ([a-f0-9]{16})/);

  if (deviceAddressMaybe == null) {
    throw new Error(`couldn't find device address in ${printerDataPath}`);
  }
  const deviceAddress = deviceAddressMaybe[1];

  const bridgeAddress = Math.floor(Math.random() * Math.floor(Math.pow(2, 64)))
    .toString(16)
    .padStart(16, '0');

  const state = new State(deviceAddress, bridgeAddress);

  // Sanity check websocket connection URL:
  if (!uri.endsWith('/api/v1/connection')) {
    console.log("Websocket URL must end with '/api/v1/connection'");
    console.log(`Maybe you meant ${uri}/api/v1/connection ?`);
    return 1;
  }

  const heartbeat = () => {
    if (state.isOnline && state.needsKey) {
      ws.send(
        pf.ENCRYPTION_KEY_REQUIRED(state.bridgeAddress, state.deviceAddress)
      );
      console.log('Asked for encryption key');
    } else if (state.isOnline && !state.needsKey) {
      ws.send(pf.HEARTBEAT(state.bridgeAddress, state.deviceAddress));
      console.log('Heartbeat. Pom pom.');
    } else if (!state.isOnline) {
      console.log('Connection is offline, sleeping heartbeat');
    } else {
      throw new Error('Invalid state during heartbeart loop');
    }
  };

  const decodeBinary = async (base64: string) => {
    const decoded = await decoder(base64);
    console.log(
      'command',
      decoded.header.commandName,
      decoded.header.printId,
      decoded.header.length
    );

    if (decoded.payload.bitmap != null) {
      thermalise(decoded.payload.bitmap);
    }
  };

  const _decode = async (data: string): Promise<object | null> => {
    const json = JSON.parse(data);

    console.log('decode type:', json['type']);

    if (json.type === 'BridgeCommand') {
      const key = (json.json_payload.params.encryption_key as string).trim();
      console.log(
        `Received encryption key (${key}), switching to heartbeat mode.`
      );
      state.needsKey = false;
    }

    if (json.type === 'DeviceCommand') {
      const payload = json.binary_payload;
      const commandId = json.command_id;

      await decodeBinary(payload);

      return {
        device_address: state.deviceAddress,
        timestamp: new Date().toISOString(),
        transfer_time: 3.44,
        bridge_address: state.bridgeAddress,
        return_code: 0,
        rssi_stats: [-19, -19, -19],
        type: 'DeviceCommandResponse',
        command_id: commandId,
      };
    }

    return null;
  };

  ws.on('open', function open() {
    console.log('open');
    ws.send(pf.CONNECT(state.bridgeAddress), {
      compress: false,
      binary: false,
      mask: true,
      fin: true,
    });

    heartbeatRef = setInterval(heartbeat, 10_000);
    heartbeat();
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
    const response = await _decode(data.toString());
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
