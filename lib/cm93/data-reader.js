import {
    BYTE, SHORT, INT, FLOAT, DOUBLE,
    TYPE_AREA, TYPE_LINE, TYPE_POINT, TYPE_MULTIPOINT,
 } from './constants.js';
import {
    readAndDecodeByte, 
    readAndDecodeUShort, 
    readAndDecodeInt, 
    readAndDecodeFloat, 
    readAndDecodeDouble,
} from './byte-reader.js'


export function readChecksum(buffer, offset) {
    const word0 = readAndDecodeUShort(buffer, offset); offset+=SHORT;
    const int0 = readAndDecodeInt(buffer, offset); offset+=INT;
    const int1 = readAndDecodeInt(buffer, offset); offset+=INT;
    
    return [word0 + int0 + int1, offset];
}

export function readHeader(buffer, offset) {
    const lonMin = readAndDecodeDouble(buffer, offset); offset += DOUBLE;
    const latMin = readAndDecodeDouble(buffer, offset); offset += DOUBLE;
    const lonMax = readAndDecodeDouble(buffer, offset); offset += DOUBLE;
    const latMax = readAndDecodeDouble(buffer, offset); offset += DOUBLE;

    const eastingMin = readAndDecodeDouble(buffer, offset); offset += DOUBLE;
    const northingMin = readAndDecodeDouble(buffer, offset); offset += DOUBLE;
    const eastingMax = readAndDecodeDouble(buffer, offset); offset += DOUBLE;
    const northingMax = readAndDecodeDouble(buffer, offset); offset += DOUBLE;

    const usnVectorRecords = readAndDecodeUShort(buffer, offset); offset += SHORT;
    const nVectorRecordPoints = readAndDecodeInt(buffer, offset); offset += INT;

    const m46 = readAndDecodeInt(buffer, offset); offset += INT;
    const m4a = readAndDecodeInt(buffer, offset); offset += INT;

    const usnPoint3dRecords = readAndDecodeUShort(buffer, offset); offset += SHORT;
    const m50 = readAndDecodeInt(buffer, offset); offset += INT;
    const m54 = readAndDecodeInt(buffer, offset); offset += INT;

    const usnPoint2dRecords = readAndDecodeUShort(buffer, offset); offset += SHORT;
    const m5a = readAndDecodeUShort(buffer, offset); offset += SHORT;
    const m5c = readAndDecodeUShort(buffer, offset); offset += SHORT;
    const usnFeatureRecords = readAndDecodeUShort(buffer, offset); offset += SHORT;

    const m60 = readAndDecodeInt(buffer, offset); offset += INT;
    const m64 = readAndDecodeInt(buffer, offset); offset += INT;

    const m68 = readAndDecodeUShort(buffer, offset); offset += SHORT;
    const m6a = readAndDecodeUShort(buffer, offset); offset += SHORT;
    const m6c = readAndDecodeUShort(buffer, offset); offset += SHORT;

    const mNrelatedObjectPointers = readAndDecodeInt(buffer, offset); offset += INT;

    const m72 = readAndDecodeInt(buffer, offset); offset += INT;
    const m76 = readAndDecodeUShort(buffer, offset); offset += SHORT;

    const m78 = readAndDecodeInt(buffer, offset); offset += INT;
    const m7c = readAndDecodeInt(buffer, offset); offset += INT;

    const header = {
        lonMin, latMin, lonMax, latMax,
        eastingMin, northingMin, eastingMax, northingMax,
        usnVectorRecords, nVectorRecordPoints,
        m46, m4a, usnPoint3dRecords, m50, m54,
        usnPoint2dRecords, m5a, m5c, usnFeatureRecords,
        m60, m64, m68, m6a, m6c, mNrelatedObjectPointers,
        m72, m76, m78, m7c,
    };

    return [header, offset];
}

