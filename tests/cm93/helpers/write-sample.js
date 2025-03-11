import { ByteStreamWriter } from "../../../lib/cm93/writer/byte-writer.js";
import { transformLngLatToXY } from '../../../lib/cm93/coordinate-utils.js'

export const sampleHeader = {
    lonMin: 144.99999647960075,
    latMin: -16.999999580904852,
    lonMax: 145.99999647960075,
    latMax: -15.999999580904852,
    eastingMin: 16141961.13025233,
    northingMin: -1920900.5998936733,
    eastingMax: 16253285.002818927,
    northingMax: -1804793.7559024408,
    usnVectorRecords: 2,
    nVectorRecordPoints: 0,
    m46: 0,
    m4a: 0,
    usnPoint3dRecords: 0,
    m50: 0,
    m54: 0,
    usnPoint2dRecords: 1,
    m5a: 0,
    m5c: 0,
    usnFeatureRecords: 3,
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

export const sampleFileLength = 211

export const sampleCoordinates = [
    { lng: 145.55959189310093, lat: -16.384923847112812 },
    { lng: 145.56070580170936, lat: -16.384923847112812 },
    { lng: 145.56018699496025, lat: -16.383793989850826 },
    { lng: 145.55959189310093, lat: -16.384923847112812 },
    { lng: 145.56009544082804, lat: -16.38440472431943 }
]

export const sampleCellInfo = {
    transformXRate: 1.698693409118754,
    transformYRate: 1.7716768748185332,
    transformXOrigin: 16141961.13025233,
    transformYOrigin: -1920900.5998936733,
}

const xyCoordsGenerated = 
    [
        [36673, 40349],
        [36746, 40349],
        [36712, 40423],
        [36673, 40349]
    ]

const xyCoordsGeneratedPt = [ 36706, 40383 ]

const obj1DescBytes = 1 // nAttributes
                    + 1 // attrId
                    + 1 // aByte
                    + 1 // attrId
                    + 4 // aFloat
                    + (1 * 2 + 2) // type LINE, (nLines * 2) + 2
                    + 5 // for having attributes
                    - 1 // some offset?

export const sampleFeatures = [
    {
        iobject: 0,
        objDescBytes: 3, // just random for now, is not read for this object type
        objectType: 81,
        geometryType: 4,
        attributes: {},
        coordinates: [ xyCoordsGenerated ],
        relatedObjects: [],
        vectorIndexes: [0],
    },
    {
        iobject: 1,
        objDescBytes: obj1DescBytes, // = 16,
        objectType: 45,
        geometryType: 130,
        attributes: { QUAPOS: 4, VALDCO: 2 },
        coordinates: [ xyCoordsGenerated ],
        relatedObjects: [],
        vectorIndexes: [],
    },
    {
        iobject: 2,
        objDescBytes: 2, // ? = size of attributes - some  // 2 = 1xSHORT, not read since no attributes
        objectType: 158,
        geometryType: 161,
        attributes: {},
        coordinates: xyCoordsGeneratedPt,
        relatedObjects: [],
        vectorIndexes: [],
    }
]

export function writeSample() {

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
    writer.writeShort(2); // 2 vector records
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
    writer.writeShort(1); // 1 point

    // misc: short short
    writer.writeShort(0);
    writer.writeShort(0);

    // feature records: short
    writer.writeShort(3); // 3 features

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

    // second: line
    writer.writeShort(4); // num points
    writer.writeShort(xyCoordinates[0].x); writer.writeShort(xyCoordinates[0].y); // x,y
    writer.writeShort(xyCoordinates[1].x); writer.writeShort(xyCoordinates[1].y); // x,y
    writer.writeShort(xyCoordinates[2].x); writer.writeShort(xyCoordinates[2].y); // x,y
    writer.writeShort(xyCoordinates[3].x); writer.writeShort(xyCoordinates[3].y); // x,y

    // ## no 3d points

    // ## points
    // first: point
    writer.writeShort(xyCoordinates[4].x); writer.writeShort(xyCoordinates[4].y); // x,y

    // ## features, 3
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

    // second: line
    const f1 = sampleFeatures[1]
    writer.writeByte(f1.objectType)
    writer.writeByte(f1.geometryType)
    writer.writeShort(f1.objDescBytes);
    writer.writeShort(f1.coordinates.length); // nElements, just one polygon
    writer.writeShort(1); // vector index = 1
    // skipping adding num related since  (130) & 0x10) is false
    // skipping second num related since (130 & 0x20) is false
    // adding attributes since (130 & 0x80) is true
    writer.writeByte(Object.keys(f1.attributes).length) // num attributes 2
    writer.writeByte(91) // attr id
    writer.writeByte(4) // "QUAPOS": 4, ==> QUAPOS|91|aBYTE|1|8
    writer.writeByte(113) // attr id
    writer.writeFloat(2) // "VALDCO": 2  ==> VALDCO|113|aFLOAT|0.0|12000.0

    // third: point
    const f2 = sampleFeatures[2]
    writer.writeByte(f2.objectType)
    writer.writeByte(f2.geometryType)
    writer.writeShort(f2.objDescBytes);
    // only a point so not adding nElements    
    writer.writeShort(0); // point index = 0
    // skipping adding num related since  (161) & 0x10) is false
    // adding second num related since (161 & 0x20) is true (=32)
    writer.writeShort(0)
    // adding attributes since (130 & 0x80) is true (=128)
    writer.writeByte(0) // num attributes = 0

    const buffer = writer.getBuffer();
    return buffer
}