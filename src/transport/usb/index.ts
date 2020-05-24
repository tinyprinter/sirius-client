import USB, { Device, OutEndpoint, InEndpoint } from 'usb';
import { promisify } from 'util';

import { TransportAdapter } from '../index';
import logger from '../../logger';
import os from 'os';

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

  private in: InEndpoint | undefined;
  private out: OutEndpoint | undefined;

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

    logger.info(
      '...connecting usb (vid: %d (0x%s), pid: %d (0x%s))',
      this.parameters.vid,
      this.parameters.vid.toString(16),
      this.parameters.pid,
      this.parameters.pid.toString(16)
    );

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

    await Promise.all(
      this.device.interfaces.map(async (iface) => {
        const setAltSetting = promisify(iface.setAltSetting).bind(iface);
        try {
          await setAltSetting(iface.altSetting);
        } catch {}

        if ('win32' !== os.platform()) {
          if (iface.isKernelDriverActive()) {
            try {
              iface.detachKernelDriver();
            } catch (e) {
              logger.error('Could not detatch kernel driver: %s', e);
            }
          }
        }

        iface.claim();
      })
    );

    this.in = this.device.interfaces.flatMap((iface) =>
      iface.endpoints.filter((endpoint) => endpoint.direction === 'in')
    )[0] as InEndpoint;

    this.out = this.device.interfaces.flatMap((iface) =>
      iface.endpoints.filter((endpoint) => endpoint.direction === 'out')
    )[0] as OutEndpoint;

    if (this.out == null || this.in == null) {
      throw new Error('could not find valid in/out endpoints for printer');
    }

    this.in.startPoll();
  }

  async disconnect(): Promise<void> {
    if (this.in != null) {
      await promisify(this.in.stopPoll).bind(this.in)();
    }

    this.device?.close();

    this.device = undefined;
    this.out = undefined;
    this.in = undefined;
  }

  async write(buffer: Buffer): Promise<void> {
    if (this.out == null) {
      throw new Error('"out" endpoint not set');
    }

    const transfer = promisify(this.out.transfer).bind(this.out);

    await transfer(buffer);
  }

  async read(): Promise<Buffer> {
    if (this.in == null) {
      throw new Error('"in" endpoint not set');
    }

    return new Promise((resolve, reject) => {
      if (this.in == null) {
        return reject(new Error('"in" endpoint not set'));
      }

      const listener = (buffer: Buffer): void => {
        // if there's an empty buffer, let's skip and resubscribe until there's data
        if (buffer.length === 0) {
          this.in?.once('data', listener);
          return;
        }

        resolve(buffer);
      };

      this.in.once('data', listener);
    });
  }
}
