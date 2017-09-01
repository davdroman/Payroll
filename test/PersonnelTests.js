// const assertThrow = require('./helpers/assertThrow')
// const PersonnelMock = artifacts.require('PersonnelMock')
// const USDExchange = artifacts.require('USDExchange')
// const ERC20Token = artifacts.require('ERC20Token')
//
// contract('Personnel', accounts => {
// 	let tokenA
// 	let tokenB
// 	let tokenC
// 	let tokenD
// 	let exchange
// 	let personnel
//
// 	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
// 	const ownerAddress = accounts[0]
// 	const employeeAddress = accounts[1]
// 	const oracleAddress = accounts[2]
//
// 	const setExchangeRates = async () => {
// 		await exchange.setExchangeRate(tokenA.address, 2e18, { from: oracleAddress })
// 		await exchange.setExchangeRate(tokenB.address, 2.5e18, { from: oracleAddress })
// 		await exchange.setExchangeRate(tokenC.address, 6e18, { from: oracleAddress })
// 		await exchange.setExchangeRate(tokenD.address, 4e18, { from: oracleAddress })
// 	}
//
// 	const determineAllocation = async () => {
// 		await personnel.determineAllocation(
// 			[tokenA.address, tokenB.address, tokenC.address],
// 			[5000, 3000, 2000],
// 			{ from: employeeAddress }
// 		)
// 	}
//
// 	const addEmployee = async () => {
// 		await personnel.addEmployee(employeeAddress, 24000e18)
// 	}
//
// 	beforeEach(async () => {
// 		tokenA = await ERC20Token.new('Test Token A', 'TTA', 18)
// 		tokenB = await ERC20Token.new('Test Token B', 'TTB', 7)
// 		tokenC = await ERC20Token.new('Test Token C', 'TTC', 0)
// 		tokenD = await ERC20Token.new('Test Token D', 'TTD', 4)
// 		exchange = await USDExchange.new(oracleAddress)
// 		personnel = await PersonnelMock.new(exchange.address)
// 	})
//
// 	context('adding new employee', () => {
// 		it('throws when address is invalid', async () => {
// 			try {
// 				await personnel.addEmployee.call(EMPTY_ADDRESS, 1000)
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Employee was added with invalid address')
// 		})
//
// 		it('throws when no salary is specified', async () => {
// 			try {
// 				await personnel.addEmployee.call('0x1', 0)
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Employee was added with no salary')
// 		})
//
// 		it('throws when sender is not the owner', async () => {
// 			try {
// 				await personnel.addEmployee.call('0x1', 1000, { from: employeeAddress })
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Employee was added by other than owner')
// 		})
//
// 		it('succeeds', async () => {
// 			await addEmployee()
// 			const employeeCount = await personnel.getEmployeeCount.call()
// 			const employee = await personnel.getEmployee.call(1)
// 			assert.equal(employeeCount, 1, 'employeeCount should be 1')
// 			assert.equal(employee[0], employeeAddress, 'employeeAddress should match')
// 			assert.equal(employee[1].length, 0, 'allocatedTokens should be empty')
// 			assert.equal(employee[2].length, 0, 'peggedTokens should be empty')
// 			assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
// 			assert.equal(employee[4], 0, 'latestPayday timestamp should be 0')
// 			assert.equal(employee[5], 24000e18, 'yearlyUSDSalary should be 1000')
// 		})
//
// 		it('throws when adding employee with the same address', async () => {
// 			await addEmployee()
//
// 			try {
// 				await addEmployee()
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Employee was added by other than owner')
// 		})
// 	})
//
// 	context('determining allocation', () => {
// 		it('throws when employee does not exist', async () => {
// 			await setExchangeRates()
//
// 			try {
// 				await determineAllocation()
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Allocation was set for inexistent employee')
// 		})
//
// 		it('throws when sender is owner', async () => {
// 			await setExchangeRates()
// 			await addEmployee()
//
// 			try {
// 				await personnel.determineAllocation.call(
// 					[tokenA.address, tokenB.address, tokenC.address],
// 					[5000, 3000, 2000]
// 				)
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Allocation was set by owner')
// 		})
//
// 		it('throws when exchange rate is not set', async () => {
// 			await addEmployee()
//
// 			try {
// 				await determineAllocation()
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Allocation was set with no exchange rates')
// 		})
//
// 		it('throws when distribution does not add up', async () => {
// 			await setExchangeRates()
// 			await addEmployee()
//
// 			try {
// 				await personnel.determineAllocation.call(
// 					[tokenA.address, tokenB.address, tokenC.address],
// 					[2000, 3000, 2000],
// 					{ from: employeeAddress }
// 				)
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Allocation was set with total distribution != 10000')
// 		})
//
// 		it('succeeds', async () => {
// 			await setExchangeRates()
// 			await addEmployee()
// 			await determineAllocation()
// 			const employee = await personnel.getEmployee.call(1)
// 			assert.deepEqual(employee[1], [tokenA.address, tokenB.address, tokenC.address], 'allocatedTokens do not match')
// 			assert.deepEqual(employee[2], [tokenA.address, tokenB.address, tokenC.address], 'peggedTokens do not match')
// 			assert.notEqual(employee[3], 0, 'latestTokenAllocation timestamp should not be 0')
//
// 			const tokenAAllocation = await personnel.getAllocatedTokenValue(tokenA.address, { from: employeeAddress })
// 			const tokenBAllocation = await personnel.getAllocatedTokenValue(tokenB.address, { from: employeeAddress })
// 			const tokenCAllocation = await personnel.getAllocatedTokenValue(tokenC.address, { from: employeeAddress })
// 			assert.equal(tokenAAllocation, 5000);
// 			assert.equal(tokenBAllocation, 3000);
// 			assert.equal(tokenCAllocation, 2000);
//
// 			const tokenAPegging = await personnel.getPeggedTokenValue(tokenA.address, { from: employeeAddress })
// 			const tokenBPegging = await personnel.getPeggedTokenValue(tokenB.address, { from: employeeAddress })
// 			const tokenCPegging = await personnel.getPeggedTokenValue(tokenC.address, { from: employeeAddress })
// 			assert.equal(tokenAPegging, 2e18);
// 			assert.equal(tokenBPegging, 2.5e18);
// 			assert.equal(tokenCPegging, 6e18);
//
// 			const salaryTokenAValue = await personnel.getSalaryTokenValue.call(tokenA.address, { from: employeeAddress })
// 			const salaryTokenBValue = await personnel.getSalaryTokenValue.call(tokenB.address, { from: employeeAddress })
// 			const salaryTokenCValue = await personnel.getSalaryTokenValue.call(tokenC.address, { from: employeeAddress })
// 			assert.equal(salaryTokenAValue, 500e18, '')
// 			assert.equal(salaryTokenBValue, 240e7, '')
// 			assert.equal(salaryTokenCValue, 66, '')
// 		})
//
// 		it('throws when allocation is not due', async () => {
// 			await setExchangeRates()
// 			await addEmployee()
// 			await determineAllocation()
//
// 			try {
// 				await determineAllocation()
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Allocation was set within 6 months of previous allocation')
// 		})
//
// 		it('succeeds reallocation', async () => {
// 			await setExchangeRates()
// 			await addEmployee()
// 			await determineAllocation()
// 			await personnel.resetEmployeeLatestTokenAllocation(1)
// 			await exchange.setExchangeRate(tokenC.address, 2e18, { from: oracleAddress })
// 			await personnel.determineAllocation(
// 				[tokenB.address, tokenD.address],
// 				[1000, 9000],
// 				{ from: employeeAddress }
// 			)
// 			const employee = await personnel.getEmployee.call(1)
// 			assert.deepEqual(employee[1], [tokenB.address, tokenD.address], 'allocatedTokens do not match')
// 			assert.deepEqual(employee[2], [tokenA.address, tokenB.address, tokenC.address, tokenD.address], 'peggedTokens do not match')
// 			assert.notEqual(employee[3], 0, 'latestTokenAllocation timestamp should not be 0')
//
// 			const tokenAAllocation = await personnel.getAllocatedTokenValue(tokenA.address, { from: employeeAddress })
// 			const tokenBAllocation = await personnel.getAllocatedTokenValue(tokenB.address, { from: employeeAddress })
// 			const tokenCAllocation = await personnel.getAllocatedTokenValue(tokenC.address, { from: employeeAddress })
// 			const tokenDAllocation = await personnel.getAllocatedTokenValue(tokenD.address, { from: employeeAddress })
// 			assert.equal(tokenAAllocation, 0);
// 			assert.equal(tokenBAllocation, 1000);
// 			assert.equal(tokenCAllocation, 0);
// 			assert.equal(tokenDAllocation, 9000);
//
// 			const tokenAPegging = await personnel.getPeggedTokenValue(tokenA.address, { from: employeeAddress })
// 			const tokenBPegging = await personnel.getPeggedTokenValue(tokenB.address, { from: employeeAddress })
// 			const tokenCPegging = await personnel.getPeggedTokenValue(tokenC.address, { from: employeeAddress })
// 			const tokenDPegging = await personnel.getPeggedTokenValue(tokenD.address, { from: employeeAddress })
// 			assert.equal(tokenAPegging, 2e18);
// 			assert.equal(tokenBPegging, 2.5e18);
// 			assert.equal(tokenCPegging, 6e18);
// 			assert.equal(tokenDPegging, 4e18);
//
// 			const tokenASalary = await personnel.getSalaryTokenValue(tokenA.address, { from: employeeAddress })
// 			const tokenBSalary = await personnel.getSalaryTokenValue(tokenB.address, { from: employeeAddress })
// 			const tokenCSalary = await personnel.getSalaryTokenValue(tokenC.address, { from: employeeAddress })
// 			const tokenDSalary = await personnel.getSalaryTokenValue(tokenD.address, { from: employeeAddress })
// 			assert.equal(tokenASalary, 0);
// 			assert.equal(tokenBSalary, 80e7);
// 			assert.equal(tokenCSalary, 0);
// 			assert.equal(tokenDSalary, 450e4);
// 		})
// 	})
//
// 	context('setting an employee salary', () => {
// 		it('throws when employee does not exist', async () => {
// 			try {
// 				await personnel.setEmployeeSalary.call(1, 36000e18)
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Inexistent employee was assigned a salary')
// 		})
//
// 		it('throws when salary is zero', async () => {
// 			await addEmployee()
//
// 			try {
// 				await personnel.setEmployeeSalary.call(1, 0)
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Employee salary was set to zero')
// 		})
//
// 		it('throws when sender is not the owner', async () => {
// 			await addEmployee()
//
// 			try {
// 				await personnel.setEmployeeSalary.call(1, 36000e18, { from: employeeAddress })
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Employee salary was set by other than owner')
// 		})
//
// 		it('succeeds', async () => {
// 			await setExchangeRates()
// 			await addEmployee()
// 			await determineAllocation()
// 			await personnel.setEmployeeSalary(1, 36000e18)
//
// 			const tokenAAllocation = await personnel.getAllocatedTokenValue(tokenA.address, { from: employeeAddress })
// 			const tokenBAllocation = await personnel.getAllocatedTokenValue(tokenB.address, { from: employeeAddress })
// 			const tokenCAllocation = await personnel.getAllocatedTokenValue(tokenC.address, { from: employeeAddress })
// 			assert.equal(tokenAAllocation, 5000);
// 			assert.equal(tokenBAllocation, 3000);
// 			assert.equal(tokenCAllocation, 2000);
//
// 			const tokenAPegging = await personnel.getPeggedTokenValue(tokenA.address, { from: employeeAddress })
// 			const tokenBPegging = await personnel.getPeggedTokenValue(tokenB.address, { from: employeeAddress })
// 			const tokenCPegging = await personnel.getPeggedTokenValue(tokenC.address, { from: employeeAddress })
// 			assert.equal(tokenAPegging, 2e18);
// 			assert.equal(tokenBPegging, 2.5e18);
// 			assert.equal(tokenCPegging, 6e18);
//
// 			const salaryTokenAValue = await personnel.getSalaryTokenValue.call(tokenA.address, { from: employeeAddress })
// 			const salaryTokenBValue = await personnel.getSalaryTokenValue.call(tokenB.address, { from: employeeAddress })
// 			const salaryTokenCValue = await personnel.getSalaryTokenValue.call(tokenC.address, { from: employeeAddress })
// 			assert.equal(salaryTokenAValue, 750e18, '')
// 			assert.equal(salaryTokenBValue, 360e7, '')
// 			assert.equal(salaryTokenCValue, 100, '')
// 		})
// 	})
//
// 	context('removing an employee', () => {
// 		it('throws when employee does not exist', async () => {
// 			await addEmployee()
//
// 			try {
// 				await personnel.removeEmployee.call(2)
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Inexistent employee was removed (wat)')
// 		})
//
// 		it('throws when sender is not the owner', async () => {
// 			await addEmployee()
//
// 			try {
// 				await personnel.removeEmployee.call(1, { from: employeeAddress })
// 			} catch (error) {
// 				return assertThrow(error)
// 			}
// 			throw new Error('Employee was removed by other than owner')
// 		})
//
// 		it('succeeds', async () => {
// 			await setExchangeRates()
// 			await addEmployee()
// 			await determineAllocation()
// 			await personnel.removeEmployee(1)
// 			const employeeCount = await personnel.getEmployeeCount.call()
// 			const employee = await personnel.getEmployee.call(1)
// 			assert.equal(employeeCount, 0, 'employeeCount should be 0')
// 			assert.equal(employee[0], EMPTY_ADDRESS, 'employeeAddress should be empty')
// 			assert.equal(employee[1].length, 0, 'allocatedTokens should be empty')
// 			assert.equal(employee[2].length, 0, 'peggedTokens should be empty')
// 			assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
// 			assert.equal(employee[4], 0, 'latestPayday timestamp should be 0')
// 			assert.equal(employee[5], 0, 'yearlyUSDSalary should be 0')
//
// 			const tokenAAllocation = await personnel.getEmployeeAllocatedTokenValue(1, tokenA.address)
// 			const tokenBAllocation = await personnel.getEmployeeAllocatedTokenValue(1, tokenB.address)
// 			const tokenCAllocation = await personnel.getEmployeeAllocatedTokenValue(1, tokenC.address)
// 			const tokenDAllocation = await personnel.getEmployeeAllocatedTokenValue(1, tokenD.address)
// 			assert.equal(tokenAAllocation, 0);
// 			assert.equal(tokenBAllocation, 0);
// 			assert.equal(tokenCAllocation, 0);
// 			assert.equal(tokenDAllocation, 0);
//
// 			const tokenAPegging = await personnel.getEmployeePeggedTokenValue(1, tokenA.address)
// 			const tokenBPegging = await personnel.getEmployeePeggedTokenValue(1, tokenB.address)
// 			const tokenCPegging = await personnel.getEmployeePeggedTokenValue(1, tokenC.address)
// 			const tokenDPegging = await personnel.getEmployeePeggedTokenValue(1, tokenD.address)
// 			assert.equal(tokenAPegging, 0);
// 			assert.equal(tokenBPegging, 0);
// 			assert.equal(tokenCPegging, 0);
// 			assert.equal(tokenDPegging, 0);
//
// 			const tokenASalary = await personnel.getEmployeeSalaryTokenValue(1, tokenA.address)
// 			const tokenBSalary = await personnel.getEmployeeSalaryTokenValue(1, tokenB.address)
// 			const tokenCSalary = await personnel.getEmployeeSalaryTokenValue(1, tokenC.address)
// 			const tokenDSalary = await personnel.getEmployeeSalaryTokenValue(1, tokenD.address)
// 			assert.equal(tokenASalary, 0);
// 			assert.equal(tokenBSalary, 0);
// 			assert.equal(tokenCSalary, 0);
// 			assert.equal(tokenDSalary, 0);
// 		})
//
// 		it('succeeds readding', async () => {
// 			await setExchangeRates()
// 			await addEmployee()
// 			await determineAllocation()
// 			await personnel.removeEmployee(1)
// 			await addEmployee()
// 			const employeeCount = await personnel.getEmployeeCount.call()
// 			const employee = await personnel.getEmployee.call(2)
// 			assert.equal(employeeCount, 1, 'employeeCount should be 1')
// 			assert.equal(employee[0], employeeAddress, 'employeeAddress should match')
// 			assert.equal(employee[1].length, 0, 'allocatedTokens should be empty')
// 			assert.equal(employee[2].length, 0, 'peggedTokens should be empty')
// 			assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
// 			assert.equal(employee[4], 0, 'latestPayday timestamp should be 0')
// 			assert.equal(employee[5], 24000e18, 'yearlyUSDSalary should be 1000')
// 		})
// 	})
// })
