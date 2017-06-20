pragma solidity ^0.4.11;

import './Owned.sol';
import './PayrollInterface.sol';

contract Payroll is Owned, PayrollInterface {

	function addEmployee(address accountAddress, address[] allowedTokens, uint256 initialYearlyUSDSalary) {

	}

	function setEmployeeSalary(uint256 employeeId, uint256 yearlyUSDSalary) {

	}

	function removeEmployee(uint256 employeeId) {

	}

	function addFunds() payable {

	}

	function scapeHatch() {

	}

	// Use approveAndCall or ERC223 tokenFallback
	function addTokenFunds() {

	}

	function getEmployeeCount() constant returns (uint256) {

	}

	function getEmployee(uint256 employeeId) constant returns (address employee) {
		// Return all important info too
	}

	// Monthly usd amount spent in salaries
	function calculatePayrollBurnrate() constant returns (uint256) {

	}

	// Days until the contract can run out of funds
	function calculatePayrollRunway() constant returns (uint256) {

	}

	// only callable once every 6 months
	function determineAllocation(address[] tokens, uint256[] distribution) {

	}

	// only callable once a month
	function payday() {

	}

	function setExchangeRate(address token, uint256 usdExchangeRate) {
		// uses decimals from token
	}
}
