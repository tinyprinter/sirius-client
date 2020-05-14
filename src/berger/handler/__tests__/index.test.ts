import Handler from '../index';
import Commander from '../../commander';

describe('handler', () => {
  let commander: jest.SpyInstance<Commander>;
  let handler: Handler;

  beforeEach(() => {
    let bridge = {};

    commander = new Commander();
    handler = new Handler(bridge, commander);
  });

  it('sends heartbeat when connected', async () => {
    expect(handler.onHeartbeat).resolves.toBeNull();

    await handler.onOpen();
    expect(handler.onHeartbeat).resolves.not.toBeNull();

    await handler.onClose();
    expect(handler.onHeartbeat).resolves.toBeNull();
  });

  it('passes messages out to commander', async () => {
    await handler.onOpen();

    const message = {
      foo: 'bar',
    };

    handler.onMessage(message);

    expect(commander.handle).toHaveBeenCalledWith(message);
  });

  it('ignores messages for another bridge', async () => {
    await handler.onOpen();

    const message = {
      foo: 'bar',
    };

    handler.onMessage(message);

    expect(commander.handle).not.toHaveBeenCalledWith(message);
  });

  it('it ignores poorly formed messages', async () => {
    await handler.onOpen();

    const message = {
      foo: 'bar',
    };

    handler.onMessage(message);

    expect(commander.handle).not.toHaveBeenCalledWith(message);
  });
});
