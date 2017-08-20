pragma solidity ^0.4.13;

import '../Zeppelin/Ownable.sol';
import './IEmployeesController.sol';

contract EmployeesController is Ownable, IEmployeesController {

	address exchangeRateOracle;
	mapping (address => uint) usdExchangeRates;

	uint employeeCount;
	uint nextEmployeeId = 1;
	mapping (uint => Employee) employeesById;
	mapping (address => uint) employeeIdsByAddress;

	struct Employee {
		uint id;
		address accountAddress;
		address[] allowedTokens;
		mapping (address => bool) tokenAllowance;
		address[] allocatedTokens;
		mapping (address => uint) tokenAllocation;
		uint weiAllocation;
		uint latestTokenAllocation;
		uint yearlyUSDSalary;
	}

	function EmployeesController(address usdExchangeRateOracle) {
		exchangeRateOracle = usdExchangeRateOracle;
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
		employeeCount++;
		nextEmployeeId++;
	}

	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary) onlyOwner {
		require(employeesById[employeeId].id > 0);
		employeesById[employeeId].yearlyUSDSalary = newYearlyUSDSalary;
	}

	function removeEmployee(uint employeeId) onlyOwner {
		require(employeesById[employeeId].id > 0);

		delete employeesById[employeeId].id;
		delete employeesById[employeeId].accountAddress;

		address[] allowedTokens = employeesById[employeeId].allowedTokens;
		for (uint i = 0; i < allowedTokens.length; i++) {
			address allowedToken = allowedTokens[i];
			delete employeesById[employeeId].tokenAllowance[allowedToken];
		}
		delete employeesById[employeeId].allowedTokens;

		address[] allocatedTokens = employeesById[employeeId].allocatedTokens;
		for (uint e = 0; e < allocatedTokens.length; e++) {
			address allocatedToken = allocatedTokens[e];
			delete employeesById[employeeId].tokenAllocation[allocatedToken];
		}
		delete employeesById[employeeId].allocatedTokens;

		delete employeesById[employeeId].weiAllocation;
		delete employeesById[employeeId].latestTokenAllocation;
		delete employeesById[employeeId].yearlyUSDSalary;

		employeeCount--;
	}

	function getEmployeeCount() constant onlyOwner returns (uint) {
		return employeeCount;
	}

	function getEmployee(uint employeeId) constant onlyOwner returns (
		address accountAddress,
		address[] allowedTokens,
		address[] allocatedTokens,
		uint weiAllocation,
		uint latestTokenAllocation,
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

	function getEmployeeIsTokenAllowed(uint employeeId, address tokenAddress) constant onlyOwner returns (bool) {
		return employeesById[employeeId].tokenAllowance[tokenAddress];
	}

	function getEmployeeTokenAllocation(uint employeeId, address tokenAddress) constant onlyOwner returns (uint) {
		return employeesById[employeeId].tokenAllocation[tokenAddress];
	}

	function setExchangeRate(address token, uint usdExchangeRate) {
		require(msg.sender == exchangeRateOracle);
		// uses decimals from token
	}
}
