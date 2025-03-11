import { readFileSync } from 'fs';

export default class AttrDictionary {
    constructor(filePath) {
        this.dictionary = {};
        this.loadDictionary(filePath);
    }

    loadDictionary(filePath) {
        const data = readFileSync(filePath, 'utf8');
        const lines = data.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            const [name, idStr, type, ...rest] = trimmed.split('|');
            const id = parseInt(idStr, 10);

            this.dictionary[id] = { id, name, type }
        });
    }

    get(id) {
        return this.dictionary[id];
    }
}