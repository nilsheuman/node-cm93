import { Buffer } from 'buffer';
import { createEncodeTable } from './encode-table.js';
import { BYTE, SHORT, INT, FLOAT, DOUBLE } from '../constants.js';

const encodeTable = createEncodeTable()

export class ByteStreamWriter {
    constructor(size) {
        this.buffer = Buffer.alloc(size);
        this.offset = 0;
    }

    encodeByte(byte) {
        return encodeTable[byte];
    }

    writeByte(value) {
        const encoded = this.encodeByte(value & 0xFF);
        this.buffer.writeUInt8(encoded, this.offset);
        this.offset += BYTE;
    }

    writeShort(value) {
        for (let i = 0; i < SHORT; i++) {
            this.writeByte((value >> (i * 8)) & 0xFF);
        }
    }

    writeInt(value) {
        for (let i = 0; i < INT; i++) {
            this.writeByte((value >> (i * 8)) & 0xFF);
        }
    }

    writeFloat(value) {
        const tempBuffer = Buffer.alloc(FLOAT);
        tempBuffer.writeFloatLE(value);
        for (let i = 0; i < FLOAT; i++) {
            this.writeByte(tempBuffer[i]);
        }
    }

    writeDouble(value) {
        const tempBuffer = Buffer.alloc(DOUBLE);
        tempBuffer.writeDoubleLE(value);
        for (let i = 0; i < DOUBLE; i++) {
            this.writeByte(tempBuffer[i]);
        }
    }

    getBuffer() {
        return this.buffer.slice(0, this.offset);
    }
}