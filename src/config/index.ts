export type PrinterConfiguration = object | undefined;

// wrapper for static function missing in interfaces
const isConfigurationValid = (
  handler: {
    isConfigurationValid(configuration: PrinterConfiguration): boolean;
  },
  configuration: PrinterConfiguration = undefined
): boolean => {
  return handler.isConfigurationValid(configuration);
};

// wrapper for static function missing in interfaces
const fromConfiguration = <T>(
  handler: {
    fromConfiguration(configuration: PrinterConfiguration): T;
  },
  configuration: PrinterConfiguration = undefined
): T => {
  return handler.fromConfiguration(configuration);
};

export { isConfigurationValid, fromConfiguration };
