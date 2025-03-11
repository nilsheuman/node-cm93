import { readFileSync } from 'fs';

export default class ObjDictionary {
    constructor(filePath) {
        this.dictionary = {}
        this.loadDictionary(filePath)
    }

    loadDictionary(filePath) {
        const data = readFileSync(filePath, 'utf8');
        const lines = data.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            const [name, idStr, type, geoTypeStr, label, ...rest] = trimmed.split('|');
            const id = parseInt(idStr, 10);
            const geoType = parseInt(geoTypeStr, 10);

            this.dictionary[id] = { id, name, type, geoType, label }
        });
    }

    get(id) {
        return this.dictionary[id]
    }
}
