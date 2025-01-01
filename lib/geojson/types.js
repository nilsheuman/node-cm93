
export const GEO_TYPE_POINT = 1
export const GEO_TYPE_LINE = 2
export const GEO_TYPE_AREA = 4
export const GEO_TYPE_MULTIPOINT = 8
export const GEO_TYPE_UNKNOWN = 16

export const geoTypeMapping = {
    [GEO_TYPE_AREA]: 'MultiPolygon',
    [GEO_TYPE_LINE]: 'MultiLineString',
    [GEO_TYPE_POINT]: 'Point',
    [GEO_TYPE_MULTIPOINT]: 'MultiPoint'
}

export const TYPE_DEPARE = 44 // Depth area
export const TYPE_ITDARE = 78 // Tidal area
export const TYPE_LNDARE = 81 // Land area

export const TYPE_SOUNDG = 147 // Spot Soundings (lots)
export const TYPE_M_PROD = 210 // Production Information
export const TYPE_M_SOR  = 217 // Source of Data // the actual bounds of the data

export const TYPE_DTNARE = 29 // Caution Area, lots of INFORM text
export const TYPE_NATARE = 97 // National territorial area - Country

// order as added to FeatureCollection
export const GROUP_DEPARE = 1
export const GROUP_ITDARE = 2
export const GROUP_LNDARE = 3

export const GROUP_EXCLUDED = 4
export const GROUP_OTHER = 5
export const GROUP_UNKNOWN = 6

export const groupMapping = {
    [TYPE_DEPARE]: GROUP_DEPARE,
    [TYPE_ITDARE]: GROUP_ITDARE,
    [TYPE_LNDARE]: GROUP_LNDARE,
    
    [TYPE_SOUNDG]: GROUP_EXCLUDED, // exclude
}

export const LAYER_DEPARE = 'DEPARE'
export const LAYER_ITDARE = 'ITDARE'
export const LAYER_LNDARE = 'LNDARE'
export const LAYER_OTHER  = 'OTHER'
export const LAYER_SYMBOL = 'SYMBOL'

export const groupLayerMapping = {
    [GROUP_DEPARE]: LAYER_DEPARE,
    [GROUP_ITDARE]: LAYER_ITDARE,
    [GROUP_LNDARE]: LAYER_LNDARE,
}