import fs from 'fs'

export function getSortKey(file) {
    try {
        const m = file.match(/.*\.([A-Z])/)
        let sortKey = 100
        
        sortKey = m[1].charCodeAt(0) - 'A'.charCodeAt(0) + 1
        if (sortKey > 7) { // Z -> 0
            sortKey = 0
        }
        
        return sortKey
    } catch(e) {
        console.warn('no file match', file, e)
        return 0
    }
}

export function createFeatureCollection(features) {
    return {
        "type": "FeatureCollection",
        "features": features
    }
}

export function formatPercentage(num) {
    return `${num.toString().padStart(3, ' ')}%`;
}

export function stringifyAndClean(json) {
    // Coordinates class adds quotes around the list, remove them
    // This allows pretty printing with coordinates on a single line
    return JSON.stringify(json, true, 2).replace(/"(\[.*?\])"/g, (_, match) => match)
}
