# Celestia Transfer

A TypeScript-based tool for interacting with the Celestia blockchain using the CosmJS library.

## Logic
- Reads mnemonic phrases from a `data/mnemonic.txt`;
- Waits for a specified genesis timestamp before proceeding;
- Waits the positive balances of wallets;
- Sends transactions from donors to recipients;
- Prints the new balances of wallets again.

## Feature: Batch Transactions

This script is capable of bundling multiple messages into a single transaction, allowing you to send tokens from one wallet to multiple different wallets in one action. 

To utilize this feature, simply create a new line in `data/mnemonic.txt` with the same sender (donor mnemonic), but a new recipient and a new amount of tokens.

## Important Note on RPC Endpoint and Explorer Path

The `RPC_ENDPOINT` and `EXPLORER_TX_PATH` values provided in the `src/config.js` file are set for the testnet. It's imperative that every user of this script specifies their own values for these configurations.

1. **RPC Endpoint:** If everyone uses the same RPC endpoint, it will likely become overloaded and fail, resulting in unsuccessful transactions. Moreover, as of now, there are no publicly available mainnet RPC endpoints since the mainnet has not been launched yet. The functionality of this script heavily relies on the RPC endpoint, hence ensure to provide a reliable and unique endpoint for your use.


2. **Explorer Transaction Path:** Similar to the RPC endpoint, ensure to set the `EXPLORER_TX_PATH` to a suitable value based on your network (testnet/mainnet).

Please treat these configurations with utmost attention to ensure the proper functionality of the script.

## Installation

Ensure you have [Node.js v20.5.1](https://nodejs.org/) or newer installed on your machine, then follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/cyberomanov/celestia-transfer.git
    cd celestia-transfer/
    ```

2. Install the dependencies (`@cosmjs/proto-signing: ^0.31.1`, `@cosmjs/stargate: ^0.31.1`):
    ```bash
    npm install
    ```

3. Install TypeScript globally (if you haven't already):
    ```bash
    npm install -g typescript
    ```

4. Prepare your `data/mnemonic.txt` file with the mnemonic phrases, recipients and amount to transfer (you can use the same mnemonic with several unique recipients).<br><br>
   A memo is required for depositing funds on certain centralized exchanges. However, if you don't wish to specify a memo, ensure that the string ends with `amount_to_transfer`.

   ```text
   word1 word2 ... word12##celestia_recipient1##amount_to_transfer1##memo1
   word1 word2 ... word12##celestia_recipient2##amount_to_transfer2
   word13 word14 ... word24##celestia_recipient3##amount_to_transfer3
   word25 word26 ... word36##celestia_recipient4##amount_to_transfer4##memo2
   ```
   
5. Update the `src/config.js` file to set the RPC endpoint, gas multiplier, and other settings (carefully change the url from testnet to mainnet):

   ```javascript
   export const RPC_ENDPOINT = "https://celestia-testnet-rpc.polkachu.com"
   export const GAS_MULTIPLIER = 1.5
   export const EXPLORER_TX_PATH = "https://celestia.explorers.guru/transaction"
   
   export const GENESIS_TIMESTAMP = 1698764400000
   export const DEFAULT_ADDRESS_PREFIX = "celestia"
   export const DEFAULT_TOKEN_PREFIX = "utia"
   export const DEFAULT_DENOMINATION = 1_000_000
   ```

6. Compile TypeScript to JavaScript:
    ```bash
    tsc
    ```

7. Run the generated JavaScript file:
    ```bash
    node build/index.js
    ```
   Get results:
   ```text
   [20:49:49.492] genesis time is in the future. sleeping until then... 10/23/2023 8:50:00 PM | 0h 0m 10s left.
   [20:49:50.491] genesis time is in the future. sleeping until then... 10/23/2023 8:50:00 PM | 0h 0m 9s left.
   [20:49:51.492] genesis time is in the future. sleeping until then... 10/23/2023 8:50:00 PM | 0h 0m 8s left.
   [20:49:52.494] genesis time is in the future. sleeping until then... 10/23/2023 8:50:00 PM | 0h 0m 7s left.
   [20:49:53.496] genesis time is in the future. sleeping until then... 10/23/2023 8:50:00 PM | 0h 0m 6s left.
   [20:49:54.496] genesis time is in the future. sleeping until then... 10/23/2023 8:50:00 PM | 0h 0m 5s left.
   [20:49:55.497] genesis time is in the future. sleeping until then... 10/23/2023 8:50:00 PM | 0h 0m 4s left.
   
   /////// BALANCE ///////
   
   [20:49:55.893] celestia1l9r5ca9cc82fvv90qtyvlwr2vm2lq4cry6m9kq: 10 $TIA | 0.2 $TIA to celestia14470mugpq9dl0dhc4vzqu8q9mn44ka2n9t5g2m.
   
   /////// TRANSFER ///////
   
   [20:49:56.524] celestia1l9r5ca9cc82fvv90qtyvlwr2vm2lq4cry6m9kq -> 0.2 $TIA | fee: 0.1081 $TIA | https://celestia.explorers.guru/transaction/A4044EC99E9B312BDEFC32E466C0621FD014027B7D8D84826EBC37CD9443A52C
   
   [20:49:56.525] sleep 30 sec.
   
   /////// BALANCE ///////
   
   [20:50:26.905] celestia1l9r5ca9cc82fvv90qtyvlwr2vm2lq4cry6m9kq: 9.6919 $TIA | 0.2 $TIA to celestia14470mugpq9dl0dhc4vzqu8q9mn44ka2n9t5g2m.
   [20:50:26.905] celestia14470mugpq9dl0dhc4vzqu8q9mn44ka2n9t5g2m: 9.8516 $TIA.
   
   with love by @cyberomanov.
   ```

## Contributing
If you'd like to contribute to this project, please fork the repository and submit a pull request.

## Contact
Telegram: [@cyberomanov](https://t.me/cyberomanov)