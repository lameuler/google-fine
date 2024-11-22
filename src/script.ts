import { Big } from 'big.js'

function calc(d?: number) {
    d = d ?? Date.now()
    const exp = (d - 1_668_900_000_000)/604_800_000
    const rounded = Math.floor(exp)
    return Big(2).pow(rounded).times(2**(exp-rounded)).times(700_000)
}

const SUFFIXES = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'unvigintillion', 'duovigintillion', 'trevigintillion', 'quattuorvigintillion', 'quinvigintillion', 'sexvigintillion', 'septenvigintillion', 'octovigintillion', 'novemvigintillion', 'trigintillion']

async function fetchRate() {
    let rate = 0.010279969
    try {
        const res = await fetch('https://latest.currency-api.pages.dev/v1/currencies/rub.min.json')
        const data = await res.json()
        rate = data?.['rub']?.['usd'] ?? rate
    } catch {}
    return rate
}

async function run() {
    const rate = await fetchRate()

    let usd = false
    let paused = false
    let saved: Big | null = null

    const valueElement = document.getElementById('value')
    const displayElement = document.getElementById('display')
    if (!valueElement || !displayElement) {
        throw new Error('failed to load elements')
    }

    const callback = () => {
        const value = paused && saved ? saved : calc()
        if (paused) {
            saved = value
            if (!document.body.classList.contains('paused')) {
                document.body.classList.add('paused')
            }
        } else if (document.body.classList.contains('paused')) {
            saved = null
            document.body.classList.remove('paused')
        }
        const converted = usd ? value.times(rate) : value
        const str = converted.toFixed(0)
        let parts = []
        for (let i = str.length; i > 0; i-=3) {
            parts.unshift(str.substring(i-3, i))
        }
        const roundorder = Math.floor((str.length-1)/3)*3
        const suffix = ' ' + SUFFIXES[roundorder/3] + (usd ? ' dollars' : ' rubles')

        const valueText = usd ? '$ ' + parts.join(',\u200B') : parts.join(',\u200B') + ' \u20BD'
        if (!paused || valueElement.innerText !== valueText) {
            valueElement.innerText = valueText
        }
        const displayText = converted.div(Big(10).pow(roundorder)).toPrecision(3) + suffix
        if (displayElement.innerText !== displayText) {
            displayElement.innerText = displayText
        }
        requestAnimationFrame(callback)
    }
    requestAnimationFrame(callback)

    const rubleInput = document.getElementById('ruble')
    const usdInput = document.getElementById('usd')
    if (rubleInput instanceof HTMLInputElement && usdInput instanceof HTMLInputElement) {
        const listener = () => {
            usd = usdInput.checked
        }
        usdInput.addEventListener('input', listener)
        rubleInput.addEventListener('input', listener)
    }

    document.getElementById('pause')?.addEventListener('click', () => paused = true)
    document.getElementById('resume')?.addEventListener('click', () => paused = false)
}

run()