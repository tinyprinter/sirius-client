import parseHeader from './parser/header';
import parsePayload from './parser/payload';

import { BinaryPayload } from './types';

export default async (base64: string): Promise<BinaryPayload> => {
  const buf = Buffer.from(base64, 'base64');

  const header = parseHeader(buf);
  const payload = await parsePayload(buf, 16);

  return {
    header,
    payload,
  };
};
