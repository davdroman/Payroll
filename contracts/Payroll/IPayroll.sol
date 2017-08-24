pragma solidity ^0.4.11;

contract IPayroll {
	// company
	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);
	function escapeHatch();

	// employee
	function payday();
}
