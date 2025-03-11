import fs from 'fs'
import path from 'path'
import { CM93, HandlerFull, HandlerScan, HandlerIndex } from '../lib/cm93.js'
import AttrDictionary from '../lib/cm93/attr-dictionary.js'
import ObjDictionary from '../lib/cm93/obj-dictionary.js'

const args = parseArgs(process.argv)

const mode = args['mode']
let inputPath = args['-i'] || ''
let outputPath = args['-o'] || ''
const attrDictFilepath = args['-ad'] || path.join(inputPath, 'CM93ATTR.DIC')
const objDictFilepath = args['-od'] || path.join(inputPath, 'CM93OBJ.DIC')
const levels = args['-l'] || 'ZABCDEFG'
const inputDirs = args['-id']
const inputFiles = args['-if']
const outputFormat = args['-f'] || 'json'
const scanOutputFilename = args['-sf'] || 'folder-scan.json'
const indexOutputFilename = args['-ixf'] || 'index.json'
const debugLevel = args['-d'] || 0
const offsetX = args['-ox'] || 0
const offsetY = args['-oy'] || 0
const offset = {x:offsetX, y:offsetY}

checkArguments()

inputPath = inputPath.endsWith(path.sep) ? inputPath : inputPath + path.sep
outputPath = outputPath.endsWith(path.sep) ? outputPath : outputPath + path.sep

const options = {
    levels,
    debugLevel,
    outputFormat,
    scanOutputFilename,
    indexOutputFilename,
    offset,
}

const attrDictionary = new AttrDictionary(attrDictFilepath)
const objDictionary = new ObjDictionary(objDictFilepath)
let handler

if (mode == 'parse') {
    handler = new HandlerFull(inputPath, outputPath, objDictionary, options)
    console.log('Parsing...')
} else if (mode == 'scan') {
    options.onlyHeader = true
    handler = new HandlerScan(inputPath, outputPath, objDictionary, options)
    console.log('Scanning...')
} else if (mode == 'index') {
    handler = new HandlerIndex(inputPath, outputPath, objDictionary, options)
    console.log('Indexing...')
}

const cm93 = new CM93(handler, attrDictionary, options)
const files = cm93.createFilelist(inputPath, inputFiles, inputDirs, options.levels)

cm93.parseFiles(files)

function showHelpAndExit() {
    console.log('usage: node script.js -m <mode:scan|parse|index> -i <input-path> -o <output-path>')
    console.log('                      [-ad <attr-dict>] attribute dictionary, default CM93ATTR.DIC')
    console.log('                      [-od <obj-dict>] object dictionary, default CM93OBJ.DIC')
    console.log('                      [-l <levels>] levels to include, default ZABCDEFG')
    console.log('                      [-id <input-directories,>] folders to scan for files, comma separated, relative to input-path')
    console.log('                      [-if <input-files,>] files to parse, if empty, the input-path will be scanned')
    console.log('                      [-sf <fileName] scan output file name, relative to output-path, default folder-scan.json')
    console.log('                      [-ixf <fileName] index output file name, relative to output-path, default index.json')
    console.log('                      [-f <json|raw>] output format, default json')
    console.log('                      [-d <level>] debug level, default 0')
    console.log('                      [-ox <x>] offset x, default 0')
    console.log('                      [-oy <y>] offset y, default 0')

    process.exit()
}

function checkArguments() {
    if (!mode || !['parse', 'scan', 'index'].includes(mode)) {
        console.log('ERROR: missing <mode> :: parse|scan')
        return showHelpAndExit() 
    }
    if (!inputPath) {
        console.log('ERROR: missing -i <input path> :: the root folder of the data files')
        return showHelpAndExit() 
    }
    if (!outputPath) {
        console.log('ERROR: missing -o <output path> :: where json files will be written')
        return showHelpAndExit()
    }
    if (!fs.existsSync(inputPath)) {
        console.log(`ERROR: -o <input path> '${inputPath}' is not a directory`)
        return showHelpAndExit()
    }
    if (!fs.existsSync(outputPath)) {
        console.log(`ERROR: -o <output path> '${outputPath}' is not a directory`)
        return showHelpAndExit()
    }
    if (inputDirs && inputFiles) {
        console.log('ERROR: both -id <input-directories> and -if <input-files> cannot be supplied')
        return showHelpAndExit()
    }
}

function parseArgs(args) {
    if (args.length < 2) {
        return {}
    }
    const argMap = {}
    argMap['mode'] = args[2]
    for (let i = 3; i < args.length; i++) {
        const arg = args[i]
        if (arg[0] == "-" && args.length > i) {
            const value = args[i+1]
            argMap[arg] = value
            i++
        }
    }
    return argMap
}
