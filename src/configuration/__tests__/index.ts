import configuration from '../index';

import Path from 'path';
import BergBridge from '../../berger/bridge';

describe('configuration', () => {
  it('parses config', async () => {
    const path = Path.join(
      __dirname,
      '../parse/__tests__/__data__/reference.json'
    );
    const result = await configuration(path);
    expect(result).toBeInstanceOf(BergBridge);
  });

  it('fails on missing file', () => {
    const path = Path.join(__dirname, '__data__', 'missing.file');
    expect(async () => {
      await configuration(path);
    }).rejects.toThrow();
  });
});
