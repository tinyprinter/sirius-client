import DeviceINQ from '../transport/bluetooth/device';

const inq = new DeviceINQ();

type FoundBluetoothDevice = {
  name: string;
  address: string;
  channel: number;
};

const findChannel = async (address: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    inq.findSerialPortChannel(address, (channel: number) => {
      if (channel >= 0) {
        resolve(channel);
      } else {
        reject();
      }
    });
  });
};

const scan = async (): Promise<FoundBluetoothDevice[]> => {
  return new Promise((resolve, reject) => {
    inq.inquire(
      async (error, devices): Promise<void> => {
        if (error != null) {
          return reject(error);
        }

        const printers: FoundBluetoothDevice[] = [];

        for (const device of devices) {
          try {
            const channel = await findChannel(device.address);

            if (channel != null) {
              printers.push({
                ...device,
                channel,
              });
            }
          } catch {
            // can't find channel, so we'll ignore the device
          }
        }

        resolve(printers);
      }
    );

    // TODO: check via listPairedDevices - do we need to auth in the system first?
  });
};

export default scan;
