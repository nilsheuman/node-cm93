import { lstatSync, readFile, statSync } from 'fs';
import { calculateTransform } from './coordinate-utils.js'
import {
    readChecksum,
    readHeader,
    readVectorRecordTable,
    read3DPointTable,
    read2DPointTable,
    readFeatureRecordTable,
} from './data-reader.js'

export function parseFile(filePath, attrDictionary, options, callback) {
    if (!lstatSync(filePath).isFile()) {
        return callback({errors: [{msg: 'not a valid file', filePath}]})
    }
    readFile(filePath, (err, buffer) => {
        const errors = []
        if (err) {
            errors.push({msg: 'file read error', err})
            return callback({errors})
        }
        
        let offset = 0

        let checksum
        [checksum, offset] = readChecksum(buffer, offset)

        const fileLength = statSync(filePath).size
        if (checksum !== fileLength) {
            errors.push({msg:'checksum error', filePath, checksum, fileLength})
            return callback({errors})
        }

        let header
        [header, offset] = readHeader(buffer, offset)
        
        if (options.onlyHeader) {
            return callback({header, errors})
        }

        const cellInfoBlock = {};
        offset = readVectorRecordTable(buffer, offset, header.usnVectorRecords, cellInfoBlock);
        offset = read3DPointTable(buffer, offset, header.usnPoint3dRecords, cellInfoBlock);
        offset = read2DPointTable(buffer, offset, header.usnPoint2dRecords, cellInfoBlock);
        offset = readFeatureRecordTable(buffer, offset, header.usnFeatureRecords, cellInfoBlock, attrDictionary);

        const cellInfo = calculateTransform(header)
        callback({header, cellInfo, cellInfoBlock, errors})
    });
}
