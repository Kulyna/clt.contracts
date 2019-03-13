pragma solidity 0.5.0;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';
import './token/TimeLockedToken.sol';


contract CLTToken is TimeLockedToken, ERC20Detailed, ERC20Mintable {

    address public crowdsaleContract;

    constructor(
        uint256 _unlockTokensTime
    )
        public
        ERC20Detailed('Test Token', 'TestCLT', 18)
        TimeLockedToken(_unlockTokensTime)
    {}

    function setCrowdsaleContract(address _crowdsaleContract) public onlyOwner {
        require(_crowdsaleContract != address(0));
        require(crowdsaleContract == address(0));

        crowdsaleContract = _crowdsaleContract;
    }


    function burnWhileRefunding(address _holder) public {
        require(crowdsaleContract == msg.sender);
        _burn(_holder, balanceOf(_holder));
    }

}