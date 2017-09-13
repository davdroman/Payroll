const assertThrow = require('./helpers/assertThrow')
const EmployeeStorage = artifacts.require('EmployeeStorageMock')

contract('EmployeeStorage', accounts => {
	let storage

	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
	const tokenA = '0x0000000000000000000000000000000000000001'
	const tokenB = '0x0000000000000000000000000000000000000002'
	const tokenC = '0x0000000000000000000000000000000000000003'
	const ownerAddress = accounts[0]
	const employeeAddress = accounts[1]
	const employeeAddressB = accounts[2]

	beforeEach(async () => {
		storage = await EmployeeStorage.new()
	})

	context('adding employee', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.add.call(employeeAddress, 1000, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added by other than owner')
		})

		it('throws when employee already exists', async () => {
			await storage.add(employeeAddress, 1000)

			try {
				await storage.add.call(employeeAddress, 1000)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added twice')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			assert.equal(await storage.getCount.call(), 1)
			assert.equal(await storage.getId.call(employeeAddress), 1)
			assert.equal(await storage.getAddress.call(1), employeeAddress)
			assert.equal(await storage.mock_getLatestTokenAllocation.call(employeeAddress), 0)
			assert.isTrue(await storage.mock_getLatestPayday.call(employeeAddress) > 0)
			assert.equal(await storage.getYearlyUSDSalary.call(employeeAddress), 1234)
		})
	})

	context('setting address', () => {
		it('throws when sender is not owner', async () => {
			await storage.add(employeeAddress, 1000)

			try {
				await storage.setAddress.call(employeeAddress, employeeAddressB, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Address was changed by other than owner')
		})

		it('throws when new address belongs to existing employee', async () => {
			await storage.add(employeeAddress, 1000)
			await storage.add(employeeAddressB, 1500)

			try {
				await storage.setAddress.call(employeeAddress, employeeAddressB)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Address was changed to that of an existing employee')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setAddress(employeeAddress, employeeAddressB)
			assert.equal(await storage.getAddress.call(1), employeeAddressB)
			assert.equal(await storage.getId.call(employeeAddressB), 1)
			assert.equal(await storage.mock_getId.call(employeeAddress), 0)
		})
	})

	context('setting allocation', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.setAllocatedToken.call(employeeAddress, tokenA, 1000, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Allocation was set by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setAllocatedToken(employeeAddress, tokenA, 2000)
			await storage.setAllocatedToken(employeeAddress, tokenB, 3500)
			await storage.setAllocatedToken(employeeAddress, tokenC, 5400)
			assert.equal(await storage.getAllocatedTokenCount.call(employeeAddress), 3)
			assert.equal(await storage.getAllocatedTokenAddress.call(employeeAddress, 0), tokenA)
			assert.equal(await storage.getAllocatedTokenAddress.call(employeeAddress, 1), tokenB)
			assert.equal(await storage.getAllocatedTokenAddress.call(employeeAddress, 2), tokenC)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenA), 2000)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenB), 3500)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenC), 5400)

			await storage.setAllocatedToken(employeeAddress, tokenB, 0)
			assert.equal(await storage.getAllocatedTokenCount.call(employeeAddress), 2)
			assert.equal(await storage.getAllocatedTokenAddress.call(employeeAddress, 0), tokenA)
			assert.equal(await storage.getAllocatedTokenAddress.call(employeeAddress, 1), tokenC)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenA), 2000)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenB), 0)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenC), 5400)
		})
	})

	context('setting pegging', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.setPeggedToken.call(employeeAddress, tokenA, 1000, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Pegging was set by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setPeggedToken(employeeAddress, tokenA, 2000)
			await storage.setPeggedToken(employeeAddress, tokenB, 3500)
			await storage.setPeggedToken(employeeAddress, tokenC, 5400)
			assert.equal(await storage.getPeggedTokenCount.call(employeeAddress), 3)
			assert.equal(await storage.getPeggedTokenAddress.call(employeeAddress, 0), tokenA)
			assert.equal(await storage.getPeggedTokenAddress.call(employeeAddress, 1), tokenB)
			assert.equal(await storage.getPeggedTokenAddress.call(employeeAddress, 2), tokenC)
			assert.equal(await storage.getPeggedTokenValue.call(employeeAddress, tokenA), 2000)
			assert.equal(await storage.getPeggedTokenValue.call(employeeAddress, tokenB), 3500)
			assert.equal(await storage.getPeggedTokenValue.call(employeeAddress, tokenC), 5400)

			await storage.setPeggedToken(employeeAddress, tokenB, 0)
			assert.equal(await storage.getPeggedTokenCount.call(employeeAddress), 2)
			assert.equal(await storage.getPeggedTokenAddress.call(employeeAddress, 0), tokenA)
			assert.equal(await storage.getPeggedTokenAddress.call(employeeAddress, 1), tokenC)
			assert.equal(await storage.getPeggedTokenValue.call(employeeAddress, tokenA), 2000)
			assert.equal(await storage.getPeggedTokenValue.call(employeeAddress, tokenB), 0)
			assert.equal(await storage.getPeggedTokenValue.call(employeeAddress, tokenC), 5400)
		})
	})

	context('setting salary tokens', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.setSalaryToken.call(employeeAddress, tokenA, 1000, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Salary was set by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setSalaryToken(employeeAddress, tokenA, 2000)
			await storage.setSalaryToken(employeeAddress, tokenB, 3500)
			await storage.setSalaryToken(employeeAddress, tokenC, 5400)
			assert.equal(await storage.getSalaryTokenCount.call(employeeAddress), 3)
			assert.equal(await storage.getSalaryTokenAddress.call(employeeAddress, 0), tokenA)
			assert.equal(await storage.getSalaryTokenAddress.call(employeeAddress, 1), tokenB)
			assert.equal(await storage.getSalaryTokenAddress.call(employeeAddress, 2), tokenC)
			assert.equal(await storage.getSalaryTokenValue.call(employeeAddress, tokenA), 2000)
			assert.equal(await storage.getSalaryTokenValue.call(employeeAddress, tokenB), 3500)
			assert.equal(await storage.getSalaryTokenValue.call(employeeAddress, tokenC), 5400)
		})
	})

	context('clearing allocation and salary', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.clearAllocatedAndSalaryTokens.call(employeeAddress, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Clearing was done by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setAllocatedToken(employeeAddress, tokenA, 2000)
			await storage.setAllocatedToken(employeeAddress, tokenB, 3500)
			await storage.setAllocatedToken(employeeAddress, tokenC, 5400)
			await storage.setSalaryToken(employeeAddress, tokenA, 3000)
			await storage.setSalaryToken(employeeAddress, tokenB, 4500)
			await storage.setSalaryToken(employeeAddress, tokenC, 6400)
			await storage.clearAllocatedAndSalaryTokens(employeeAddress)
			assert.equal(await storage.getAllocatedTokenCount.call(employeeAddress), 0)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenA), 0)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenB), 0)
			assert.equal(await storage.getAllocatedTokenValue.call(employeeAddress, tokenC), 0)
			assert.equal(await storage.getSalaryTokenCount.call(employeeAddress), 0)
			assert.equal(await storage.getSalaryTokenValue.call(employeeAddress, tokenA), 0)
			assert.equal(await storage.getSalaryTokenValue.call(employeeAddress, tokenB), 0)
			assert.equal(await storage.getSalaryTokenValue.call(employeeAddress, tokenC), 0)
		})
	})

	context('setting latest allocation date', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.setLatestTokenAllocation.call(employeeAddress, 100, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Setting latest allocation date was done by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setLatestTokenAllocation(employeeAddress, 100)
			assert.equal(await storage.getLatestTokenAllocation.call(employeeAddress), 100)
		})
	})

	context('setting latest payday date', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.setLatestPayday.call(employeeAddress, 100, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Setting latest payday date was done by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setLatestPayday(employeeAddress, 100)
			assert.equal(await storage.getLatestPayday.call(employeeAddress), 100)
		})
	})

	context('setting latest token payday date', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.setLatestTokenPayday.call(employeeAddress, tokenA, 100, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Setting latest token payday date was done by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setLatestTokenPayday(employeeAddress, tokenA, 100)
			assert.equal(await storage.getLatestTokenPayday.call(employeeAddress, tokenA), 100)
		})
	})

	context('setting yearly USD salary', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.setYearlyUSDSalary.call(employeeAddress, 100, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Setting yearly USD salary was done by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setYearlyUSDSalary(employeeAddress, 100)
			assert.equal(await storage.getYearlyUSDSalary.call(employeeAddress), 100)
		})
	})

	context('removing employee', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.remove.call(employeeAddress, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was removed by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setAllocatedToken(employeeAddress, tokenA, 2000)
			await storage.setAllocatedToken(employeeAddress, tokenB, 3500)
			await storage.setAllocatedToken(employeeAddress, tokenC, 5400)
			await storage.setPeggedToken(employeeAddress, tokenA, 3000)
			await storage.setPeggedToken(employeeAddress, tokenB, 4500)
			await storage.setPeggedToken(employeeAddress, tokenC, 6400)
			await storage.setSalaryToken(employeeAddress, tokenA, 4000)
			await storage.setSalaryToken(employeeAddress, tokenB, 5500)
			await storage.setSalaryToken(employeeAddress, tokenC, 7400)
			await storage.setLatestTokenAllocation(employeeAddress, 100)
			await storage.setLatestPayday(employeeAddress, 200)
			await storage.setYearlyUSDSalary(employeeAddress, 300)
			await storage.remove(employeeAddress)
			assert.equal(await storage.getCount.call(), 0)
			assert.equal(await storage.mock_getExists.call(employeeAddress), false)
			assert.equal(await storage.mock_getId.call(employeeAddress), 0)
			assert.equal(await storage.mock_getAddress.call(0), EMPTY_ADDRESS)
			assert.equal(await storage.mock_getAllocatedTokenCount.call(employeeAddress), 0)
			assert.equal(await storage.mock_getAllocatedTokenValue.call(employeeAddress, tokenA), 0)
			assert.equal(await storage.mock_getAllocatedTokenValue.call(employeeAddress, tokenB), 0)
			assert.equal(await storage.mock_getAllocatedTokenValue.call(employeeAddress, tokenC), 0)
			assert.equal(await storage.mock_getPeggedTokenCount.call(employeeAddress), 0)
			assert.equal(await storage.mock_getPeggedTokenValue.call(employeeAddress, tokenA), 0)
			assert.equal(await storage.mock_getPeggedTokenValue.call(employeeAddress, tokenB), 0)
			assert.equal(await storage.mock_getPeggedTokenValue.call(employeeAddress, tokenC), 0)
			assert.equal(await storage.mock_getSalaryTokenValue.call(employeeAddress, tokenA), 0)
			assert.equal(await storage.mock_getSalaryTokenValue.call(employeeAddress, tokenB), 0)
			assert.equal(await storage.mock_getSalaryTokenValue.call(employeeAddress, tokenC), 0)
			assert.equal(await storage.mock_getLatestTokenAllocation.call(employeeAddress), 0)
			assert.equal(await storage.mock_getLatestPayday.call(employeeAddress), 0)
			assert.equal(await storage.mock_getYearlyUSDSalary.call(employeeAddress), 0)
		})
	})

	context('counting total yearly USD salaries', () => {
		it('increases upon new employee', async () => {
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
			await storage.add(employeeAddress, 24000e18)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 24000e18)
			await storage.add(employeeAddressB, 2000e18)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 26000e18)
		})

		it('increases upon salary raise', async () => {
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
			await storage.add(employeeAddress, 24000e18)
			await storage.setYearlyUSDSalary(employeeAddress, 50000e18)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 50000e18)
		})

		it('decreases upon salary cut', async () => {
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
			await storage.add(employeeAddress, 24000e18)
			await storage.setYearlyUSDSalary(employeeAddress, 10000e18)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 10000e18)
		})

		it('decreases upon employee removal', async () => {
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
			await storage.add(employeeAddress, 24000e18)
			await storage.remove(employeeAddress)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
		})
	})

	context('counting total monthly salary tokens', () => {
		it('changes after setting salary', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setSalaryToken(employeeAddress, tokenA, 2000)
			await storage.setSalaryToken(employeeAddress, tokenB, 3500)
			await storage.setSalaryToken(employeeAddress, tokenC, 5400)
			assert.equal(await storage.getSalaryTokensTotalCount.call(), 3)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenA), 2000)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenB), 3500)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenC), 5400)

			await storage.add(employeeAddressB, 1234)
			await storage.setSalaryToken(employeeAddressB, tokenA, 2000)
			await storage.setSalaryToken(employeeAddressB, tokenB, 0)
			await storage.setSalaryToken(employeeAddressB, tokenC, 400)
			assert.equal(await storage.getSalaryTokensTotalCount.call(), 3)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenA), 4000)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenB), 3500)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenC), 5800)

			await storage.setSalaryToken(employeeAddress, tokenB, 0)
			assert.equal(await storage.getSalaryTokensTotalCount.call(), 2)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenB), 0)
		})

		it('decreases upon employee removal', async () => {
			await storage.add(employeeAddress, 1234)
			await storage.setSalaryToken(employeeAddress, tokenA, 2000)
			await storage.setSalaryToken(employeeAddress, tokenB, 3500)
			await storage.setSalaryToken(employeeAddress, tokenC, 5400)
			await storage.remove(employeeAddress)
			assert.equal(await storage.getSalaryTokensTotalCount.call(), 0)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenA), 0)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenB), 0)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenC), 0)

		})
	})
})
