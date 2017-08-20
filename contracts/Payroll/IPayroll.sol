pragma solidity ^0.4.13;

contract IPayroll {
	/*function daysUntilNextPayday() constant returns(int);*/
	function payday();

	/*function tokensForAllocation() constant returns (address[]);*/
	/*function daysUntilNextAllocation() constant returns(int);*/
	function determineAllocation(address[] tokens, uint[] distribution);
}
