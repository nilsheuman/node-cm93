import { ByteStreamWriter } from "../../../lib/cm93/writer/byte-writer.js";
import { transformLngLatToXY } from '../../../lib/cm93/coordinate-utils.js'

export const sampleHeader = {
    "lonMin": -79.99999807216231,
    "latMin": 19.99999949708582,
    "lonMax": -69.99999832361941,
    "latMax": 29.999999245628732,
    "eastingMin": -8905909.590713536,
    "northingMin": 2273120.3396305735,
    "eastingMax": -7792670.893040727,
    "northingMax": 3503687.6569091114,
    usnVectorRecords: 1,
    nVectorRecordPoints: 0,
    m46: 0,
    m4a: 0,
    usnPoint3dRecords: 0,
    m50: 0,
    m54: 0,
    usnPoint2dRecords: 0,
    m5a: 0,
    m5c: 0,
    usnFeatureRecords: 1,
    m60: 0,
    m64: 0,
    m68: 0,
    m6a: 0,
    m6c: 0,
    mNrelatedObjectPointers: 0,
    m72: 0,
    m76: 0,
    m78: 0,
    m7c: 0
}

export const sampleFileLength = 164


export const sampleCoordinates = [
    {"lat": 25.78270797418328, "lng": -79.55397758574135},
    {"lat": 22.250668508619786, "lng": -72.3511090062445},
    {"lat": 27.41166226406159, "lng": -71.03379766723093},
    {"lat": 25.78270797418328, "lng": -79.55397758574135},
]

// 02190435.D
export const sampleCellInfo = {
    "transformXRate": 16.986933664039206,
    "transformYRate": 18.777253639712182,
    "transformXOrigin": -8905909.590713536,
    "transformYOrigin": 2273120.3396305735
}

const xyCoordsGenerated = 
    [
        [2923, 37236],
        [50127, 14306],
        [58760, 48037],
        [2923, 37236]
    ]

export const sampleFeatures = [
    {
        iobject: 0,
        objDescBytes: 3, // just random for now, is not read for this object type
        objectType: 81,
        geometryType: 4,
        attributes: {},
        coordinates: [ xyCoordsGenerated ],
        relatedObjects: []
    }
]

export function writeSampleBt() {

    const xyCoordinates = sampleCoordinates
        .map(lngLat => transformLngLatToXY(lngLat, 0, 0, 
            sampleCellInfo.transformXRate, sampleCellInfo.transformYRate, 
            sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin));

    // Example usage
    const writer = new ByteStreamWriter(1024); // Allocate 1KB buffer

    // Write checksum
    writer.writeShort(0x0000); // checksum (word)
    writer.writeInt(0x00000000); // checksum (int)
    writer.writeInt(sampleFileLength); // checksum (int)

    // coords
    writer.writeDouble(sampleHeader.lonMin)  // lonMin
    writer.writeDouble(sampleHeader.latMin) // latMin
    writer.writeDouble(sampleHeader.lonMax)  // lonMax
    writer.writeDouble(sampleHeader.latMax) // latMax

    // eastins: double double double double
    writer.writeDouble(sampleHeader.eastingMin)
    writer.writeDouble(sampleHeader.northingMin)
    writer.writeDouble(sampleHeader.eastingMax)
    writer.writeDouble(sampleHeader.northingMax)

    // vector records: short int
    writer.writeShort(1); // 1 vector record
    writer.writeInt(0);

    // misc: int int
    writer.writeInt(0);
    writer.writeInt(0);

    // point3d records: short
    writer.writeShort(0);

    // misc: int int
    writer.writeInt(0);
    writer.writeInt(0);

    // point2d records: short
    writer.writeShort(0); // 0 points

    // misc: short short
    writer.writeShort(0);
    writer.writeShort(0);

    // feature records: short
    writer.writeShort(1); // 1 feature

    // misc: int int short short short
    writer.writeInt(0);
    writer.writeInt(0);
    writer.writeShort(0);
    writer.writeShort(0);
    writer.writeShort(0);

    // related: int
    writer.writeInt(0);

    // misc: int short int int
    writer.writeInt(0);
    writer.writeShort(0);
    writer.writeInt(0);
    writer.writeInt(0);

    // ## vector records area, line
    // first: area
    writer.writeShort(4); // num points
    writer.writeShort(xyCoordinates[0].x); writer.writeShort(xyCoordinates[0].y); // x,y
    writer.writeShort(xyCoordinates[1].x); writer.writeShort(xyCoordinates[1].y); // x,y
    writer.writeShort(xyCoordinates[2].x); writer.writeShort(xyCoordinates[2].y); // x,y
    writer.writeShort(xyCoordinates[3].x); writer.writeShort(xyCoordinates[3].y); // x,y

    // ## no 3d points

    // ## no points

    // ## features, 1
    // first: area
    const f0 = sampleFeatures[0]
    writer.writeByte(f0.objectType)
    writer.writeByte(f0.geometryType)
    writer.writeShort(f0.objDescBytes);
    writer.writeShort(f0.coordinates.length); // nElements, just one polygon
    writer.writeShort(0); // vector index = 0
    // skipping adding num related since (4 & 0x10) is false
    // skipping second num related since (4 & 0x20) is false
    // skipping attributes since (4 & 0x80) is false

    const buffer = writer.getBuffer();
    return buffer
}