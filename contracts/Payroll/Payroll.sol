pragma solidity ^0.4.11;

import './IPayroll.sol';
import '../Personnel/IPersonnel.sol';
import '../Zeppelin/Ownable.sol';
import '../Zeppelin/SafeMath.sol';

contract Payroll is IPayroll, Ownable {

	//////////////////
	/// Properties ///
	//////////////////

	IPersonnel public personnel;

	/////////////////
	/// Modifiers ///
	/////////////////

	modifier validAddress(address addr) {
		require(addr != 0x0);
		_;
	}

	//////////////////////////
	/// Init/set functions ///
	//////////////////////////

	function Payroll(address initialPersonnel) {
		setExchange(initialPersonnel);
	}

	function setExchange(address newPersonnel) onlyOwner validAddress(newPersonnel) {
		personnel = IPersonnel(newPersonnel);
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
}
