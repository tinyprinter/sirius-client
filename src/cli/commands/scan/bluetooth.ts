import yargs from 'yargs';
import daemon from '../../../daemon';
import logger from '../../../logger';

type CommandArguments = {
  config: string;
};

const commander: yargs.CommandModule<{}, CommandArguments> = {
  command: 'bluetooth',
  describe: 'Scan for valid Bluetooth devices.',
  handler: async (argv) => {
    logger.info('starting Bluetooth scan');

    try {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await scan();
    } catch (error) {
      logger.error('%O', error);
    }
  },
};

export default commander;

// ---
// ---
// ---

const btSerial = new (require('bluetooth-serial-port').BluetoothSerialPort)();

type FoundDevice = {
  address: string;
  name: string;
  channel: string;
};

const scan = async (): Promise<FoundDevice[]> => {
  return new Promise((resolve, reject) => {
    const devices: FoundDevice[] = [];

    // const interval = setInterval(() => {
    //   resolve(devices);
    // }, 10_000);

    btSerial.on('found', function (address: string, name: string) {
      console.log(`found: ${address}: ${name}`);

      console.log(`beginining find serial port channel on ${address}`);
      btSerial.findSerialPortChannel(
        address,
        function (channel: number) {
          console.log(`found serial port on ${address}: ${channel}`);

          console.log(`connectiong to serial port on ${address}: ${channel}`);

          btSerial.connect(
            address,
            channel,
            function () {
              console.log('connected');

              btSerial.write(Buffer.from('my data', 'utf-8'), function (
                err: Error | undefined,
                bytesWritten: number
              ) {
                if (err) console.log(err);
              });

              btSerial.on('data', function (buffer: Buffer) {
                console.log(buffer.toString('utf-8'));
              });
            },
            function () {
              console.log('cannot connect');
            }
          );

          // close the connection when you're ready
          btSerial.close();
        },
        function () {
          console.log('found nothing');
        }
      );
    });

    console.log('beginning inquire');
    btSerial.inquire();
  });
};
