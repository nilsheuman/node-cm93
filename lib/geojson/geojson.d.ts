import { CellInfo } from "cm93/coordinate-utils";
import ObjDictionary from "cm93/obj-dictionary";
import { Cm93Package } from "cm93/parser";
import { Coordinates } from "./coordinates";

export declare function defaultProperties(block: CellInfoBlock, file: string, sortKey: number, objDictionary: ObjDictionary): {}
export declare function safeProperties(properties: {}): {}
export declare function createFeature(properties: {}, coordinates: Coordinates, geometryType: string, layerId: string): {}
export declare function handleAreaGroup(k: string, groups: {}, file: string, sortKey: number, objDictionary: ObjDictionary, errors: any[], cellinfo: CellInfo, offset: Point): {}
export declare function handle(result: Cm93Package, objDictionary: ObjDictionary, options: {}, errors: any[])