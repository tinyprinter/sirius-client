import ndarray from 'ndarray';

const segmenter = async (pixels: ndarray): Promise<Buffer[]> => {
  let data = [];
  function rgb(
    pixel: number[]
  ): { r: number; g: number; b: number; a: number } {
    return {
      r: pixel[0],
      g: pixel[1],
      b: pixel[2],
      a: pixel[3],
    };
  }

  for (let i = 0; i < pixels.data.length; i += pixels.shape[2]) {
    data.push(
      rgb(
        new Array(pixels.shape[2]).fill(0).map(function (_, b) {
          return pixels.data[i + b];
        })
      )
    );
  }

  data = data.map((pixel) => {
    if (pixel.a == 0) {
      return 0;
    }
    const shouldBeWhite = pixel.r > 200 && pixel.g > 200 && pixel.b > 200;
    return shouldBeWhite ? 0 : 1;
  });

  const buffers: Buffer[] = [];

  const width = pixels.shape[0];
  const rowCount = pixels.shape[1];

  for (let row = 0; row < rowCount; row++) {
    const begin = row * width;
    const rowBits = data.slice(begin, begin + width);
    const rowBytes = new Uint8Array(width / 8);
    for (let b = 0; b < rowBytes.length; b++) {
      rowBytes[b] =
        (rowBits[b * 8 + 0] << 7) |
        (rowBits[b * 8 + 1] << 6) |
        (rowBits[b * 8 + 2] << 5) |
        (rowBits[b * 8 + 3] << 4) |
        (rowBits[b * 8 + 4] << 3) |
        (rowBits[b * 8 + 5] << 2) |
        (rowBits[b * 8 + 6] << 1) |
        (rowBits[b * 8 + 7] << 0);
    }

    buffers.push(Buffer.from(rowBytes));
  }

  return buffers;
  // return buffers.slice(20, 27);
};

export default segmenter;
