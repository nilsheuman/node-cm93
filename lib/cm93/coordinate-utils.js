import { CM93SemimajorAxisMeters, DEGREE } from './constants.js';

export function calculateTransform(header) {
    let deltaX = header.eastingMax - header.eastingMin;
    if (deltaX < 0)
      deltaX += CM93SemimajorAxisMeters * 2.0 * Math.PI;  // add one trip around
  
    const transformXRate = deltaX / 65535;
    const transformYRate = (header.northingMax - header.northingMin) / 65535;
  
    const transformXOrigin = header.eastingMin;
    const transformYOrigin = header.northingMin;
  
    return {
        transformXRate,
        transformYRate,
        transformXOrigin,
        transformYOrigin,
    }
}


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

// writer

export function transformLngLatToXY(lngLat, transX, transY, transformXRate, transformYRate, transformXOrigin, transformYOrigin) {
  const correctedX = lngLat.lng * (DEGREE * CM93SemimajorAxisMeters) + transX;
  const correctedY = Math.log(Math.tan((Math.PI / 4.0) + (lngLat.lat * DEGREE / 2.0))) * CM93SemimajorAxisMeters + transY;

  const x = (correctedX - transformXOrigin) / transformXRate;
  const y = (correctedY - transformYOrigin) / transformYRate;

  return {
      x: Math.round(x), // Round to match integer grid
      y: Math.round(y)  // Round to match integer grid
  };
}

export function transformCoordinatesToXY(coord, transformXRate, transformYRate, transformXOrigin, transformYOrigin) {
  const x = (coord[0] - transformXOrigin) / transformXRate;
  const y = (coord[1] - transformYOrigin) / transformYRate;

  return {
      x: Math.round(x),
      y: Math.round(y),
  };
}