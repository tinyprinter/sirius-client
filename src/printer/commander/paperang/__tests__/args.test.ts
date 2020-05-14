import * as args from '../args';

describe('args', () => {
  describe('line feed', () => {
    it('0', () => {
      const arg = 0;
      const out = '\x00\x00';

      expect(args.lineFeed(arg)).toEqual(Buffer.from(out, 'ascii'));
    });

    it('200', () => {
      const arg = 200;
      const out = '\xc8\x00';

      expect(args.lineFeed(arg)).toEqual(Buffer.from(out, 'ascii'));
    });

    it('20000', () => {
      const arg = 20000;
      const out = '\x20\x4e';

      expect(args.lineFeed(arg)).toEqual(Buffer.from(out, 'ascii'));
    });
  });

  describe('print', () => {
    it('1', () => {
      const arg = 1;
      const out = '\x00\x01\x01\x00';

      expect(args.print(arg)).toEqual(Buffer.from(out, 'ascii'));
    });

    it('9', () => {
      const arg = 9;
      const out = '\x00\x01\x09\x00';

      expect(args.print(arg)).toEqual(Buffer.from(out, 'ascii'));
    });
  });
});