export function readVectorRecordTable(buffer, offset, recordCount, cellInfoBlock) {
    cellInfoBlock.edgeVectorDescriptorBlock = [];
    cellInfoBlock.pvectorRecordBlockTop = []; // TODO: lookup what this was

    for (let i = 0; i < recordCount; i++) {
        const nPoints = readAndDecodeUShort(buffer, offset);
        offset += SHORT;

        const descriptor = { index: i, nPoints, pPoints: [] };
        for (let j = 0; j < nPoints; j++) {
            const x = readAndDecodeUShort(buffer, offset);
            offset += SHORT;
            const y = readAndDecodeUShort(buffer, offset);
            offset += SHORT;
            descriptor.pPoints.push({ x, y });
        }
        cellInfoBlock.edgeVectorDescriptorBlock.push(descriptor);
    }

    return offset;
}

export function read3DPointTable(buffer, offset, pointCount, cellInfoBlock) {
    cellInfoBlock.point3dDescriptorBlock = [];

    for (let i = 0; i < pointCount; i++) {
        const nPoints = readAndDecodeUShort(buffer, offset);
        offset += SHORT;

        const descriptor = { nPoints, pPoints: [] };
        for (let j = 0; j < nPoints; j++) {
            const x = readAndDecodeUShort(buffer, offset);
            offset += SHORT;
            const y = readAndDecodeUShort(buffer, offset);
            offset += SHORT;
            const z = readAndDecodeUShort(buffer, offset);
            offset += SHORT;
            descriptor.pPoints.push({ x, y, z });
        }
        cellInfoBlock.point3dDescriptorBlock.push(descriptor);
    }

    return offset;
}

export function read2DPointTable(buffer, offset, pointCount, cellInfoBlock) {
    cellInfoBlock.p2dpointArray = [];

    for (let i = 0; i < pointCount; i++) {
        const x = readAndDecodeUShort(buffer, offset);
        offset += SHORT;
        const y = readAndDecodeUShort(buffer, offset);
        offset += SHORT;
        cellInfoBlock.p2dpointArray.push({ x, y });
    }

    return offset;
}

export function readFeatureRecordTable(buffer, offset, featureCount, cellInfoBlock, dictionary) {
    cellInfoBlock.pobjectBlock = [];

    for (let i = 0; i < featureCount; i++) {
        const objectType = readAndDecodeByte(buffer, offset); offset+=BYTE;
        const geometryType = readAndDecodeByte(buffer, offset); offset+=BYTE;
        
        let objDescBytes = readAndDecodeUShort(buffer, offset);
        offset += SHORT;

        const feature = {
            iobject: i,
            objDescBytes,
            objectType,
            geometryType,
            attributes: {},
            coordinates: [],
            relatedObjects: [],
        };

        // Geometry parsing based on the type
        switch (geometryType & 0x0f) {
            case TYPE_AREA:
                {
                    const nElements = readAndDecodeUShort(buffer, offset);
                    offset += SHORT;

                    objDescBytes -= (nElements * 2) + 2;

                    for (let j = 0; j < nElements; j++) {
                        const index = readAndDecodeUShort(buffer, offset);
                        offset += SHORT;

                        const vectorDescriptor = cellInfoBlock.edgeVectorDescriptorBlock[index & 0x1fff];
                        const points = vectorDescriptor.pPoints.map(pt => [pt.x, pt.y]);
                        feature.coordinates.push(points);
                    }
                }
                break;

            case TYPE_LINE:
                {
                    const nLines = readAndDecodeUShort(buffer, offset);
                    offset += SHORT;

                    objDescBytes -= (nLines * 2) + 2;

                    for (let j = 0; j < nLines; j++) {
                        const index = readAndDecodeUShort(buffer, offset);
                        offset += SHORT;

                        const vectorDescriptor = cellInfoBlock.edgeVectorDescriptorBlock[index & 0x1fff];
                        const points = vectorDescriptor.pPoints.map(pt => [pt.x, pt.y]);
                        feature.coordinates.push(points);
                    }
                }
                break;

            case TYPE_POINT:
                {
                    const pointIndex = readAndDecodeUShort(buffer, offset);
                    offset += SHORT;

                    objDescBytes -= 2;

                    const point = cellInfoBlock.p2dpointArray[pointIndex];
                    feature.coordinates = [point.x, point.y];
                }
                break;

            case TYPE_MULTIPOINT:
                {
                    const multiPointIndex = readAndDecodeUShort(buffer, offset);
                    offset += SHORT;

                    objDescBytes -= 2;

                    const descriptor = cellInfoBlock.point3dDescriptorBlock[multiPointIndex];
                    descriptor.pPoints.forEach(pt => {
                        feature.coordinates.push([pt.x, pt.y, pt.z]);
                    });
                }
                break;

            default:
                // console.warn(`Unknown geometry type: ${geometryType}`);
                break;
        }

        // Handle related objects
        if (geometryType & 0x10) {
            const nRelated = readAndDecodeByte(buffer, offset); offset+=BYTE;
            objDescBytes -= (nRelated * 2) + 1;
            for (let j = 0; j < nRelated; j++) {
                const relatedIndex = readAndDecodeUShort(buffer, offset);
                offset += SHORT;

                // feature.relatedObjects.push(cellInfoBlock.pobjectBlock[relatedIndex]);
                feature.relatedObjects.push(relatedIndex);
            }
        }

        if (geometryType & 0x20) {
            // eslint-disable-next-line no-unused-vars
            const nRelated = readAndDecodeUShort(buffer, offset); offset+=SHORT;
            objDescBytes -= 2;
        }

        // Handle attributes
        if (geometryType & 0x80) {
            objDescBytes -= 5;
            
            let attributes
            [attributes, offset, objDescBytes] = readAttributes(buffer, offset, objDescBytes, dictionary)
            feature.attributes = attributes
            if (attributes == null) {
                console.error('\nERROR: attributes null', i)
                return
            }
        }

        cellInfoBlock.pobjectBlock.push(feature);
    }

    return offset;
}

