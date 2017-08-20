const assertThrow = require('./helpers/assertThrow')
const Payroll = artifacts.require('Payroll')

contract('Payroll', accounts => {
	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

	let payroll
	let ownerAddress = accounts[0]
	let employeeAddress = accounts[1]
	let oracleAddress = accounts[2]
	let antAddress = '0x960b236a07cf122663c4303350609a66a7b288c0'
	let gntAddress = '0xa74476443119a942de498590fe1f2454d7d4ac0d'
	let payAddress = '0xb97048628db6b661d4c2aa833e95dbe1a905b280'

	beforeEach(async () => {
		payroll = await Payroll.new(oracleAddress)
	})

	context('adding employee', () => {
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
			await payroll.addEmployee(employeeAddress, [antAddress, gntAddress], 1000)
			const employeeCount = await payroll.getEmployeeCount.call()
			const employee = await payroll.getEmployee.call(1)
			const isANTTokenAllowed = await payroll.getEmployeeIsTokenAllowed.call(1, antAddress)
			const isGNTTokenAllowed = await payroll.getEmployeeIsTokenAllowed.call(1, gntAddress)
			const isPAYTokenAllowed = await payroll.getEmployeeIsTokenAllowed.call(1, payAddress)
			assert.equal(employeeCount, 1, 'employeeCount should be 1')
			assert.equal(employee[0], employeeAddress, 'employeeAddress should match')
			assert.deepEqual(employee[1], [antAddress, gntAddress], 'allowedTokens should be ANT & GNT')
			assert.equal(employee[2].length, 0, 'allocatedTokens should be empty')
			assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
			assert.equal(employee[4], 0, 'weiAllocation should be 0')
			assert.equal(employee[5], 1000, 'yearlyUSDSalary should be 1000')
			assert.equal(isANTTokenAllowed, true, 'ANT token should be allowed')
			assert.equal(isGNTTokenAllowed, true, 'GNT token should be allowed')
			assert.equal(isPAYTokenAllowed, false, 'PAY token should be allowed')
		})
	})

	context('removing employee', () => {
		it('throws when employee does not exist', async () => {
			try {
				await payroll.addEmployee(employeeAddress, [antAddress], 1000)
				await payroll.removeEmployee.call(2)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Inexistent employee was removed (wat)')
		})

		it('throws when sender is not the owner', async () => {
			try {
				await payroll.addEmployee(employeeAddress, [antAddress], 1000)
				await payroll.removeEmployee.call(2, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was removed by other than owner')
		})

		it('succeeds', async () => {
			await payroll.addEmployee(employeeAddress, [antAddress], 1000)
			await payroll.removeEmployee(1)
			const employeeCount = await payroll.getEmployeeCount.call()
			const employee = await payroll.getEmployee.call(1)
			const isANTTokenAllowed = await payroll.getEmployeeIsTokenAllowed.call(1, antAddress)
			const isGNTTokenAllowed = await payroll.getEmployeeIsTokenAllowed.call(1, gntAddress)
			const isPAYTokenAllowed = await payroll.getEmployeeIsTokenAllowed.call(1, payAddress)
			assert.equal(employeeCount, 0, 'employeeCount should be 0')
			assert.equal(employee[0], EMPTY_ADDRESS, 'employeeAddress should be empty')
			assert.equal(employee[1].length, 0, 'allowedTokens should be empty')
			assert.equal(employee[2].length, 0, 'allocatedTokens should be empty')
			assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
			assert.equal(employee[4], 0, 'weiAllocation should be 0')
			assert.equal(employee[5], 0, 'yearlyUSDSalary should be 1000')
			assert.equal(isANTTokenAllowed, false, 'ANT token should be allowed')
			assert.equal(isGNTTokenAllowed, false, 'GNT token should be allowed')
			assert.equal(isPAYTokenAllowed, false, 'PAY token should be allowed')
		})
	})
})
