import { Cm93Header } from "./data-reader";

export interface LngLat {
    lng: number,
    lat: number,
}

export interface CellInfo {
    transformXRate: number,
    transformYRate: number,
    transformXOrigin: number,
    transformYOrigin: number,
}

export declare function calculateTransform(header: Cm93Header): CellInfo

export declare function transformCoordinates(s: number[], transX: number, transY: number,
    transformXRate: number, transformYRate: number, transformXOrigin: number, transformYOrigin: number): LngLat

export declare function transformLngLatToXY(lngLat: Point, transX: number, transY: number,
    transformXRate: number, transformYRate: number, transformXOrigin: number, transformYOrigin: number)

export declare function transformCoordinatesToXY(coord: number[], transformXRate: number, transformYRate: number,
    transformXOrigin: number, transformYOrigin: number)
