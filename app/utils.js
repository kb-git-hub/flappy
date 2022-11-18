function generateQueryConstructor(query) {
    const keys = Object.keys(query)
    const values = Object.values(query)
    for (let i = 0; i < keys.length; i += 1) this[keys[i]] = values[i]
}

const randomHoleGenerator = () => {
    // desktop values
    // const bottom = 450
    // const top = 730

    // for Mobile
    const fromHeight = (62 * window.innerHeight) / 100
    const toHeight = (95 * window.innerHeight) / 100

    const result = -(Math.floor(Math.random() * (toHeight - fromHeight + 1)) + fromHeight)
    return `${result}px`
}

const getCSSProp = (element, property) => window.getComputedStyle(element).getPropertyValue(property)

const detectCollision = (el1, el2, extra) => {
    const rect1 = el1.getBoundingClientRect()
    const rect2 = el2.getBoundingClientRect()

    extra = extra || {
        y1: 0,
        y2: 0,
    }

    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height + extra.y1 &&
        rect1.y + rect1.height > rect2.y + extra.y2
    )
}

const roundNum = (num, decimals = 2) => Math.round((num + Number.EPSILON) * 10 ** decimals) / 10 ** decimals

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min)

export { randomNumber, generateQueryConstructor, randomHoleGenerator, getCSSProp, detectCollision, roundNum }
