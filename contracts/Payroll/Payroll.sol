pragma solidity ^0.4.11;

import './IPayroll.sol';
import '../Zeppelin/Ownable.sol';
import '../Employees/EmployeesController.sol';

contract Payroll is IPayroll, Ownable {
	EmployeesController employees;

	function Payroll(address initialEmployeesController) {
		setEmployeesController(initialEmployeesController);
	}

	function setEmployeesController(address newEmployeesController) onlyOwner {
		require(newEmployeesController != 0x0);
		employees = EmployeesController(newEmployeesController);
	}

	// Monthly usd amount spent in salaries
	function calculatePayrollBurnrate() constant onlyOwner returns (uint) {

	}

	// Days until the contract can run out of funds
	function calculatePayrollRunway() constant onlyOwner returns (uint) {

	}

	function availableTokensForAllocation() constant returns (address[]) {

	}

	function daysUntilNextAllocation() constant returns(int) {

	}

	/// Determines allocation of ERC20 tokens as an employee's salary.
	///
	/// @param tokens specifies the token addresses to be paid.
	/// @param distributions is an array of integer percentages with a
	/// max sum of 10000 (100.00%).
	/// i.e. [5000, 3050, 1950] (50%, 30.50%, 19.50%)
	function determineAllocation(address[] tokens, uint[] distributions) {
		
	}

	function daysUntilNextPayday() constant returns(int) {

	}

	function payday() {

	}
}
