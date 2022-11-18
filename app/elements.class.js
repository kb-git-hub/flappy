import { generateQueryConstructor } from './utils.js'

class DOMElements {
    constructor() {
        generateQueryConstructor.call(this, ...arguments)
    }
}

export default DOMElements
