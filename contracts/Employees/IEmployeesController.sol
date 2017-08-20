pragma solidity ^0.4.11;

contract IEmployeesController {
	function addEmployee(address accountAddress, uint initialYearlyUSDSalary);
	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary);
	function removeEmployee(uint employeeId);
	function getEmployeeCount() constant returns (uint);
	function getEmployee(uint employeeId) constant returns (
		address accountAddress,
		address[] allocatedTokens,
		uint latestTokenAllocation,
		uint weiAllocation,
		uint yearlyUSDSalary
	);
	function getEmployeeTokenAllocation(uint employeeId, address tokenAddress) constant returns (uint);
}
