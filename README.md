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

4. Prepare your `data/mnemonic.txt` file with the mnemonic phrases, recipients and amount to transfer (you can use the same mnemonic with several unique recipients):

   ```bash
   word1 word2 ... word12##celestia_recipient1##amount_to_transfer1
   word1 word2 ... word12##celestia_recipient2##amount_to_transfer2
   word13 word14 ... word24##celestia_recipient3##amount_to_transfer3
   word25 word26 ... word36##celestia_recipient4##amount_to_transfer4
   ```
   
5. Update the `src/config.js` file to set the RPC endpoint, gas multiplier, and other settings:

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

## Contributing
If you'd like to contribute to this project, please fork the repository and submit a pull request.

## Contact
Telegram: [@cyberomanov](https://t.me/cyberomanov)