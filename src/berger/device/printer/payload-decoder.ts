import { Parser } from 'binary-parser';

export type BergPrinterPayload = {
  // these are returned as arrays - not sure exactly what the exact values represent, but they're probably control code + escpos value
  control: {
    maximumPrinterSpeed: number[];
    printerAcceleration: number[];
    peakCurrent: number[];
    maximumIntensity: number[];
  };
  metadata: {
    pixelCount: number;
  };
  rle: {
    length: number;
    isCompressed: boolean;
    // TODO: convert this to use a buffer
    data: number[];
  };
};

const pixelCounter = (n1: number, n2: number, n3: number): number => {
  const n3Remainder = n2 * 256 + n1;
  const byteCount = n3 * 65536 + n3Remainder;
  const pixelCount = byteCount * 8;

  return pixelCount;
};

// There are a small pile of checks & balances here for file sizes and whatnot, but yolo seems fine for now.
// Since we're only expecting images, it's a reasonably safe to assume the shape of the important parts.
//
// What do we have, if we don't trust blindly?
export default async (buf: Buffer): Promise<BergPrinterPayload> => {
  const maxPrinterSpeedParser = new Parser().endianess('little').array('data', {
    type: 'uint8',
    length: 4,
    assert: function (arg) {
      const x = arg as number[];
      return x[0] === 0x1d && x[1] === 0x73 && x[2] === 0x03 && x[3] === 0xe8;
    },
  });

  const printerAccelerationParser = new Parser()
    .endianess('little')
    .array('data', {
      type: 'uint8',
      length: 3,
      assert: function (arg) {
        const x = arg as number[];
        return x[0] === 0x1d && x[1] === 0x61 && x[2] === 0xd0;
      },
    });

  const peakCurrentParser = new Parser().endianess('little').array('data', {
    type: 'uint8',
    length: 3,
    assert: function (arg) {
      const x = arg as number[];
      return x[0] === 0x1d && x[1] === 0x2f && x[2] === 0x0f;
    },
  });

  const maxIntensityParser = new Parser().endianess('little').array('data', {
    type: 'uint8',
    length: 3,
    assert: function (arg) {
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

  // I don't know what most of these mean - they're hardcoded in sirius. n1/n2/n3 are used to count pixels though, so they're relevant
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
    .uint8('is_compressed', {
      assert: 0x1,
    }) // assume compressed
    .uint32('data_length')
    .array('data', {
      type: 'uint8',
      length: 'data_length',
    });

  const parser = new Parser()
    .endianess('little')
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

  const pixelCount = pixelCounter(
    result.printer_data.n1,
    result.printer_data.n2,
    result.printer_data.n3
  );

  return {
    control: {
      maximumIntensity: result.printer_control.max_intensity.data,
      maximumPrinterSpeed: result.printer_control.max_printer_speed.data,
      peakCurrent: result.printer_control.peak_current.data,
      printerAcceleration: result.printer_control.printer_acceleration.data,
    },
    metadata: {
      pixelCount,
    },
    rle: {
      isCompressed: result.rle.is_compressed == 0 ? false : true, // TODO: derive from data
      data: result.rle.data,
      length: result.rle.data_length,
    },
  };
};
