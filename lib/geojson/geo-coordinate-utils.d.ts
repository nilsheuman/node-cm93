import { CellInfo } from "cm93/coordinate-utils";

export declare function transformCoordinates(s: number[], transX: number, transY: number,
    transformXRate: number, transformYRate: number, transformXOrigin: number, transformYOrigin: number)
export declare function convertCoord(cellInfo: CellInfo, coord: number[], offset: Point)
export declare function separatePolygonsAndLines(lineStrings: []): []
export declare function convertCoordinates(cellinfo: CellInfo, shape: [], type: string, offset: Point): []
