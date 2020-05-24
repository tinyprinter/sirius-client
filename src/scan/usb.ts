import usb, { LIBUSB_CLASS_PRINTER } from 'usb';
import { assertType } from 'typescript-is';
import logger from '../logger';

type FoundUSBDevice = {
  vid: number;
  pid: number;
  name?: string;
  manufacturer?: string;
  serialNumber?: string;
};

const fetchStringDescriptor = async (
  device: usb.Device,
  descriptor: number
): Promise<string | undefined> => {
  if (descriptor === 0) {
    return undefined;
  }

  return new Promise((resolve, reject) => {
    try {
      device.open();

      device.getStringDescriptor(descriptor, (error, result) => {
        device.close();

        if (error != null) {
          return reject(error);
        }

        if (result == null) {
          return resolve(undefined);
        }

        // note, the argument is actually a string, not a buffer, so we'll cast it over
        const string = assertType<string>(result);

        // the string is padded with null bytes out of the buffer, so we'll need to deal with that
        resolve(string.replace(/\0/g, ''));
      });
    } catch (error) {
      // we want ~a~ value, so send something back
      resolve(undefined);
    }
  });
};

const scan = async (): Promise<FoundUSBDevice[]> => {
  return new Promise(async (resolve, reject) => {
    const devices = usb.getDeviceList();

    const printers = devices.filter((device) => {
      try {
        return (
          device.configDescriptor.interfaces.filter((iface) => {
            return (
              iface.filter((descriptor) => {
                return descriptor.bInterfaceClass === LIBUSB_CLASS_PRINTER;
              }).length > 0
            );
          }).length > 0
        );
      } catch (error) {
        return false;
      }
    });

    try {
      const found = await Promise.all(
        printers.map(
          async (printer): Promise<FoundUSBDevice> => {
            return {
              vid: printer.deviceDescriptor.idVendor,
              pid: printer.deviceDescriptor.idProduct,
              name: await fetchStringDescriptor(
                printer,
                printer.deviceDescriptor.iProduct
              ),
              manufacturer: await fetchStringDescriptor(
                printer,
                printer.deviceDescriptor.iManufacturer
              ),
              serialNumber: await fetchStringDescriptor(
                printer,
                printer.deviceDescriptor.iSerialNumber
              ),
            };
          }
        )
      );

      resolve(found);
    } catch (error) {
      reject(error);
    }
  });
};

export default scan;
