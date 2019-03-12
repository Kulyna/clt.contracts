pragma solidity 0.5.0;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';


contract TimeLockedToken is ERC20, Ownable {

    uint256 public time;

    mapping(address => bool) public excludedAddresses;

    modifier isTimeLocked(address _holder, bool _timeLocked) {
        bool locked = (block.timestamp < time);
        require(excludedAddresses[_holder] == true || locked == _timeLocked);
        _;
    }

    constructor(uint256 _time) public {
        time = _time;
    }

    function updateExcludedAddress(address _address, bool _status) public onlyOwner {
        excludedAddresses[_address] = _status;
    }

    function setUnlockTime(uint256 _unlockTokensTime) public onlyOwner {
        time = _unlockTokensTime;
    }

    function transfer(address _to, uint256 _tokens) public isTimeLocked(msg.sender, false) returns (bool) {
        return super.transfer(_to, _tokens);
    }

    function transferFrom(
        address _holder,
        address _to,
        uint256 _tokens
    ) public isTimeLocked(_holder, false) returns (bool) {
        return super.transferFrom(_holder, _to, _tokens);
    }

}
