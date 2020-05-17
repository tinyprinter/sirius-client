import { PrinterConfiguration } from './index';

// wrapper for static function missing in interfaces
export default <T>(
  handler: {
    fromConfiguration(configuration: PrinterConfiguration): T;
  },
  configuration: PrinterConfiguration = undefined
): T => {
  return handler.fromConfiguration(configuration);
};
