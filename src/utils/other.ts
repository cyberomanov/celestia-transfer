import {GENESIS_TIMESTAMP} from '../config.js'
import * as fs from 'fs'
import path from "path"
import {fileURLToPath} from "url"

export function readFile(relativeFilePath: string): string[] {
    try {
        const currentDir: string = path.dirname(fileURLToPath(new URL(import.meta.url)))
        const filePath: string = path.join(currentDir, relativeFilePath)

        const fileContent: string = fs.readFileSync(filePath, 'utf-8')
        return fileContent.split('\n').map(line => line.trim()).filter(line => line !== '')
    } catch (error: any) {
        console.error(`${getCurrentTime()} error reading the file: ${error.message}`)
        return []
    }
}

function formatTimeLeft(milliseconds: number): string {
    const totalSeconds: number = Math.floor(milliseconds / 1000)
    const hours: number = Math.floor(totalSeconds / 3600)
    const minutes: number = Math.floor((totalSeconds % 3600) / 60)
    const seconds: number = totalSeconds % 60

    return `${hours}h ${minutes}m ${seconds}s`
}

export function until5SecLeft(targetTimestamp: number): Promise<void> {
    return new Promise((resolve) => {
        let intervalId: any

        function _check() {
            const now: number = Date.now()
            const timeLeft: number = targetTimestamp - now
            const genTime: Date = new Date(GENESIS_TIMESTAMP)


            console.log(`${getCurrentTime()} genesis time is in the future. sleeping until then... ${genTime.toLocaleDateString()} ${genTime.toLocaleTimeString()} | ${formatTimeLeft(timeLeft)} left.`)

            if (timeLeft <= 5 * 1000) {
                clearInterval(intervalId)
                resolve()
                return
            }

            if (timeLeft > 2 * 60 * 1000) {
                clearInterval(intervalId)
                intervalId = setInterval(_check, 60 * 1000)
            } else if (timeLeft > 60 * 1000) {
                clearInterval(intervalId)
                intervalId = setInterval(_check, 5 * 1000)
            } else if (timeLeft > 15 * 1000) {
                clearInterval(intervalId)
                intervalId = setInterval(_check, 1000)
            }
        }

        _check()
    })
}

export function sleep(ms: number, log: boolean = true): Promise<void> {
    log && console.log(`${getCurrentTime()} sleep ${Math.floor(ms / 1000)} sec.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}


export function identifyInput(input: string): "private_key" | "mnemonic_phrase" {
    const privateKeyRegex: RegExp = /^[0-9a-fA-F]{64}$/

    if (privateKeyRegex.test(input)) {
        return "private_key"
    } else {
        return "mnemonic_phrase"
    }
}

export function getCurrentTime(): string {
    const now: Date = new Date()
    const hours: string = now.getHours().toString().padStart(2, '0')
    const minutes: string = now.getMinutes().toString().padStart(2, '0')
    const seconds: string = now.getSeconds().toString().padStart(2, '0')
    const milliseconds: string = now.getMilliseconds().toString().padStart(3, '0')
    return `[${hours}:${minutes}:${seconds}.${milliseconds}]`
}
