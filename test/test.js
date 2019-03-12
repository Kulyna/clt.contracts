const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const BN = require('bn.js');

const Utils = require("./utils");
const Token = artifacts.require('CLTToken.sol');
const Crowdsale = artifacts.require("test/CLTCrowdsaleTest.sol");
const CLTCrowdsaleTestForRefund = artifacts.require("test/CLTCrowdsaleTestForRefund.sol");
const RefundEscrow = artifacts.require("./../node_modules/openzeppelin-solidity/contracts/payment/escrow/RefundEscrow");

const precision = new BigNumber("1000000000000000000");

contract('CLTCrowdsale', accounts => {

    let token = null
    let crowdsale = null;
    let escrow = null;

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
    });

    describe('CLTCrowdsale', () => {

        it('check contribution flow', async () => {
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: 0,
                    isOpen: false,
                }
            });

            await crowdsale.changeDatesTest([
                parseInt(new Date().getTime() / 1000) - 3600,
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 30).toNumber(),
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 31).toNumber(),
                new BigNumber(preICOStartsAt).plus(3600 * 24 * 61).toNumber()
            ]);
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: 0,
                    isPreICOOpen: true,
                    isICOOpen: false,
                    isOpen: true,
                }
            });

            await crowdsale.addWhitelisted(accounts[1])
                .then(Utils.receiptShouldSucceed);
            await token.addMinter(crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            // check min invest
            await crowdsale.sendTransaction({from: accounts[1], value: new BigNumber('0.49').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
            // check pre-ico contribution
            await crowdsale.sendTransaction({from: accounts[1], value: new BigNumber('0.5').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldSucceed);
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: new BigNumber('1.1').multipliedBy(precision).valueOf(),
                    isPreICOOpen: true,
                    isICOOpen: false,
                    isOpen: true,
                }
            });

            let time = parseInt(new Date().getTime() / 1000);

            await crowdsale.changeDatesTest([
                time - 3600 * 24 * 30,
                time - 3600 * 24 * 1,
                time - 3600,
                time + 3600 * 24 * 30
            ]);
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: new BigNumber('1.1').multipliedBy(precision).valueOf(),
                    isPreICOOpen: false,
                    isICOOpen: true,
                    isOpen: true,
                }
            });

            await crowdsale.sendTransaction({from: accounts[2], value: new BigNumber('0.49').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
            await crowdsale.sendTransaction({from: accounts[2], value: new BigNumber('0.5').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldSucceed);
            //0.5 eth = 0.5 token
            //1 week = 8% discount
            //0.5 * 108 / 100 = 0.54
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: new BigNumber('1.1').plus('0.54').multipliedBy(precision).valueOf(),
                    isPreICOOpen: false,
                    isICOOpen: true,
                    isOpen: true,
                }
            });
            await crowdsale.changeDatesTest([
                time - 3600 * 24 * 30,
                time - 3600 * 24 * 15,
                time - 3600 * 24 * 13.8,
                time + 3600 * 24 * 30
            ]);
            await crowdsale.sendTransaction({from: accounts[3], value: new BigNumber('0.5').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldSucceed);
            //0.5 eth = 0.5 token
            //2 week = 7% discount
            //0.5 * 107 / 100 = 0.535
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: new BigNumber('1.1').plus('0.54').plus('0.535').multipliedBy(precision).valueOf(),
                    isPreICOOpen: false,
                    isICOOpen: true,
                    isOpen: true,
                }
            });

            await crowdsale.changeDatesTest([
                time - 3600 * 24 * 51,
                time - 3600 * 24 * 50,
                time - 3600 * 24 * 49.8,
                time + 3600 * 24 * 30
            ]);

            await crowdsale.sendTransaction({from: accounts[3], value: new BigNumber('0.5').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldSucceed);

            //0.5 eth = 0.5 token
            //8 week = 1% discount
            //0.5 * 101 / 100 = 0.505
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: new BigNumber('1.1').plus('0.54').plus('0.535').plus('0.505').multipliedBy(precision).valueOf(),
                    isPreICOOpen: false,
                    isICOOpen: true,
                    isOpen: true,
                }
            });

            await crowdsale.changeDatesTest([
                time - 3600 * 24 * 70,
                time - 3600 * 24 * 60,
                time - 3600 * 24 * 56.1,
                time + 3600 * 24 * 30
            ]);

            await crowdsale.sendTransaction({from: accounts[3], value: new BigNumber('0.5').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldSucceed);

            //0.5 eth = 0.5 token
            //9 week = 0% discount
            //0.5 * 101 / 100 = 0.505
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: new BigNumber('1.1').plus('0.54').plus('0.535').plus('0.505').plus('0.5').multipliedBy(precision).valueOf(),
                    isPreICOOpen: false,
                    isICOOpen: true,
                    isOpen: true,
                    weiRaised: new BigNumber('2.5').multipliedBy(precision).valueOf(),
                }
            });
        });

        it('check refund', async () => {
            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    tokensSold: 0,
                    isOpen: false,
                }
            });

            await token.addMinter(crowdsale.address)
                .then(Utils.receiptShouldSucceed);
            let time = parseInt(new Date().getTime() / 1000);
            await crowdsale.changeDatesTest([
                time - 3600 * 24 * 70,
                time - 3600 * 24 * 60,
                time - 3600 * 24 * 56.1,
                time + 3600 * 24 * 30
            ]);

            let initialEtherBalanceA3 = await Utils.getEtherBalance(accounts[3]);

            await crowdsale.sendTransaction({from: accounts[3], value: new BigNumber('1').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldSucceed);

            let afterContributionEtherBalanceA3 = await Utils.getEtherBalance(accounts[3]);

            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    goalReached: false,
                    hasClosed: false,
                    goal: new BigNumber('1000000').multipliedBy(precision).toNumber(),
                },
            });

            await crowdsale.changeDatesTest([
                time - 3600 * 24 * 70,
                time - 3600 * 24 * 60,
                time - 3600 * 24 * 56.1,
                time - 3600 * 24 * 30
            ]);

            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    goalReached: false,
                    hasClosed: true,
                    goal: new BigNumber('1000000').multipliedBy(precision).toNumber(),
                },
            });

            await crowdsale.finalize()
                .then(Utils.receiptShouldSucceed);

            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    goalReached: false,
                    hasClosed: true,
                    goal: new BigNumber('1000000').multipliedBy(precision).toNumber(),
                }
            });

            await token.setCrowdsaleContract(crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            await token.setCrowdsaleContract(accounts[5])
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await Utils.checkState({token}, {
                token: {
                    balanceOf: [
                        {[accounts[3]]: new BigNumber('1').multipliedBy(precision).toNumber()},
                    ],
                }
            });

            await crowdsale.claimRefund(accounts[3], {from: accounts[3]})
                .then(Utils.receiptShouldSucceed);

            let afterRefundEtherBalanceA3 = await Utils.getEtherBalance(accounts[3]);

            await Utils.checkState({crowdsale, token}, {
                crowdsale: {
                    goalReached: false,
                    hasClosed: true,
                    goal: new BigNumber('1000000').multipliedBy(precision).toNumber(),
                },
                token: {
                    balanceOf: [
                        {[accounts[3]]: new BigNumber('0').multipliedBy(precision).toNumber()},
                    ],
                }
            });

            console.log('should: ', new BigNumber(afterContributionEtherBalanceA3).plus(new BigNumber('1').multipliedBy(precision)).toNumber())
            console.log('actual: ', await Utils.getEtherBalance(accounts[3]))
        });

        it('check refund 1', async () => {

            token = await Token.new(_unlockTokensTime);
            crowdsale = await CLTCrowdsaleTestForRefund.new(
                [
                    preICOStartsAt,
                    new BigNumber(preICOStartsAt).plus(3600 * 24 * 30).toNumber(),
                    new BigNumber(preICOStartsAt).plus(3600 * 24 * 31).toNumber(),
                    new BigNumber(preICOStartsAt).plus(3600 * 24 * 61).toNumber()
                ],
                beneficiary,
                token.address
            );


            await token.addMinter(crowdsale.address)
                .then(Utils.receiptShouldSucceed);
            let time = parseInt(new Date().getTime() / 1000);
            await crowdsale.changeDatesTest([
                time - 3600 * 24 * 70,
                time - 3600 * 24 * 60,
                time - 3600 * 24 * 56.1,
                time + 3600 * 24 * 30
            ]);

            await crowdsale.sendTransaction({from: accounts[3], value: new BigNumber('1').multipliedBy(precision).valueOf()})
                .then(Utils.receiptShouldSucceed);

            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    goalReached: true,
                    hasClosed: false,
                    goal: new BigNumber('1000000').multipliedBy(precision).toNumber(),
                },
            });

            await crowdsale.changeDatesTest([
                time - 3600 * 24 * 70,
                time - 3600 * 24 * 60,
                time - 3600 * 24 * 56.1,
                time - 3600 * 24 * 30
            ]);

            await Utils.checkState({crowdsale}, {
                crowdsale: {
                    goalReached: true,
                    hasClosed: true,
                    goal: new BigNumber('1000000').multipliedBy(precision).toNumber(),
                },
            });

            let initialBeneficiaryBalance = await Utils.getEtherBalance(beneficiary);

            await crowdsale.finalize()
                .then(Utils.receiptShouldSucceed);

            await Utils.checkState({crowdsale, token}, {
                crowdsale: {
                    goalReached: true,
                    hasClosed: true,
                    goal: new BigNumber('1000000').multipliedBy(precision).toNumber(),
                },
                token: {
                    balanceOf: [
                        {[accounts[3]]: new BigNumber('1').multipliedBy(precision).toNumber()},
                    ],
                }
            });

            console.log('should: ', new BigNumber(initialBeneficiaryBalance).plus(new BigNumber('1').multipliedBy(precision)).toNumber())
            console.log('actual: ', await Utils.getEtherBalance(beneficiary))

        });

    });
});