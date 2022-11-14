// NOTE: You need to have a .env.enc file in the root directory where you are running the node command
 
const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");
const OverledgerTypes = require("@quantnetwork/overledger-types");

const OverledgerSDK = OverledgerBundle.default;
const courseModule = "transaction-search";
const { DltNameOptions } = OverledgerTypes;

const log = log4js.getLogger(courseModule);

// Initialize log
log4js.configure({
  appenders: {
    console: { type: "console" },
  },
  categories: {
    default: { appenders: ["console"], level: "debug" },
  },
});

log.info("Loading password passed in via the command line");
const PASSWORD_INPUT = process.argv.slice(2).toString();
const SENV_PASSWORD = PASSWORD_INPUT.split("=")[1];

//Define transaction (hardcoded)
const myBTCTransaction = "9b927450de58b335b794bd22f88d1005dcc6ed342336608b308f97ada425dc78";
const myETHTransaction = "0x8edafc9a7e14f393fce99931554572c9cec5dd6577b8a32e74bcb144f6d13401";
const myXRPTransaction = "b8a3784d705420e97cc5efe955f1ed2865726c9fb308dce067c0d55e5bd78ea6";
const myTransaction = myETHTransaction;


// Check for provided password
if (!SENV_PASSWORD) {
  log.error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/transaction-search/autoexecute-transaction-search.js password=MY_PASSWORD",
  );
  throw new Error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/transaction-search/autoexecute-transaction-search.js password=MY_PASSWORD",
  );
}
log.info("Executing ", courseModule);
(async () => {
  try {
    log.info("Initializing the SDK");
    const overledger = new OverledgerSDK({
      dlts: [
        { dlt: DltNameOptions.BITCOIN },
        { dlt: DltNameOptions.ETHEREUM },
        { dlt: DltNameOptions.XRP_LEDGER },
      ], // connects OVL to these 3 technologies
      userPoolID: "us-east-1_xfjNg5Nv9", // where your userpool id is located
      provider: { network: "https://api.sandbox.overledger.io/v2" }, // URL for the testnet versions of these DLTs
      envFilePassword: SENV_PASSWORD,
    });

    log.info("Obtaining the Access Token to Interact with Overledger");
    const refreshTokensResponse =
      await overledger.getTokensUsingClientIdAndSecret(
        process.env.USER_NAME,
        process.env.PASSWORD,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );

    log.info(
      "Creating the Overledger Request Object with the Correct Location",
    );
    const overledgerRequestMetaData = {
      location: {
        technology: "Ethereum",
        network: "Ropsten Testnet",
      },
    };
    const overledgerInstance = overledger.provider.createRequest(
      refreshTokensResponse.accessToken.toString(),
    );

    log.info("Locating the Latest Payment Transaction on the Blockchain");
    let locatedPaymentTransaction = false;
    let numberOfTransactionsInBlock;
    let transactionsInBlockCounter;
    let transactionId = myTransaction; //changed to point to the pre-defined transaction.
    let overledgerTransactionResponse;
    let overledgerBlockResponse;
    let blockToSearch = "latest";
    // Query for specific transaction
    // query Overledger for this transaction
    overledgerTransactionResponse = await overledgerInstance.post(
      `/autoexecution/search/transaction?transactionId=${transactionId}`,
      overledgerRequestMetaData,
    );
    log.info(`The transaction Response DATA is: ${JSON.stringify(overledgerTransactionResponse.data)}`)
    log.info(
      `The Type of this Transaction is ${overledgerTransactionResponse.data.executionTransactionSearchResponse.type}`,
    );
    //END Of modifications
/*
    while (locatedPaymentTransaction === false) {
      log.info(`Asking Overledger for Block: ${blockToSearch}`);
      overledgerBlockResponse = await overledgerInstance.post(
        `/autoexecution/search/block/${blockToSearch}`,
        overledgerRequestMetaData,
      );

      transactionsInBlockCounter =
        overledgerBlockResponse.data.executionBlockSearchResponse.block
          .numberOfTransactions - 1;
      log.info(
        `Transactions in Block = ${overledgerBlockResponse.data.executionBlockSearchResponse.block.numberOfTransactions}`,
      );
      // check if there is any transactions in this block
      while (transactionsInBlockCounter < 0) {
        // if there is no transactions then ...
        log.info(
          `Block Number ${overledgerBlockResponse.data.executionBlockSearchResponse.block.number} does not have any transactions`,
        );
        log.info("Therefore searching for previous block...");
        blockToSearch =
          overledgerBlockResponse.data.executionBlockSearchResponse.block
            .number - 1;
        overledgerBlockResponse = await overledgerInstance.post(
          `/autoexecution/search/block/${blockToSearch}`,
          overledgerRequestMetaData,
        );
        transactionsInBlockCounter =
          overledgerBlockResponse.data.executionBlockSearchResponse.block
            .numberOfTransactions - 1;
      }
      log.info(
        `Block number ${overledgerBlockResponse.data.executionBlockSearchResponse.block.number} includes transactions`,
      );
      log.info(
        `Transactions in Block = ${overledgerBlockResponse.data.executionBlockSearchResponse.block.numberOfTransactions}`,
      );
      // start from the last transaction of the block (as blockchains process from transaction 1 of the block to transaction n)
      log.info(
        `Payment Transaction Search Will Start From Transaction Number: ${transactionsInBlockCounter}`,
      );
      while (transactionsInBlockCounter >= 0) {
        // get n'th transaction id
        log.info(
          `Asking Overledger for Transaction ${transactionsInBlockCounter} in Block ${blockToSearch}`,
        );
        transactionId =
          overledgerBlockResponse.data.executionBlockSearchResponse.block
            .transactionIds[transactionsInBlockCounter];
        log.info(`The Id of this Transaction is ${transactionId}`);
        // query Overledger for this transaction
        overledgerTransactionResponse = await overledgerInstance.post(
          `/autoexecution/search/transaction?transactionId=${transactionId}`,
          overledgerRequestMetaData,
        );
        log.info(
          `The Type of this Transaction is ${overledgerTransactionResponse.data.executionTransactionSearchResponse.type}`,
        );
        if (
          overledgerTransactionResponse.data.executionTransactionSearchResponse
            .type === "PAYMENT"
        ) {
          transactionsInBlockCounter = numberOfTransactionsInBlock;
          locatedPaymentTransaction = true;
        } else {
          transactionsInBlockCounter -= 1;
        }
      }
      if (
        overledgerTransactionResponse.data.executionTransactionSearchResponse
          .type === "PAYMENT"
      ) {
        transactionsInBlockCounter = numberOfTransactionsInBlock;
        locatedPaymentTransaction = true;
      } else {
        transactionsInBlockCounter -= 1;
      }
      if (locatedPaymentTransaction === false) {
        log.info(
          `No Payment Transactions Found in Block Number ${overledgerBlockResponse.data.executionBlockSearchResponse.block.number}`,
        );
        blockToSearch =
          overledgerBlockResponse.data.executionBlockSearchResponse.block
            .number - 1;
      }
    }
*/
    log.info(
      `Printing Out Overledger's Response:\n\n${JSON.stringify(
        overledgerTransactionResponse.data,
      )}\n\n`,
    );
  } catch (e) {
    log.error("error", e);
  }
})();
