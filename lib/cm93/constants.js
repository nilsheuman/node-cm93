export const BYTE = 1
export const SHORT = 2
export const INT = 4
export const FLOAT = 4
export const DOUBLE = 8

export const TYPE_AREA = 4
export const TYPE_LINE = 2
export const TYPE_POINT = 1
export const TYPE_MULTIPOINT = 8

// Note from opencpn:
//    This constant was developed empirically by looking at a
//    representative cell, comparing the cm93 point transform coefficients
//    to the stated lat/lon bounding box.
//    This value corresponds to the semi-major axis for the "International 1924"
//    geo-standard For WGS84, it should be 6378137.0......

export const CM93SemimajorAxisMeters = 6378388.0;  // CM93 semimajor axis

export const DEGREE = Math.PI / 180.0;
