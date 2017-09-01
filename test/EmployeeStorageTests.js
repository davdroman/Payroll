const assertThrow = require('./helpers/assertThrow')
const EmployeeStorage = artifacts.require('EmployeeStorage')

contract('EmployeeStorage', accounts => {
	let storage

	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
	const ownerAddress = accounts[0]
	const employeeAddress = accounts[1]

	// const setExchangeRates = async () => {
	// 	await exchange.setExchangeRate(tokenA.address, 2e18, { from: oracleAddress })
	// 	await exchange.setExchangeRate(tokenB.address, 2.5e18, { from: oracleAddress })
	// 	await exchange.setExchangeRate(tokenC.address, 6e18, { from: oracleAddress })
	// 	await exchange.setExchangeRate(tokenD.address, 4e18, { from: oracleAddress })
	// }
	//
	// const determineAllocation = async () => {
	// 	await personnel.determineAllocation(
	// 		[tokenA.address, tokenB.address, tokenC.address],
	// 		[5000, 3000, 2000],
	// 		{ from: employeeAddress }
	// 	)
	// }
	//
	// const addEmployee = async () => {
	// 	await personnel.addEmployee(employeeAddress, 24000e18)
	// }

	beforeEach(async () => {
		storage = await EmployeeStorage.new()
	})

	context('adding new employee', () => {
		it('throws when sender is not owner', async () => {
			try {
				await storage.add.call(employeeAddress, 1000, { from: employeeAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Employee was added by other than owner')
		})

		it('succeeds', async () => {
			await storage.add(employeeAddress, 1000)
			assert.equal(await storage.getCount.call(), 1)
			assert.equal(await storage.getAddress.call(1), employeeAddress)
			assert.equal(await storage.getYearlyUSDSalary.call(employeeAddress), 1000)
			// assert.equal(employeeCount, 1, 'employeeCount should be 1')
			// assert.equal(employee[0], employeeAddress, 'employeeAddress should match')
			// assert.equal(employee[1].length, 0, 'allocatedTokens should be empty')
			// assert.equal(employee[2].length, 0, 'peggedTokens should be empty')
			// assert.equal(employee[3], 0, 'latestTokenAllocation timestamp should be 0')
			// assert.equal(employee[4], 0, 'latestPayday timestamp should be 0')
			// assert.equal(employee[5], 24000e18, 'yearlyUSDSalary should be 1000')
		})
	})
})
