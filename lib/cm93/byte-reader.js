import { Buffer } from 'buffer';
import { createDecodeTable } from './decode-table.js';
import { BYTE, SHORT, INT, FLOAT, DOUBLE } from './constants.js';

const decodeTable = createDecodeTable();

export function readAndDecodeBytes(buffer, offset, length) {
    const decoded = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
        const encoded = buffer[offset + i];
        decoded[i] = decodeTable[encoded];
    }
    return decoded;
}

export function readAndDecodeByte(buffer, offset) {
    const decoded = readAndDecodeBytes(buffer, offset, BYTE);
    return decoded[0];
}

export function readAndDecodeUShort(buffer, offset) {
    const decoded = readAndDecodeBytes(buffer, offset, SHORT);
    return decoded.readUInt16LE();
}

export function readAndDecodeInt(buffer, offset) {
    const decoded = readAndDecodeBytes(buffer, offset, INT);
    return decoded.readInt32LE();
}

export function readAndDecodeFloat(buffer, offset) {
    const decoded = readAndDecodeBytes(buffer, offset, FLOAT);
    return decoded.readFloatLE();
}

export function readAndDecodeDouble(buffer, offset) {
    const decoded = readAndDecodeBytes(buffer, offset, DOUBLE);
    return decoded.readDoubleLE();
}
