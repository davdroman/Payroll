pragma solidity ^0.4.11;

contract IPayroll {
	// company
	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);

	// employee
	function availableTokensForAllocation() constant returns (address[]);
	function daysUntilNextAllocation() constant returns(int);
	function determineAllocation(address[] tokens, uint[] distribution);

	function daysUntilNextPayday() constant returns(int);
	function payday();
}
