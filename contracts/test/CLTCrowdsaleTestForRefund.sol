pragma solidity ^0.5.0;

import '../CLTCrowdsale.sol';


contract CLTCrowdsaleTestForRefund is CLTCrowdsale {

    constructor(
        uint256[4] memory _periods,
        address payable _etherHolder,
        CLTToken _token
    )
        public
        CLTCrowdsale(_periods, _etherHolder, _token)
    {}

    /**
     * @return the amount of wei raised.
     */
    function weiRaised() public view returns (uint256) {
        return 100000000 ether;
    }

    function changeDatesTest(uint256[4] memory _periods) public {
        require(_periods[1] > _periods[0]);
        require(_periods[2] > _periods[1]);
        require(_periods[3] > _periods[2]);

        openingTimePreICO = _periods[0];
        closingTimePreICO = _periods[1];
        openingTimeICO = _periods[2];
        closingTimeICO = _periods[3];
    }

}