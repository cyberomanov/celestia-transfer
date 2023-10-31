import {getWalletItems, printBalances, untilPositiveBalance} from "./utils/cosmos-common.js"
import {sendConsolidatedTransactions} from "./utils/cosmos-tx.js"
import {readFile, sleep, until5SecLeft} from "./utils/other.js"

import {WalletItem} from "./datatypes/cosmos.js"
import {GENESIS_TIMESTAMP, RPC_ENDPOINT} from "./config.js"


async function main() {
    let fileStrings: string[] = readFile("../.././data/mnemonic.txt")
    let walletItems: WalletItem[] = await getWalletItems(fileStrings, RPC_ENDPOINT)

    await until5SecLeft(GENESIS_TIMESTAMP)


    console.log('\n/////// BALANCE ///////\n')
    await untilPositiveBalance(walletItems)

    console.log('\n/////// TRANSFER ///////\n')
    await sendConsolidatedTransactions(walletItems)

    console.log()
    await sleep(30_000)

    console.log('\n/////// BALANCE ///////\n')
    await printBalances(walletItems, true, true)
    await sleep(1_000, false)
    console.log('\nwith love by @cyberomanov.\n')
}

await main()