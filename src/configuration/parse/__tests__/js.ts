import js from '../js';

import Path from 'path';

import reference from './__data__/reference.json';

describe('js', () => {
  it('reads good file', async () => {
    const path = Path.join(__dirname, '__data__', 'good.js');
    const result = await js(path);

    expect(result).toEqual(reference);
  });

  it('rejects bad file', async () => {
    const path = Path.join(__dirname, '__data__', 'bad.js');

    expect(async () => {
      await js(path);
    }).rejects.toThrow();
  });
});
