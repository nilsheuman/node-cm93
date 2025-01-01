
/*
Coordinates class allows json export to be pretty printed while keeping Coordinates on one line
Pretty printing returns a string of the list, so the quotes need to be removed around the list

    JSON.stringify(json, true, 2).replace(/"(\[.*?\])"/g, (_, match) => match)

*/
export class Coordinates {
    constructor(list) {
        this.list = list
    }
    toJSON() {
        return JSON.stringify(this.list)
    }
}
