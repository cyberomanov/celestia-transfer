import {Balance, WalletItem} from "../datatypes/cosmos.js";
import {DEFAULT_DENOMINATION, DEFAULT_TOKEN_PREFIX, EXPLORER_TX_PATH, GAS_MULTIPLIER} from "../config.js";
import {Coin, coins} from "@cosmjs/proto-signing";
import {getCurrentTime} from "./other.js";
import {getWalletBalance} from "./cosmos-common.js";


export async function sendConsolidatedTransactions(walletItems: WalletItem[]) {
    const groupedBySender: { [p: string]: WalletItem[] } = groupBySender(walletItems)

    for (const sender in groupedBySender) {
        let messages, totalAmountToSend: Balance

        const itemsFromSameSender: WalletItem[] = groupedBySender[sender]

        const currentBalance: Balance = await getWalletBalance(itemsFromSameSender[0].client, sender)

        if (itemsFromSameSender.length == 1) {
            if (itemsFromSameSender[0].amount == -1) {
                totalAmountToSend = currentBalance
            } else {
                totalAmountToSend = {
                    int: itemsFromSameSender[0].amount * DEFAULT_DENOMINATION,
                    float: itemsFromSameSender[0].amount
                }
            }
            messages = createSingleMessage(itemsFromSameSender[0], totalAmountToSend)
        } else {
            totalAmountToSend = {
                int: Math.floor(itemsFromSameSender.reduce((sum, item) =>
                    sum + item.amount, 0) * DEFAULT_DENOMINATION),
                float: parseFloat((Math.floor(itemsFromSameSender.reduce((sum, item) =>
                    sum + item.amount, 0) * DEFAULT_DENOMINATION) / DEFAULT_DENOMINATION).toFixed(4))
            }

            messages = createMultipleMessages(itemsFromSameSender)
        }


        if (totalAmountToSend.int <= currentBalance.int) {
            const estimatedFee: number = await itemsFromSameSender[0].client.simulate(
                sender, messages, itemsFromSameSender[0].memo
            )

            const estimatedFeeAdjustment: number = Math.floor(estimatedFee * GAS_MULTIPLIER)
            const fee: { amount: Coin[], gas: string } = {
                amount: coins(estimatedFeeAdjustment, DEFAULT_TOKEN_PREFIX),
                gas: String(estimatedFeeAdjustment)
            }

            if (totalAmountToSend.int == currentBalance.int) {
                totalAmountToSend = {
                    int: currentBalance.int - estimatedFeeAdjustment,
                    float: parseFloat((Math.floor(currentBalance.int - estimatedFeeAdjustment) / DEFAULT_DENOMINATION).toFixed(4))
                }
                messages = createSingleMessage(itemsFromSameSender[0], totalAmountToSend)
            }

            if (totalAmountToSend.int + estimatedFeeAdjustment <= currentBalance.int) {
                const txHash: string = await itemsFromSameSender[0].client.signAndBroadcastSync(
                    sender, messages, fee, itemsFromSameSender[0].memo
                )

                console.log(`${getCurrentTime()} ${sender} -> ${totalAmountToSend.float} $TIA | fee: ${parseFloat((estimatedFeeAdjustment / DEFAULT_DENOMINATION).toFixed(4))} $TIA | ${EXPLORER_TX_PATH}/${txHash}`)
            } else {
                logInsufficientBalance(sender, totalAmountToSend.int, currentBalance.int)
            }
        } else {
            logInsufficientBalance(sender, totalAmountToSend.int, currentBalance.int)
        }
    }
}

function groupBySender(walletItems: WalletItem[]): { [p: string]: WalletItem[] } {
    const groupedBySender: { [address: string]: WalletItem[] } = {}
    for (const item of walletItems) {
        if (!groupedBySender[item.address]) {
            groupedBySender[item.address] = []
        }
        groupedBySender[item.address].push(item)
    }
    return groupedBySender
}

function logInsufficientBalance(sender: string, required: number, actual: number) {
    console.log(`${getCurrentTime()} ${sender}: the minimum balance should be: ${required} $${DEFAULT_TOKEN_PREFIX.toUpperCase()}, but it's only ${actual} $${DEFAULT_TOKEN_PREFIX.toUpperCase()}.`)
}

function createSingleMessage(itemsFromSameSender: WalletItem, totalAmountToSend: Balance) {
    return [{
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
            fromAddress: itemsFromSameSender.address,
            toAddress: itemsFromSameSender.recipient,
            amount: [{
                amount: Math.floor(totalAmountToSend.int).toString(),
                denom: DEFAULT_TOKEN_PREFIX
            }]
        },
    }]
}

function createMultipleMessages(itemsFromSameSender: WalletItem[]) {
    return itemsFromSameSender.map(item => ({
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
            fromAddress: itemsFromSameSender[0].address,
            toAddress: item.recipient,
            amount: [{
                amount: Math.floor(item.amount * DEFAULT_DENOMINATION).toString(),
                denom: DEFAULT_TOKEN_PREFIX
            }]
        },
    }))
}
