import fs from 'fs'
import path from 'path'
import { Coordinates } from '../geojson/coordinates.js'
import { getSortKey } from '../geojson/utils.js'

const colors = [
        ['Beige', '#fffac8'],
        ['Blue', '#4363d8'],
        ['Brown', '#9A6324'],
        ['Orange', '#f58231'],
        ['Purple', '#911eb4'],
        ['Cyan', '#42d4f4'],
        ['Pink', '#fabed4'],
        ['Green', '#3cb44b'],
        ['Red', '#e6194B'],
        ['Yellow', '#ffe119'],
        ['Teal', '#469990'],
        ['Maroon', '#800000'],
        ['Olive', '#808000'],
        ['Apricot', '#ffd8b1'],
        ['Navy', '#000075'],
        ['Grey', '#a9a9a9'],
    ]

// remove inputPath and convert / to _, add .json
export function genOutfilename(inputPath, outputPath, dataFilepath, format='') {
    return outputPath + dataFilepath.replace(inputPath, "").replace(/\/+/g, "_") + format + ".json"
}

export function getShortFilepath(inputPath, filepath) {
    return filepath.replace(inputPath, "")
}

export function isZoomFile(file, levels) {
    return file.length == 1 && levels.includes(file)
}

export function listFilesInFolder(folderpath, levels) {
    const patternDataFile = /([A-Za-z0-9]\d+)\.([A-Za-z])$/
    const patternDataFolder = /([A-Za-z0-9]{8})$/
    let fileList = []
    const files = fs.readdirSync(folderpath)
    files.forEach(file => {
        const filepath = path.join(folderpath,file)
        const isDirectory = fs.lstatSync(filepath).isDirectory()
        if (isDirectory && (isZoomFile(file, levels) || file.match(patternDataFolder))) {
            fileList = fileList.concat(listFilesInFolder(filepath, levels))
        } else if (file.match(patternDataFile) && !isDirectory) {
            fileList.push(filepath)
        }
    })
    return fileList
}

export function getFiles(inputPath, inputFiles, inputDirs, levels) {
    let files = []
    if (inputFiles) {
        // add specified files
        files = inputFiles.split(',').map(f => inputPath + f)
    } else if (inputDirs) {
        // scan specified directories
        const dirs = inputDirs.split(',')
        dirs.forEach(dir => {
            const p = path.join(inputPath, dir)
            files = files.concat( listFilesInFolder(p, levels) )
        })
    } else {
        // scan base path
        files = listFilesInFolder(inputPath, levels)
    }
    return files
}

export function createFeature(id, name, filepath, sortKey, coordinates, color, type, scanType) {
    return {
        "type": "Feature",
        "properties": {
            "id": id,
            "name": name,
            "filepath": filepath,
            "sortKey": sortKey,
            "color": color,
            "scanType": scanType,
        },
        "geometry": {
            "coordinates": new Coordinates(coordinates),
            "type": type,
        }
    }
}

export function createFeatures(inputPath, outputFilepath, allData) {
    let shapeFeatures = [] // squares
    let textFeatures = [] // center points for text

    Object.entries(allData).forEach(([filepath, data, index]) => {
        const name = path.basename(filepath)
        const shortFilepath = getShortFilepath(inputPath, filepath)
        const sortKey = getSortKey(name)
        let color = 'rgb(200,200,200)'
        try {
            color = colors[sortKey][1]
        } catch(e) {
            console.log('sortKey color error', name, sortKey, e)
        }
        
        const id = index
        const minMax = data.header
        const coordinates = [[
            [minMax.lonMin, minMax.latMin],
            [minMax.lonMax, minMax.latMin],
            [minMax.lonMax, minMax.latMax],
            [minMax.lonMin, minMax.latMax],
            [minMax.lonMin, minMax.latMin],
        ]]
        shapeFeatures.push(createFeature(id, name, shortFilepath, sortKey, coordinates, color, "Polygon", "scanArea"))
        textFeatures.push(createFeature(id, name, shortFilepath, sortKey, coordinates[0][0], color, "Point", "scanPoint"))
    })

    return shapeFeatures.concat(textFeatures)
}