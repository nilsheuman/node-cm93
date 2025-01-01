import { separatePolygonsAndLines, convertCoordinates } from './geo-coordinate-utils.js'
import { Coordinates } from './coordinates.js'
import { getSortKey } from './utils.js'
import { 
    GEO_TYPE_POINT, GEO_TYPE_LINE, GEO_TYPE_AREA, GEO_TYPE_MULTIPOINT,
    geoTypeMapping, groupMapping, groupLayerMapping,
    GROUP_EXCLUDED, GROUP_OTHER, GROUP_UNKNOWN,
    GROUP_DEPARE, GROUP_ITDARE, GROUP_LNDARE,
    LAYER_SYMBOL, LAYER_OTHER, 
} from './types.js'


function defaultProperties(block, file, sortKey, objDictionary) {
    const dictObj = objDictionary.get(block.objectType)
    
    const properties = {
        iobject: block.iobject,
        otype: block.objectType,
        geotype: block.geometryType,
        cmtype: dictObj.name,
        typeLabel: dictObj.label,
        file,
        sortKey
    }
    
    if (block.attributes !== undefined) {
        Object.entries(block.attributes).forEach(([key, entry]) => {
            properties[key] = entry
        })
    }

    if (block.attributes !== undefined && block.attributes.OBJNAM !== undefined) { // got string
        properties.text = block.attributes.OBJNAM
    }

    return properties
}

// convert too large numbers to strings
// eg: "HORCLR": 7.096507931512301e+22,
function safeProperties(properties) {
    for (const key in properties) {
            const value = properties[key]

            if (typeof value === "number" && (value > Number.MAX_SAFE_INTEGER)) {
                properties[key] = value.toString()
            }
    }

    return properties
}

function createFeature(properties, coordinates, geometryType, layerId) {

    properties = safeProperties(properties)

    if (layerId == null) {
        layerId = properties.cmtype
    }

    const geoJsonFeature = {
        tippecanoe : {
            layer: layerId
        },
        type: 'Feature',
        geometry: {
            type: geometryType,
            coordinates: coordinates
        },
        properties
    }

    return geoJsonFeature
}

function handleAreaGroup(k, groups, file, sortKey, objDictionary, errors, cellinfo, offset) {
    const features = []
    const threshold = 0 // not used

    let layerId = groupLayerMapping[k] || LAYER_OTHER

    groups[k].forEach(block => {
        const properties = defaultProperties(block, file, sortKey, objDictionary)

        const geometryTypeBit = block.geometryType & 0x0f
        const geometryTypeStr = geoTypeMapping[geometryTypeBit]

        if (geometryTypeBit == GEO_TYPE_AREA) {
            const [allPolys, allLines] = separatePolygonsAndLines(block.coordinates, threshold)
            if (allPolys.length > 0) {
                const coordinates = convertCoordinates(cellinfo, allPolys, 'MultiPolygon', offset)
                features.push(createFeature(properties, new Coordinates(coordinates), 'MultiPolygon', layerId))
            }
            if (allLines.length > 0) {
                const coordinates = convertCoordinates(cellinfo, allLines, geometryTypeStr, offset)
                features.push(createFeature(properties, new Coordinates(coordinates), 'MultiLineString', layerId))
            }
        } else if ( geometryTypeBit == GEO_TYPE_LINE) {
            // changed to not try to make polygons out of line type
            const coordinates = convertCoordinates(cellinfo, block.coordinates, geometryTypeStr, offset)
            features.push(createFeature(properties, new Coordinates(coordinates), geometryTypeStr, layerId))
        } else if (geometryTypeBit == GEO_TYPE_POINT || geometryTypeBit == GEO_TYPE_MULTIPOINT) {
            const coordinates = convertCoordinates(cellinfo, block.coordinates, geometryTypeStr, offset)
            const layerId = LAYER_SYMBOL
            features.push(createFeature(properties, new Coordinates(coordinates), geometryTypeStr, layerId))
        } else {
            errors.push({msg: 'unhandled geometry type', data: [block.geometryType, geometryTypeBit]})
        }
    })
    return features
}

export function handle(result, objDictionary, options, errors) {
    
    const file = options.filename || "-"
    const sortKey = getSortKey(file)
    const groups = {}
    const offset = options.offset || {x:0, y:0}

    // group per type to be able to loop depth area layers first when exporting
    result.cellInfoBlock.pobjectBlock.forEach(block => {
        const groupId = groupMapping[block.objectType] || GROUP_UNKNOWN
        if (!groups[groupId]) {
            groups[groupId] = []
        }
        groups[groupId].push(block)
    })

    let features = []

    Object.keys(groups).forEach(k => {
        k = parseInt(k)

        switch (k) {
            case GROUP_EXCLUDED:
                // console.log('K:exclude', groups[k].length)
                break
            case GROUP_UNKNOWN:
                // console.log('K:unknown', groups[k].length)
                features = features.concat( handleAreaGroup(k, groups, file, sortKey, objDictionary, errors, result.cellInfo, offset) )
                break
            case GROUP_OTHER:
                // console.log('K:other', groups[k].length)
                features = features.concat( handleAreaGroup(k, groups, file, sortKey, objDictionary, errors, result.cellInfo, offset) )
                break
            case GROUP_DEPARE:
            case GROUP_ITDARE:
            case GROUP_LNDARE:
                // console.log('K:area', k, groups[k].length)
                features = features.concat( handleAreaGroup(k, groups, file, sortKey, objDictionary, errors, result.cellInfo, offset) )
                break
        }
        // const entries = groups[k]
    })

    const json = {
        type: 'FeatureCollection',
        header: result.header,
        cellInfo: result.cellInfo,
        features
    }
    return json
}
