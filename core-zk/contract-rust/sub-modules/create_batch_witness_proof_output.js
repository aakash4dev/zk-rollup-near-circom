cExec = require("command-exec"); // alternative: child-process
fs = require("fs");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const create_batch_witness_proof_output = async () => {
  const transactionsPerBatch=25;

  let batchNumber = Number(
    await fs.promises.readFile(`../json_db/batch_count.md`, "utf8")
  );
  console.log(batchNumber);

  try {
    console.log("creating batch started");
    let Batch = {
      from: [],
      to: [],
      amount: [],
      transactionHash: [],
      frombalances: [],
      tobalances: [],
    };

    fs.readdir("../json_db/tx", async (err, files) => {
      console.log("transactions left to batch: ",files.length)

      if (files.length >= transactionsPerBatch) {
        for (let i = 0; i < transactionsPerBatch; i++) {
          let jsonData = JSON.parse(
            await fs.promises.readFile(`../json_db/tx/${files[i]}`, "utf8")
          );
          Batch.from.push(jsonData.from);
          Batch.to.push(jsonData.to);
          Batch.amount.push(jsonData.value);
          Batch.transactionHash.push(jsonData.hash);
          Batch.frombalances.push("100"); // ! make function real, trace it via web3
          Batch.tobalances.push("100"); // ! make function real, trace it via web3

          // remove transaction file, its no more needed.
          fs.unlink(`../json_db/tx/${files[i]}`, (err, data) => {});
        }
      } else {
        await delay(5000); // wait for new transactions if not have enough transactions in blockchain for batch
        create_batch_witness_proof_output();
        return;
      }

      // add batch
      await fs.promises.writeFile(
        `../json_db/batch/${batchNumber}.json`,
        JSON.stringify(Batch)
      );

      // generate witness
      // const res =
      await cExec(`
      node  ../circuit/circuit_js/generate_witness.js ../circuit/circuit_js/circuit.wasm ../json_db/batch/${batchNumber}.json ../json_db/witness/${batchNumber}.wtns;
     `);

      //  power of tau
      // Generating proof:
      // const res2 =
      await cExec(`snarkjs groth16 prove ../circuit/circuit_0001.zkey ../json_db/witness/${batchNumber}.wtns ../json_db/proof/${batchNumber}.json ../json_db/public/${batchNumber}.json`);

      // snarkjs groth16 prove ../circuit/circuit_0001.zkey ../json_db/witness/0.wtns ../json_db/proof/0.json ../json_db/public/0.json

      // update batch number: very useful in restart too.
      await fs.promises.writeFile(
        `../json_db/batch_count.md`,
        JSON.stringify(batchNumber + 1)
      );

      // console.log("batch",batchNumber + 1,"stored")
      create_batch_witness_proof_output();
      return;
    });
  } catch (error) {}
};

module.exports = { create_batch_witness_proof_output };