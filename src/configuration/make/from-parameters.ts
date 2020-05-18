import { PrinterParameters } from '../index';

// wrapper for static function missing in interfaces
export default <T>(
  handler: {
    fromParameters(parameters: PrinterParameters): T;
  },
  parameters: PrinterParameters = undefined
): T => {
  return handler.fromParameters(parameters);
};
