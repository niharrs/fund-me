const { deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe Contract", async function () {
      let fundMe, deployer, mockV3Aggregator;
      let sendValue = ethers.utils.parseEther("1");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("Constructor", async function () {
        it("Sets the aggregator address correctly", async function () {
          const response = await fundMe.priceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("Fund function", async function () {
        it("Fails if you don't send at least 50 USD to the contract", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "Mininum dollar amount is 50."
          );
        });

        it("Fund function updates addressToAmountFunded data structure", async function () {
          await fundMe.fund({
            value: sendValue,
          });
          const response = await fundMe.addressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("Fund function adds to depositor array", async function () {
          await fundMe.fund({
            value: sendValue,
          });
          const response = await fundMe.depositors(0);
          assert.equal(response, deployer);
        });
      });

      describe("Withdraw function", async function () {
        beforeEach(async function () {
          await fundMe.fund({
            value: sendValue,
          });
        });

        it("Withdraw ETH with single funder", async function () {
          const startingBalanceOfFundMe = await fundMe.provider.getBalance(
            fundMe.address
          );
          const beforeWithdrawalBalanceOfDeployer =
            await fundMe.provider.getBalance(deployer);

          const txRes = await fundMe.withdraw();
          const txReceipt = await txRes.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingBalanceOfFundMe = await fundMe.provider.getBalance(
            fundMe.address
          );
          const afterWithdrawalBalanceOfDeployer =
            await fundMe.provider.getBalance(deployer);

          assert.equal(endingBalanceOfFundMe, 0);
          assert.equal(
            startingBalanceOfFundMe.add(beforeWithdrawalBalanceOfDeployer),
            afterWithdrawalBalanceOfDeployer.add(gasCost).toString()
          );
        });

        it("Withdraw ETH with multiple funders", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingBalanceOfFundMe = await fundMe.provider.getBalance(
            fundMe.address
          );
          const beforeWithdrawalBalanceOfDeployer =
            await fundMe.provider.getBalance(deployer);

          const txRes = await fundMe.withdraw();
          const txReceipt = await txRes.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingBalanceOfFundMe = await fundMe.provider.getBalance(
            fundMe.address
          );
          const afterWithdrawalBalanceOfDeployer =
            await fundMe.provider.getBalance(deployer);

          assert.equal(endingBalanceOfFundMe, 0);
          assert.equal(
            startingBalanceOfFundMe.add(beforeWithdrawalBalanceOfDeployer),
            afterWithdrawalBalanceOfDeployer.add(gasCost).toString()
          );

          await expect(fundMe.depositors(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.addressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allows owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        });
      });
    });
