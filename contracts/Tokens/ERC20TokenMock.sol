pragma solidity ^0.4.11;

import './Owned.sol';
import './ERC20Token.sol';

/**
    ERC20 Standard Token mock used for tests
*/
contract ERC20TokenMock is ERC20Token, Owned {
    uint256 public totalSupply = 0;
    mapping (address => uint256) public balanceOf;

	function pump(address recipient, uint amount) ownerOnly {
		balanceOf[recipient] += amount;
		totalSupply += amount;
	}
}
