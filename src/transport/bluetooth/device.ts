import bindings from 'bindings';

const { DeviceINQ } = bindings('BluetoothSerialPort.node');

// TODO: add typing - it's not exposed in the default type information
export default class extends DeviceINQ {
  async scan(): Promise<object[]> {
    const list: object[] = [];

    return new Promise((resolve) => {
      const found = (address: string, name: string): void => {
        list.push({ address, name });
      };
      const finish = (): void => {
        resolve(list);
      };

      this.inquire(found, finish);
    });
  }
}
