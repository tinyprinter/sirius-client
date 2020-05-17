import make from '../make';

import BergBridge from '../../berger/bridge';

import reference from '../parse/__tests__/__data__/reference.json';

describe('make', () => {
  it('parses config', async () => {
    const result = await make(reference);
    expect(result).toBeInstanceOf(BergBridge);
  });

  it('fails on bad configuration', () => {
    expect(async () => {
      await make({});
    }).rejects.toThrow();
  });
});
