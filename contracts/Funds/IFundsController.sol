pragma solidity ^0.4.11;

contract IFundsController {
	function determineAllocation(address[] tokens, uint[] distribution);

	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);

	function escapeHatch();
}
