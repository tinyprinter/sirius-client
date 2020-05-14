export type BergDeviceCommandJSON = {
  type: 'DeviceCommand';
  device_address: string;
  bridge_address: string;
  command_id: number;
  binary_payload: string;
};

class BergDeviceCommand {
  timestamp: Date;
  deviceAddress: string;
  bridgeAddress: string;
  commandId: number;
  payload: string;

  constructor(json: BergDeviceCommandJSON) {
    this.timestamp = new Date();

    this.bridgeAddress = json.bridge_address;
    this.deviceAddress = json.device_address;
    this.commandId = json.command_id;
    this.payload = json.binary_payload;
  }
}

export default BergDeviceCommand;
