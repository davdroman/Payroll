pragma solidity ^0.4.11;

import './IEmployeeStorage.sol';
import '../Zeppelin/SafeMath.sol';
import '../Zeppelin/Ownable.sol';

contract EmployeeStorage is IEmployeeStorage, Ownable {
	using SafeMath for uint;

	struct Employee {
		bool exists;
		uint id;
		address accountAddress;
		address[] allocatedTokensIndex;
		mapping (address => uint) allocatedTokens; // parts per 10000 (100.00%)
		address[] peggedTokensIndex;
		mapping (address => uint) peggedTokens; // pegged exchange rate (18 decimals)
		address[] salaryTokensIndex;
		mapping (address => uint) salaryTokens; // calculated monthly salary from allocation, pegging, and yearly USD salary
		uint latestTokenAllocation;
		uint latestPayday;
		uint yearlyUSDSalary; // 18 decimals
	}

	uint nextEmployeeId = 1;
	uint employeeCount;
	mapping (uint => Employee) employeesById;
	mapping (address => uint) employeeIdsByAddress;
	uint yearlyUSDSalariesTotal;
	address[] salaryTokensTotalIndex;
	mapping (address => uint) salaryTokensTotal;

	function getEmployee(address _address) internal constant returns (Employee storage employee) {
		uint employeeId = employeeIdsByAddress[_address];
		return employeesById[employeeId];
	}

	// Modifiers

	modifier existingEmployeeAddress(address _address) {
		require(getEmployee(_address).exists);
		_;
	}

	modifier existingEmployeeId(uint _id) {
		require(employeesById[_id].exists);
		_;
	}

	modifier notExistingEmployeeAddress(address _address) {
		require(!getEmployee(_address).exists);
		_;
	}

	// Add

	function add(address _address, uint _yearlyUSDSalary) onlyOwner notExistingEmployeeAddress(_address) {
		employeesById[nextEmployeeId].exists = true;
		employeesById[nextEmployeeId].id = nextEmployeeId;
		employeesById[nextEmployeeId].accountAddress = _address;
		employeesById[nextEmployeeId].yearlyUSDSalary = _yearlyUSDSalary;

		employeeIdsByAddress[_address] = nextEmployeeId;

		employeeCount++;
		nextEmployeeId++;
		yearlyUSDSalariesTotal = yearlyUSDSalariesTotal.add(_yearlyUSDSalary);
	}

	// Set

	function remove(address[] storage _array, uint _index) private {
        if (_index >= _array.length) return;

        for (uint i = _index; i < _array.length - 1; i++){
            _array[i] = _array[i + 1];
        }

        delete _array[_array.length - 1];
        _array.length--;
    }

	function removeAddressFromArray(address[] storage _array, address _address) private {
		for (uint i = 0; i < _array.length; i++) {
			if (_array[i] == _address) {
				remove(_array, i);
				break;
			}
		}
    }

	function arrayContainsAddress(address[] _array, address _address) private constant returns (bool contained) {
		for (uint i; i < _array.length; i++) {
			if (_array[i] == _address) {
				contained = true;
			}
		}
	}

	function setAllocatedToken(address _address, address _token, uint _distribution) onlyOwner existingEmployeeAddress(_address) {
		Employee employee = getEmployee(_address);

		// distribution being 0 means deletion
		if (_distribution == 0) {
			removeAddressFromArray(employee.allocatedTokensIndex, _token);
			delete employee.allocatedTokens[_token];
		} else {
			// insert in index only if new
			if (employee.allocatedTokens[_token] == 0) {
				employee.allocatedTokensIndex.push(_token);
			}

			employee.allocatedTokens[_token] = _distribution;
		}
	}

	function clearAllocatedAndSalaryTokens(address _address) onlyOwner existingEmployeeAddress(_address) {
		Employee employee = getEmployee(_address);

		for (uint i; i < employee.allocatedTokensIndex.length; i++) {
			delete employee.allocatedTokens[employee.allocatedTokensIndex[i]];
		}

		for (uint a; a < employee.salaryTokensIndex.length; a++) {
			address salaryToken = salaryTokensTotalIndex[a];

			uint totalValue = salaryTokensTotal[salaryToken];
			uint employeeValue = employee.salaryTokens[salaryToken];
			salaryTokensTotal[salaryToken] = totalValue.sub(employeeValue);

			delete employee.salaryTokens[salaryToken];
		}

		delete employee.allocatedTokensIndex;
		delete employee.salaryTokensIndex;
	}

	function setPeggedToken(address _address, address _token, uint _value) onlyOwner existingEmployeeAddress(_address) {
		Employee employee = getEmployee(_address);

		// value being 0 means deletion
		if (_value == 0) {
			removeAddressFromArray(employee.peggedTokensIndex, _token);
			delete employee.peggedTokens[_token];
		} else {
			// insert in index only if new
			if (employee.peggedTokens[_token] == 0) {
				employee.peggedTokensIndex.push(_token);
			}

			employee.peggedTokens[_token] = _value;
		}
	}

	function setSalaryToken(address _address, address _token, uint _value) onlyOwner existingEmployeeAddress(_address) {
		Employee employee = getEmployee(_address);

		// adjust salary tokens total
		uint totalValue = salaryTokensTotal[_token];
		uint employeeValue = employee.salaryTokens[_token];
		uint newTotalValue = totalValue.sub(employeeValue).add(_value);

		salaryTokensTotal[_token] = newTotalValue;

		if (!arrayContainsAddress(salaryTokensTotalIndex, _token)) {
			salaryTokensTotalIndex.push(_token);
		}

		// value being 0 means deletion
		if (_value == 0) {
			removeAddressFromArray(employee.salaryTokensIndex, _token);
			delete employee.salaryTokens[_token];
		} else {
			// insert in index only if new
			if (!arrayContainsAddress(employee.salaryTokensIndex, _token)) {
				employee.salaryTokensIndex.push(_token);
			}

			employee.salaryTokens[_token] = _value;
		}
	}

	function setLatestTokenAllocation(address _address, uint _date) onlyOwner existingEmployeeAddress(_address) {
		getEmployee(_address).latestTokenAllocation = _date;
	}

	function setLatestPayday(address _address, uint _date) onlyOwner existingEmployeeAddress(_address) {
		getEmployee(_address).latestPayday = _date;
	}

	function setYearlyUSDSalary(address _address, uint _salary) onlyOwner existingEmployeeAddress(_address) {
		Employee employee = getEmployee(_address);
		yearlyUSDSalariesTotal = yearlyUSDSalariesTotal.sub(employee.yearlyUSDSalary);
		employee.yearlyUSDSalary = _salary;
		yearlyUSDSalariesTotal = yearlyUSDSalariesTotal.add(_salary);
	}

	// Get

	function getCount() onlyOwner constant returns (uint) {
		return employeeCount;
	}

	function getId(address _address) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).id;
	}

	function getAddress(uint _id) onlyOwner existingEmployeeId(_id) constant returns (address) {
		return employeesById[_id].accountAddress;
	}

	function getAllocatedTokenCount(address _address) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).allocatedTokensIndex.length;
	}

	function getAllocatedTokenAddress(address _address, uint _index) onlyOwner existingEmployeeAddress(_address) constant returns (address) {
		return getEmployee(_address).allocatedTokensIndex[_index];
	}

	function getAllocatedTokenValue(address _address, address _token) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).allocatedTokens[_token];
	}

	function getPeggedTokenCount(address _address) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).peggedTokensIndex.length;
	}

	function getPeggedTokenAddress(address _address, uint _index) onlyOwner existingEmployeeAddress(_address) constant returns (address) {
		return getEmployee(_address).peggedTokensIndex[_index];
	}

	function getPeggedTokenValue(address _address, address _token) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).peggedTokens[_token];
	}

	function getSalaryTokenCount(address _address) constant returns (uint) {
		return getEmployee(_address).salaryTokensIndex.length;
	}

	function getSalaryTokenAddress(address _address, uint _index) constant returns (address) {
		return getEmployee(_address).salaryTokensIndex[_index];
	}

	function getSalaryTokenValue(address _address, address _token) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).salaryTokens[_token];
	}

	function getLatestTokenAllocation(address _address) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).latestTokenAllocation;
	}

	function getLatestPayday(address _address) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).latestPayday;
	}

	function getYearlyUSDSalary(address _address) onlyOwner existingEmployeeAddress(_address) constant returns (uint) {
		return getEmployee(_address).yearlyUSDSalary;
	}

	function getYearlyUSDSalariesTotal() onlyOwner constant returns (uint) {
		return yearlyUSDSalariesTotal;
	}

	function getSalaryTokensTotalCount() onlyOwner constant returns (uint) {
		return salaryTokensTotalIndex.length;
	}

	function getSalaryTokensTotalAddress(uint _index) onlyOwner constant returns (address) {
		return salaryTokensTotalIndex[_index];
	}

	function getSalaryTokensTotalValue(address _token) onlyOwner constant returns (uint) {
		return salaryTokensTotal[_token];
	}

	// Remove

	function remove(address _address) onlyOwner existingEmployeeAddress(_address) {
		Employee employee = getEmployee(_address);
		clearAllocatedAndSalaryTokens(_address);

		delete employee.id;
		delete employee.accountAddress;

		for (uint i; i < employee.peggedTokensIndex.length; i++) {
			delete employee.peggedTokens[employee.peggedTokensIndex[i]];
		}

		delete employee.peggedTokensIndex;
		delete employee.latestTokenAllocation;
		delete employee.latestPayday;
		yearlyUSDSalariesTotal = yearlyUSDSalariesTotal.sub(employee.yearlyUSDSalary);
		delete employee.yearlyUSDSalary;
		delete employee.exists;
		employeeCount--;
	}
}
