import gm, { State } from 'gm';

const im = gm.subClass({ imageMagick: true });

const WIDTH = 384; // 576 for 80mm paper/high res, generally

const gmify = (buf: Buffer): Promise<State> => {
  return Promise.resolve(im(buf));
};

const resize = async (state: State): Promise<State> => {
  return Promise.resolve(state.resize(WIDTH));
};

const bnwify = async (state: State): Promise<State> => {
  return Promise.resolve(
    state
      .colorspace('gray')
      .colors(2) // automatically applies dithering
      .out('-type', 'bilevel') // putting this here forces it at the end of the command (otherwise `gm` will push it to the start, ruining the effect)
  );
};

const pnger = async (state: State): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    state.toBuffer('PNG', (err, out) => {
      if (err) {
        return reject(err);
      }

      return resolve(out);
    });
  });
};

export default async (source: Buffer): Promise<Buffer> => {
  const state = await gmify(source);
  const resized = await resize(state);
  const bnw = await bnwify(resized);
  const png = await pnger(bnw);
  return png;
};
