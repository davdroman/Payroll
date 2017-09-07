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
	const otherAddress = accounts[3]

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
		tokenA = await ERC20Token.new(10000e18, 'Test Token A', 18, 'TTA')
		tokenB = await ERC20Token.new(10000e7, 'Test Token B', 7, 'TTB')
		tokenC = await ERC20Token.new(10000, 'Test Token C', 0, 'TTC')
		tokenD = await ERC20Token.new(10000e4, 'Test Token D', 4, 'TTD')
		employeeStorage = await EmployeeStorage.new()
		exchange = await USDExchange.new(oracleAddress)
		payroll = await Payroll.new(employeeStorage.address, exchange.address)
		await employeeStorage.transferOwnership(payroll.address)
	})

	context('adding employee', () => {
		it('throws when sender is not owner', async () => {
			try {
				await payroll.addEmployee.call(employeeAddress, 1000, { from: otherAddress })
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
			await addEmployee()
			assert.equal(await employeeStorage.mock_getAddress.call(1), employeeAddress)
			assert.equal(await employeeStorage.mock_getYearlyUSDSalary.call(employeeAddress), 24000e18)
		})
	})

	context('determining employee allocation', () => {
		it('throws when address is invalid', async () => {
			await setExchangeRates()
			await addEmployee()

			try {
				await payroll.determineAllocation(
					[tokenA.address, tokenB.address, tokenC.address, tokenD.address],
					[5000, 3000, 1000, 1000],
					{ from: otherAddress }
				)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was determined by other than employee')
		})

		it('throws when array lengths do not match', async () => {
			await setExchangeRates()
			await addEmployee()

			try {
				await payroll.determineAllocation.call(
					[tokenA.address, tokenB.address, tokenC.address, tokenD.address],
					[5000, 3000, 2000],
					{ from: employeeAddress }
				)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was determined with unmatched arrays')
		})

		it('throws when distribution is not 100%', async () => {
			await setExchangeRates()
			await addEmployee()

			try {
				await payroll.determineAllocation.call(
					[tokenA.address, tokenB.address, tokenC.address, tokenD.address],
					[5000, 3000, 1000, 500],
					{ from: employeeAddress }
				)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was determined distribution != 100%')
		})

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

		it('throws when reallocation is not due', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			try {
				await determineAllocation()
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was determined before next due date')
		})

		it('succeeds reallocation', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			await exchange.setExchangeRate(tokenA.address, 1, { from: oracleAddress })
			await exchange.setExchangeRate(tokenB.address, 2, { from: oracleAddress })
			await exchange.setExchangeRate(tokenC.address, 3, { from: oracleAddress })
			await exchange.setExchangeRate(tokenD.address, 4, { from: oracleAddress })

			await employeeStorage.mock_resetLatestTokenAllocation(employeeAddress)

			await payroll.determineAllocation(
				[tokenA.address, tokenC.address, tokenD.address],
				[3000, 5000, 2000],
				{ from: employeeAddress }
			)

			assert.equal(await employeeStorage.mock_getAllocatedTokenCount.call(employeeAddress), 3)
			assert.equal(await employeeStorage.mock_getAllocatedTokenAddress.call(employeeAddress, 0), tokenA.address)
			assert.equal(await employeeStorage.mock_getAllocatedTokenAddress.call(employeeAddress, 1), tokenC.address)
			assert.equal(await employeeStorage.mock_getAllocatedTokenAddress.call(employeeAddress, 2), tokenD.address)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenA.address), 3000)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenC.address), 5000)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenD.address), 2000)

			assert.equal(await employeeStorage.mock_getPeggedTokenCount.call(employeeAddress), 4)
			assert.equal(await employeeStorage.mock_getPeggedTokenAddress.call(employeeAddress, 0), tokenA.address)
			assert.equal(await employeeStorage.mock_getPeggedTokenAddress.call(employeeAddress, 1), tokenB.address)
			assert.equal(await employeeStorage.mock_getPeggedTokenAddress.call(employeeAddress, 2), tokenC.address)
			assert.equal(await employeeStorage.mock_getPeggedTokenAddress.call(employeeAddress, 3), tokenD.address)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenA.address), 2e18)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenB.address), 2.5e18)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenC.address), 6e18)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenD.address), 4e18)

			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenA.address), 300e18)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenB.address), 0)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenC.address), 166)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenD.address), 100e4)
		})
	})

	context('setting employee salary', () => {
		it('throws when sender is not owner', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			try {
				await payroll.setEmployeeSalary.call(1, 5678, { from: otherAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added by other than owner')
		})

		it('throws when salary is zero', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			try {
				await payroll.setEmployeeSalary.call(1, 0)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added with salary zero')
		})

		it('succeeds', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			await payroll.setEmployeeSalary(1, 30000e18)
			assert.equal(await employeeStorage.mock_getYearlyUSDSalary.call(employeeAddress), 30000e18)

			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenA.address), 625e18)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenB.address), 300e7)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenC.address), 41)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenD.address), 62.5e4)
		})
	})

	context('removing an employee', () => {
		it('throws when employee does not exist', async () => {
			await addEmployee()

			try {
				await payroll.removeEmployee(2)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Inexistent employee was removed (wat)')
		})

		it('throws when sender is not the owner', async () => {
			await addEmployee()

			try {
				await payroll.removeEmployee.call(1, { from: otherAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was removed by other than owner')
		})

		it('succeeds', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			await payroll.removeEmployee(1)

			assert.equal(await employeeStorage.mock_getCount.call(), 0)
			assert.equal(await employeeStorage.mock_getExists.call(employeeAddress), false)
			assert.equal(await employeeStorage.mock_getId.call(employeeAddress), 0)
			assert.equal(await employeeStorage.mock_getAddress.call(1), EMPTY_ADDRESS)
			assert.equal(await employeeStorage.mock_getLatestTokenAllocation.call(employeeAddress), 0)
			assert.equal(await employeeStorage.mock_getLatestPayday.call(employeeAddress), 0)
			assert.equal(await employeeStorage.mock_getYearlyUSDSalary.call(employeeAddress), 0)

			assert.equal(await employeeStorage.mock_getAllocatedTokenCount.call(employeeAddress), 0)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenA.address), 0)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenB.address), 0)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenC.address), 0)
			assert.equal(await employeeStorage.mock_getAllocatedTokenValue.call(employeeAddress, tokenD.address), 0)

			assert.equal(await employeeStorage.mock_getPeggedTokenCount.call(employeeAddress), 0)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenA.address), 0)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenB.address), 0)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenC.address), 0)
			assert.equal(await employeeStorage.mock_getPeggedTokenValue.call(employeeAddress, tokenD.address), 0)

			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenA.address), 0)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenB.address), 0)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenC.address), 0)
			assert.equal(await employeeStorage.mock_getSalaryTokenValue.call(employeeAddress, tokenD.address), 0)
		})

		it('succeeds readding', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			await payroll.removeEmployee(1)
			await addEmployee()

			assert.equal(await employeeStorage.mock_getAddress.call(2), employeeAddress)
			assert.equal(await employeeStorage.mock_getYearlyUSDSalary.call(employeeAddress), 24000e18)
		})
	})

	context('calculating payroll burnrate', () => {
		it('throws when sender is not the owner', async () => {
			try {
				await payroll.calculatePayrollBurnrate.call({ from: otherAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Burnrate was fetched by other than owner')
		})

		it('succeeds', async () => {
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 0)
			await addEmployee()
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 2000e18)
			await payroll.setEmployeeSalary(1, 30000e18)
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 2500e18)
			await payroll.addEmployee(otherAddress, 24000e18)
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 4500e18)
			await payroll.removeEmployee(1)
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 2000e18)
			await payroll.removeEmployee(2)
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 0)
		})
	})

	context('calculating payroll runway', () => {
		it('throws when sender is not the owner', async () => {
			try {
				await payroll.calculatePayrollRunway.call({ from: otherAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Runway was fetched by other than owner')
		})

		it('succeeds', async () => {
			// TODO
		})
	})
})
