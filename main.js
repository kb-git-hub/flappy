import DOMConfig from './app/dom-config.js'
import DOMElements from './app/elements.class.js'
import Game from './app/game.class.js'
import gameConfig from './app/game-config.js'
import { randomNumber, detectCollision, getCSSProp, randomHoleGenerator, roundNum } from './app/utils.js'

const domEl = new DOMElements(DOMConfig)
const game = new Game(gameConfig)

const startBGAnimation = () => {
    domEl.game.style.animation = `backgroundAnimation 2s infinite linear`
}

const stopBGAnimation = () => {
    domEl.game.style.animation = ``
}

const showGameOverScreen = () => {
    domEl.gameOverScreen.style.display = ''
    const finalScore = domEl.gameOverScreen.querySelector('.finalScore')
    finalScore.textContent = `Final Score: ${game.scoreTotal.toString()}`
}
const hideGameOverScreen = () => {
    domEl.gameOverScreen.style.display = 'none'
}

const resetCharacterPosition = () => {
    domEl.character.style.top = `30vh`
    domEl.character.style.left = `25vw`
}

const stopBlockAnimation = () => {
    const blockLeft = domEl.block.getBoundingClientRect().x
    domEl.block.style.animation = ''
    domEl.hole.style.animation = ''

    domEl.block.style.left = `${blockLeft}px`
    domEl.hole.style.left = `${blockLeft}px`
}

const hideStar = () => {
    domEl.star.style.display = 'none'
}

const showStar = () => {
    if (domEl.star.style.display !== 'none') return

    domEl.star.style.display = ''
    domEl.star.style.top = `${randomNumber(20, 70)}vh`
}

function gameOver() {
    new Audio('/sounds/sounds_gameover.wav').play()
    game.gameStopped = true
    showGameOverScreen()
    stopBlockAnimation()
    hideStar()
    stopBGAnimation()
}

// SCORE UI

const changeScoreUI = () => {
    domEl.liveScore.innerText = `Score: ${game.scoreTotal.toString()}`
}

const handleCharacterAnimation = (direction) => {
    if (direction === 'down') {
        domEl.character.classList.remove('go-up')
        domEl.character.classList.add('go-down')
    } else if (direction === 'up') {
        domEl.character.classList.add('go-up')
        domEl.character.classList.remove('go-down')
    }
}

const handleCharacterPosition = (diff) => {
    const charTop = parseInt(getCSSProp(domEl.character, 'top'), 10)

    const changeTop = charTop + diff
    if (changeTop < 0) return
    if (changeTop > window.innerHeight) gameOver()
    domEl.character.style.top = `${changeTop}px`
}

const handleCharacterCollision = () => {
    const collisionBlock = detectCollision(domEl.character, domEl.block)
    const collisionHole = detectCollision(domEl.character, domEl.hole, { y1: -46, y2: 47 })

    if (collisionBlock && !collisionHole) gameOver()

    if (collisionHole) {
        game.scoreTotal += 1
        game.soundCount += 1
        if (game.soundCount > 35) {
            new Audio('/sounds/sounds_hole.wav').play()
            game.soundCount = 0

            // playSound
        }
        changeScoreUI()

        if (game.gameStopped) return

        game.numOfHoles += 1
        if (game.numOfHoles > 150) {
            game.numOfHoles = 0
        }

        showStar()
        setTimeout(() => {
            hideStar()
        }, 1500)
    }
}

const resetAnimations = (speed) => {
    const seconds = roundNum(window.innerWidth / speed)

    const blockAnimation = `blockAnimation ${seconds}s infinite linear`
    domEl.block.style.animation = blockAnimation
    domEl.hole.style.animation = blockAnimation

    if (domEl.star.style.display !== 'none') return

    const starNum = randomNumber(1, 5)
    const starAnimationCSS = `starAnimation${starNum} ${seconds}s infinite linear`
    domEl.star.style.animation = starAnimationCSS
}

const handleGameSpeed = () => {
    let doReset = false
    let newGameSpeed = ''

    if (game.scoreTotal > 400) {
        newGameSpeed = 'insane'
        doReset = true
    } else if (game.scoreTotal > 300) {
        newGameSpeed = 'superFast'
        doReset = true
    } else if (game.scoreTotal > 200) {
        newGameSpeed = 'fast'
        doReset = true
    } else if (game.scoreTotal > 20) {
        newGameSpeed = 'normal'
        doReset = true
    }

    if (doReset) {
        const timeoutLength = game.gameSpeed[newGameSpeed] * (game.gameSpeed[newGameSpeed] / 100)
        setTimeout(() => {
            if (game.gameStopped) return
            resetAnimations(game.gameSpeed[newGameSpeed])
        }, timeoutLength)
    }
}

const handleStarDetection = () => {
    if (domEl.star.style.display === 'none') return

    if (detectCollision(domEl.character, domEl.star)) {
        game.scoreTotal += 150
        hideStar()
        changeScoreUI()
        new Audio('/sounds/sounds_star.wav').play()
    }
}

// called every x milliseconds
const changeGameState = ({ diff, direction }) => {
    handleStarDetection()
    handleGameSpeed()
    handleCharacterAnimation(direction)
    handleCharacterCollision()
    handleCharacterPosition(diff)
}

const initRandomHoles = () => {
    domEl.hole.addEventListener('animationiteration', () => {
        domEl.hole.style.top = randomHoleGenerator()
    })
}

function beginGravity() {
    setInterval(() => {
        if (game.charIsJumping || game.gameStopped) return
        changeGameState({ diff: 5, direction: 'down' })
    }, 20)
}

const characterJump = () => {
    game.charIsJumping = true
    let jumpCount = 0

    const jumpInterval = setInterval(() => {
        changeGameState({ diff: -3, direction: 'up' })
        if (jumpCount > 20) {
            new Audio('/sounds/sounds_fly.wav').play()
            clearInterval(jumpInterval)
            game.charIsJumping = false
            jumpCount = 0
        }
        jumpCount += 1
    }, 10)
}

const setEventListeners = () => {
    window.addEventListener('resize', () => {
        if (game.gameStopped) return
        resetAnimations()
    })

    document.documentElement.addEventListener('click', () => {
        if (game.gameStopped) return
        characterJump()
    })

    document.onkeydown = (e) => {
        if (game.gameStopped) return
        if (e.code === 'Space') characterJump()
    }

    domEl.gameOverScreen.querySelector('button').addEventListener('click', (e) => {
        game.scoreTotal = 0
        hideGameOverScreen()
        changeScoreUI()
        resetCharacterPosition()
        initRandomHoles()
        beginGravity()
        resetAnimations(game.gameSpeed.slow)
        startBGAnimation()

        setTimeout(() => {
            game.gameStopped = false
        }, 0)
    })
}

const gameInit = () => {
    initRandomHoles()
    setEventListeners()
    beginGravity()
    resetAnimations(game.gameSpeed.slow)
    startBGAnimation()
}

gameInit()

Object.assign(window, detectCollision)
