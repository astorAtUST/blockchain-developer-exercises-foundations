// NOTE: You need to have a .env.enc file in the root directory where you are running the node command

const log4js = require("log4js");
const OverledgerBundle = require("@quantnetwork/overledger-bundle");
const OverledgerTypes = require("@quantnetwork/overledger-types");

const OverledgerSDK = OverledgerBundle.default;
const courseModule = "specific-blocknumber-search";
const { DltNameOptions } = OverledgerTypes;

const log = log4js.getLogger(courseModule);
const searchableBlockNumber = 2405222;

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

// Check for provided password
if (!SENV_PASSWORD) {
  log.error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/block-search/autoexecute-specific-blocknumber-search.js password=MY_PASSWORD",
  );
  throw new Error(
    "Please insert a password to decrypt the secure env file. Example: \n node examples/block-search/autoexecute-specific-blocknumber-search.js password=MY_PASSWORD",
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

    log.info("Obtaining the Access Token to interact with Overledger");
    const refreshTokensResponse =
      await overledger.getTokensUsingClientIdAndSecret(
        process.env.USER_NAME,
        process.env.PASSWORD,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      );

    log.info("Createing the Overledger Request Object with Correct Location");
    const overledgerRequestMetaData = {
      location: {
        technology: "Bitcoin",
        network: "Testnet",
      },
    };
    const overledgerInstance = overledger.provider.createRequest(
      refreshTokensResponse.accessToken.toString(),
    );
/*
    //Commented to use the section that allows specifying a block number
    log.info("Sending a Request to Overledger for the Latest Block");
    const overledgerLatestBlockResponse = await overledgerInstance.post(
      "/autoexecution/search/block/latest",
      overledgerRequestMetaData,
    );

    log.info("Sending a Request to Overledger for the Parent Block (Using BlockNumber Search)");
    const parentBlockNumber =
      overledgerLatestBlockResponse.data.executionBlockSearchResponse.block
        .number - 1;
    const overledgerParentBlockResponse = await overledgerInstance.post(
      `/autoexecution/search/block/${parentBlockNumber}`,
      overledgerRequestMetaData,
    );
*/
    log.info("Sending a Request to Overledger for the searchableBlockNumber Block (Using BlockNumber Search)");
    const parentBlockNumber = searchableBlockNumber;
    const overledgerParentBlockResponse = await overledgerInstance.post(
      `/autoexecution/search/block/${parentBlockNumber}`,
      overledgerRequestMetaData,
    );
    log.info(
      `Printing Out Overledger's Response:\n\n${JSON.stringify(
        overledgerParentBlockResponse.data,
      )}\n\n`,
    );
  } catch (e) {
    log.error("error", e);
  }
})();
