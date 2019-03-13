const BigNumber = require('bignumber.js');

const Token = artifacts.require('CLTToken.sol');
const Crowdsale = artifacts.require("test/CLTCrowdsaleTest.sol");
const Allocation = artifacts.require("CLTAllocation.sol");

module.exports = function (deployer, network, accounts) {
    let precision = "1000000000000000000",
        _unlockTokensTime = parseInt(new Date().getTime() / 1000) + 3600 * 24 * 30,
        preICOStartsAt = parseInt(new Date().getTime() / 1000) + 60,
        beneficiary = "0xb75037df93E6BBbbB80B0E5528acaA34511B1cD0".toLowerCase(),
        owner = "0xb75037df93E6BBbbB80B0E5528acaA34511B1cD0".toLowerCase(),
        token,
        crowdsale,
        allocation;

    deployer.then(function () {
        return deployer.deploy(Token, _unlockTokensTime);
    }).then(async () => {
        token = await Token.deployed();
        return deployer.deploy(
            Crowdsale,
            [
                preICOStartsAt,
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 30).toNumber(),
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 31).toNumber(),
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 61).toNumber()
            ],
            beneficiary,
            token.address
        );
    }).then(async () => {
        crowdsale = await Crowdsale.deployed();
        return deployer.deploy(Allocation, token.address);
    }).then(async () => {
        allocation = await Allocation.deployed();
    }).then(async () => {
        await token.addMinter(allocation.address)
        await token.addMinter(crowdsale.address)

        await token.transferOwnership(owner);
        await allocation.transferOwnership(owner);
    }).then(() => {
        console.log("Finished");
        console.log("Token", token.address);
        console.log("Crowdsale", crowdsale.address);
        console.log("Allocation", allocation.address);
        console.log("owner", owner);
    }) .catch((err) => {
        console.error('ERROR', err)
    });

};