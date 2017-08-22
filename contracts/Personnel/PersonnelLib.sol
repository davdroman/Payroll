pragma solidity ^0.4.11;

// I'm *so* tempted to name this HRLib.
library PersonnelLib {
	struct Personnel {
		uint employeeCount;
		uint nextEmployeeId;
		mapping (uint => Employee) employeesById;
		mapping (address => uint) employeeIdsByAddress;
	}

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

	function init(Personnel storage personnel) {
		personnel.nextEmployeeId = 1; // id == 0 is invalid, and used to determine inexistent employees
	}

	/// Adds a new employee.
	///
	/// @param accountAddress the initial address for the employee to receive
	/// their salary.
	/// @param initialYearlyUSDSalary the initial yearly USD salary, expressed
	/// with 18 decimals.
	/// i.e. $43500.32 = 4350032e16
	function addEmployee(Personnel storage personnel, address accountAddress, uint initialYearlyUSDSalary) {
		/*require(employeeIdsByAddress[msg.sender] == 0); // check employee doesn't already exist
		require(accountAddress != 0x0);
		require(initialYearlyUSDSalary > 0);

		employeesById[nextEmployeeId].id = nextEmployeeId;
		employeesById[nextEmployeeId].accountAddress = accountAddress;
		employeesById[nextEmployeeId].yearlyUSDSalary = initialYearlyUSDSalary;

		employeeIdsByAddress[accountAddress] = nextEmployeeId;

		employeeCount++;
		nextEmployeeId++;*/
	}

	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary) {
		/*require(employeesById[employeeId].id > 0);
		require(newYearlyUSDSalary > 0);
		employeesById[employeeId].yearlyUSDSalary = newYearlyUSDSalary;*/
	}

	function setEmployeeAllocation(address[] tokens, uint[] distribution) {
		/*uint employeeId = employeeIdsByAddress[msg.sender];
		require(employeesById[employeeId].id > 0);
		require(tokens.length == distribution.length);
		require(SafeMath.sub(now, employeesById[employeeId].latestTokenAllocation) >= 182 days);

		// check distribution adds up to 100%
		uint sum = 0;
		for (uint e = 0; e < distribution.length; e++) {
			sum += distribution[e];
		}
		require(sum == 10000);

		// clean up old allocation
		address[] allocatedTokens = employeesById[employeeId].allocatedTokens;
		for (uint i = 0; i < allocatedTokens.length; i++) {
			address allocatedToken = allocatedTokens[i];
			delete employeesById[employeeId].tokenAllocation[allocatedToken];
		}
		delete employeesById[employeeId].allocatedTokens;

		// set new allocation
		for (uint o = 0; o < tokens.length; o++) {
			address token = tokens[o];
			employeesById[employeeId].allocatedTokens.push(token);
			employeesById[employeeId].tokenAllocation[token] = distribution[o];

			// peg new token
			if (employeesById[employeeId].tokenPegging[token] == 0) {
				uint tokenExchangeRate = exchange.exchangeRates(token);
				assert(tokenExchangeRate > 0);
				employeesById[employeeId].peggedTokens.push(token);
				employeesById[employeeId].tokenPegging[token] = tokenExchangeRate;
			}
		}

		employeesById[employeeId].latestTokenAllocation = now;*/
	}

	function resetEmployeeLatestTokenAllocation(uint employeeId) {
		/*delete employeesById[employeeId].latestTokenAllocation;*/
	}

	function removeEmployee(uint employeeId) {
		/*require(employeesById[employeeId].id > 0);

		delete employeesById[employeeId].id;
		delete employeesById[employeeId].accountAddress;

		address[] allocatedTokens = employeesById[employeeId].allocatedTokens;
		for (uint e = 0; e < allocatedTokens.length; e++) {
			address allocatedToken = allocatedTokens[e];
			delete employeesById[employeeId].tokenAllocation[allocatedToken];
		}
		delete employeesById[employeeId].allocatedTokens;

		delete employeesById[employeeId].latestTokenAllocation;
		delete employeesById[employeeId].yearlyUSDSalary;

		employeeCount--;*/
	}

	function getEmployeeCount() constant returns (uint) {
		/*return employeeCount;*/
	}

	function getEmployee(uint employeeId) constant returns (
		address accountAddress,
		address[] allocatedTokens,
		address[] peggedTokens,
		uint latestTokenAllocation,
		uint latestPayday,
		uint yearlyUSDSalary
	) {
		/*Employee employee = employeesById[employeeId];
		return (
			employee.accountAddress,
			employee.allocatedTokens,
			employee.peggedTokens,
			employee.latestTokenAllocation,
			employee.latestPayday,
			employee.yearlyUSDSalary
		);*/
	}

	function allocatedTokens(uint employeeId) constant returns(address[] allocatedTokens) {
		/*return employeesById[employeeId].allocatedTokens;*/
	}

	/*function tokenAllocation(uint employeeId, address tokenAddress) constant returns (uint) {
		return employeesById[employeeId].tokenAllocation[tokenAddress];
	}

	function tokenPegging(uint employeeId, address tokenAddress) constant returns (uint) {
		return employeesById[employeeId].tokenPegging[tokenAddress];
	}*/

	// Monthly usd amount spent in salaries
	function payrollBurnrate(Personnel storage personnel) constant returns (uint) {

	}

	// Days until the contract can run out of funds
	function payrollRunway() constant returns (uint) {

	}
}
