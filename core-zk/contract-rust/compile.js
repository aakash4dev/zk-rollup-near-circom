const { exec }=require ("child_process");
// import { promisify } from "util";
// let exec_prom = promisify(exec)
// https://stackoverflow.com/questions/50250837/node-js-child-process-exec-not-actually-waiting


const compile = async () => {
  try {
    // compile smart contract
    exec(
      "cd contract;rustup target add wasm32-unknown-unknown;cargo build --all --target wasm32-unknown-unknown --release;",
      //   "sh ./air-near-app/contract/build.sh",
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          // process.exit();
        }
        // error inside cli running codes
        console.log("stdout: ", stdout);
        console.log("stderr: ", stderr);
      }
    );
  }catch(err){
	console.log(err)
  }
}
compile()