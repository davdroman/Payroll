pragma solidity ^0.4.13;

contract IFundsController {
	function addFunds() payable;
	function escapeHatch();
	function addTokenFunds();

	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);

	function setExchangeRate(address token, uint usdExchangeRate);
}
