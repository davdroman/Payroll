pragma solidity ^0.4.11;

import './Personnel.sol';

contract PersonnelMock is Personnel {
	function PersonnelMock(address exchangeAddress) Personnel(exchangeAddress) { }

	function resetEmployeeLatestTokenAllocation(uint employeeId) onlyOwner validEmployeeId(employeeId) {
		delete employeesById[employeeId].latestTokenAllocation;
	}

	function getEmployeeAllocatedTokensCount(uint employeeId) onlyOwner constant returns (uint) {
		return employeesById[employeeId].allocatedTokensIndex.length;
	}

	function getEmployeeAllocatedTokenAddress(uint employeeId, uint index) onlyOwner returns (address) {
		return employeesById[employeeId].allocatedTokensIndex[index];
	}

	function getEmployeeAllocatedTokenValue(uint employeeId, address tokenAddress) onlyOwner validAddress(tokenAddress) constant returns (uint) {
		return employeesById[employeeId].allocatedTokens[tokenAddress];
	}

	function getEmployeePeggedTokensCount(uint employeeId) onlyOwner constant returns (uint) {
		return employeesById[employeeId].peggedTokensIndex.length;
	}

	function getEmployeePeggedTokenAddress(uint employeeId, uint index) onlyOwner returns (address) {
		return employeesById[employeeId].peggedTokensIndex[index];
	}

	function getEmployeePeggedTokenValue(uint employeeId, address tokenAddress) onlyOwner validAddress(tokenAddress) constant returns (uint) {
		return employeesById[employeeId].peggedTokens[tokenAddress];
	}

	function getEmployeeSalaryTokenValue(uint employeeId, address tokenAddress) onlyOwner validAddress(tokenAddress) constant returns (uint) {
		return employeesById[employeeId].salaryTokens[tokenAddress];
	}
}
