import { createDecodeTable } from '../decode-table.js';

export function createEncodeTable() {
    const decodeTable = createDecodeTable();
    const encodeTable = {}
    decodeTable.forEach(i => encodeTable[ decodeTable[i] ] = i)
    return encodeTable
}