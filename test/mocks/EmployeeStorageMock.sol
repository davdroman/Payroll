pragma solidity ^0.4.11;

import '../../contracts/Employees/EmployeeStorage.sol';

contract EmployeeStorageMock is EmployeeStorage {

	function mock_resetLatestTokenAllocation(address _address) {
		getEmployee(_address).latestTokenAllocation = 0;
	}

	function mock_resetLatestPayday(address _address) {
		getEmployee(_address).latestPayday = 0;
	}

	function mock_getCount() constant returns (uint) {
		return employeeCount;
	}

	function mock_getExists(address _address) constant returns (bool) {
		return getEmployee(_address).exists;
	}

	function mock_getId(address _address) constant returns (uint) {
		return getEmployee(_address).id;
	}

	function mock_getAddress(uint _id) constant returns (address) {
		return employeesById[_id].accountAddress;
	}

	function mock_getAllocatedTokenCount(address _address) constant returns (uint) {
		return getEmployee(_address).allocatedTokens.length();
	}

	function mock_getAllocatedTokenAddress(address _address, uint _index) constant returns (address) {
		return getEmployee(_address).allocatedTokens.getAddress(_index);
	}

	function mock_getAllocatedTokenValue(address _address, address _token) constant returns (uint) {
		return getEmployee(_address).allocatedTokens.getUInt(_token);
	}

	function mock_getPeggedTokenCount(address _address) constant returns (uint) {
		return getEmployee(_address).peggedTokens.length();
	}

	function mock_getPeggedTokenAddress(address _address, uint _index) constant returns (address) {
		return getEmployee(_address).peggedTokens.getAddress(_index);
	}

	function mock_getPeggedTokenValue(address _address, address _token) constant returns (uint) {
		return getEmployee(_address).peggedTokens.getUInt(_token);
	}

	function mock_getSalaryTokenValue(address _address, address _token) constant returns (uint) {
		return getEmployee(_address).salaryTokens.getUInt(_token);
	}

	function mock_getLatestTokenAllocation(address _address) constant returns (uint) {
		return getEmployee(_address).latestTokenAllocation;
	}

	function mock_getLatestPayday(address _address) constant returns (uint) {
		return getEmployee(_address).latestPayday;
	}

	function mock_getYearlyUSDSalary(address _address) constant returns (uint) {
		return getEmployee(_address).yearlyUSDSalary;
	}
}
