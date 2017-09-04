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

	modifier higherThanZeroUInt(uint _uint) {
		require(_uint > 0);
		_;
	}

	// Init/setters

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

	function setEmployeeSalary(uint _id, uint _yearlyUSDSalary) onlyOwner higherThanZeroUInt(_yearlyUSDSalary) {
		address employeeAddress = employeeStorage.getAddress(_id);
		employeeStorage.setYearlyUSDSalary(employeeAddress, _yearlyUSDSalary);
		determineSalaryTokens(employeeAddress);
	}

	function determineSalaryTokens(address employeeAddress) private {
		uint allocatedTokenCount = employeeStorage.getAllocatedTokenCount(employeeAddress);

		// calculate new salary
		for (uint i = 0; i < allocatedTokenCount; i++) {
			// fetch info to calculate token salary
			address allocatedToken = employeeStorage.getAllocatedTokenAddress(employeeAddress, i);
			uint allocation = employeeStorage.getAllocatedTokenValue(employeeAddress, allocatedToken);
			uint peggedRate = employeeStorage.getPeggedTokenValue(employeeAddress, allocatedToken);

			// assert validity
			assert(allocatedToken != 0x0);
			assert(allocation > 0);
			assert(peggedRate > 0);

			// calculate monthly salary
			uint monthlyUSDSalary = employeeStorage.getYearlyUSDSalary(employeeAddress).div(12);
			uint monthlyUSDSalaryAllocation = monthlyUSDSalary.mul(allocation).div(10000);
			uint monthlySalaryTokens = exchange.exchange(allocatedToken, monthlyUSDSalaryAllocation, peggedRate);

			// assign salary tokens
			employeeStorage.setSalaryToken(employeeAddress, allocatedToken, monthlySalaryTokens);
		}
	}

	function removeEmployee(uint _id) onlyOwner {
		employeeStorage.remove(employeeStorage.getAddress(_id));
	}

	function getEmployeeCount() onlyOwner constant returns (uint) {
		return employeeStorage.getCount();
	}

	function getEmployeeId(address _address) onlyOwner validAddress(_address) constant returns (uint) {
		return employeeStorage.getId(_address);
	}

	function getEmployee(uint _id) onlyOwner constant returns (address accountAddress, uint latestTokenAllocation, uint latestPayday, uint yearlyUSDSalary) {
		accountAddress = employeeStorage.getAddress(_id);
		latestTokenAllocation = employeeStorage.getLatestTokenAllocation(accountAddress);
		latestPayday = employeeStorage.getLatestPayday(accountAddress);
		yearlyUSDSalary = employeeStorage.getYearlyUSDSalary(accountAddress);
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
	function determineAllocation(address[] _tokens, uint[] _distribution) {
		require(_tokens.length == _distribution.length);

		// check total distribution adds up to exactly 100%
		uint totalDistribution = 0;
		for (uint d = 0; d < _distribution.length; d++) { totalDistribution += _distribution[d]; }
		require(totalDistribution == 10000);

		// fetch employee address
		address employeeAddress = msg.sender;

		// check latest reallocation was > 6 months ago
		uint latestTokenAllocation = employeeStorage.getLatestTokenAllocation(employeeAddress);
		assert(now.sub(latestTokenAllocation) >= 182 days);

		// clean up old allocation and salary
		employeeStorage.clearAllocatedAndSalaryTokens(employeeAddress);

		// set new allocation
		for (uint t = 0; t < _tokens.length; t++) {
			address token = _tokens[t];
			employeeStorage.setAllocatedToken(employeeAddress, token, _distribution[t]);

			// peg rate (new tokens only)
			if (employeeStorage.getPeggedTokenValue(employeeAddress, token) == 0) {
				uint tokenExchangeRate = exchange.exchangeRates(token);
				assert(tokenExchangeRate > 0);
				employeeStorage.setPeggedToken(employeeAddress, token, tokenExchangeRate);
			}
		}

		// set new salary tokens
		determineSalaryTokens(employeeAddress);

		// updates allocation date
		employeeStorage.setLatestTokenAllocation(employeeAddress, now);
	}

	function payday() {

	}
}
