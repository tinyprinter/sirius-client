import yaml from '../yaml';

import Path from 'path';

import reference from './__data__/reference.json';

describe('yaml', () => {
  it('reads good file', async () => {
    const path = Path.join(__dirname, '__data__', 'good.yaml');
    const result = await yaml(path);

    expect(result).toEqual(reference);
  });

  it('rejects bad file', async () => {
    const path = Path.join(__dirname, '__data__', 'bad.yaml');

    expect(async () => {
      await yaml(path);
    }).rejects.toThrow();
  });
});
