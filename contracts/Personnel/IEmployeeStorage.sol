pragma solidity ^0.4.11;

contract IEmployeeStorage {
	// Add
	function add(address _address, uint _salary);

	// Set
	function clearAllocatedTokens(address _address);
	function setAllocatedToken(address _address, address _token, uint _distribution);

	function setPeggedToken(address _address, address _token, uint _value);

	function clearSalaryTokens(address _address);
	function setSalaryToken(address _address, address _token, uint _value);

	function setLatestTokenAllocation(address _address, uint _date);
	function setLatestPayday(address _address, uint _date);
	function setYearlyUSDSalary(address _address, uint _salary);

	// Get
	function getCount() constant returns (uint);
	function getAddress(uint _id) constant returns (address);

	function getAllocatedTokenCount(address _address) constant returns (uint);
	function getAllocatedTokenAddress(address _address, uint _index) constant returns (address);
	function getAllocatedTokenValue(address _address, address _token) constant returns (uint);

	function getPeggedTokenCount(address _address) constant returns (uint);
	function getPeggedTokenAddress(address _address, uint _index) constant returns (address);
	function getPeggedTokenValue(address _address, address _token) constant returns (uint);

	function getSalaryTokenValue(address _address, address _token) constant returns (uint);

	function getLatestTokenAllocation(address _address) constant returns (uint);
	function getLatestPayday(address _address) constant returns (uint);
	function getYearlyUSDSalary(address _address) constant returns (uint);

	// Remove
	function remove(address _address);
}
