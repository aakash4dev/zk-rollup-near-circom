const fsExtra = require("fs-extra");
const fs=require('fs')
const dirs = ["batch", "tx","public","proof","witness"];
dirs.forEach((dir) => {
  fsExtra.emptyDirSync(dir);
});
const files = ["batch_count.md","tx_block_count.md","batchstate_count.md"]
files.forEach((file)=>{
    fs.promises.writeFile(file,"0");
})
