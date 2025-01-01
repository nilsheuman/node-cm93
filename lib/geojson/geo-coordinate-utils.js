import { CM93SemimajorAxisMeters, DEGREE } from "../cm93/constants.js";

export function transformCoordinates(coord, transX, transY, transformXRate, transformYRate, transformXOrigin, transformYOrigin) {
    const valX = (coord[0] * transformXRate) + transformXOrigin;
    const valY = (coord[1] * transformYRate) + transformYOrigin;

    const correctedX = valX - transX;
    const correctedY = valY - transY;

    const lat = (2.0 * Math.atan(Math.exp(correctedY / CM93SemimajorAxisMeters)) - Math.PI / 2.0) / DEGREE;
    const lng = correctedX / (DEGREE * CM93SemimajorAxisMeters);

    return {
        lng: lng,
        lat: lat
    };
}

export function convertCoord(cellInfo, coord, offset) {
    const trans_x = offset.x
    const trans_y = offset.y
    
    const transformed = transformCoordinates(
        coord,
        trans_x,
        trans_y,
        cellInfo.transformXRate,
        cellInfo.transformYRate,
        cellInfo.transformXOrigin,
        cellInfo.transformYOrigin
    )
    
    return [transformed.lng, transformed.lat]
}

// try creating polygons from linestrings
// the line strings in polygons are not always in order so flip
export function separatePolygonsAndLines(lineStrings) {
    const usedIndexes = new Set();
    const polygons = [];
    const lines = [];

    function findConnectedLines(startIndex) {
        const orderedLines = [lineStrings[startIndex]];
        usedIndexes.add(startIndex);

        let hasConnections = true;
        while (hasConnections) {
            hasConnections = false;
            const currentLine = orderedLines[orderedLines.length - 1];
            const currentEnd = currentLine[currentLine.length - 1];

            for (let i = 0; i < lineStrings.length; i++) {
                if (usedIndexes.has(i)) continue;

                const line = lineStrings[i];
                if (currentEnd[0] === line[0][0] && currentEnd[1] === line[0][1]) {
                    // Line starts where the current line ends
                    orderedLines.push(line);
                    usedIndexes.add(i);
                    hasConnections = true;
                    break;
                } else if (currentEnd[0] === line[line.length - 1][0] && currentEnd[1] === line[line.length - 1][1]) {
                    // Line ends where the current line ends (reverse it)
                    orderedLines.push(line.reverse());
                    usedIndexes.add(i);
                    hasConnections = true;
                    break;
                }
            }
        }

        return orderedLines;
    }

    for (let i = 0; i < lineStrings.length; i++) {
        if (usedIndexes.has(i)) continue;

        const connectedLines = findConnectedLines(i);

        // Check if the connected lines form a closed polygon
        const firstPoint = connectedLines[0][0];
        const lastPoint = connectedLines[connectedLines.length - 1][connectedLines[connectedLines.length - 1].length - 1];

        if (firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]) {
            const allCoords = [];
            connectedLines.forEach((line) => {
                allCoords.push(...line.slice(0, -1)); // Avoid duplicate points at connections
            });
            allCoords.push(firstPoint); // Close the loop
            polygons.push(allCoords);
        } else {
            const allCoords = [];
            connectedLines.forEach((line) => {
                allCoords.push(...line);
            });
            lines.push(allCoords);
        }
    }

    const polygonList = polygons.length > 0 ? [polygons] : []
    return [polygonList, lines];
}

export function convertCoordinates(cellinfo, shape, type, offset) {
    let coordinates = []
    switch (type) {
        case 'Point': 
            coordinates = convertCoord(cellinfo, shape, offset); break
        case 'MultiPoint':
        case 'LineString':
            coordinates = shape.map(pt => convertCoord(cellinfo, pt, offset)); break
        case 'MultiLineString':
        case 'Polygon':
            coordinates = shape.map(pts => {
                return pts.map(pt => convertCoord(cellinfo, pt, offset))
                });
                break
        case 'MultiPolygon':
            coordinates = shape.map(poly => {
                return poly.map(pts => {
                    return pts.map(pt => convertCoord(cellinfo, pt, offset))
                })
            })
            break
    }
    return coordinates
}
