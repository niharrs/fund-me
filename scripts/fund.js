const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding contract");
  const fundTxResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await fundTxResponse.wait(1);
  console.log("Funded");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
