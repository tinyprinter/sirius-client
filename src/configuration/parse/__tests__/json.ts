import json from '../json';

import Path from 'path';

import reference from './__data__/reference.json';

describe('json', () => {
  it('reads good file', async () => {
    const path = Path.join(__dirname, '__data__', 'good.json');
    const result = await json(path);

    expect(result).toEqual(reference);
  });

  it('rejects bad file', async () => {
    const path = Path.join(__dirname, '__data__', 'bad.json');

    expect(async () => {
      await json(path);
    }).rejects.toThrow();
  });
});
