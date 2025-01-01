export declare function readChecksum(buffer: Buffer, offset: number): [checksum: number, offset: number];
export declare function readHeader(buffer: Buffer, offset: number): [header: Cm93Header, offset: number];
export declare function readVectorRecordTable(buffer: Buffer, offset: number, recordCount, cellInfoBlock: CellInfoBlock): number
export declare function read3DPointTable(buffer: Buffer, offset: number, pointCount: number, cellInfoBlock: CellInfoBlock): number
export declare function read2DPointTable(buffer: Buffer, offset: number, pointCount: number, cellInfoBlock: CellInfoBlock): number
export declare function readFeatureRecordTable(buffer: Buffer, offset: number, featureCount, cellInfoBlock: CellInfoBlock, dictionary: AttrDictionary): number
export declare function readAttributes(buffer: Buffer, offset: number, objDescBytes: number, dictionary: AttrDictionary): number;  

export interface Cm93Header {
    lonMin: number;
    latMin: number;
    lonMax: number;
    latMax: number;
    eastingMin: number;
    northingMin: number;
    eastingMax: number;
    northingMax: number;
    usnVectorRecords: number;
    nVectorRecordPoints: number;
    m46: number;
    m4a: number;
    usnPoint3dRecords: number;
    m50: number;
    m54: number;
    usnPoint2dRecords: number;
    m5a: number;
    m5c: number;
    usnFeatureRecords: number;
    m60: number;
    m64: number;
    m68: number;
    m6a: number;
    m6c: number;
    mNrelatedObjectPointers: number;
    m72: number;
    m76: number;
    m78: number;
    m7c: number;
}

export interface CellInfoBlock {
    edgeVectorDescriptorBlock: Descriptor[],
    pvectorRecordBlockTop: any, // not used
    point3dDescriptorBlock: Descriptor3D[],
    p2dpointArray: Point[],
    pobjectBlock: BlockFeature[],
}

export interface Descriptor3D {
    nPoints: number,
    pPoints: Point3D[],
}

export interface Descriptor {
    index: number,
    nPoints: number,
    pPoints: Point[],
}

export interface Point {
    x: number,
    y: number,
    z: number?,
}

export interface Point3D {
    x: number,
    y: number,
    z: number,
}

export interface BlockFeature {
    attributes: {},
    coordinates: [], // can be point, list of points, list of list of points...
    relatedObjects: number[],
}