import bindings from 'bindings';

declare type ScanResult = {
  address: string;
  name: string;
};

export declare class DeviceINQNative {
  constructor();
  inquire(
    callback: (error: Error | undefined, devices: ScanResult[]) => void
  ): void;
  findSerialPortChannel(
    address: string,
    callback: (channel: number) => void
  ): void;
}

const DeviceINQ = bindings('BluetoothSerialPort.node')
  .DeviceINQ as typeof DeviceINQNative;

export default class extends DeviceINQ {}
