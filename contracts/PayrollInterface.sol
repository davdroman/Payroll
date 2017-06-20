pragma solidity ^0.4.11;

contract PayrollInterface {
	// Company (owner) functions
	function addEmployee(address accountAddress, address[] allowedTokens, uint256 initialYearlyUSDSalary);
	function setEmployeeSalary(uint256 employeeId, uint256 yearlyUSDSalary);
	function removeEmployee(uint256 employeeId);

	function addFunds() payable;
	function scapeHatch();
	function addTokenFunds();

	function getEmployeeCount() constant returns (uint256);
	function getEmployee(uint256 employeeId) constant returns (address employee);

	function calculatePayrollBurnrate() constant returns (uint256);
	function calculatePayrollRunway() constant returns (uint256);

	// Employee functions
	function determineAllocation(address[] tokens, uint256[] distribution);
	function payday();

	// Exchange rate Oracle callbacks
	function setExchangeRate(address token, uint256 usdExchangeRate);
}
