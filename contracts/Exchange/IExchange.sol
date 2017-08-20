pragma solidity ^0.4.11;

contract IExchange {
	mapping (address => uint) public exchangeRates;
	function peggedValue(address token, uint amount, uint rate) constant returns (uint);
	function setExchangeRate(address token, uint exchangeRate);
}
