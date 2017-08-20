pragma solidity ^0.4.13;

import '../Zeppelin/Ownable.sol';
import './IPayroll.sol';

contract Payroll is Ownable, IPayroll {

	function addFunds() payable onlyOwner {
		require(msg.value > 0);
	}

	function escapeHatch() onlyOwner {
		selfdestruct(owner);
	}

	// Use approveAndCall or ERC223 tokenFallback
	function addTokenFunds() onlyOwner {

	}

	// Monthly usd amount spent in salaries
	function calculatePayrollBurnrate() constant onlyOwner returns (uint) {

	}

	// Days until the contract can run out of funds
	function calculatePayrollRunway() constant onlyOwner returns (uint) {

	}

	/// Determines allocation of ERC20 tokens as an employee's salary.
	///
	/// @param tokenAddresses specifies the token addresses to be paid.
	/// @param distributions is an array of integer percentages with a
	/// max sum of 10000 (100.00%). Wei is allocated as the amount left (if any)
	/// between the max sum and the actual sum of the distributions.
	/// i.e. a [5000, 3000] token distribution would result in 2000 (20%) left
	/// for wei allocation.
	function determineAllocation(address[] tokenAddresses, uint[] distributions) {
		/*require(employees[msg.sender].length != 0);
		require(tokenAddress.length > 0);
		require(tokenAddress.length == distribution.length);

		for (var i = 0; i < tokenAddress.length; i++) {
			address tokenAddress = tokenAddresses[i];
			uint distribution = distribution[i];
		}*/
	}

	// only callable once a month
	function payday() {

	}
}
