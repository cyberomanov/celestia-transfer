import {DirectSecp256k1HdWallet, DirectSecp256k1Wallet} from "@cosmjs/proto-signing"
import {SigningStargateClient} from "@cosmjs/stargate"


export type Balance = {
    int: number
    float: number
}

export type WalletItem = {
    client: SigningStargateClient
    wallet: DirectSecp256k1HdWallet | DirectSecp256k1Wallet
    address: string
    recipient: string
    amount: number
}
