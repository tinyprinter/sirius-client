import { PrinterParameters } from '../index';

// wrapper for static function missing in interfaces
export default (
  handler: {
    areParametersValid(configuration: PrinterParameters): boolean;
  },
  configuration: PrinterParameters = undefined
): boolean => {
  return handler.areParametersValid(configuration);
};
