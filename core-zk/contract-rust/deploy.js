const nearAPI=require("near-api-js");
const { Account, transactions, keyStores, utils } = nearAPI;
const fs =require("fs");
//IMP :- Testnet Only for now
require('dotenv').config()

//todo make this dynamic
let wasm = fs.readFileSync("contract/target/wasm32-unknown-unknown/release/hello_near.wasm");
// let wasm = fs.readFileSync("./main2.wasm");

// const Creater = async (contractId) => {
//   try {
//     const newAccountId = ("noob-" + contractId + ".testnet").toLowerCase();

//     console.log("Creating account: ⌛ " + newAccountId);
//     const nearConfig = {
//       networkId: "testnet",
//       nodeUrl: "https://rpc.testnet.near.org",
//       walletUrl: "https://wallet.testnet.near.org",
//       helperUrl: "https://helper.testnet.near.org",
//     };
//     const nearConnection = await nearAPI.connect(nearConfig);
//     const keyPair = nearAPI.KeyPair.fromRandom("ed25519");
//     let newAccount = await nearConnection.createAccount(
//       newAccountId,
//       keyPair.publicKey
//     );
//     console.log(newAccount);
//     newAccount.keypair = keyPair;
//     const accountId = newAccount.accountId;
//     const secretKey = newAccount.keypair.secretKey;
//     console.log("Account Created: ✅✅ " + newAccountId);
//     console.log("Secret Key: 💀💀 " + secretKey);
//     await deploy(accountId, keyPair);
//   } catch (error) {
//     console.log(error.toString());
//     return false;
//   }
// };

// Step 2 Deploy the Code to the AccountId

// const deploy = async (accountId, keyPair) => {
//   try {
//     const keyStore = new keyStores.InMemoryKeyStore();
//     keyStore.setKey("testnet", accountId, keyPair);

//     const nearConfig = {
//       keyStore, // instance of InMemoryKeyStore
//       networkId: "testnet",
//       nodeUrl: "https://rpc.testnet.near.org",
//     };
//     const near = await nearAPI.connect(nearConfig);
//     const contractId = await near.account(accountId);
//     // wasm is like bytecode in EVM chains
//     let deployCodes = await contractId.deployContract(wasm);
//     console.log("Deployed Contract: 💘 " + accountId);
//     if (deployCodes.status.Failure || deployCodes.status.Unknown) {
//       console.log("Contract not deployed: ❌❌ " + accountId);
//       console.log(deployCodes.status.Failure);
//       return false;
//     } else if (
//       deployCodes.status.SuccessValue ||
//       deployCodes.status.SuccessReceiptId
//     ) {
//       console.log("Contract deployed: ✅✅ " + accountId);
//       console.log(deployCodes.status.SuccessValue);
//       console.log(deployCodes.status.SuccessReceiptId);
//       return true;
//     }

//     return true;
//   } catch (error) {
//     console.log(error);
//     console.log(
//       "Error: ❌❌ " +
//         accountId +
//         "The account already exists on the Network or the Account is not funded"
//     );
//     return false;
//   }
// };

const deployMain = async (accountId, privateKey) => {
  try {

    const keyPair = utils.KeyPair.fromString(privateKey);
    const keyStore = new keyStores.InMemoryKeyStore();
    keyStore.setKey("mainnet", accountId, keyPair);

    const nearConfig = {
      networkId: "mainnet",
      keyStore: keyStore,
      nodeUrl: "https://rpc.near.gateway.fm/",
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

// console.log(process.env.key)
// console.log(process.env.address)

deployMain(
  process.env.account,
  process.env.key,
);
