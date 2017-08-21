const assertThrow = require('./helpers/assertThrow')
const EmployeesController = artifacts.require('EmployeesController')
const USDExchange = artifacts.require('USDExchange')
const ERC20Token = artifacts.require('ERC20Token')

contract('EmployeesController', accounts => {
	let tokenA
	let tokenB
	let tokenC

	let exchange
	let controller

	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
	const ownerAddress = accounts[0]
	const employeeAddress = accounts[1]
	const oracleAddress = accounts[2]

	before(async () => {
		tokenA = await ERC20Token.new('Test Token A', 'TTA', 18, 1000e18)
		tokenB = await ERC20Token.new('Test Token B', 'TTB', 7, 1000e7)
		tokenC = await ERC20Token.new('Test Token C', 'TTC', 0, 1000)
	})

	beforeEach(async () => {
		exchange = await USDExchange.new(oracleAddress)
		controller = await EmployeesController.new(exchange.address)
	})

	context('adding employee', () => {
		it('throws when address is invalid', async () => {
			try {
				await controller.addEmployee.call('0x0', 1000)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added with invalid address')
		})

		it('throws when no salary is specified', async () => {
			try {
				await controller.addEmployee.call('0x1', 0)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added with no salary')
		})

		it('throws when sender is not the owner', async () => {
			try {
				await controller.addEmployee.call('0x1', 1000, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added by other than owner')
		})

		it('succeeds', async () => {
			await controller.addEmployee(employeeAddress, 1000)
			const employeeCount = await controller.getEmployeeCount.call()
			const employee = await controller.getEmployee.call(1)
			assert.equal(employeeCount, 1, 'employeeCount should be 1')
			assert.equal(employee[0], employeeAddress, 'employeeAddress should match')
			assert.equal(employee[1].length, 0, 'allocatedTokens should be empty')
			assert.equal(employee[2].length, 0, 'peggedTokens should be empty')
			assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
			assert.equal(employee[4], 0, 'latestPayday timestamp should be 0')
			assert.equal(employee[5], 1000, 'yearlyUSDSalary should be 1000')
		})
	})

	context('setting allocation', () => {
		it('throws when employee does not exist', async () => {
			try {
				await controller.setEmployeeAllocation.call(
					[tokenA.address, tokenB.address, tokenC.address],
					[5000, 3000, 2000],
					{ from: employeeAddress }
				)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was set for inexistent employee')
		})

		it('throws when sender is owner', async () => {
			try {
				await controller.setEmployeeAllocation.call(
					[tokenA.address, tokenB.address, tokenC.address],
					[5000, 3000, 2000]
				)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was set by owner')
		})

		it('throws when exchange rate is not set', async () => {
			try {
				await controller.setEmployeeAllocation.call(
					[tokenA.address, tokenB.address, tokenC.address],
					[5000, 3000, 2000],
					{ from: employeeAddress }
				)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was set with no exchange rates')
		})

		it('succeeds', async () => {
			await exchange.setExchangeRate(tokenA.address, 2e18, { from: oracleAddress })
			await exchange.setExchangeRate(tokenB.address, 2.5e18, { from: oracleAddress })
			await exchange.setExchangeRate(tokenC.address, 6e18, { from: oracleAddress })
			await controller.addEmployee(employeeAddress, 1000)
			await controller.setEmployeeAllocation(
				[tokenA.address, tokenB.address, tokenC.address],
				[5000, 3000, 2000],
				{ from: employeeAddress }
			)
			const employee = await controller.getEmployee.call(1)
			assert.deepEqual(employee[1], [tokenA.address, tokenB.address, tokenC.address], 'allocatedTokens do not match')
			assert.deepEqual(employee[2], [tokenA.address, tokenB.address, tokenC.address], 'peggedTokens do not match')
			assert.notEqual(employee[3], 0, 'latestTokenAllocation timestamp should not be 0')
		})

		it('throws when allocation is not due', async () => {
			await exchange.setExchangeRate(tokenA.address, 2e18, { from: oracleAddress })
			await exchange.setExchangeRate(tokenB.address, 2.5e18, { from: oracleAddress })
			await exchange.setExchangeRate(tokenC.address, 6e18, { from: oracleAddress })
			await controller.addEmployee(employeeAddress, 1000)
			await controller.setEmployeeAllocation(
				[tokenA.address, tokenB.address, tokenC.address],
				[5000, 3000, 2000],
				{ from: employeeAddress }
			)
			
			try {
				await controller.setEmployeeAllocation.call(
					[tokenA.address, tokenB.address, tokenC.address],
					[5000, 3000, 2000],
					{ from: employeeAddress }
				)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was set within 6 months of previous allocation')
		})
	})

	context('removing employee', () => {
		it('throws when employee does not exist', async () => {
			try {
				await controller.addEmployee(employeeAddress, 1000)
				await controller.removeEmployee.call(2)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Inexistent employee was removed (wat)')
		})

		it('throws when sender is not the owner', async () => {
			try {
				await controller.addEmployee(employeeAddress, 1000)
				await controller.removeEmployee.call(2, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was removed by other than owner')
		})

		it('succeeds', async () => {
			await controller.addEmployee(employeeAddress, 1000)
			await controller.removeEmployee(1)
			const employeeCount = await controller.getEmployeeCount.call()
			const employee = await controller.getEmployee.call(1)
			assert.equal(employeeCount, 0, 'employeeCount should be 0')
			assert.equal(employee[0], EMPTY_ADDRESS, 'employeeAddress should be empty')
			assert.equal(employee[1].length, 0, 'allocatedTokens should be empty')
			assert.equal(employee[2].length, 0, 'peggedTokens should be empty')
			assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
			assert.equal(employee[4], 0, 'latestPayday timestamp should be 0')
			assert.equal(employee[5], 0, 'yearlyUSDSalary should be 1000')
		})
	})
})
