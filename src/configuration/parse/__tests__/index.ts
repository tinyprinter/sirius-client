import parse from '../index';

import Path from 'path';

import reference from './__data__/reference.json';

describe('parse', () => {
  it('reads js', async () => {
    const path = Path.join(__dirname, '__data__', 'good.js');
    expect(await parse(path)).toEqual(reference);
  });

  it('reads json', async () => {
    const path = Path.join(__dirname, '__data__', 'good.json');
    expect(await parse(path)).toEqual(reference);
  });

  it('reads yaml', async () => {
    const path = Path.join(__dirname, '__data__', 'good.yaml');
    expect(await parse(path)).toEqual(reference);
  });

  it('rejects unknown extention', async () => {
    const path = Path.join(__dirname, '__data__', 'unknown.md');
    expect(async () => {
      await parse(path);
    }).rejects.toThrow();
  });

  it('rejects on missing file', async () => {
    const path = Path.join(__dirname, '__data__', 'foo.bar.baz.quux');
    expect(async () => {
      await parse(path);
    }).rejects.toThrow();
  });
});
