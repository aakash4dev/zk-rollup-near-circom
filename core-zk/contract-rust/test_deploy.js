const nearAPI=require("near-api-js");
const { Account, transactions, keyStores, utils } = nearAPI;
const fs =require("fs");
//IMP :- Testnet Only for now
require('dotenv').config()

//todo make this dynamic
let wasm = fs.readFileSync("contract/target/wasm32-unknown-unknown/release/hello_near.wasm");

const deployMain = async (accountId, privateKey) => {
  try {

    const keyPair = utils.KeyPair.fromString(privateKey);
    const keyStore = new keyStores.InMemoryKeyStore();
    keyStore.setKey("testnet", accountId, keyPair);

    const nearConfig = {
      networkId: "testnet",
      keyStore: keyStore,
      nodeUrl: "https://rpc.testnet.near.org",
    };
    const near = await nearAPI.connect(nearConfig);
    const contractId = await near.account(accountId);
 
    // return
    let deployCodes = await contractId.deployContract(wasm);
    console.log("Deployed Contract: 💘 " + accountId);
    if (deployCodes.status.Failure || deployCodes.status.Unknown) {
      return false;
    } else if (
      deployCodes.status.SuccessValue ||
      deployCodes.status.SuccessReceiptId
    ) {
      return true;
    }

    return true;
  } catch (error) {
    console.log(error);
    console.log(
      "Error: ❌❌ " +
        accountId +
        "The account already exists on the Network or the Account is not funded"
    );
    return false;
  }
};


deployMain(
  process.env.testnet_account,
  process.env.testnet_key,
);
