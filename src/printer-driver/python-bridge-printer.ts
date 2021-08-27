import { PrinterDriverInterface, PrintingResult } from '.';
import fs from 'fs';
import os from 'os';
import path from 'path';
import bitmapify from '../decoder/parser/bitmapify';
import { spawn } from 'child_process';


export default class PythonBridgePrinterDriver implements PrinterDriverInterface {
  async print(buffer: Buffer): Promise<PrintingResult> {
    return new Promise<void>(resolve => {
      const tempDir = path.join(os.tmpdir(), 'sirius-client');
      fs.mkdirSync(tempDir, { recursive: true });

      const randomName = Math.random().toString(36);
      const tempFile = path.join(tempDir, randomName + '.bmp');

      const bitmap = bitmapify(buffer);
      fs.writeFileSync(tempFile, bitmap);
      console.log(`Written: ${tempFile}`);

      const python = spawn('python3', ['../python_print/main.py', tempFile]);
 
      python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        console.log(data.toString());
      });
      python.on('error', function (...args) {
        console.log('Python error', args);
      });
      python.on('exit', function (code, signal) {
          console.log('Python exit', code, signal);
      });
      python.on('close', function (code, signal) {
          console.log('Python close', code, signal);
          resolve();          
      });
      
    });
  }
}
