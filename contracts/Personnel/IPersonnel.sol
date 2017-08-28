pragma solidity ^0.4.11;

contract IPersonnel {
	// Company-only
	function addEmployee(address accountAddress, uint initialYearlyUSDSalary);
	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary);
	function removeEmployee(uint employeeId);
	function getEmployeeCount() constant returns (uint);
	function getEmployeeId(address employeeAddress) constant returns (uint);
	function getEmployee(uint employeeId) constant returns (
		address accountAddress,
		address[] allocatedTokensIndex,
		address[] peggedTokensIndex,
		uint latestTokenAllocation,
		uint latestPayday,
		uint yearlyUSDSalary
	);

	// Employee-only
	function determineAllocation(address[] tokens, uint[] distribution);
	function getSalaryTokenValue(address tokenAddress) constant returns (uint);

	function getAllocatedTokensCount() constant returns (uint);
	function getAllocatedTokenAddress(uint index) returns (address);
	function getAllocatedTokenValue(address tokenAddress) constant returns (uint);

	function getPeggedTokensCount() constant returns (uint);
	function getPeggedTokenAddress(uint index) returns (address);
	function getPeggedTokenValue(address tokenAddress) constant returns (uint);
}
