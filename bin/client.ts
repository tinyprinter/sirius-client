#!/usr/bin/env node

import fs from 'fs';
import wsclient from '../src/wsclient';

import Bridge from '../src/bridge';
import ConsolePrinter from '../src/device/printer/console-printer';

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// const uri = 'wss://sirius.localhost/api/v1/connection';
const printerDataPath = 'fixtures/2cadfa9fdad2c46a.printer';

const uri = 'wss://littleprinter.nordprojects.co/api/v1/connection';
// const printerDataPath = 'fixtures/11cc0f6aaeb07dad.printer';

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

const device = new ConsolePrinter(deviceAddress);
const bridge = new Bridge(bridgeAddress, device);

wsclient(uri, bridge);
