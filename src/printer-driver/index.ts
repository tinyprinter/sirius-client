export interface IPrinterDriver {
  print(buffer: Buffer): Promise<PrintingResult>;
}

export type PrintingResult = any;
