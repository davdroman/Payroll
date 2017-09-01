pragma solidity ^0.4.11;

import './IEmployeeStorage.sol';
import '../Zeppelin/Ownable.sol';

contract EmployeeStorage is IEmployeeStorage, Ownable {

	uint employeeCount;
	uint nextEmployeeId = 1;
	mapping (uint => Employee) employeesById;
	mapping (address => uint) employeeIdsByAddress;

	struct Employee {
		uint id;
		address accountAddress;
		address[] allocatedTokensIndex;
		mapping (address => uint) allocatedTokens; // parts per 10000 (100.00%)
		address[] peggedTokensIndex;
		mapping (address => uint) peggedTokens; // pegged exchange rate (18 decimals)
		mapping (address => uint) salaryTokens; // calculated monthly salary from allocation, pegging, and yearly USD salary
		uint latestTokenAllocation;
		uint latestPayday;
		uint yearlyUSDSalary; // 18 decimals
	}

	// Add

	function add(address _address, uint _salary) onlyOwner {
		employeesById[nextEmployeeId].id = nextEmployeeId;
		employeesById[nextEmployeeId].accountAddress = _address;
		employeesById[nextEmployeeId].yearlyUSDSalary = _salary;

		employeeIdsByAddress[_address] = nextEmployeeId;

		employeeCount++;
		nextEmployeeId++;
	}

	// Set

	function clearAllocatedTokens(address _address) onlyOwner {

	}

	function setAllocatedToken(address _address, address _token, uint _distribution) onlyOwner {

	}

	function setPeggedToken(address _address, address _token, uint _value) onlyOwner {

	}

	function clearSalaryTokens(address _address) onlyOwner {

	}

	function setSalaryToken(address _address, address _token, uint _value) onlyOwner {

	}

	function setLatestTokenAllocation(address _address, uint _date) onlyOwner {

	}

	function setLatestPayday(address _address, uint _date) onlyOwner {

	}

	function setYearlyUSDSalary(address _address, uint _salary) onlyOwner {
		/*employeesById[employeeId].yearlyUSDSalary = newYearlyUSDSalary;*/
	}

	// Get

	function getCount() onlyOwner constant returns (uint) {
		return employeeCount;
	}

	function getAddress(uint _id) onlyOwner constant returns (address) {
		return employeesById[_id].accountAddress;
	}

	function getAllocatedTokenCount(address _address) onlyOwner constant returns (uint) {

	}

	function getAllocatedTokenAddress(address _address, uint _index) onlyOwner constant returns (address) {

	}

	function getAllocatedTokenValue(address _address, address _token) onlyOwner constant returns (uint) {

	}

	function getPeggedTokenCount(address _address) onlyOwner constant returns (uint) {

	}

	function getPeggedTokenAddress(address _address, uint _index) onlyOwner constant returns (address) {

	}

	function getPeggedTokenValue(address _address, address _token) onlyOwner constant returns (uint) {

	}

	function getSalaryTokenValue(address _address, address _token) onlyOwner constant returns (uint) {

	}

	function getLatestTokenAllocation(address _address) onlyOwner constant returns (uint) {

	}

	function getLatestPayday(address _address) onlyOwner constant returns (uint) {

	}

	function getYearlyUSDSalary(address _address) onlyOwner constant returns (uint) {
		return employeesById[employeeIdsByAddress[_address]].yearlyUSDSalary;
	}

	// Remove

	function remove(address _address) onlyOwner {

	}
}
