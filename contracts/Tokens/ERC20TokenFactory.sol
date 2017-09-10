pragma solidity ^0.4.11;

import './ERC20Token.sol';

contract ERC20TokenFactory {

	address[] tokens;

	function getTokens() constant returns (address[]) {
		return tokens;
	}

	function create(uint256 _initialAmount, string _tokenName, uint8 _decimalUnits, string _tokenSymbol) {
		address token = new ERC20Token(_initialAmount, _tokenName, _decimalUnits, _tokenSymbol);
		tokens.push(token);
	}
}
