declare module 'get-pixels' {
  interface Pixels {}

  function getPixels(
    buffer: Buffer,
    type: string,
    callback: (err: any, pixels: Pixels) => void
  ): void;
  export = getPixels;
}
