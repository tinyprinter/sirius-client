export interface BinaryPayload {
  header: CommandHeader;
  payload: CommandPayload;
}

export enum CommandName {
  SetDeliveryAndPrint = 0x1,
  SetDelivery = 0x2,
  SetDeliveryAndPrintNoFace = 0x11,
  SetDeliveryNoFace = 0x12,

  SetPersonality = 0x102,
  SetPersonalityWithMessage = 0x101,

  SetQuip = 0x202,
}

export interface CommandHeader {
  deviceId: number;
  commandName: CommandName;
  printId: number;
  crc: number; // unused
  length: number;
}

// export interface CommandPayloadHeader {}

export interface CommandPayload {
  length: number;
  // bitmap: Buffer;
  bytes: Buffer;
}
