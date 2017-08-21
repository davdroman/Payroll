pragma solidity ^0.4.11;

contract IEmployeesController {
	function addEmployee(address accountAddress, uint initialYearlyUSDSalary);
	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary);
	function setEmployeeAllocation(address[] tokens, uint[] distribution) external;
	function removeEmployee(uint employeeId);
	function getEmployeeCount() constant returns (uint);
	function getEmployee(uint employeeId) constant returns (
		address accountAddress,
		address[] allocatedTokens,
		address[] peggedTokens,
		uint latestTokenAllocation,
		uint latestPayday,
		uint yearlyUSDSalary
	);
	function getEmployeeTokenAllocation(uint employeeId, address tokenAddress) constant returns (uint);
	function getEmployeeTokenPegging(uint employeeId, address tokenAddress) constant returns (uint);
}
