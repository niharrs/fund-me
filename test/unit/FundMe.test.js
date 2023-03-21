const { deployments, ethers } = require("hardhat");
const { assert } = require("chai");

describe("FundMe", async function () {
  let fundMe, deployer, mockV3Aggregator;

  beforeEach(async function () {
    console.log("1");
    deployer = (await getNamedAccounts()).deployer;
    console.log("2");
    await deployments.fixture(["all"]);
    console.log("3");
    fundMe = await ethers.getContract("FundMe", deployer);
    console.log("4");
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    console.log("5");
  });

  describe("Constructor", async function () {
    it("Sets the aggregator address correctly", async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
});
