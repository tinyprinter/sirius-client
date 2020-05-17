module.exports = [
  printers: {
    printer_console: {
      driver: 'console',
    },
  },
  network: {
    uri: 'wss://littleprinter.nordprojects.co/api/v1/connection',
  },
  bridge: {
    address: 'abcdef123456',
    devices: {
      device: {
        type: 'littleprinter',
        address: 'abcdef1234567890',
        secret: 1234567890,
        handler: 'printer_console',
      },
    },
  },
};
