const nearAPI = require("near-api-js");
require("dotenv").config();
const { connect, keyStores, utils } = nearAPI;
const delay = require("delay");
require("dotenv").config();
let privateKey = process.env.key;
let accountId = process.env.account;


const update_state = async (batchNumber) => {
  try {
    let privateKey = process.env.key
    let accountId = process.env.account
      console.log(privateKey, accountId)
      console.log('checking error here')
      const keyPair = utils.KeyPair.fromString(privateKey);
      const keyStore = new keyStores.InMemoryKeyStore();
      await keyStore.setKey("mainnet", accountId, keyPair);
    const nearConfig = {
      networkId: "mainnet",
      keyStore: keyStore,
      nodeUrl: "https://rpc.near.gateway.fm/",
    };
    const nearConnection = await connect(nearConfig);
    const account = await nearConnection.account(accountId);

    console.log("no error till here i guess")
    let batchInputArray = await fs.promises.readFile(
      `../json_db/public/${batchNumber}.json`,
      "utf8"
    );
    let proof = await fs.promises.readFile(
      `../json_db/proof/${batchNumber}.json`,
      "utf8"
    );
    let inputJson = JSON.parse(batchInputArray);
    let proofJson = JSON.parse(proof);

    console.log("inputJson", inputJson);
    console.log("proofJson", proofJson);
    console.log("inputJson[50]", inputJson[50]);

    let res = await account
      .functionCall({
        contractId: accountId,
        methodName: "update_state_with_verify",
        args: {
          input: inputJson,
          proof: {
            a: {
              x: proofJson.pi_a[0],
              y: proofJson.pi_a[1],
            },
            b: {
              x: proofJson.pi_b[0],
              y: proofJson.pi_b[1],
            },
            c: {
              x: proofJson.pi_c[0],
              y: proofJson.pi_c[1],
            },
          },
          batch_num: 1,
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

    console.log("batchNumber done: ", batchNumber);
  } catch (err) {
    console.error(err);
    console.log("retrying update_state", batchNumber);
    await delay(1*1000)
    await update_state(batchNumber);
  }
};

const update_state_verify_contract_call = async () => {
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

      update_state_verify_contract_call();
      return;
    }else{
        await delay(20*1000)
        update_state_verify_contract_call();
    }
  } catch (error) {
    console.error(error);
    console.log("retrying update_state_verify_contract_call");
    await delay(5*1000)
    update_state_verify_contract_call();
  }
};
module.exports = { update_state_verify_contract_call };
