import { Parser } from 'binary-parser';

import { CommandPayload } from '../types';

import unrle from './unrle';

// There are a small pile of checks & balances here for file sizes and whatnot, but yolo seems fine for now.
// Since we're only expecting images, it's a reasonably safe to assume the shape of the important parts.
//
// What do we have, if we don't trust blindly?
export default async (buf: Buffer, offset: number): Promise<CommandPayload> => {
  const maxPrinterSpeedParser = new Parser().endianess('little').array('data', {
    type: 'uint8',
    length: 4,
    assert: function(arg) {
      const x = arg as number[];
      return x[0] === 0x1d && x[1] === 0x73 && x[2] === 0x03 && x[3] === 0xe8;
    },
  });

  const printerAccelerationParser = new Parser()
    .endianess('little')
    .array('data', {
      type: 'uint8',
      length: 3,
      assert: function(arg) {
        const x = arg as number[];
        return x[0] === 0x1d && x[1] === 0x61 && x[2] === 0xd0;
      },
    });

  const peakCurrentParser = new Parser().endianess('little').array('data', {
    type: 'uint8',
    length: 3,
    assert: function(arg) {
      const x = arg as number[];
      return x[0] === 0x1d && x[1] === 0x2f && x[2] === 0x0f;
    },
  });

  const maxIntensityParser = new Parser().endianess('little').array('data', {
    type: 'uint8',
    length: 3,
    assert: function(arg) {
      const x = arg as number[];
      return x[0] === 0x1d && x[1] === 0x44 && x[2] === 0x80;
    },
  });

  const printerControlParser = new Parser()
    .endianess('little')
    .nest('max_printer_speed', {
      type: maxPrinterSpeedParser,
    })
    .nest('printer_acceleration', {
      type: printerAccelerationParser,
    })
    .nest('peak_current', {
      type: peakCurrentParser,
    })
    .nest('max_intensity', {
      type: maxIntensityParser,
    });

  const printerDataParser = new Parser()
    .endianess('little')
    .uint8('static1', {
      assert: 0x1b,
    })
    .uint8('static2', {
      assert: 0x2a,
    })
    .uint8('n1')
    .uint8('n2')
    .uint8('n3')
    .uint8('static3', {
      assert: 0x0,
    })
    .uint8('static4', {
      assert: 0x0,
    })
    .uint8('static5', {
      assert: 0x30,
    });

  const rleParser = new Parser()
    .endianess('little')
    .uint8('type', {
      assert: 0x1,
    }) // assume compressed
    .uint32('compressed_length')
    .array('compressed_data', {
      type: 'uint8',
      length: 'compressed_length',
    });

  const parser = new Parser()
    .endianess('little')
    .skip(offset)
    .uint32('payload_length_with_header_plus_one')
    .uint8('static1')
    .uint8('static2')
    .uint32('header_region_length')
    .nest('printer_control', {
      type: printerControlParser,
    })
    .nest('printer_data', {
      type: printerDataParser,
    })
    .nest('rle', {
      type: rleParser,
    });

  const result = parser.parse(buf);

  return {
    length: result.payload_length_with_header_plus_one,
    bytes: await unrle(result.rle.compressed_data as number[]),
  };
};
