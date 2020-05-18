import USB, { Device, OutEndpoint, LIBUSB_CLASS_PRINTER } from 'usb';
import { promisify } from 'util';

import { TransportAdapter } from './index';
import { assertType } from 'typescript-is';

export type USBParameters = {
  pid?: number;
  vid?: number;
};

export type USBTransportConfiguration = {
  type: 'usb';
  parameters: USBParameters;
};

export default class implements TransportAdapter {
  private parameters: USBParameters;

  private device: Device | undefined;
  private endpoint: OutEndpoint | undefined;

  constructor(parameters: USBParameters) {
    this.parameters = parameters;
  }

  async connect(): Promise<void> {
    if (this.device != null) {
      return;
    }

    if (this.parameters.vid == null || this.parameters.pid == null) {
      throw new Error('scanning for printers not (yet) supported');
    }

    this.device = USB.findByIds(this.parameters.vid, this.parameters.pid);

    if (this.device == null) {
      throw new Error(
        `could not find USB device with pid ${this.parameters.pid}/${this.parameters.vid}`
      );
    }

    this.device.open();

    await Promise.all(
      this.device.interfaces.map(async (iface) => {
        const setAltSetting = promisify(iface.setAltSetting).bind(iface);
        try {
          await setAltSetting(iface.altSetting);
        } catch {}
        iface.claim();
      })
    );

    this.endpoint = this.device.interfaces.flatMap((iface) =>
      iface.endpoints.filter((endpoint) => endpoint.direction === 'out')
    )[0] as OutEndpoint;

    if (this.endpoint == null) {
      throw new Error('could not find valid endpoint for printer');
    }
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      this.device.close();
    }

    this.device = undefined;
    this.endpoint = undefined;
  }

  async write(buffer: Buffer): Promise<void> {
    if (this.endpoint == null) {
      return;
    }

    const transfer = promisify(this.endpoint.transfer).bind(this.endpoint);

    await transfer(buffer);
  }
}
