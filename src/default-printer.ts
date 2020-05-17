// note: this is a placeholder for common setup until config is loadable

import { PrintableImageHandler } from './printer/printable-image-wrapper';
import BluetoothPaperangPrinter from './printer/bluetooth-paperang-printer';
import USBPaperangPrinter from './printer/paperang';
import ConsolePrinter from './printer/console';

const printer: PrintableImageHandler = new ConsolePrinter();
// const printer: PrintableImageHandler = new USBPaperangPrinter(image: { width: 576 });
// const printer: PrintableImageHandler = new BluetoothPaperangPrinter({
//   image: { width: 576 },
//   bluetooth: {
//     address: '00-15-82-90-1d-76',
//     channel: 6,
//   },
// });

export default printer;
