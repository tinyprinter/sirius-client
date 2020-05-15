import CRC from './crc';

const Packet = {
  Start: '\x02',
  End: '\x03',
};

const packetify = (
  operation: string | Buffer,
  data: Buffer,
  checksum: CRC
): Buffer => {
  const packet = Buffer.alloc(1 + operation.length + data.length + 5);

  packet.write(Packet.Start, 0, 'ascii');
  packet.write(Packet.End, packet.length - 1, 'ascii');

  const op = Buffer.isBuffer(operation)
    ? operation
    : Buffer.from(operation, 'ascii');
  op.copy(packet, 1, 0);
  data.copy(packet, op.length + 1, 0);
  checksum.checksumBytes(data).copy(packet, packet.length - 5, 0, 4);

  return packet;
};

export default packetify;
