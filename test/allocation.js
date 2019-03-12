const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const BN = require('bn.js');

const Utils = require("./utils");
const Token = artifacts.require('CLTToken.sol');
const Crowdsale = artifacts.require("test/CLTCrowdsaleTest.sol");
const Allocation = artifacts.require("CLTAllocation.sol");

const precision = new BigNumber("1000000000000000000");

contract('CLTAllocation', accounts => {

    let token = null
    let crowdsale = null;
    let allocation = null;

    let _unlockTokensTime = parseInt(new Date().getTime() / 1000) + 3600 * 24 * 30;
    let preICOStartsAt = parseInt(new Date().getTime() / 1000) + 3600;
    let beneficiary = accounts[7];

    beforeEach(async () => {
        token = await Token.new(_unlockTokensTime);
        crowdsale = await Crowdsale.new(
            [
                preICOStartsAt,
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 30).toNumber(),
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 31).toNumber(),
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 61).toNumber()
            ],
            beneficiary,
            token.address
        );

        allocation = await Allocation.new(token.address);
    });

    describe('CLTAllocation', () => {

        it('check allocations', async () => {

            await Utils.checkState({allocation}, {
                allocation: {
                    token: token.address,
                    teamTokensSupply: new BigNumber(200).multipliedBy(precision).toNumber(),
                    airdropsTokensSupply: new BigNumber(10).multipliedBy(precision).toNumber(),
                    advisorsTokensSupply: new BigNumber(100).multipliedBy(precision).toNumber(),
                }
            });

            await token.addMinter(allocation.address)

            await allocation.allocateTeamTokens([accounts[0], accounts[1]], [28, 56])
                .then(Utils.receiptShouldSucceed);

            await allocation.allocateAirdropsTokens([accounts[2], accounts[3]], [2, 3])
                .then(Utils.receiptShouldSucceed);

            await allocation.allocateAdvisorsTokens([accounts[4], accounts[5]], [15, 36])
                .then(Utils.receiptShouldSucceed);


            await Utils.checkState({allocation}, {
                allocation: {
                    token: token.address,
                    teamTokensSupply: new BigNumber(200).multipliedBy(precision).minus(28).minus(56).toNumber(),
                    airdropsTokensSupply: new BigNumber(10).multipliedBy(precision).minus(2).minus(3).toNumber(),
                    advisorsTokensSupply: new BigNumber(100).multipliedBy(precision).minus(15).minus(36).toNumber(),
                }
            });

        });

    });
});