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

        handlePayload: async payload => {},
      },

      connect: async (): Promise<CommandResponse> => {},
      heartbeat: async (): Promise<CommandResponse> => {},
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
