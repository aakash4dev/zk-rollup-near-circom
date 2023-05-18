const { store_transactions } = require("./sub-modules/store_transactions");
const { create_batch_witness_proof_output } = require("./sub-modules/create_batch_witness_proof_output");
const { update_state_contract_call } = require("./sub-modules/test_update_state");
require("dotenv").config();

const start_batching = () => {
  // store_transactions(); // trace transactions from l2 blokchain block by block and store minimum transactions info needed for making batch for l1 
  // create_batch_witness_proof_output();
  // update_state_verify_contract_call(); // upload batch & verify in l1 blockchain
  update_state_contract_call();
};

// module.exports = start_batching();
start_batching();