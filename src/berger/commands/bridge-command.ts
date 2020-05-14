export type BergBridgeCommandJSON = {
  type: 'BridgeCommand';
  bridge_address: string;
  command_id: number;
  json_payload: {
    params: object;
    name: string;
  };
};

export type BergBridgeCommandJSONParamsAddDeviceEncryptionKey = {
  device_address: string;
  encryption_key: string;
};

class BergBridgeCommand {
  timestamp: Date;
  bridgeAddress: string;
  commandId: number;
  params: object;
  commandName: string;

  constructor(json: BergBridgeCommandJSON) {
    this.timestamp = new Date();

    this.bridgeAddress = json.bridge_address;
    this.commandId = json.command_id;
    this.params = json.json_payload.params;
    this.commandName = json.json_payload.name;
  }
}

export default BergBridgeCommand;
