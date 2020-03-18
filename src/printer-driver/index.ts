export interface PrinterDriverInterface {
  print(buffer: Buffer): Promise<PrintingResult>;
}

export type PrintingResult = any;
