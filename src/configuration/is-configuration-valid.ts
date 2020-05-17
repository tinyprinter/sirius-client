import { PrinterConfiguration } from './index';

// wrapper for static function missing in interfaces
export default (
  handler: {
    isConfigurationValid(configuration: PrinterConfiguration): boolean;
  },
  configuration: PrinterConfiguration = undefined
): boolean => {
  return handler.isConfigurationValid(configuration);
};
