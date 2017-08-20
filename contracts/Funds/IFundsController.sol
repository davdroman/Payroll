pragma solidity ^0.4.13;

contract IFundsController {
	function pay(uint employeeId, uint amount);
	function payToken(uint employeeId, address token, uint amount);

	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);

	function escapeHatch();
}
