import {Balance, WalletItem} from "datatypes/cosmos.js"
import {
    DEFAULT_DENOMINATION,
    DEFAULT_ADDRESS_PREFIX,
    DEFAULT_TOKEN_PREFIX,
    GAS_MULTIPLIER,
    EXPLORER_TX_PATH
} from "../config.js"
import {DirectSecp256k1HdWallet, coins, Coin} from "@cosmjs/proto-signing"
import {SigningStargateClient} from "@cosmjs/stargate";
import {sleep} from "./other.js";


export async function getWalletItems(strings: string[], rpcEndpoint: string): Promise<WalletItem[]> {
    const itemsPromises: Promise<WalletItem>[] = strings.map(async (mnemonic_string) => {
        let mnemonic: string = mnemonic_string.split('##')[0];
        let recipient: string = mnemonic_string.split('##')[1];
        let amount: string = mnemonic_string.split('##')[2];

        const wallet: DirectSecp256k1HdWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {prefix: DEFAULT_ADDRESS_PREFIX});
        const client: SigningStargateClient = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet)

        const [account] = await wallet.getAccounts()

        return {
            client: client,
            wallet: wallet,
            address: account.address,
            recipient: recipient,
            amount: parseFloat(amount)
        };
    });

    return Promise.all(itemsPromises);
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
            console.log(`${item.address}: ${donor_balance.float} $TIA | ${item.amount} $TIA to ${item.recipient}.`)
        } else {
            console.log(`${item.address}: ${donor_balance.float} $TIA.`)
        }

        if (recipient) {
            console.log(`${item.recipient}: ${recipient_balance.float} $TIA.\n`)
        }
    }
}

export async function untilSinglePositiveBalance(item: WalletItem): Promise<void> {
    let donor_balance;
    do {
        donor_balance = await getWalletBalance(item.client, item.address);

        if (donor_balance.int <= 0) {
            console.log(`${item.address}: ${donor_balance.float} $TIA, waiting for any balance.`)
            await sleep(1500, false);
        }
    } while (donor_balance.int <= 0);

    console.log(`${item.address}: ${donor_balance.float} $TIA | ${item.amount} $TIA to ${item.recipient}.`)
}

export async function untilPositiveBalance(walletItems: WalletItem[]) {
    for (const item of walletItems) {
        await untilSinglePositiveBalance(item);
    }
}


export async function sendConsolidatedTransactions(walletItems: WalletItem[]) {
    const groupedBySender: { [address: string]: WalletItem[] } = {};
    for (const item of walletItems) {
        if (!groupedBySender[item.address]) {
            groupedBySender[item.address] = [];
        }
        groupedBySender[item.address].push(item);
    }

    for (const sender in groupedBySender) {
        const itemsFromSameSender: WalletItem[] = groupedBySender[sender];

        const totalAmountToSend: Balance = {
            int: Math.floor(itemsFromSameSender.reduce((sum, item) =>
                sum + item.amount, 0) * DEFAULT_DENOMINATION),
            float: parseFloat((Math.floor(itemsFromSameSender.reduce((sum, item) =>
                sum + item.amount, 0) * DEFAULT_DENOMINATION) / DEFAULT_DENOMINATION).toFixed(4))
        }
        const currentBalance = await getWalletBalance(itemsFromSameSender[0].client, sender);

        const messages = itemsFromSameSender.map(item => ({
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: {
                fromAddress: sender,
                toAddress: item.recipient,
                amount: [{
                    amount: Math.floor(item.amount * DEFAULT_DENOMINATION).toString(),
                    denom: DEFAULT_TOKEN_PREFIX
                }]
            },
        }));

        if (totalAmountToSend.int < currentBalance.int) {
            const estimatedFee: number = await itemsFromSameSender[0].client.simulate(sender, messages, '');

            const estimatedFeeAdjustment = Math.floor(estimatedFee * GAS_MULTIPLIER)
            const fee: { amount: Coin[], gas: string } = {
                amount: coins(estimatedFeeAdjustment, DEFAULT_TOKEN_PREFIX),
                gas: String(estimatedFeeAdjustment)
            };


            if (totalAmountToSend.int + estimatedFeeAdjustment < currentBalance.int) {
                const txHash: string = await itemsFromSameSender[0].client.signAndBroadcastSync(sender, messages, fee, '');
                console.log(`${sender} -> ${totalAmountToSend.float} $TIA | fee: ${parseFloat((estimatedFeeAdjustment / DEFAULT_DENOMINATION).toFixed(4))} $TIA | ${EXPLORER_TX_PATH}/${txHash}`)
            } else {
                console.log(`${sender}: the minimum balance should be: ${totalAmountToSend.int + estimatedFeeAdjustment} $${DEFAULT_TOKEN_PREFIX.toUpperCase()}, but it's only ${currentBalance.int} $${DEFAULT_TOKEN_PREFIX.toUpperCase()}.`)
            }
        } else {
            console.log(`${sender}: the minimum balance should be: ${totalAmountToSend.int} $${DEFAULT_TOKEN_PREFIX.toUpperCase()}, but it's only ${currentBalance.int} $${DEFAULT_TOKEN_PREFIX.toUpperCase()}.`)
        }
    }
}