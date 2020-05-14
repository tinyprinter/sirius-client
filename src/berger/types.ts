enum CommandType {
  BridgeCommand = 'BridgeCommand',
  DeviceCommand = 'DeviceCommand',
}

export type Command = {
  timestamp: string; // presumably supposed to be ISO-8601, but I usually just see '0'
  type: CommandType;
  bridge_address: string;
  command_id: number; // index of command, used for responding later
};
