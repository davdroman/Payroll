pragma solidity ^0.4.11;

contract IPayroll {
	function determineAllocation(address[] tokens, uint[] distribution);
	function payday();
}
