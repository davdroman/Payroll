pragma solidity ^0.4.11;

import './IPayroll.sol';
import '../Employees/IEmployeeStorage.sol';
import '../Exchange/IExchange.sol';
import '../Zeppelin/Ownable.sol';
import '../Zeppelin/SafeMath.sol';

contract Payroll is IPayroll, Ownable {
	using SafeMath for uint;

	IEmployeeStorage public employeeStorage;
	IExchange public exchange;

	// Modifiers

	modifier validAddress(address _address) {
		require(_address != 0x0);
		_;
	}

	modifier validEmployeeId(uint _id) {
		_;
	}

	modifier higherThanZeroUInt(uint _uint) {
		require(_uint > 0);
		_;
	}

	modifier onlyEmployee() {
		_;
	}

	function Payroll(address _employeeStorage, address _exchange) {
		setEmployeeStorage(_employeeStorage);
		setExchange(_exchange);
	}

	function setEmployeeStorage(address _newEmployeeStorage) onlyOwner validAddress(_newEmployeeStorage) {
		employeeStorage = IEmployeeStorage(_newEmployeeStorage);
	}

	function setExchange(address _newExchange) onlyOwner validAddress(_newExchange) {
		exchange = IExchange(_newExchange);
	}

	// Company functions

	/// Adds a new employee.
	///
	/// @param _address the initial address for the employee to receive
	/// their salary.
	/// @param _yearlyUSDSalary the initial yearly USD salary, expressed
	/// with 18 decimals.
	/// i.e. $43500.32 = 4350032e16
	function addEmployee(address _address, uint _yearlyUSDSalary) onlyOwner validAddress(_address) higherThanZeroUInt(_yearlyUSDSalary) {
		employeeStorage.add(_address, _yearlyUSDSalary);
	}

	function setEmployeeSalary(uint _id, uint _yearlyUSDSalary) onlyOwner validEmployeeId(_id) {
		/*require(newYearlyUSDSalary > 0);
		employeesById[employeeId].yearlyUSDSalary = newYearlyUSDSalary;
		recalculateSalaryTokens(employeeId);*/
	}

	function recalculateSalaryTokens(uint employeeId) private {
		/*Employee employee = employeesById[employeeId];

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
		}*/
	}

	function removeEmployee(uint _id) onlyOwner validEmployeeId(_id) {
		/*Employee employee = employeesById[employeeId];

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

		employeeCount--;*/
	}

	function getEmployeeCount() onlyOwner constant returns (uint) {
		/*return employeeCount;*/
	}

	function getEmployeeId(address _address) onlyOwner constant returns (uint) {
		/*uint employeeId = employeeIdsByAddress[employeeAddress];
		require(employeeId > 0);
		return employeeId;*/
	}

	function getEmployee(uint _id) onlyOwner constant returns (
		address accountAddress,
		address[] allocatedTokensIndex,
		address[] peggedTokensIndex,
		uint latestTokenAllocation,
		uint latestPayday,
		uint yearlyUSDSalary
	) {
		/*Employee employee = employeesById[employeeId];
		accountAddress = employee.accountAddress;
		allocatedTokensIndex = employee.allocatedTokensIndex;
		peggedTokensIndex = employee.peggedTokensIndex;
		latestTokenAllocation = employee.latestTokenAllocation;
		latestPayday = employee.latestPayday;
		yearlyUSDSalary = employee.yearlyUSDSalary;*/
	}

	// Monthly usd amount spent in salaries
	function calculatePayrollBurnrate() onlyOwner constant returns (uint) {

	}

	// Days until the contract can run out of funds
	function calculatePayrollRunway() onlyOwner constant returns (uint) {

	}

	function escapeHatch() onlyOwner {

	}

	// Employee functions

	/// Determines allocation of ERC20 tokens as an employee's salary.
	///
	/// @param _tokens specifies the ERC20 token addresses.
	/// @param _distribution is an array of percentages expressed as integers
	/// with a max sum of 10000 (100.00%)
	/// i.e. [5000, 3000, 2000]
	function determineAllocation(address[] _tokens, uint[] _distribution) onlyEmployee {
		/*require(tokens.length == distribution.length);

		uint totalDistribution = 0;
		for (uint d = 0; d < distribution.length; d++) { totalDistribution += distribution[d]; }
		require(totalDistribution == 10000); // check total distribution adds up to exactly 100%

		Employee employee = employeesById[employeeIdsByAddress[msg.sender]];
		assert(now.sub(employee.latestTokenAllocation) >= 182 days); // check latest reallocation was > 6 months ago

		// clean up old allocation
		for (uint a = 0; a < employee.allocatedTokensIndex.length; a++) {
			address allocatedToken = employee.allocatedTokensIndex[a];
			delete employee.allocatedTokens[allocatedToken];
			delete employee.salaryTokens[allocatedToken];
		}
		delete employee.allocatedTokensIndex;

		// set new allocation
		for (uint t = 0; t < tokens.length; t++) {
			address token = tokens[t];
			employee.allocatedTokensIndex.push(token);
			employee.allocatedTokens[token] = distribution[t];

			// peg rate (new tokens only)
			if (employee.peggedTokens[token] == 0) {
				uint tokenExchangeRate = exchange.exchangeRates(token);
				assert(tokenExchangeRate > 0);
				employee.peggedTokensIndex.push(token);
				employee.peggedTokens[token] = tokenExchangeRate;
			}
		}

		recalculateSalaryTokens(employee.id);

		employee.latestTokenAllocation = now;*/
	}

	function getAllocatedTokens() onlyEmployee constant returns (address[]) {
		/*return employeesById[employeeIdsByAddress[msg.sender]].allocatedTokensIndex.length;*/
	}

	function getAllocatedTokenValue(address _token) onlyEmployee validAddress(_token) constant returns (uint) {
		/*return employeesById[employeeIdsByAddress[msg.sender]].allocatedTokens[tokenAddress];*/
	}

	function getPeggedTokens() onlyEmployee constant returns (address[]) {
		/*return employeesById[employeeIdsByAddress[msg.sender]].peggedTokensIndex[index];*/
	}

	function getPeggedTokenValue(address _token) onlyEmployee validAddress(_token) constant returns (uint) {
		/*return employeesById[employeeIdsByAddress[msg.sender]].peggedTokens[tokenAddress];*/
	}

	function getSalaryTokenValue(address _token) onlyEmployee validAddress(_token) constant returns (uint) {
		/*return employeesById[employeeIdsByAddress[msg.sender]].salaryTokens[tokenAddress];*/
	}

	function payday() {

	}
}
