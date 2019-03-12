pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol';


contract CLTTimedCrowdsale is TimedCrowdsale {

    uint256 public openingTimePreICO;
    uint256 public closingTimePreICO;
    uint256 public openingTimeICO;
    uint256 public closingTimeICO;

    constructor (
        uint256[4] memory _periods
    )
        public
        TimedCrowdsale(_periods[0], _periods[1])
    {
        // solhint-disable-next-line not-rely-on-time
        require(_periods[0] >= block.timestamp);
        require(_periods[1] > _periods[0]);
        require(_periods[2] > _periods[1]);
        require(_periods[3] > _periods[2]);

        openingTimePreICO = _periods[0];
        closingTimePreICO = _periods[1];
        openingTimeICO = _periods[2];
        closingTimeICO = _periods[3];
    }

    function isOpen() public view returns (bool) {
        return isPreICOOpen() || isICOOpen();
    }

    function isPreICOOpen() public view returns (bool) {
        // solhint-disable-next-line not-rely-on-time
        return block.timestamp >= openingTimePreICO && block.timestamp <= closingTimePreICO;
    }

    function isICOOpen() public view returns (bool) {
        // solhint-disable-next-line not-rely-on-time
        return block.timestamp >= openingTimeICO && block.timestamp <= closingTimeICO;
    }

    function hasClosed() public view returns (bool) {
        // solhint-disable-next-line not-rely-on-time
        return block.timestamp > closingTimeICO;
    }

}
