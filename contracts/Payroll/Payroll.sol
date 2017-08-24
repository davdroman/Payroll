/*pragma solidity ^0.4.11;

import './IPayroll.sol';
import '../Personnel/PersonnelLib.sol';
import '../Exchange/USDExchange.sol';
import '../Zeppelin/SafeMath.sol';
import '../Zeppelin/Ownable.sol';

contract Payroll is IPayroll, Ownable {
	using PersonnelLib for PersonnelLib.Personnel;

	PersonnelLib.Personnel public personnel;
	USDExchange public exchange;

	function Payroll(address initialExchange) {
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

	}

	function setEmployeeSalary(uint employeeId, uint newYearlyUSDSalary) onlyOwner {

	}

	function setEmployeeAllocation(address[] tokens, uint[] distribution) notOwner external {

	}

	function resetEmployeeLatestTokenAllocation(uint employeeId) onlyOwner {

	}

	function removeEmployee(uint employeeId) onlyOwner {

	}

	function getEmployeeCount() constant onlyOwner returns (uint) {

	}

	function getEmployee(uint employeeId) constant onlyOwner returns (
		address accountAddress,
		address[] allocatedTokens,
		address[] peggedTokens,
		uint latestTokenAllocation,
		uint latestPayday,
		uint yearlyUSDSalary
	) {

	}

	function getEmployeeAllocatedTokens(uint employeeId) constant returns(address[] allocatedTokens) {

	}

	function getEmployeeTokenAllocation(uint employeeId, address tokenAddress) constant onlyOwner returns (uint) {

	}

	function getEmployeeTokenPegging(uint employeeId, address tokenAddress) constant onlyOwner returns (uint) {

	}

	// Monthly usd amount spent in salaries
	function calculatePayrollBurnrate() constant onlyOwner returns (uint) {

	}

	// Days until the contract can run out of funds
	function calculatePayrollRunway() constant onlyOwner returns (uint) {

	}

	function escapeHatch() onlyOwner {

	}

	function payday() {

	}
}*/
