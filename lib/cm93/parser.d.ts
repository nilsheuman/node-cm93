export declare function parseFile(
  filePath: string,
  attrDictionary: AttrDictionary,
  options: {},
  callback: () => Cm93Package,
)

export interface Cm93Package {
  header: Cm93Header,
  cellInfo: Cm93CellInfo,
  cellInfoBlock: CellInfoBlock,
  errors: Errors
}

export interface ParseOption {
  onlyHeader: boolean
}

export interface Errors {}
