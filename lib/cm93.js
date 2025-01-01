import fs from 'fs'
import path from 'path'
import { parseFile } from './cm93/parser.js'
import { createFeatures } from './cm93/scanner.js'
import { handle } from './geojson/geojson.js'
import { createFeatureCollection, stringifyAndClean } from './geojson/utils.js'
import { getFiles, getShortFilepath, genOutfilename } from './cm93/scanner.js'

const defaultOptions = {
    levels: 'ZABCDEFG',
    outputFormat: 'json',
    scanOutputFilename: 'folder-scan.json',
    debugLevel: 0,
    onlyHeader: false,
    mode: 'full',
    offset: {x:0, y:0}
}

export class HandlerFull {
    constructor(inputPath, outputPath, objDictionary, options) {
        this.inputPath = inputPath
        this.outputPath = outputPath
        this.objDictionary = objDictionary
        this.options = {...defaultOptions, ...options}
        this.data = []
        this.errors = []
    }

    handleResult(dataFilePath, result, next) {
        if (this.options.outputFormat == 'json') {
            const filename = path.basename(dataFilePath)    
            const shortFilepath = getShortFilepath(this.inputPath, dataFilePath)
            const json = handle(result, this.objDictionary, {
                filename,
                filepath: shortFilepath,
                offset: this.options.offset
            }, this.errors)

            const outputFilePath = genOutfilename(this.inputPath, this.outputPath, dataFilePath)
            this._write(outputFilePath, stringifyAndClean(json), next)
        } else if (this.options.outputFormat == 'raw') {
            const outputFilePath = genOutfilename(this.inputPath, this.outputPath, dataFilePath, 'raw')
            this._write(outputFilePath, JSON.stringify(result, true, 2), next)
        } else {
            this.data.push(result)
            next()
        }
    }

    handleDone(next) {
        next()
    }

    getErrors() {
        return this.errors
    }

    getData() {
        return this.data
    }

    _write(filePath, content, next) {
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }

            if (this.options.debugLevel > 0) {
                console.log('wrote', filePath)
            }

            next(err)
        });
    }
}

export class HandlerScan {
    constructor(inputPath, outputPath, objDictionary, options) {
        this.inputPath = inputPath
        this.outputPath = outputPath
        this.objDictionary = objDictionary
        this.options = {...defaultOptions, ...options}
        this.scanOutputFilename = options.scanOutputFilename
        this.data = []
        this.errors = []
    }

    handleResult(dataFilePath, result, next) {
        this.data[dataFilePath] = result
        next()
    }

    handleDone(next) {
        if (this.options.outputFormat == 'json') {
            const filePath = path.join(this.outputPath, this.scanOutputFilename)
            const features = createFeatures(this.inputPath, this.outputFilepath, this.data)
            let content = stringifyAndClean(createFeatureCollection(features))
            this._write(filePath, content, next)
        } else {
            next()
        }
    }

    getErrors() {
        return this.errors
    }

    getData() {
        return this.data
    }

    _write(filePath, content, next) {
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }
            next(err)
        });
    }
}

export class CM93 {
    constructor(handler, attrDictionary, options) {
        this.handler = handler;
        this.attrDictionary = attrDictionary
        this.options = {...defaultOptions, ...options}
    }
    
    createFilelist(inputPath, inputFiles, inputDirs, levels) {
        return getFiles(inputPath, inputFiles, inputDirs, levels);
    }

    parseFiles(files) {
        this.fileIndex = 0
        this.fileWrittenIndex = 0
        this.files = files
        this.totalFiles = files.length
        this.errors = []
        this.handler.errors = []

        this._parseNextFile()
    }

    _parseNextFile() {
        if (this.fileIndex < this.totalFiles) {
            const dataFilepath = this.files[this.fileIndex]
            logStatus(dataFilepath, this.fileIndex, this.totalFiles, this.options.debugLevel)
        
            parseFile(dataFilepath, this.attrDictionary, this.options, (result) => {
                this.fileIndex++
                if (result.errors.length > 0) {
                    this.errors = this.errors.concat(result.errors)
                    this._parseNextFile()
                } else {
                    this.handler.handleResult(dataFilepath, result, () => this._parseNextFile())
                }
            })
        } else {
            this.handler.handleDone(() => this._parseFilesDone())
        }
    }

    _parseFilesDone() {
        console.log('') // new line since progress writes without endline
        
        if (this.errors.length > 0) {
            console.log('Errors:')
            console.log(this.errors)
        }
        if (this.handler.errors.length > 0) {
            console.log('Handler Errors:')
            console.log(this.handler.getErrors())
        }

    }
}

function format(num, pad) {
    return `${num.toString().padStart(pad, ' ')}`;
}

function logStatus(dataFilePath, fileIndex, totalFiles, debugLevel) {
    fileIndex+=1 // file number rather than index
    const percentRead = Math.floor(100 * fileIndex / totalFiles)
    
    const text = `${format(percentRead, 3)}% ${format(fileIndex, 15)}/${totalFiles} ${dataFilePath}`
    if (debugLevel > 0) {
        console.log(text)
    } else {
        process.stdout.write(`\r${text}`)
    }
}