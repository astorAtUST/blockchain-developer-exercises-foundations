// NOTE: You need to have a .env.enc file in the root directory where you are running the node command

const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");
const OverledgerTypes = require("@quantnetwork/overledger-types");

const OverledgerSDK = OverledgerBundle.default;
const courseModule = "utxo-state-search";
const { DltNameOptions } = OverledgerTypes;

const log = log4js.getLogger(courseModule);

//Hardcoded UtxoId & BlockId
const myBlock = "0000000000000024fc216cbafc9c8b7e39679d27a135f0d769c5d8087b1afe19";
const myUtxo = "f3539f94241bce0a3443de766262252448cddf1e5af6e92695c449ebbe547a3a:0";

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

// Check for provided password for the secure env
if (!SENV_PASSWORD) {
  log.error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/state-search/autoexecute-utxo-search.js password=MY_PASSWORD",
  );
  throw new Error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/state-search/autoexecute-utxo-search.js password=MY_PASSWORD",
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
        technology: "Bitcoin",
        network: "Testnet",
      },
    };
    const overledgerInstance = overledger.provider.createRequest(
      refreshTokensResponse.accessToken.toString(),
    );

    log.info("Locating the Largest Unspent UTXO in a recent Block");
    let transactionId;
    let overledgerTransactionResponse;
    let overledgerUTXOResponse;
    let utxoCount;
    let utxoId;
    let thisUtxoAmount;
    let maxUtxoAmount = 0;
    let maxUtxoId;
    let maxUtxoDestination;
    let overledgerUTXOMaxBalanceResponse;
    let utxoStatus;

    //Custom code to search for specific UTXO
    log.info(
      `Asking Overledger for UTXO ${myUtxo}`,
    );
    overledgerUTXOResponse = await overledgerInstance.post(
      `/autoexecution/search/utxo/${myUtxo}`,
      overledgerRequestMetaData,
    );
    let myUtxoStatus =
      overledgerUTXOResponse.data.executionUtxoSearchResponse.status.code;
    let myUtxoBalanceUnit =
    overledgerUTXOResponse.data.executionUtxoSearchResponse.destination[0]
      .payment.unit;
    let myUtxoDestination =
      overledgerUTXOResponse.data.executionUtxoSearchResponse
        .destination[0].destinationId;
    let myUtxoAmount =
      overledgerUTXOResponse.data.executionUtxoSearchResponse
        .destination[0].payment.amount;
    log.info();
    log.info(`The Requested UTXO is: ${myUtxo}`);
    log.info(`The Address with the Largest UTXO is: ${myUtxoDestination}`);
    log.info(`This UTXO balance is/was: ${myUtxoAmount} ${myUtxoBalanceUnit}`);
    log.info(`The Status of the UTXO is: ${myUtxoStatus}`);

    log.info(
      `Overledger's Response For the Requested UTXO Was:\n\n${JSON.stringify(
        overledgerUTXOResponse.data,
      )}\n\n`,
    );
    //End of custom code for specific utxo
/*
    //Pre-defined blocknumber just for fun.
    log.info(`Asking Overledger for the pre-defined Block`);
    const blockNumber = myBlock;
    let overledgerBlockResponse = await overledgerInstance.post(
      `/autoexecution/search/block/${blockNumber}`,
      overledgerRequestMetaData,
    );
    //END of custom code for pre-assigned block

    //Commented to play out with code

    log.info(`Asking Overledger for the Latest Block`);
    let overledgerBlockResponse = await overledgerInstance.post(
      `/autoexecution/search/block/latest`,
      overledgerRequestMetaData,
    );
    const blockNumber =
      overledgerBlockResponse.data.executionBlockSearchResponse.block.number -
      20;
    log.info(`Asking Overledger for the Block 20 Back from the Latest`);
    let overledgerBlockResponse = await overledgerInstance.post(
      `/autoexecution/search/block/${blockNumber}`,
      overledgerRequestMetaData,
    );
    */
/*
    const transactionsInBlock =
      overledgerBlockResponse.data.executionBlockSearchResponse.block
        .numberOfTransactions - 1;
    log.info(
      `Transactions in Block = ${overledgerBlockResponse.data.executionBlockSearchResponse.block.numberOfTransactions}`,
    );
    // check if there is any transactions in this block
    if (transactionsInBlock < 0) {
      log.info(`The latest block has no transactions. Please try again later`);
    } else {
      let counter = 0;
      while (counter <= transactionsInBlock) {
        // get n'th transaction id
        log.info(
          `Asking Overledger for Transaction ${counter} in Block ${blockNumber}`,
        );
        transactionId =
          overledgerBlockResponse.data.executionBlockSearchResponse.block
            .transactionIds[counter];
        log.info(`The Id of this Transaction is ${transactionId}`);
        // query Overledger for this transaction
        overledgerTransactionResponse = await overledgerInstance.post(
          `/autoexecution/search/transaction?transactionId=${transactionId}`,
          overledgerRequestMetaData,
        );
        utxoCount =
          overledgerTransactionResponse.data.executionTransactionSearchResponse
            .transaction.destination.length - 1;
        log.info(
          `This Transaction has ${overledgerTransactionResponse.data.executionTransactionSearchResponse.transaction.destination.length} destinations`,
        );
        while (utxoCount >= 0) {
          utxoId = `${transactionId}:${utxoCount.toString()}`;
          log.info(
            `Asking Overledger for UTXO ${utxoCount} in Transaction ${counter}`,
          );
          overledgerUTXOResponse = await overledgerInstance.post(
            `/autoexecution/search/utxo/${utxoId}`,
            overledgerRequestMetaData,
          );
          utxoStatus =
            overledgerUTXOResponse.data.executionUtxoSearchResponse.status.code;
          log.info(`The UTXO has a status of ${utxoStatus} on ${overledgerUTXOResponse.data.executionUtxoSearchResponse
            .destination[0].payment.amount}`);
          if (utxoStatus === "UNSPENT_SUCCESSFUL") {
            thisUtxoAmount =
              overledgerUTXOResponse.data.executionUtxoSearchResponse
                .destination[0].payment.amount;
            if (thisUtxoAmount > maxUtxoAmount) {
              maxUtxoAmount = thisUtxoAmount;
              maxUtxoId = utxoId;
              maxUtxoDestination =
                overledgerUTXOResponse.data.executionUtxoSearchResponse
                  .destination[0].destinationId;
              overledgerUTXOMaxBalanceResponse = overledgerUTXOResponse;
            }
          }
          utxoCount -= 1;
        }
        counter += 1;
      }
      const balanceUnit =
        overledgerUTXOResponse.data.executionUtxoSearchResponse.destination[0]
          .payment.unit;
      log.info();
      log.info(`In Block ${blockNumber}:`);
      log.info(`The Largest UTXO is: ${maxUtxoId}`);
      log.info(`The Address with the Largest UTXO is: ${maxUtxoDestination}`);
      log.info(`This UTXO has locked: ${maxUtxoAmount} ${balanceUnit}`);

      log.info(
        `Overledger's Response For the Max UTXO Was:\n\n${JSON.stringify(
          overledgerUTXOMaxBalanceResponse.data,
        )}\n\n`,
      );
    }
    */
  } catch (e) {
    log.error("error", e);
  }
})();
