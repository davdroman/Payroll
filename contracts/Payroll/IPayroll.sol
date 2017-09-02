pragma solidity ^0.4.11;

contract IPayroll {
	// Company-only
	function addEmployee(address _address, uint _yearlyUSDSalary);
	function setEmployeeSalary(uint _id, uint _yearlyUSDSalary);
	function removeEmployee(uint _id);
	function getEmployeeCount() constant returns (uint);
	function getEmployeeId(address _address) constant returns (uint);
	function getEmployee(uint _id) constant returns (
		address accountAddress,
		address[] allocatedTokensIndex,
		address[] peggedTokensIndex,
		uint latestTokenAllocation,
		uint latestPayday,
		uint yearlyUSDSalary
	);

	function calculatePayrollBurnrate() constant returns (uint);
	function calculatePayrollRunway() constant returns (uint);

	function escapeHatch();

	// Employee-only
	function determineAllocation(address[] _tokens, uint[] _distribution);
	function payday();

	function getAllocatedTokens() constant returns (address[]);
	function getAllocatedTokenValue(address _token) constant returns (uint);

	function getPeggedTokens() constant returns (address[]);
	function getPeggedTokenValue(address _token) constant returns (uint);

	function getSalaryTokenValue(address _token) constant returns (uint);
}
