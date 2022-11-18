import { generateQueryConstructor } from './utils.js'

class Game {
    constructor() {
        generateQueryConstructor.call(this, ...arguments)
    }
}

export default Game
