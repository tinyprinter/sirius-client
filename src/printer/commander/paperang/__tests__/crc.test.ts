import CRC, { MagicValue } from '../crc';

describe('CRC', () => {
  describe('IV bytes', () => {
    it('can read the default IV as MV', () => {
      const crc = new CRC(MagicValue);
      const iv = crc.ivBytes;
      expect(iv).toEqual(Buffer.from('\x21\x95\x76\x35', 'ascii'));
    });

    it('can set an arbitrary IV', () => {
      const crc = new CRC(1);
      const iv = crc.ivBytes;
      expect(iv).toEqual(Buffer.from('\x20\x95\x76\x35', 'ascii'));
    });

    it('can set the magic IV', () => {
      const crc = new CRC(0x77c40d4d ^ MagicValue);
      const iv = crc.ivBytes;
      expect(iv).toEqual(Buffer.from('\x4d\x0d\xc4\x77', 'ascii'));
    });
  });

  describe('checksum bytes', () => {
    it('handshake magicvalue', () => {
      const crc = new CRC(0x77c40d4d ^ MagicValue);

      const data = crc.ivBytes;
      const checksum = new CRC(MagicValue);

      expect(checksum.checksumBytes(data)).toEqual(
        Buffer.from('\x69\x92\x95\xed', 'ascii')
      );
    });

    it('noop', () => {
      const crc = new CRC(0x77c40d4d ^ MagicValue);
      const data = Buffer.from('\x00\x00', 'ascii');

      expect(crc.checksumBytes(data)).toEqual(
        Buffer.from('\x90\x6f\x45\x76', 'ascii')
      );
    });

    it('feed: 0', () => {
      const crc = new CRC(0x77c40d4d ^ MagicValue);
      const data = Buffer.from('\x00\x00', 'ascii');

      expect(crc.checksumBytes(data)).toEqual(
        Buffer.from('\x90\x6f\x45\x76', 'ascii')
      );
    });

    it('feed: 200', () => {
      const crc = new CRC(0x77c40d4d ^ MagicValue);
      const data = Buffer.from('\xc8\x00', 'ascii');

      expect(crc.checksumBytes(data)).toEqual(
        Buffer.from('\xd6\x32\x66\x75', 'ascii')
      );
    });
  });
});
