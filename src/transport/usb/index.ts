import USB, { Device, OutEndpoint } from 'usb';
import { promisify } from 'util';

import { TransportAdapter } from '../index';

export type USBParameters = {
  pid: number;
  vid: number;
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
        `could not find USB device with vid/pid ${this.parameters.vid}/${
          this.parameters.pid
        } (0x${this.parameters.vid.toString(
          16
        )}/0x${this.parameters.pid.toString(16)})`
      );
    }

    this.device.open();

    await Promise.allSettled(
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