export function readAttributes(buffer, offset, objDescBytes, dictionary) {
    const attributes = {}

    const nAttributes = readAndDecodeByte(buffer, offset); offset+=BYTE;

    let attrOffset = 0
    for (let j = 0; j < nAttributes; j++) {
        const attrId = readAndDecodeByte(buffer, offset + attrOffset); attrOffset+=BYTE;
        const attrName = dictionary.getAttrName(attrId) || 'a_' + j; 
        const attrType = dictionary.getAttrType(attrId);
        
        let value;
        switch (attrType) {
            case 'I':  // never seen?
                break;
            case 'B':
                value = readAndDecodeByte(buffer, offset + attrOffset)
                attrOffset+=BYTE
                break;
            case 'W': // Word
                value = readAndDecodeUShort(buffer, offset + attrOffset)
                attrOffset+=SHORT
                break;
            case 'G': // Long
                value = readAndDecodeInt(buffer, offset + attrOffset)
                attrOffset+=4
                break;
            case 'S': // String
                {
                    let str = '';
                    let c;
                    while ((c = readAndDecodeByte(buffer, offset + attrOffset)) !== 0 && attrOffset < objDescBytes) {
                        attrOffset+=BYTE;
                        str+= String.fromCharCode(c)
                    }
                    attrOffset+=BYTE; // skip terminator
                    value = str
                }
                break;
            case 'C': // Complex _texta
                {
                    let complexStr = '';
                    let cc;
                    attrOffset += 3; // Skip the first 3 bytes
                    while ((cc = readAndDecodeByte(buffer, offset + attrOffset)) !== 0 && attrOffset < objDescBytes) {
                        attrOffset += 1;
                        complexStr += String.fromCharCode(cc);
                    }
                    attrOffset += 1; // Skip terminator
                    value = complexStr;
                }
                break;
            case 'L': // List
                {
                    const len = readAndDecodeByte(buffer, offset + attrOffset)
                    attrOffset+=BYTE
                    const list = []
                    for (let i = 0; i < len; i++) {
                        const l = readAndDecodeByte(buffer, offset + attrOffset)
                        list.push(l)
                        attrOffset+=BYTE
                    }
                    value = list
                }
                break;
            case 'R': // Float
                value = readAndDecodeFloat(buffer, offset + attrOffset)
                attrOffset+=FLOAT
                break;
            default:
                console.log('unhandled attr')

        }
        attributes[attrName] = value;
    }
    offset+= objDescBytes

    return [attributes, offset]
}
