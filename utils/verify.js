const { run } = require("hardhat");

async function verify(contractAddress, args) {
  //args: constructor args
  console.log("---Beginning verification---");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };
