const nearAPI = require("near-api-js");
require("dotenv").config();
const { connect, keyStores, utils } = nearAPI;
const delay = require("delay");



const update_state = async (batchNumber) => {
  try {
      let privateKey = process.env.testnet_key
      let accountId = process.env.testnet_account
      console.log(privateKey, accountId)
      console.log('checking error here')
      const keyPair = utils.KeyPair.fromString(privateKey);
      const keyStore = new keyStores.InMemoryKeyStore();
      await keyStore.setKey("testnet", accountId, keyPair);
    const nearConfig = {
      networkId: "testnet",
      keyStore: keyStore,
      nodeUrl: "https://rpc.testnet.near.org",
    };
    const nearConnection = await connect(nearConfig);
    const account = await nearConnection.account(accountId);

    let batchInputArray = await fs.promises.readFile(
      `../json_db/public/${batchNumber}.json`,
      "utf8"
    );

    let inputJson = JSON.parse(batchInputArray);

    let res = await account
      .functionCall({
        contractId: accountId,
        methodName: "update_state",
        args: {
          batch_num: batchNumber,
          new_state_root: inputJson[50],
        },
        gas: 300000000000000,
      })
      .then((res) => {
        console.log("1", res);
        return res;
      })
      .catch((err) => {
        console.log(err);
        throw err;
        //   return false;
      });

    console.log(res.transaction.hash);
    console.log(res);

    // process.exit()
    console.log("batchNumber done: ", batchNumber);
  } catch (err) {
    console.error(err);
    console.log("retrying update_state", batchNumber);
    await delay(1*1000)
    await update_state(batchNumber);
  }
};

const update_state_contract_call = async () => {
  try {
    let batchStateNumber = Number(
      await fs.promises.readFile(`../json_db/batchstate_count.md`, "utf8")
    );
    let batch_created_yet = Number(
      await fs.promises.readFile(`../json_db/batch_count.md`, "utf8")
    );

    console.log(batchStateNumber, batch_created_yet);

    if (batchStateNumber < batch_created_yet) {
      await update_state(batchStateNumber);
      await fs.promises.writeFile(
        `../json_db/batchstate_count.md`,
        JSON.stringify(batchStateNumber + 1)
      );

      update_state_contract_call();
      return;
    }else{
        await delay(20*1000)
        update_state_contract_call();
    }
  } catch (error) {
    console.error(error);
    console.log("retrying update_state_contract_call");
    await delay(5*1000)
    update_state_contract_call();
  }
};
module.exports = { update_state_contract_call};
