import { sampleCoordinates, sampleCellInfo } from "./helpers/write-sample.js";
import { transformLngLatToXY } from '../../lib/cm93/coordinate-utils.js'
import { transformCoordinates } from '../../lib/geojson/geo-coordinate-utils.js'

test('transform coordinates', () => {
    // it should be noted that there is precision loss/change going from an arbitrary lnglat coordinate to xy
    // however this loss is only happening once, so coordinates generated from xy will not experience the loss/change

    const xyCoordinates = sampleCoordinates
        .map(lngLat => transformLngLatToXY(lngLat, 0, 0, 
            sampleCellInfo.transformXRate, sampleCellInfo.transformYRate, 
            sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin));

    const lngLatCoordinates = xyCoordinates.map(xy => transformCoordinates([xy.x, xy.y], 0, 0,
            sampleCellInfo.transformXRate, sampleCellInfo.transformYRate,
            sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin))

    const xyCoordinates2 = lngLatCoordinates
        .map(lngLat => transformLngLatToXY(lngLat, 0, 0, 
            sampleCellInfo.transformXRate, sampleCellInfo.transformYRate, 
            sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin));

    const lngLatCoordinates2 = xyCoordinates2.map(xy => transformCoordinates([xy.x, xy.y], 0, 0,
        sampleCellInfo.transformXRate, sampleCellInfo.transformYRate,
        sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin))

    expect(sampleCoordinates).toStrictEqual(lngLatCoordinates)
    expect(xyCoordinates).toStrictEqual(xyCoordinates2)
    expect(lngLatCoordinates).toStrictEqual(lngLatCoordinates2)
})


test.skip('generate valid coordinates', () => {
    // by running coodinates through the transformers twice they stay the same
    // enable this test to wash coordinates for test use
    // the test will fail and output the valid coordinates
    
    const arbitraryCoordinates = [
        { lng: -79.55397758574135, lat: 25.78270797418328 },
        { lng: -72.3511090062445, lat: 22.250668508619786 },
        { lng: -71.03379766723093, lat: 27.41166226406159 }
    ]

    const sampleCellInfo = {
        "transformXRate": 16.986933664039206,
        "transformYRate": 18.777253639712182,
        "transformXOrigin": -8905909.590713536,
        "transformYOrigin": 2273120.3396305735
    }

    const xyCoordinates = arbitraryCoordinates
        .map(lngLat => transformLngLatToXY(lngLat, 0, 0, 
            sampleCellInfo.transformXRate, sampleCellInfo.transformYRate, 
            sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin));

    const lngLatCoordinates = xyCoordinates.map(xy => transformCoordinates([xy.x, xy.y], 0, 0,
            sampleCellInfo.transformXRate, sampleCellInfo.transformYRate,
            sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin))

    const xyCoordinates2 = lngLatCoordinates
        .map(lngLat => transformLngLatToXY(lngLat, 0, 0, 
            sampleCellInfo.transformXRate, sampleCellInfo.transformYRate, 
            sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin));

    const lngLatCoordinates2 = xyCoordinates2.map(xy => transformCoordinates([xy.x, xy.y], 0, 0,
        sampleCellInfo.transformXRate, sampleCellInfo.transformYRate,
        sampleCellInfo.transformXOrigin, sampleCellInfo.transformYOrigin))

    console.log({arbitraryCoordinates, lngLatCoordinates, lngLatCoordinates2, xyCoordinates, xyCoordinates2})

    expect(xyCoordinates).toStrictEqual(xyCoordinates2)
    expect(lngLatCoordinates).toStrictEqual(lngLatCoordinates2)

    // output of these coordinates are valid converting forth and back, this test will always fail
    expect(xyCoordinates).toStrictEqual(lngLatCoordinates)
})