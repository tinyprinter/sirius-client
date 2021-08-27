import { PrinterDriverInterface, PrintingResult } from '.';
import fs from 'fs';
import os from 'os';
import path from 'path';
import bitmapify from '../decoder/parser/bitmapify';
import { spawn } from 'child_process';


export default class CommandPrinterDriver implements PrinterDriverInterface {

  parameters: [string];
  command: string;

  constructor(command:string, parameters:[string] ){
    this.parameters = parameters;
    this.command = command;
  }

  createImageFileFromBuffer(buffer: Buffer){
    const tempDir = path.join(os.tmpdir(), 'sirius-client');
    fs.mkdirSync(tempDir, { recursive: true });

    const randomName = Math.random().toString(36);
    const tempFile = path.join(tempDir, randomName + '.bmp');

    const bitmap = bitmapify(buffer);
    fs.writeFileSync(tempFile, bitmap);
    console.log(`Written: ${tempFile}`);
    return tempFile;
  }

  async print(buffer: Buffer): Promise<PrintingResult> {
    return new Promise<void>(resolve => {
      const imageFile = this.createImageFileFromBuffer(buffer);
      this.parameters.push(imageFile);
      const process = spawn(this.command, this.parameters);
 
      process.stdout.on('data', function (data) {
        console.log('Pipe data from command ...');
        console.log(data.toString());
      });
      process.on('error', function (...args) {
        console.log('Command error', args);
      });
      process.on('exit', function (code, signal) {
          console.log('Command exit', code, signal);
      });
      process.on('close', function (code, signal) {
          console.log('Command close', code, signal);
          resolve();          
      });
      
    });
  }
}
