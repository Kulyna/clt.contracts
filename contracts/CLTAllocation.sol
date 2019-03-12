pragma solidity 0.5.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './CLTToken.sol';

contract CLTAllocation is Ownable {

    using SafeMath for uint256;

    CLTToken public token;

    uint256 public teamTokensSupply = 200e18;
    uint256 public airdropsTokensSupply = 10e18;
    uint256 public advisorsTokensSupply = 100e18;

    constructor(CLTToken _token) public {
        require(address(_token) != address(0));
        token = _token;
    }

    function allocateTeamTokens(address[] memory _addresses, uint256[] memory _tokens) public onlyOwner {
        require(_addresses.length == _tokens.length);
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(_addresses[i] != address(0) && _tokens[i] > 0 && _tokens[i] <= teamTokensSupply);
            teamTokensSupply -= _tokens[i];

            token.mint(_addresses[i], _tokens[i]);
        }
    }

    function allocateAirdropsTokens(address[] memory _addresses, uint256[] memory _tokens) public onlyOwner {
        require(_addresses.length == _tokens.length);
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(_addresses[i] != address(0) && _tokens[i] > 0 && _tokens[i] <= airdropsTokensSupply);
            airdropsTokensSupply -= _tokens[i];

            token.mint(_addresses[i], _tokens[i]);
        }
    }

    function allocateAdvisorsTokens(address[] memory _addresses, uint256[] memory _tokens) public onlyOwner {
        require(_addresses.length == _tokens.length);
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(_addresses[i] != address(0) && _tokens[i] > 0 && _tokens[i] <= advisorsTokensSupply);
            advisorsTokensSupply -= _tokens[i];

            token.mint(_addresses[i], _tokens[i]);
        }
    }

}
