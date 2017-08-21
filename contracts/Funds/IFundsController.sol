pragma solidity ^0.4.11;

contract IFundsController {
	function pay(uint employeeId, uint amount);
	function payToken(uint employeeId, address token, uint amount);

	function determineAllocation(address[] tokens, uint[] distribution);

	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);

	function escapeHatch();
}
