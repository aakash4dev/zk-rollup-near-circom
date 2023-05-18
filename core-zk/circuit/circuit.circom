  pragma circom 2.0.0;

  include "./circomlib/circuits/poseidon.circom";

  // Helper template that computes hashes of the next tree layer
  template TreeLayer(height, nItems) {
    signal input ins[nItems * 2];
    signal output outs[nItems];
    
    component hash[nItems];
    for(var i = 0; i < nItems; i++) {
      hash[i] = Poseidon(2);
      hash[i].inputs[0] <== ins[i * 2];
      hash[i].inputs[1] <== ins[i * 2 + 1];
      hash[i].out ==> outs[i];
    }
  }

  // Builds a merkle tree from leaf array
  template MerkleTree(nLeaves) {
    var levels = 0;
    var temp = nLeaves - 1;
    while(temp > 0) {
      levels += 1;
      temp = temp >> 1;
    }
    signal input leaves[nLeaves];
    signal output root; // merkle root: state root.
    signal output numLevels;

    component layers[levels];
    for(var level = levels - 1; level >= 0; level--) {
      var nItems = 1 << level;
      layers[level] = TreeLayer(level, nItems);
      for(var i = 0; i < (nItems * 2); i++) {
        if(level == levels - 1 && i >= nLeaves) {
          layers[level].ins[i] <== 0;
        } else if(level == levels - 1) {
          layers[level].ins[i] <== leaves[i];
        } else if(i >= (1 << (level + 1))) {
          layers[level].ins[i] <== 0;
        } else {
          layers[level].ins[i] <== layers[level + 1].outs[i >> 1];
        }
      }
    }

    root <== layers[0].outs[0];
    numLevels <== levels;
  }

  template Rollup(nTx){
      signal input to[nTx];
      signal input from[nTx];
      signal input amount[nTx];
      signal input transactionHash[nTx];
      signal input frombalances[nTx];
      signal input tobalances[nTx];

      // to pass to the merkle tree template
      signal leafHashes[nTx];

      signal output newfrombalances[nTx];
      signal output newtobalances[nTx];
      signal output tx_merkle_root;

      component hash[nTx];
      for(var i = 0; i < nTx; i++) {
          hash[i] = Poseidon(4);
          hash[i].inputs[0] <== to[i];
          hash[i].inputs[1] <== from[i];
          hash[i].inputs[2] <== amount[i];
          hash[i].inputs[3] <== transactionHash[i];
          hash[i].out ==> leafHashes[i];

          newfrombalances[i] <== frombalances[i] - amount[i];
          newtobalances[i] <== tobalances[i] + amount[i];
      }

      // Build the Merkle tree
      component merkle = MerkleTree(nTx);
      merkle.leaves <== leafHashes;
      merkle.root ==> tx_merkle_root;
  }

  component main {public [from,to,amount,transactionHash,frombalances,tobalances]} = Rollup(25);// Rollup(2)

  /*INPUT ={
      "from": [
          "0xce0babc8398144aa98d9210d595e3a9714910748",
          "0x4ecca05fe1f502608389b6a57f913b18b61b2df9"
      ],
      "to": [
          "0x388c818ca8b9251b393131c08a736a67ccb19297",
          "14780632341277755899330141855966417738975199657954509255716508264496764475094"
      ],
      "amount":[
          "501",
          "501"
      ],
      "transactionHash":[
          "0x1761e6b3363365c1926bf580342a10cd0416306421c4bd677cb618467d27c73d",
          "0xb09a12424271599634fc7acb0aa6d17bc18981d3552fc4fd39f41212020cf331"
      ]
      ,
      "frombalances":[
          "900",
          "1000"
      ],
      "tobalances":[
          "0",
          "0"
      ]
  }

  */