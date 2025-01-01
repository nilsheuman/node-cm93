import fs from 'fs'
import path from 'path'
import { writeSample, sampleHeader, sampleCoordinates, sampleFileLength, sampleCellInfo, sampleFeatures } from "./helpers/write-sample.js";
import { writeSampleBt } from "./helpers/write-sample-bt.js";
import { 
    readChecksum, 
    readHeader, 
    readVectorRecordTable, 
    read2DPointTable, 
    readFeatureRecordTable, 
    read3DPointTable
} from '../../lib/cm93/data-reader.js'
import AttrDictionary from '../../lib/cm93/attr-dictionary.js'
import ObjDictionary from '../../lib/cm93/obj-dictionary.js'
import { calculateTransform } from '../../lib/cm93/coordinate-utils.js'
import { handle } from '../../lib/geojson/geojson.js'
import { stringifyAndClean } from '../../lib/geojson/utils.js';

const sampleName = '02190435'
const sampleNameBt = '03300840'

test('writing and reading buffer and converting to geojson', () => {
    const attrDictionary = new AttrDictionary(path.resolve('tests/resources/sample-attr.dic'))
    const objDictionary = new ObjDictionary(path.resolve('tests/resources/sample-obj.dic'))

    // writeSample partly manually writes the data from test/resources/sample-simple.json
    // the sample contains two triangles (1 polygon, 1 linestring) and one point
    const buffer = writeSample();

    let offset = 0
    let checksum
    [checksum, offset] = readChecksum(buffer, offset)
    expect(checksum).toBe(sampleFileLength)
    
    let header
    [header, offset] = readHeader(buffer, offset)
    expect(header).toStrictEqual(sampleHeader)

    const cellInfoBlock = {};
    offset = readVectorRecordTable(buffer, offset, header.usnVectorRecords, cellInfoBlock)
    offset = read2DPointTable(buffer, offset, header.usnPoint2dRecords, cellInfoBlock)
    offset = read3DPointTable(buffer, offset, header.usnPoint3dRecords, cellInfoBlock);
    offset = readFeatureRecordTable(buffer, offset, header.usnFeatureRecords, cellInfoBlock, attrDictionary);
    
    const cellInfo = calculateTransform(header)
    expect(cellInfo).toStrictEqual(sampleCellInfo)

    const errors = []
    const result = {header, cellInfo, cellInfoBlock, errors}

    expect(cellInfoBlock.edgeVectorDescriptorBlock.length).toBe(2)
    expect(cellInfoBlock.p2dpointArray.length).toBe(1)
    expect(cellInfoBlock.pobjectBlock.length).toBe(3)

    expect(cellInfoBlock.pobjectBlock).toStrictEqual(sampleFeatures)

    // testing the geojson conversion as well
    
    const filename = '02190435.D'
    const json = handle(result, objDictionary, {filename}, errors) // json contains Coordinate class, needs to be removed
    const jsonClean = JSON.parse(stringifyAndClean(json)).features
    
    const simpleClean = JSON.parse(fs.readFileSync(`tests/resources/${sampleName}.json`)).features
    
    expect(jsonClean).toStrictEqual(simpleClean);
});

test.skip('update sample binary data file', () => {
    const buffer = writeSample();
    
    fs.writeFileSync(`tests/resources/${sampleName}.D`, buffer,  "binary", function(err) {
        console.log('write error', err)
    });

    expect(1).toBe(0) // this test should be disabled and never succeed
})


test.skip('update sample binary data file', () => {
    const buffer = writeSample();
    
    fs.writeFileSync(`tests/resources/${sampleName}.D`, buffer,  "binary", function(err) {
        console.log('write error', err)
    });

    expect(1).toBe(0) // this test should be disabled and never succeed
})


test.skip('update sample-bt binary data file', () => {
    const buffer = writeSampleBt();
    
    fs.writeFileSync(`tests/resources/${sampleNameBt}.B`, buffer,  "binary", function(err) {
        console.log('write error', err)
    });

    expect(1).toBe(0) // this test should be disabled and never succeed
})