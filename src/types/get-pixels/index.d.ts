declare module 'get-pixels' {
  import ndarray from 'ndarray';

  function getPixels(
    buffer: Buffer,
    type: string,
    callback: (err: any, pixels: ndarray) => void
  ): void;
  export = getPixels;
}
