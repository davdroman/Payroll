pragma solidity ^0.4.11;

import './EmployeeStorage.sol';

contract EmployeeStorageMock is EmployeeStorage {

	function mock_getExists(address _address) onlyOwner constant returns (bool) {
		return getEmployee(_address).exists;
	}

	function mock_getId(address _address) onlyOwner constant returns (uint) {
		return getEmployee(_address).id;
	}

	function mock_getAddress(uint _id) onlyOwner constant returns (address) {
		return employeesById[_id].accountAddress;
	}

	function mock_getAllocatedTokenCount(address _address) onlyOwner constant returns (uint) {
		return getEmployee(_address).allocatedTokensIndex.length;
	}

	function mock_getAllocatedTokenAddress(address _address, uint _index) onlyOwner constant returns (address) {
		return getEmployee(_address).allocatedTokensIndex[_index];
	}

	function mock_getAllocatedTokenValue(address _address, address _token) onlyOwner constant returns (uint) {
		return getEmployee(_address).allocatedTokens[_token];
	}

	function mock_getPeggedTokenCount(address _address) onlyOwner constant returns (uint) {
		return getEmployee(_address).peggedTokensIndex.length;
	}

	function mock_getPeggedTokenAddress(address _address, uint _index) onlyOwner constant returns (address) {
		return getEmployee(_address).peggedTokensIndex[_index];
	}

	function mock_getPeggedTokenValue(address _address, address _token) onlyOwner constant returns (uint) {
		return getEmployee(_address).peggedTokens[_token];
	}

	function mock_getSalaryTokenValue(address _address, address _token) onlyOwner constant returns (uint) {
		return getEmployee(_address).salaryTokens[_token];
	}

	function mock_getLatestTokenAllocation(address _address) onlyOwner constant returns (uint) {
		return getEmployee(_address).latestTokenAllocation;
	}

	function mock_getLatestPayday(address _address) onlyOwner constant returns (uint) {
		return getEmployee(_address).latestPayday;
	}

	function mock_getYearlyUSDSalary(address _address) onlyOwner constant returns (uint) {
		return getEmployee(_address).yearlyUSDSalary;
	}
}
