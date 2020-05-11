#!/usr/bin/env node

import fs from 'fs';
import wsclient from '../src/wsclient';

import Bridge from '../src/bridge';
import ConsolePrinter from '../src/device/printer/console-printer';
import FilesystemPrinter from '../src/device/printer/filesystem-printer';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// const uri = 'ws://localhost:5000/api/v1/connection';
const uri = 'wss://littleprinter.nordprojects.co/api/v1/connection';
const printerDataPath = 'fixtures/fb1f6abb95f9b129.printer';
//const printerDataPath = 'fixtures/0aaab8e735e378b4.printer';


const printerData = fs.readFileSync(printerDataPath).toString();

console.log('Contacting', uri);
console.log(printerData);
console.log('-----------------------------');

// Parse data from printer file
const deviceAddressMaybe = printerData.match(/address: ([a-f0-9]{16})/);

if (deviceAddressMaybe == null) {
  throw new Error(`couldn't find device address in ${printerDataPath}`);
}
const deviceAddress = deviceAddressMaybe[1];

const bridgeAddress = Math.floor(Math.random() * Math.floor(Math.pow(2, 64)))
  .toString(16)
  .padStart(16, '0');

// const device = new ConsolePrinter(deviceAddress);
const device = new FilesystemPrinter(deviceAddress);
const bridge = new Bridge(bridgeAddress, device);

wsclient(uri, bridge);
