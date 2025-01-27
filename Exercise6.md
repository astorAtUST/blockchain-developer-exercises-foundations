# Week 2 Ledger State and Updates

## The Accounts Model

### Exercise - Read your first Accounts State

In this exercise, we will read our first Accounts state via Overledger’s autoExecuteSearchAddressBalance and autoExecuteSearchAddressSequence APIs. The documentation for these endpoints can be found [here](https://docs.overledger.io/#operation/autoExecuteSearchAddressBalanceRequest) and [here](https://docs.overledger.io/#operation/prepareAddressSequenceSearchRequest_1) respectively. 

Note that unlike blocks and transactions, the state data model of utxo and accounts based DLTs do have to diverge somewhat. This is because of the wide variety of parameters in the state of both models.

#### DLT Network Information

We will be interacting with the Ethereum Goerli and the XRP Ledger testnets. The relevant Overledger location objects are as follows:

1. `Location = {“technology”: “Ethereum”, “network”: “Ethereum Goerli Testnet”}`
   
2. `Location = {“technology”: “XRP Ledger”, “network”: “Testnet”}`

#### Prerequisites

It is assumed that you have already setup your environment by following [these instructions](./Exercise1.md) and that you have completed the previous exercises to search for a block using Overledger [here](./Exercise2.md) and to search for an Account transaction using Overledger [here](./Exercise5.md).

#### Searching Accounts for Specific Properties

We will demostrate searching the Accounts state through a specific example. This example will search a subset of addresses and identify the address with the largest balance and the address with the largest sequence number. To be in the subset of addresses searched, an address will have had to send a transaction in the latest block of the Ethereum Goerli testnet. To run the example, enter:

```
node examples/state-search/autoexecute-accounts-search.js password=MY_PASSWORD
```

You will see in the example script that we are using the `/autoexecution/search/address/balance/${originId}` Overledger URL to search for an address balance and we are using the `/autoexecution/search/address/sequence/${originId}` Overledger URL to search for an address sequence.

The full details of this script is as follows. This script first gets the latest block, then gets each transaction from the block. For each transaction origin address, the script gets that addresses balance and sequence number. The script keeps track of the address with the largest parameters.

All the logic in this script is based on the Overledger standardised data model. This means that the script can easily be reused for other DLTs that are Account based.

##### Overledger Auto Execute Balance Search API Response

See that the response has two main objects due to Overledger’s preparation and execution model:

1. preparationAddressBalanceSearchResponse: This includes the request id and any QNT fee that must be paid for use of this endpoint.
   
2. executionAddressBalanceSearchResponse: This includes the requested address balance. 

The balance information will be returned in cross-DLT standardised form for the account data model. There is no associated status object as balances are read from the state of the latest block.

For parameter by parameter descriptions see the [openAPI3 doc](https://docs.overledger.io/#operation/autoExecuteSearchAddressBalanceRequest).

##### Overledger Auto Execute Sequence Search API Response

See that the response has two main objects due to Overledger’s preparation and execution model:

1. preparationAddressSequenceSearchResponse: This includes the request id and any QNT fee that must be paid for use of this endpoint.
   
2. executionAddressSequenceSearchResponse: This includes the requested address sequence. 

The sequence information will be returned in cross-DLT standardised form for the account data model. There is no associated status object as sequences are read from the state of the latest block.

For parameter by parameter descriptions see the [documentation](https://docs.overledger.io/#operation/prepareAddressSequenceSearchRequest_1).

#### Challenges

##### Searching the XRP Ledger Testnet

Given the example `./examples/state-search/autoexecute-accounts-search.js` file and the location information listed above, can you understand how to change this file to instead run for the XRP Ledger testnet?

##### Searching for a Specific Address

Take a look at a third party explorer for the DLT testnets we are using, e.g. [the Ethereum Goerli Testnet](https://Goerli.etherscan.io/) or [the XRP Ledger Testnet](https://blockexplorer.one/xrp/testnet).

Choose any account address from these explorers. Can you understand how to modify the example script to search for that account's balance and sequence?

#### Troubleshooting
This exercise was tested in Ubuntu 20.04.2 LTS Release: 20.04 Codename: focal, with nvm version 0.35.3, and node version 16.3.0. 

This exercise was additionally tested in MacOS Monterey Version 12.0.1, with nvm version 0.39.0, and node version 16.3.0. 

#### Error: bad decrypt 

Description:

```
Secure-env :  ERROR OCCURED Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt
```

Cause: the secure env package cannot decrypt the .env.enc file because the provided password was incorrect.

Solution: provide the password with which .env.enc was encrypted when running the script.

#### Error: .env.enc does not exist 

Description:

```
Secure-env :  ERROR OCCURED .env.enc does not exist.
```

Cause: You are missing the encrypted environment file in the folder that you are running from.

Solution: Return to the top level folder and encrypt .env as described in Exercise 1.

#### Error: Missing Password

Description:

```
Error: Please insert a password to decrypt the secure env file.
```

Cause: You did not include the password as a command line option.

Solution: Include the password as a command line option as stated in your terminal print out.