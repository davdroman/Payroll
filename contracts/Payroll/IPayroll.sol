pragma solidity ^0.4.11;

contract IPayroll {
	// Company-only
	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);
	function escapeHatch();

	// Employee-only
	function payday();
}
