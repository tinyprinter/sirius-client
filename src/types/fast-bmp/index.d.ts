declare module 'fast-bmp' {
  interface EncodeOptions {
    width: number;
    height: number;
    data: Buffer;
    bitDepth: number;
    components: number;
    channels: number;
  }
  function encode(options: EncodeOptions): Buffer;
}
