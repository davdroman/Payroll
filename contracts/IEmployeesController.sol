pragma solidity ^0.4.13;

contract IEmployeeController {
	function addEmployee(address accountAddress, address[] allowedTokens, uint initialYearlyUSDSalary);
	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary);
	function removeEmployee(uint employeeId);
	function getEmployeeCount() constant returns (uint);
	function getEmployee(uint employeeId) constant returns (
		address accountAddress,
		address[] allowedTokens,
		address[] allocatedTokens,
		uint latestTokenAllocation,
		uint weiAllocation,
		uint yearlyUSDSalary
	);
}
