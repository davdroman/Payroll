pragma solidity ^0.4.11;

import './IPersonnel.sol';
import '../Exchange/IExchange.sol';
import '../Zeppelin/Ownable.sol';
import '../Zeppelin/SafeMath.sol';

contract Personnel is IPersonnel, Ownable {
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
		address[] allocatedTokensIndex;
		mapping (address => uint) allocatedTokens; // parts per 10000 (100.00%)
		address[] peggedTokensIndex;
		mapping (address => uint) peggedTokens; // pegged exchange rate (18 decimals)
		mapping (address => uint) salaryTokens; // calculated monthly salary from allocation, pegging, and yearly USD salary
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

	/////////////////////////
	/// Company functions ///
	/////////////////////////

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

	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary) onlyOwner validEmployeeId(employeeId) {
		require(newYearlyUSDSalary > 0);
		employeesById[employeeId].yearlyUSDSalary = newYearlyUSDSalary;
		recalculateSalaryTokens(employeeId);
	}

	function recalculateSalaryTokens(uint employeeId) private {
		Employee employee = employeesById[employeeId];

		// calculate new salary
		for (uint i = 0; i < employee.allocatedTokensIndex.length; i++) {
			// fetch info to calculate token salary
			address allocatedToken = employee.allocatedTokensIndex[i];
			uint allocation = employee.allocatedTokens[allocatedToken];
			uint peggedRate = employee.peggedTokens[allocatedToken];

			// assert validity
			assert(allocatedToken != 0x0);
			assert(allocation > 0);
			assert(peggedRate > 0);

			// calculate monthly salary
			uint monthlyUSDSalary = employee.yearlyUSDSalary.div(12);
			uint monthlyUSDSalaryAllocation = monthlyUSDSalary.mul(allocation).div(10000);
			uint monthlySalaryTokens = exchange.exchange(allocatedToken, monthlyUSDSalaryAllocation, peggedRate);

			// assign salary tokens
			employee.salaryTokens[allocatedToken] = monthlySalaryTokens;
		}
	}

	function removeEmployee(uint employeeId) onlyOwner validEmployeeId(employeeId) {
		Employee employee = employeesById[employeeId];

		for (uint a = 0; a < employee.allocatedTokensIndex.length; a++) {
			delete employee.allocatedTokens[employee.allocatedTokensIndex[a]];
			delete employee.salaryTokens[employee.allocatedTokensIndex[a]];
		}

		for (uint p = 0; p < employee.peggedTokensIndex.length; p++) {
			delete employee.peggedTokens[employee.peggedTokensIndex[p]];
		}

		delete employeeIdsByAddress[employee.accountAddress];

		delete employee.id;
		delete employee.accountAddress;
		delete employee.allocatedTokensIndex;
		delete employee.peggedTokensIndex;
		delete employee.latestTokenAllocation;
		delete employee.latestPayday;
		delete employee.yearlyUSDSalary;

		employeeCount--;
	}

	function getEmployeeCount() onlyOwner constant returns (uint) {
		return employeeCount;
	}

	function getEmployeeId(address employeeAddress) onlyOwner constant returns (uint) {
		uint employeeId = employeeIdsByAddress[employeeAddress];
		require(employeeId > 0);
		return employeeId;
	}

	function getEmployee(uint employeeId) onlyOwner constant returns (
		address accountAddress,
		address[] allocatedTokensIndex,
		address[] peggedTokensIndex,
		uint latestTokenAllocation,
		uint latestPayday,
		uint yearlyUSDSalary
	) {
		Employee employee = employeesById[employeeId];
		return (
			employee.accountAddress,
			employee.allocatedTokensIndex,
			employee.peggedTokensIndex,
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
		address[] allocatedTokensIndex = employeesById[employeeId].allocatedTokensIndex;
		for (uint i = 0; i < allocatedTokensIndex.length; i++) {
			address allocatedToken = allocatedTokensIndex[i];
			delete employeesById[employeeId].allocatedTokens[allocatedToken];
			delete employeesById[employeeId].salaryTokens[allocatedToken];
		}
		delete employeesById[employeeId].allocatedTokensIndex;

		// set new allocation
		for (uint o = 0; o < tokens.length; o++) {
			address token = tokens[o];
			employeesById[employeeId].allocatedTokensIndex.push(token);
			employeesById[employeeId].allocatedTokens[token] = distribution[o];

			// peg rate (new tokens only)
			if (employeesById[employeeId].peggedTokens[token] == 0) {
				uint tokenExchangeRate = exchange.exchangeRates(token);
				assert(tokenExchangeRate > 0);
				employeesById[employeeId].peggedTokensIndex.push(token);
				employeesById[employeeId].peggedTokens[token] = tokenExchangeRate;
			}
		}

		recalculateSalaryTokens(employeeId);

		employeesById[employeeId].latestTokenAllocation = now;
	}

	function getAllocatedTokensCount() onlyEmployee constant returns (uint) {
		return employeesById[employeeIdsByAddress[msg.sender]].allocatedTokensIndex.length;
	}

	function getAllocatedTokenAddress(uint index) onlyEmployee returns (address) {
		return employeesById[employeeIdsByAddress[msg.sender]].allocatedTokensIndex[index];
	}

	function getAllocatedTokenValue(address tokenAddress) onlyEmployee validAddress(tokenAddress) constant returns (uint) {
		return employeesById[employeeIdsByAddress[msg.sender]].allocatedTokens[tokenAddress];
	}

	function getPeggedTokensCount() onlyEmployee constant returns (uint) {
		return employeesById[employeeIdsByAddress[msg.sender]].peggedTokensIndex.length;
	}

	function getPeggedTokenAddress(uint index) onlyEmployee returns (address) {
		return employeesById[employeeIdsByAddress[msg.sender]].peggedTokensIndex[index];
	}

	function getPeggedTokenValue(address tokenAddress) onlyEmployee validAddress(tokenAddress) constant returns (uint) {
		return employeesById[employeeIdsByAddress[msg.sender]].peggedTokens[tokenAddress];
	}

	function getSalaryTokenValue(address tokenAddress) onlyEmployee validAddress(tokenAddress) constant returns (uint) {
		return employeesById[employeeIdsByAddress[msg.sender]].salaryTokens[tokenAddress];
	}
}
