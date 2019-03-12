pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol';
import 'openzeppelin-solidity/contracts/crowdsale/validation/WhitelistCrowdsale.sol';
import 'openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';
import 'openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import './CLTTimedCrowdsale.sol';
import './CLTToken.sol';


contract CLTCrowdsale is Crowdsale, CLTTimedCrowdsale, WhitelistCrowdsale, MintedCrowdsale, RefundableCrowdsale {

    uint256 public hardCap = 100000000 ether;

    uint256 public minInvest = 0.5 ether;

    uint256 public tokensSold;

    constructor(
        uint256[4] memory _periods,
        address payable _etherHolder,
        CLTToken _token
    )
        public
        Crowdsale(2, _etherHolder, _token)
        CLTTimedCrowdsale(_periods)
        RefundableCrowdsale(1000000 ether)
    {
        require(_etherHolder != address(0));
        require(address(_token) != address(0));
    }

    function isWhitelisted(address account) public view returns (bool) {
        if (!isICOOpen()) {
            return super.isWhitelisted(account);
        }

        return true;
    }

    function getTokenAmountWithDiscount(uint256 _weiAmount) public view returns (uint256) {
        if (isPreICOOpen()) {
            //1 token - 0.5 eth
            //discount - 10%
            //_weiAmount(wei) * rate(token) * 110(%) / 100(%)
            return _weiAmount.mul(2).mul(11).div(10);
        }

        if (isICOOpen()) {
            //1 token - 1 eth
            // solhint-disable-next-line not-rely-on-time
            uint256 currentICOWeek = uint256(block.timestamp).sub(openingTimeICO).div(7 days);

            //discount - start with 8%, each week decrease 1%
            uint256 discountPercentage;
            if (currentICOWeek < 8) {
                discountPercentage = uint256(8).sub(currentICOWeek);
            }

            //_weiAmount(wei) * rate(token) * (100 + discountPercentage(%)) / 100(%)
            return _weiAmount.mul(uint256(100).add(discountPercentage)).div(100);
        }
    }

    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal view {
        require(_weiAmount >= minInvest);
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }

    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        tokensSold = tokensSold.add(_getTokenAmount(weiAmount));
    }

    function _postValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        require(hardCap >= weiRaised());
    }

    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        return getTokenAmountWithDiscount(weiAmount);
    }

    function claimRefund(address payable refundee) public {
        CLTToken(address(token())).burnWhileRefunding(refundee);
        super.claimRefund(refundee);
    }

}