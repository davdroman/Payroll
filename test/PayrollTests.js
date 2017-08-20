const assertThrow = require('./helpers/assertThrow')
const Payroll = artifacts.require('Payroll')

contract('Payroll', accounts => {
	let payroll
	let ownerAddress = accounts[0]
	let employeeAddress = accounts[1]
	let antAddress = '0x960b236a07cf122663c4303350609a66a7b288c0'

	beforeEach(async () => {
		payroll = await Payroll.new()
	})

	context('adding employees', () => {
		it('throws when address is invalid', async () => {
			try {
				await payroll.addEmployee.call('0x0', ['0x1'], 1000)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added with invalid address')
		})

		it('throws when no tokens are allowed', async () => {
			try {
				await payroll.addEmployee.call('0x1', [], 1000)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added with no allowed tokens')
		})

		it('throws when no salary is specified', async () => {
			try {
				await payroll.addEmployee.call('0x1', ['0x2'], 0)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added with no salary')
		})

		it('throws when sender is not the owner', async () => {
			try {
				await payroll.addEmployee.call('0x1', ['0x2'], 1000, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added by other than owner')
		})

		it('succeeds', async () => {
			await payroll.addEmployee(employeeAddress, [antAddress], 1000)
			const employeeCount = await payroll.getEmployeeCount.call()
			const employee = await payroll.getEmployee.call(1)
			const isTokenAllowed = await payroll.getEmployeeIsTokenAllowed.call(1, antAddress)
			assert.equal(employeeCount, 1, 'employeeCount should be 1')
			assert.equal(employee[0], employeeAddress, 'employeeAddress should match')
			assert.equal(employee[1][0], antAddress, 'allowedTokens should contain ANT address')
			assert.equal(employee[2].length, 0, 'allocatedTokens should be empty')
			assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
			assert.equal(employee[4], 0, 'weiAllocation should be 0')
			assert.equal(employee[5], 1000, 'yearlyUSDSalary should be 1000')
			assert.equal(isTokenAllowed, true, 'ANT token should be allowed')
		})
	})
})
