const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3("http://127.0.0.1:8546");

const saveTransactions = async (fromBlock) => {
  let i = Number(fromBlock);
  try {
    latestBlock = await web3.eth.getBlockNumber();

    for (i; i < latestBlock; i++) {
      blockData = await web3.eth.getBlock(i);
      transactions = blockData.transactions;
      if (transactions.length > 0) {
        for (let j = 0; j < transactions.length; j++) {
          transaction = await web3.eth.getTransaction(transactions[j]);

          filterTransaction = {
            from: transaction.from,
            hash: transaction.hash,
            input: transaction.input,
            to: transaction.to,
            value: transaction.value,
            blockNumber: transaction.blockNumber,
          };

          fs.writeFileSync(`../json_db/tx/${transaction.hash}.json`, JSON.stringify(filterTransaction, null, 2));
        }
      }

      // update batch number: very useful in restart too.
      await fs.promises.writeFile(
        `../json_db/tx_block_count.md`,
        JSON.stringify(i + 1)
      );
      console.log("tx fetch on block",i,"done")

    }
  } catch (error) {
    console.log(error);
    console.log("retrying after 10 seconds");
    setTimeout(() => {
      saveTransactions(i);
    }, 10 * 1000);
  }

  setTimeout(() => {
    saveTransactions(i);
  }, 10 * 1000);
};

const store_transactions = async() => {
  let startFromBlock = Number(
    await fs.promises.readFile(`../json_db/tx_block_count.md`, "utf8")
  );
  saveTransactions(startFromBlock);
};

module.exports = { store_transactions };