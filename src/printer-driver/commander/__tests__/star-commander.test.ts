import StarCommander, {
  PrinterSpeed,
  PrintableWidth,
  PageCut,
  DocumentCut,
} from '../star-commander';

const ESC = '\x1b';
const NUL = '\x00';

describe('StarCommander', () => {
  describe('single commands', () => {
    let sc: StarCommander;

    beforeEach(() => {
      sc = new StarCommander();
    });

    it('can set printer speed: high', () => {
      sc.setPrintSpeed(PrinterSpeed.High);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rQ0${NUL}`);
    });

    it('can set printer speed: medium', () => {
      sc.setPrintSpeed(PrinterSpeed.Medium);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rQ1${NUL}`);
    });

    it('can set printer speed: low', () => {
      sc.setPrintSpeed(PrinterSpeed.Low);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rQ2${NUL}`);
    });

    it('can set printable width: 80mm paper', () => {
      sc.setPrintableWidth(PrintableWidth.WIDTH_72MM);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}\x1eA\x00`);
    });

    it('can set printable width: 58mm paper', () => {
      sc.setPrintableWidth(PrintableWidth.WIDTH_51MM);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}\x1eA\x01`);
    });

    it('can set page cut mode: none', () => {
      sc.setPageCut(PageCut.None);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rF1${NUL}`);
    });

    it('can set page cut mode: partial', () => {
      sc.setPageCut(PageCut.Partial);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rF13${NUL}`);
    });

    it('can set document cut mode: none', () => {
      sc.setDocumentCut(DocumentCut.None);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rE1${NUL}`);
    });

    it('can set document cut mode: partial', () => {
      sc.setDocumentCut(DocumentCut.Partial);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rE13${NUL}`);
    });

    it('can initialise', () => {
      sc.initialise();
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}@`);
    });

    it('can initialise raster mode', () => {
      sc.initialiseRasterMode();
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rR${ESC}*rA`);
    });

    it('can end raster mode', () => {
      sc.endRasterMode();
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rB`);
    });

    it('can set page length', () => {
      sc.setPageLength();
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rP\x30${NUL}`);
    });

    it('can start page', () => {
      sc.startPage();
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${NUL}`);
    });

    it('can line feed', () => {
      sc.lineFeed(1);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rY1${NUL}`);
      sc.lineFeed(12);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rY12${NUL}`);
      sc.lineFeed(123);
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}*rY123${NUL}`);
    });

    it('can form feed', () => {
      sc.executeFormFeed();
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}\x0c${NUL}`);
    });

    it('can end of text', () => {
      sc.executeEOT();
      expect(sc.fetchBuffer().toString('ascii')).toBe(`${ESC}\x0c\x04`);
    });

    // it('can process image', () => {});
  });
});
