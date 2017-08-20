pragma solidity ^0.4.13;

import './IPayroll.sol';
import './Ownable.sol';

contract Payroll is Ownable, IPayroll {

	/*mapping (address => uint) usdExchangeRates;*/
	mapping (uint => Employee) employeesById;
	mapping (address => uint) employeeIdsByAddress;
	uint employeeCount;
	uint nextEmployeeId = 1;

	struct Employee {
		uint id;
		address accountAddress;
		address[] allowedTokens;
		mapping (address => bool) tokenAllowance;
		address[] allocatedTokens;
		mapping (address => uint) tokenAllocation;
		uint latestTokenAllocation;
		uint weiAllocation;
		uint yearlyUSDSalary;
	}

	function addEmployee(address accountAddress, address[] allowedTokens, uint initialYearlyUSDSalary) onlyOwner {
		require(employeeIdsByAddress[msg.sender] == 0); // check employee doesn't already exist
		require(accountAddress != 0x0);
		require(allowedTokens.length > 0);
		require(initialYearlyUSDSalary > 0);

		// add employee to employeesById
		employeesById[nextEmployeeId].id = nextEmployeeId;
		employeesById[nextEmployeeId].accountAddress = accountAddress;
		employeesById[nextEmployeeId].allowedTokens = allowedTokens;

		for (uint i = 0; i < allowedTokens.length; i++) {
			address tokenAddress = allowedTokens[i];
			employeesById[nextEmployeeId].tokenAllowance[tokenAddress] = true;
		}

		employeesById[nextEmployeeId].yearlyUSDSalary = initialYearlyUSDSalary;

		// add employee id to employeeIdsByAddress
		employeeIdsByAddress[accountAddress] = nextEmployeeId;

		// +1 employee and next employee id
		employeeCount = employeeCount+1;
		nextEmployeeId++;
	}

	function setEmployeeSalary(uint employeeId, uint yearlyUSDSalary) onlyOwner {

	}

	function removeEmployee(uint employeeId) onlyOwner {

	}

	function addFunds() payable onlyOwner {
		require(msg.value > 0);
	}

	function escapeHatch() onlyOwner {
		selfdestruct(owner);
	}

	// Use approveAndCall or ERC223 tokenFallback
	function addTokenFunds() onlyOwner {

	}

	function getEmployeeCount() constant onlyOwner returns (uint) {
		return employeeCount;
	}

	function getEmployee(uint employeeId) constant onlyOwner returns (
		address accountAddress,
		address[] allowedTokens,
		address[] allocatedTokens,
		uint latestTokenAllocation,
		uint weiAllocation,
		uint yearlyUSDSalary
	) {
		Employee employee = employeesById[employeeId];
		return (
			employee.accountAddress,
			employee.allowedTokens,
			employee.allocatedTokens,
			employee.latestTokenAllocation,
			employee.weiAllocation,
			employee.yearlyUSDSalary
		);
	}

	// Monthly usd amount spent in salaries
	function calculatePayrollBurnrate() constant onlyOwner returns (uint) {

	}

	// Days until the contract can run out of funds
	function calculatePayrollRunway() constant onlyOwner returns (uint) {

	}

	/// Determines allocation of ERC20 tokens as an employee's salary.
	///
	/// @param tokenAddresses specifies the token addresses to be paid.
	/// @param distributions is an array of integer percentages with a
	/// max sum of 10000 (100.00%). Wei is allocated as the amount left (if any)
	/// between the max sum and the actual sum of the distributions.
	/// i.e. a [5000, 3000] token distribution would result in 2000 (20%) left
	/// for wei allocation.
	function determineAllocation(address[] tokenAddresses, uint[] distributions) {
		/*require(employees[msg.sender].length != 0);
		require(tokenAddress.length > 0);
		require(tokenAddress.length == distribution.length);

		for (var i = 0; i < tokenAddress.length; i++) {
			address tokenAddress = tokenAddresses[i];
			uint distribution = distribution[i];
		}*/
	}

	// only callable once a month
	function payday() {

	}

	function setExchangeRate(address token, uint usdExchangeRate) {
		// uses decimals from token
	}
}
