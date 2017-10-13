const assertThrow = require('./helpers/assertThrow')
const AddressUIntIndexedMappingLib = artifacts.require('AddressUIntIndexedMappingLib')
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
		const indexedMappingLib = await AddressUIntIndexedMappingLib.new()
		EmployeeStorage.link('AddressUIntIndexedMappingLib', indexedMappingLib.address)
		storage = await EmployeeStorage.new()
	})

	context('adding employee', () => {
		it('throws when sender is not owner', async () => {
			await assertThrow(storage.add.call(employeeAddress, 1000, 0, { from: employeeAddress }))
		})

		it('throws when employee already exists', async () => {
			await storage.add(employeeAddress, 1000, 0)
			await assertThrow(storage.add.call(employeeAddress, 1000, 0))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 5)
			assert.equal(await storage.getCount.call(), 1)
			assert.equal(await storage.getId.call(employeeAddress), 1)
			assert.equal(await storage.getAddress.call(1), employeeAddress)
			assert.equal(await storage.getLatestTokenAllocation.call(employeeAddress), 0)
			assert.equal(await storage.getLatestPayday.call(employeeAddress), 5)
			assert.equal(await storage.getYearlyUSDSalary.call(employeeAddress), 1234)
		})
	})

	context('setting address', () => {
		it('throws when sender is not owner', async () => {
			await storage.add(employeeAddress, 1000, 0)
			await assertThrow(storage.setAddress.call(employeeAddress, employeeAddressB, { from: employeeAddress }))
		})

		it('throws when new address belongs to existing employee', async () => {
			await storage.add(employeeAddress, 1000, 0)
			await storage.add(employeeAddressB, 1500, 0)
			await assertThrow(storage.setAddress.call(employeeAddress, employeeAddressB))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
			await storage.setAddress(employeeAddress, employeeAddressB)
			assert.equal(await storage.getAddress.call(1), employeeAddressB)
			assert.equal(await storage.getId.call(employeeAddressB), 1)
			await assertThrow(storage.getId.call(employeeAddress))
		})
	})

	context('setting allocation', () => {
		it('throws when sender is not owner', async () => {
			await assertThrow(storage.setAllocatedToken.call(employeeAddress, tokenA, 1000, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
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
			await assertThrow(storage.setPeggedToken.call(employeeAddress, tokenA, 1000, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
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
			await assertThrow(storage.setSalaryToken.call(employeeAddress, tokenA, 1000, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
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
			await assertThrow(storage.clearAllocatedAndSalaryTokens.call(employeeAddress, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
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
			await assertThrow(storage.setLatestTokenAllocation.call(employeeAddress, 100, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
			await storage.setLatestTokenAllocation(employeeAddress, 100)
			assert.equal(await storage.getLatestTokenAllocation.call(employeeAddress), 100)
		})
	})

	context('setting latest payday date', () => {
		it('throws when sender is not owner', async () => {
			await assertThrow(storage.setLatestPayday.call(employeeAddress, 100, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
			await storage.setLatestPayday(employeeAddress, 100)
			assert.equal(await storage.getLatestPayday.call(employeeAddress), 100)
		})
	})

	context('setting latest token payday date', () => {
		it('throws when sender is not owner', async () => {
			await assertThrow(storage.setLatestTokenPayday.call(employeeAddress, tokenA, 100, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
			await storage.setLatestTokenPayday(employeeAddress, tokenA, 100)
			assert.equal(await storage.getLatestTokenPayday.call(employeeAddress, tokenA), 100)
		})
	})

	context('setting yearly USD salary', () => {
		it('throws when sender is not owner', async () => {
			await assertThrow(storage.setYearlyUSDSalary.call(employeeAddress, 100, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
			await storage.setYearlyUSDSalary(employeeAddress, 100)
			assert.equal(await storage.getYearlyUSDSalary.call(employeeAddress), 100)
		})
	})

	context('removing employee', () => {
		it('throws when sender is not owner', async () => {
			await assertThrow(storage.remove.call(employeeAddress, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1234, 0)
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
			await storage.mock_throwIfNotRemoved.call(employeeAddress)
		})
	})

	context('counting total yearly USD salaries', () => {
		it('increases upon new employee', async () => {
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
			await storage.add(employeeAddress, 24000e18, 0)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 24000e18)
			await storage.add(employeeAddressB, 2000e18, 0)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 26000e18)
		})

		it('increases upon salary raise', async () => {
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
			await storage.add(employeeAddress, 24000e18, 0)
			await storage.setYearlyUSDSalary(employeeAddress, 50000e18)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 50000e18)
		})

		it('decreases upon salary cut', async () => {
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
			await storage.add(employeeAddress, 24000e18, 0)
			await storage.setYearlyUSDSalary(employeeAddress, 10000e18)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 10000e18)
		})

		it('decreases upon employee removal', async () => {
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
			await storage.add(employeeAddress, 24000e18, 0)
			await storage.remove(employeeAddress)
			assert.equal(await storage.getYearlyUSDSalariesTotal.call(), 0)
		})
	})

	context('counting total monthly salary tokens', () => {
		it('changes after setting salary', async () => {
			await storage.add(employeeAddress, 1234, 0)
			await storage.setSalaryToken(employeeAddress, tokenA, 2000)
			await storage.setSalaryToken(employeeAddress, tokenB, 3500)
			await storage.setSalaryToken(employeeAddress, tokenC, 5400)
			assert.equal(await storage.getSalaryTokensTotalCount.call(), 3)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenA), 2000)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenB), 3500)
			assert.equal(await storage.getSalaryTokensTotalValue.call(tokenC), 5400)

			await storage.add(employeeAddressB, 1234, 0)
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
			await storage.add(employeeAddress, 1234, 0)
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
