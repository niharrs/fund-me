const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports.default = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
  });

  log(`Contract deployed at ${fundMe.address}`);
};

module.exports.tags = ["all", "fundme"];
