import wsclient from '../wsclient';

import { BridgeInterface, Command } from '../bridge';
import { CommandResponse } from '../types';

describe('wsclient', () => {
  let mockBridge: BridgeInterface;

  beforeEach(() => {
    mockBridge = {
      address: 'address',

      device: {
        address: 'address',
        encryptionKey: undefined,

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handlePayload: async payload => {},
      },

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      connect: async (): Promise<CommandResponse> => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      heartbeat: async (): Promise<CommandResponse> => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      handle: async (command: Command): Promise<CommandResponse> => {},
    };
  });

  it('throws on bad connection URI', () => {
    expect(() => {
      wsclient('foo://bar.baz', mockBridge);
    }).toThrow();
  });

  describe('connects', () => {
    it('accepts valid URI', () => {
      expect(() => {
        wsclient('wss://example.com/api/v1/connection', mockBridge);
      }).not.toThrow();
    });
  });
});
