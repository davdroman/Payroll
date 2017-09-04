const assertThrow = require('./helpers/assertThrow')
const EmployeeStorage = artifacts.require('EmployeeStorageMock')
const USDExchange = artifacts.require('USDExchange')
const Payroll = artifacts.require('Payroll')
const ERC20Token = artifacts.require('ERC20Token')

contract('Payroll', accounts => {
	let tokenA
	let tokenB
	let tokenC
	let tokenD
	let employeeStorage
	let exchange
	let payroll

	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
	const ownerAddress = accounts[0]
	const employeeAddress = accounts[1]
	const oracleAddress = accounts[2]

	const setExchangeRates = async () => {
		await exchange.setExchangeRate(tokenA.address, 2e18, { from: oracleAddress })
		await exchange.setExchangeRate(tokenB.address, 2.5e18, { from: oracleAddress })
		await exchange.setExchangeRate(tokenC.address, 6e18, { from: oracleAddress })
		await exchange.setExchangeRate(tokenD.address, 4e18, { from: oracleAddress })
	}

	const addEmployee = async () => {
		await payroll.addEmployee(employeeAddress, 24000e18)
	}

	const determineAllocation = async () => {
		await payroll.determineAllocation(
			[tokenA.address, tokenB.address, tokenC.address, tokenD.address],
			[5000, 3000, 1000, 1000],
			{ from: employeeAddress }
		)
	}

	beforeEach(async () => {
		tokenA = await ERC20Token.new('Test Token A', 'TTA', 18)
		tokenB = await ERC20Token.new('Test Token B', 'TTB', 7)
		tokenC = await ERC20Token.new('Test Token C', 'TTC', 0)
		tokenD = await ERC20Token.new('Test Token D', 'TTD', 4)
		employeeStorage = await EmployeeStorage.new()
		exchange = await USDExchange.new(oracleAddress)
		payroll = await Payroll.new(employeeStorage.address, exchange.address)
		await employeeStorage.transferOwnership(payroll.address)
	})

	context('adding employee', () => {
		it('throws when sender is not owner', async () => {
			try {
				await payroll.addEmployee.call(employeeAddress, 1000, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added by other than owner')
		})

		it('throws when address is invalid', async () => {
			try {
				await payroll.addEmployee.call(EMPTY_ADDRESS, 1234)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added with invalid address')
		})

		it('throws when salary is zero', async () => {
			try {
				await payroll.addEmployee.call(employeeAddress, 0)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added with salary as zero')
		})

		it('succeeds', async () => {
			await payroll.addEmployee(employeeAddress, 1234)
			assert.equal(await employeeStorage.mock_getAddress.call(0), employeeAddress)
			assert.equal(await employeeStorage.mock_getYearlyUSDSalary.call(employeeAddress), 1234)
		})
	})

	context('determining employee allocation', () => {
		it('succeeds', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			assert.equal(await employeeStorage.mock_getAllocatedTokenCount.call(employeeAddress), 4)
			assert.equal(await employeeStorage.mock_getAllocatedTokenAddress.call(employeeAddress, 0), tokenA.address)
			assert.equal(await employeeStorage.mock_getAllocatedTokenAddress.call(employeeAddress, 1), tokenB.address)
			assert.equal(await employeeStorage.mock_getAllocatedTokenAddress.call(employeeAddress, 2), tokenC.address)
			assert.equal(await employeeStorage.mock_getAllocatedTokenAddress.call(employeeAddress, 3), tokenD.address)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenA.address), 5000)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenB.address), 3000)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenC.address), 1000)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenD.address), 1000)

			assert.equal(await employeeStorage.mock_getPeggedTokenCount.call(employeeAddress), 4)
			assert.equal(await employeeStorage.mock_getPeggedTokenAddress.call(employeeAddress, 0), tokenA.address)
			assert.equal(await employeeStorage.mock_getPeggedTokenAddress.call(employeeAddress, 1), tokenB.address)
			assert.equal(await employeeStorage.mock_getPeggedTokenAddress.call(employeeAddress, 2), tokenC.address)
			assert.equal(await employeeStorage.mock_getPeggedTokenAddress.call(employeeAddress, 3), tokenD.address)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenA.address), 2e18)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenB.address), 2.5e18)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenC.address), 6e18)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenD.address), 4e18)

			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenA.address), 500e18)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenB.address), 240e7)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenC.address), 33)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenD.address), 50e4)
		})

		// it('throws when address is invalid', async () => {
		// 	try {
		// 		await payroll.addEmployee.call(EMPTY_ADDRESS, 1234)
		// 	} catch (error) {
		// 		return assertThrow(error)
		// 	}
		// 	throw new Error('Employee was added with invalid address')
		// })
		//
		// it('throws when salary is zero', async () => {
		// 	try {
		// 		await payroll.addEmployee.call(employeeAddress, 0)
		// 	} catch (error) {
		// 		return assertThrow(error)
		// 	}
		// 	throw new Error('Employee was added with salary as zero')
		// })

		// it('succeeds', async () => {
		// 	await payroll.addEmployee(employeeAddress, 1234)
		// 	await payroll.setEmployeeSalary(0, 5678)
		// 	assert.equal(await employeeStorage.mock_getYearlyUSDSalary.call(employeeAddress), 5678)
		// })
	})

	context('setting employee salary', () => {
		it('throws when sender is not owner', async () => {
			await payroll.addEmployee(employeeAddress, 1234)

			try {
				await payroll.setEmployeeSalary(0, 5678, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added by other than owner')
		})

		// it('throws when address is invalid', async () => {
		// 	try {
		// 		await payroll.addEmployee.call(EMPTY_ADDRESS, 1234)
		// 	} catch (error) {
		// 		return assertThrow(error)
		// 	}
		// 	throw new Error('Employee was added with invalid address')
		// })
		//
		// it('throws when salary is zero', async () => {
		// 	try {
		// 		await payroll.addEmployee.call(employeeAddress, 0)
		// 	} catch (error) {
		// 		return assertThrow(error)
		// 	}
		// 	throw new Error('Employee was added with salary as zero')
		// })

		it('succeeds', async () => {
			await payroll.addEmployee(employeeAddress, 1234)
			await payroll.setEmployeeSalary(0, 5678)
			assert.equal(await employeeStorage.mock_getYearlyUSDSalary.call(employeeAddress), 5678)
		})
	})
})
