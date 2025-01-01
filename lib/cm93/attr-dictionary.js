import { readFileSync } from 'fs';

export default class AttrDictionary {
    constructor(filePath) {
        this.idToAttrNameMap = {};
        this.idToClassNameMap = {};
        this.idToTypeCharMap = {};
        this.m_max_attr = 0;
        this.m_max_class = 0;

        this.loadDictionary(filePath)
    }

    typeToChar(type) {
        switch (type) {
            case "aFLOAT": return 'R';
            case "aBYTE": return 'B';
            case "aSTRING": return 'S';
            case "aCMPLX": return 'C';
            case "aWORD10": return 'W';
            case "aLONG": return 'G';
            case "aLIST": return 'L';
            case "aNotUsed": return '?';
            default: return '?';
        }
    }

    loadDictionary(filePath) {
        const data = readFileSync(filePath, 'utf8');
        const lines = data.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.length === 0) return;

            const tokens = trimmed.split('|');
            if (tokens.length < 3) {
                console.warn(`Malformed dictionary line: ${line}`);
                return;
            }

            const name = tokens[0].trim();
            const id = parseInt(tokens[1].trim(), 10);
            const type = tokens[2].trim();
            const typeChar = this.typeToChar(type);

            this.idToAttrNameMap[id] = name;
            this.idToTypeCharMap[id] = typeChar;

            if (id > this.m_max_attr) {
                this.m_max_attr = id;
            }
        });

        return true;
    }

    getAttrName(id) {
        return this.idToAttrNameMap[id] || "UnknownAttr";
    }

    getAttrType(id) {
        return this.idToTypeCharMap[id] || '?';
    }

    getClassName(id) {
        return this.idToClassNameMap[id] || "Unknown";
    }
}