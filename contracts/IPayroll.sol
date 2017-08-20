pragma solidity ^0.4.11;

contract IPayroll {
	// Company (owner) functions
	function addEmployee(address accountAddress, address[] allowedTokens, uint initialYearlyUSDSalary);
	function setEmployeeSalary(uint employeeId, uint yearlyUSDSalary);
	function removeEmployee(uint employeeId);

	function addFunds() payable;
	function escapeHatch();
	function addTokenFunds();

	function getEmployeeCount() constant returns (uint);
	function getEmployee(uint employeeId) constant returns (
		address accountAddress,
		address[] allowedTokens,
		address[] allocatedTokens,
		uint latestTokenAllocation,
		uint weiAllocation,
		uint yearlyUSDSalary
	);

	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);

	// Employee functions
	function determineAllocation(address[] tokens, uint[] distribution);
	function payday();

	// Exchange rate Oracle callbacks
	function setExchangeRate(address token, uint usdExchangeRate);
}
