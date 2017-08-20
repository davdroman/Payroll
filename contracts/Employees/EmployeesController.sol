pragma solidity ^0.4.11;

import '../Zeppelin/Ownable.sol';
import '../Exchange/USDExchange.sol';
/*import '../Allocation/Allocator.sol';*/
import './IEmployeesController.sol';

contract EmployeesController is Ownable, IEmployeesController {
	/*Allocator allocator;*/
	USDExchange exchange;

	uint employeeCount;
	uint nextEmployeeId = 1;
	mapping (uint => Employee) employeesById;
	mapping (address => uint) employeeIdsByAddress;

	struct Employee {
		uint id;
		address accountAddress;
		address[] allocatedTokens;
		mapping (address => uint) tokenAllocation; // parts per 10000 (100.00%)
		address[] peggedTokens;
		mapping (address => uint) tokenPegging; // pegged exchange rate (18 decimals)
		uint latestTokenAllocation;
		uint latestPayday;
		uint yearlyUSDSalary; // 18 decimals
	}

	function ExployeesController(address initialExchange) {
		setExchange(initialExchange);
	}

	function setExchange(address newExchange) onlyOwner {
		require(newExchange != 0x0);
		exchange = USDExchange(newExchange);
	}

	/// Adds a new employee.
	///
	/// @param accountAddress the initial address for the employee to receive
	/// their salary.
	/// @param initialYearlyUSDSalary the initial yearly USD salary, expressed
	/// with 18 decimals.
	/// i.e. $43500.32 = 4350032e16
	function addEmployee(address accountAddress, uint initialYearlyUSDSalary) onlyOwner {
		require(employeeIdsByAddress[msg.sender] == 0); // check employee doesn't already exist
		require(accountAddress != 0x0);
		require(initialYearlyUSDSalary > 0);

		employeesById[nextEmployeeId].id = nextEmployeeId;
		employeesById[nextEmployeeId].accountAddress = accountAddress;
		employeesById[nextEmployeeId].yearlyUSDSalary = initialYearlyUSDSalary;

		employeeIdsByAddress[accountAddress] = nextEmployeeId;

		employeeCount++;
		nextEmployeeId++;
	}

	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary) onlyOwner {
		require(employeesById[employeeId].id > 0);
		employeesById[employeeId].yearlyUSDSalary = newYearlyUSDSalary;
	}

	/*function setEmployeeAllocation(uint employeeId, uint )*/

	function removeEmployee(uint employeeId) onlyOwner {
		require(employeesById[employeeId].id > 0);

		delete employeesById[employeeId].id;
		delete employeesById[employeeId].accountAddress;

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
		address[] allocatedTokens,
		uint weiAllocation,
		uint latestTokenAllocation,
		uint yearlyUSDSalary
	) {
		Employee employee = employeesById[employeeId];
		return (
			employee.accountAddress,
			employee.allocatedTokens,
			employee.latestTokenAllocation,
			employee.weiAllocation,
			employee.yearlyUSDSalary
		);
	}

	function getEmployeeTokenAllocation(uint employeeId, address tokenAddress) constant onlyOwner returns (uint) {
		return employeesById[employeeId].tokenAllocation[tokenAddress];
	}
}
