import {Balance, WalletItem} from "datatypes/cosmos.js"
import {
    DEFAULT_DENOMINATION,
    DEFAULT_ADDRESS_PREFIX,
    DEFAULT_TOKEN_PREFIX
} from "../config.js"
import {DirectSecp256k1HdWallet, coins, Coin, DirectSecp256k1Wallet} from "@cosmjs/proto-signing"
import {SigningStargateClient} from "@cosmjs/stargate"
import {identifyInput, sleep, getCurrentTime} from "./other.js"


export async function getWalletFromString(string: string): Promise<DirectSecp256k1HdWallet | DirectSecp256k1Wallet> {
    if (identifyInput(string) === 'private_key') {
        return await DirectSecp256k1Wallet.fromKey(new Uint8Array(string.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))), DEFAULT_ADDRESS_PREFIX)
    } else {
        return await DirectSecp256k1HdWallet.fromMnemonic(string, {prefix: DEFAULT_ADDRESS_PREFIX})
    }
}

export async function getWalletItems(strings: string[], rpcEndpoint: string): Promise<WalletItem[]> {
    const itemsPromises: Promise<WalletItem>[] = strings.map(async (mnemonic_string) => {
        let mnemonic: string = mnemonic_string.split('##')[0]
        let recipient: string = mnemonic_string.split('##')[1]
        let amount: string = mnemonic_string.split('##')[2]
        let memo: string = mnemonic_string.split('##')[3] ?? '';

        let wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet = await getWalletFromString(mnemonic)
        const client: SigningStargateClient = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet)
        const [account] = await wallet.getAccounts()

        return {
            client: client,
            wallet: wallet,
            address: account.address,
            recipient: recipient,
            amount: parseFloat(amount),
            memo: memo
        }
    })

    return Promise.all(itemsPromises)
}

export async function getWalletBalance(client: SigningStargateClient, address: string): Promise<Balance> {
    let balance: Coin = await client.getBalance(address, DEFAULT_TOKEN_PREFIX)

    return {
        int: parseInt(balance.amount),
        float: parseFloat((parseInt(balance.amount) / DEFAULT_DENOMINATION).toFixed(4))
    }
}

export async function printBalances(walletItems: WalletItem[], to_send: boolean = true, recipient: boolean = false): Promise<void> {
    for (const item of walletItems) {
        const donor_balance: Balance = await getWalletBalance(item.client, item.address)
        const recipient_balance: Balance = await getWalletBalance(item.client, item.recipient)
        if (to_send) {
            console.log(`${getCurrentTime()} ${item.address}: ${donor_balance.float} $TIA | ${item.amount} $TIA to ${item.recipient}.`)
        } else {
            console.log(`${getCurrentTime()} ${item.address}: ${donor_balance.float} $TIA.`)
        }

        if (recipient) {
            console.log(`${getCurrentTime()} ${item.recipient}: ${recipient_balance.float} $TIA.`)
        }
    }
}

export async function untilSinglePositiveBalance(item: WalletItem): Promise<void> {
    let donor_balance

    do {
        donor_balance = await getWalletBalance(item.client, item.address)

        if (donor_balance.int <= 0) {
            console.log(`${getCurrentTime()} ${item.address}: ${donor_balance.float} $TIA, waiting for any balance.`)
            await sleep(1500, false)
        }
    } while (donor_balance.int <= 0)

    console.log(`${getCurrentTime()} ${item.address}: ${donor_balance.float} $TIA | ${item.amount} $TIA to ${item.recipient}.`)
}

export async function untilPositiveBalance(walletItems: WalletItem[]) {
    for (const item of walletItems) {
        await untilSinglePositiveBalance(item)
    }
}


