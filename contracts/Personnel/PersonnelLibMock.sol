pragma solidity ^0.4.11;

import './PersonnelLib.sol';

contract PersonnelLibMock {
	using PersonnelLib for PersonnelLib.Personnel;

	PersonnelLib.Personnel public personnel;

	function PersonnelLibMock() {
		personnel.init();
	}

	function getPersonnelNextEmployeeId() constant returns (uint) {
		return personnel.nextEmployeeId;
	}

	function addEmployee(address accountAddress, uint initialYearlyUSDSalary) {
		personnel.addEmployee(accountAddress, initialYearlyUSDSalary);
	}
}
