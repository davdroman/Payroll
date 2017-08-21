pragma solidity ^0.4.11;

import '../Zeppelin/Ownable.sol';
import './IPayroll.sol';

contract Payroll is Ownable, IPayroll {

	function daysUntilNextPayday() constant returns(int) {

	}

	function payday() {

	}

	function tokensForAllocation() constant returns (address[]) {

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
		/*require(employees[msg.sender].length != 0);
		require(tokenAddress.length > 0);
		require(tokenAddress.length == distribution.length);

		for (var i = 0; i < tokenAddress.length; i++) {
			address tokenAddress = tokenAddresses[i];
			uint distribution = distribution[i];
		}*/
	}
}
