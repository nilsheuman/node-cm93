import { Cm93Header } from "./data-reader";

export declare function calculateTransform(header: Cm93Header): CellInfo

export interface CellInfo {
    transformXRate: number,
    transformYRate: number,
    transformXOrigin: number,
    transformYOrigin: number,
}

export declare function transformLngLatToXY(lngLat: Point, transX: number, transY: number,
    transformXRate: number, transformYRate: number, transformXOrigin: number, transformYOrigin: number)

export declare function transformCoordinatesToXY(coord: number[], transformXRate: number, transformYRate: number,
    transformXOrigin: number, transformYOrigin: number)
