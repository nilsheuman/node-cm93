import fs from 'fs';

export default class ObjDictionary {
    constructor(filePath) {
        this.dictionary = {}
        this.loadDictionary(filePath)
    }

    loadDictionary(filePath) {
        const data = fs.readFileSync(filePath, 'utf8');
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
            const label = tokens[4].trim();
            const entry = {
                id, name, label,
                columns: tokens.slice(5)
            }

            if (id !== undefined) {
                this.dictionary[id] = entry
            }
        })
        return true;

    }

    get(id) {
        return this.dictionary[id]
    }
}
