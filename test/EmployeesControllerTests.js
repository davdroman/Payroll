const assertThrow = require('./helpers/assertThrow')
const EmployeesController = artifacts.require('EmployeesController')

contract('EmployeesController', accounts => {
	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

	let controller
	let ownerAddress = accounts[0]
	let employeeAddress = accounts[1]
	let oracleAddress = accounts[1]
	let antAddress = '0x960b236a07cf122663c4303350609a66a7b288c0'
	let gntAddress = '0xa74476443119a942de498590fe1f2454d7d4ac0d'
	let payAddress = '0xb97048628db6b661d4c2aa833e95dbe1a905b280'

	beforeEach(async () => {
		controller = await EmployeesController.new(oracleAddress)
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
			assert.equal(employee[2], 0, 'latestTokenAllocation timestamp should be 0')
			assert.equal(employee[3], 0, 'weiAllocation should be 0')
			assert.equal(employee[4], 1000, 'yearlyUSDSalary should be 1000')
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
			assert.equal(employee[2], 0, 'latestTokenAllocation timestamp should be 0')
			assert.equal(employee[3], 0, 'weiAllocation should be 0')
			assert.equal(employee[4], 0, 'yearlyUSDSalary should be 1000')
		})
	})
})
