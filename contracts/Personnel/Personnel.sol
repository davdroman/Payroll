pragma solidity ^0.4.11;

import '../Exchange/IExchange.sol';
import '../Zeppelin/Ownable.sol';
import '../Zeppelin/SafeMath.sol';

contract Personnel is Ownable {
	using SafeMath for uint;

	//////////////////
	/// Properties ///
	//////////////////

	IExchange public exchange;

	uint employeeCount;
	uint nextEmployeeId = 1;
	mapping (uint => Employee) employeesById;
	mapping (address => uint) employeeIdsByAddress;

	///////////////
	/// Structs ///
	///////////////

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

	/////////////////
	/// Modifiers ///
	/////////////////

	modifier validAddress(address addr) {
		require(addr != 0x0);
		_;
	}

	modifier validEmployeeId(uint employeeId) {
		require(employeesById[employeeId].id > 0);
		_;
	}

	modifier onlyEmployee {
		uint employeeId = employeeIdsByAddress[msg.sender];
		require(employeesById[employeeId].id > 0);
		_;
	}

	//////////////////////////
	/// Init/set functions ///
	//////////////////////////

	function Personnel(address exchangeAddress) {
		setExchange(exchangeAddress);
	}

	function setExchange(address newExchangeAddress) onlyOwner validAddress(newExchangeAddress) {
		exchange = IExchange(newExchangeAddress);
	}

	///////////////////////
	/// Owner functions ///
	///////////////////////

	/// Adds a new employee.
	///
	/// @param accountAddress the initial address for the employee to receive
	/// their salary.
	/// @param initialYearlyUSDSalary the initial yearly USD salary, expressed
	/// with 18 decimals.
	/// i.e. $43500.32 = 4350032e16
	function addEmployee(address accountAddress, uint initialYearlyUSDSalary) onlyOwner validAddress(accountAddress) {
		require(employeeIdsByAddress[accountAddress] == 0); // check employee doesn't already exist
		require(initialYearlyUSDSalary > 0);

		employeesById[nextEmployeeId].id = nextEmployeeId;
		employeesById[nextEmployeeId].accountAddress = accountAddress;
		employeesById[nextEmployeeId].yearlyUSDSalary = initialYearlyUSDSalary;

		employeeIdsByAddress[accountAddress] = nextEmployeeId;

		employeeCount++;
		nextEmployeeId++;
	}

	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary) {
		/*require(employeesById[employeeId].id > 0);
		require(newYearlyUSDSalary > 0);
		employeesById[employeeId].yearlyUSDSalary = newYearlyUSDSalary;*/
	}

	function resetEmployeeLatestTokenAllocation(uint employeeId) onlyOwner validEmployeeId(employeeId) {
		delete employeesById[employeeId].latestTokenAllocation;
	}

	function removeEmployee(uint employeeId) validEmployeeId(employeeId) {
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

		employeeCount--;
	}

	function getEmployeeCount() constant returns (uint) {
		return employeeCount;
	}

	function getEmployeeId(address employeeAddress) returns (uint) {
		uint employeeId = employeeIdsByAddress[employeeAddress];
		require(employeeId > 0);
		return employeeId;
	}

	function getEmployee(uint employeeId) constant returns (
		address accountAddress,
		address[] allocatedTokens,
		address[] peggedTokens,
		uint latestTokenAllocation,
		uint latestPayday,
		uint yearlyUSDSalary
	) {
		Employee employee = employeesById[employeeId];
		return (
			employee.accountAddress,
			employee.allocatedTokens,
			employee.peggedTokens,
			employee.latestTokenAllocation,
			employee.latestPayday,
			employee.yearlyUSDSalary
		);
	}

	//////////////////////////
	/// Employee functions ///
	//////////////////////////

	function determineAllocation(address[] tokens, uint[] distribution) onlyEmployee {
		uint employeeId = employeeIdsByAddress[msg.sender];
		require(tokens.length == distribution.length);
		require(now.sub(employeesById[employeeId].latestTokenAllocation) >= 182 days);

		// adds up all distributions
		uint totalDistribution = 0;
		for (uint e = 0; e < distribution.length; e++) {
			totalDistribution += distribution[e];
		}
		require(totalDistribution == 10000); // check total distribution adds up to exactly 100%

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

			// peg rate (new tokens only)
			if (employeesById[employeeId].tokenPegging[token] == 0) {
				uint tokenExchangeRate = exchange.exchangeRates(token);
				assert(tokenExchangeRate > 0);
				employeesById[employeeId].peggedTokens.push(token);
				employeesById[employeeId].tokenPegging[token] = tokenExchangeRate;
			}
		}

		employeesById[employeeId].latestTokenAllocation = now;
	}

	function getAllocatedTokensCount() constant returns (uint) onlyEmployee {

	}

	function getPeggedTokensCount() constant returns (uint) onlyEmployee {

	}

	function getTokenAllocation(address tokenAddress) constant returns (uint) onlyEmployee {

	}

	function getTokenPegging(address tokenAddress) constant returns (uint) onlyEmployee {

	}
}
