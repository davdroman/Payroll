const assertThrow = require('./helpers/assertThrow')
const AddressUIntIndexedMappingLib = artifacts.require('AddressUIntIndexedMappingLib')
const EmployeeStorage = artifacts.require('EmployeeStorageMock')
const USDExchange = artifacts.require('USDExchange')
const Payroll = artifacts.require('Payroll')
const ERC20Token = artifacts.require('ERC20TokenMock')

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
		await payroll.addEmployee(employeeAddress, 24000e18, 0)
	}

	const determineAllocation = async () => {
		await payroll.determineAllocation(
			[tokenA.address, tokenB.address, tokenC.address, tokenD.address],
			[5000, 3000, 1000, 1000],
			{ from: employeeAddress }
		)
	}

	const fundPayroll = async (tokenDValue) => {
		await tokenA.transfer(payroll.address, 5000e18)
		await tokenB.transfer(payroll.address, 2400e7)
		await tokenC.transfer(payroll.address, 3300)
		await tokenD.transfer(payroll.address, tokenDValue != null ? tokenDValue : 300e4)
	}

	beforeEach(async () => {
		tokenA = await ERC20Token.new(10000e18, 'Test Token A', 18, 'TTA')
		tokenB = await ERC20Token.new(10000e7, 'Test Token B', 7, 'TTB')
		tokenC = await ERC20Token.new(10000, 'Test Token C', 0, 'TTC')
		tokenD = await ERC20Token.new(10000e4, 'Test Token D', 4, 'TTD')

		exchange = await USDExchange.new(oracleAddress)

		const indexedMappingLib = await AddressUIntIndexedMappingLib.new()
		Payroll.link('AddressUIntIndexedMappingLib', indexedMappingLib.address)
		payroll = await Payroll.new(exchange.address, 0, 0)

		// inject mocked employee storage
		EmployeeStorage.link('AddressUIntIndexedMappingLib', indexedMappingLib.address)
		employeeStorage = await EmployeeStorage.new()
		await employeeStorage.transferOwnership(payroll.address)
		await payroll.setEmployeeStorage(employeeStorage.address)
	})

	context('adding employee', () => {
		it('throws when sender is not owner', async () => {
			await assertThrow(payroll.addEmployee.call(employeeAddress, 1000, 0, { from: otherAddress }))
		})

		it('throws when address is invalid', async () => {
			await assertThrow(payroll.addEmployee.call(EMPTY_ADDRESS, 1234, 0))
		})

		it('throws when salary is zero', async () => {
			await assertThrow(payroll.addEmployee.call(employeeAddress, 0, 0))
		})

		it('succeeds', async () => {
			await addEmployee()
			assert.equal(await employeeStorage.getAddress.call(1), employeeAddress)
			assert.equal(await employeeStorage.getYearlyUSDSalary.call(employeeAddress), 24000e18)
		})
	})

	context('setting employee address', () => {
		it('throws when sender is not owner', async () => {
			await addEmployee()
			await assertThrow(payroll.setEmployeeAddress.call(1, otherAddress, { from: employeeAddress }))
		})

		it('throws when address is invalid', async () => {
			await addEmployee()
			await assertThrow(payroll.setEmployeeAddress.call(1, EMPTY_ADDRESS))
		})

		it('succeeds', async () => {
			await addEmployee()
			await payroll.setEmployeeAddress(1, otherAddress)

			assert.equal(await employeeStorage.getAddress.call(1), otherAddress)
			assert.equal(await employeeStorage.getId.call(otherAddress), 1)
			await assertThrow(employeeStorage.getId.call(employeeAddress))
		})
	})

	context('setting employee salary', () => {
		it('throws when sender is not owner', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()
			await assertThrow(payroll.setEmployeeSalary.call(1, 5678, { from: otherAddress }))
		})

		it('throws when salary is zero', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()
			await assertThrow(payroll.setEmployeeSalary.call(1, 0))
		})

		it('succeeds', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			await payroll.setEmployeeSalary(1, 30000e18)
			assert.equal(await employeeStorage.getYearlyUSDSalary.call(employeeAddress), 30000e18)

			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenA.address), 625e18)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenB.address), 300e7)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenC.address), 41)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenD.address), 62.5e4)
		})
	})

	context('removing an employee', () => {
		it('throws when employee does not exist', async () => {
			await addEmployee()
			await assertThrow(payroll.removeEmployee(2))
		})

		it('throws when sender is not the owner', async () => {
			await addEmployee()
			await assertThrow(payroll.removeEmployee.call(1, { from: otherAddress }))
		})

		it('succeeds', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			await payroll.removeEmployee(1)

			assert.equal(await employeeStorage.getCount.call(), 0)
			await employeeStorage.mock_throwIfNotRemoved.call(employeeAddress)
		})

		it('succeeds readding', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			await payroll.removeEmployee(1)
			await addEmployee()

			assert.equal(await employeeStorage.getAddress.call(2), employeeAddress)
			assert.equal(await employeeStorage.getYearlyUSDSalary.call(employeeAddress), 24000e18)
		})
	})

	context('calculating payroll burnrate', () => {
		it('throws when sender is not the owner', async () => {
			await assertThrow(payroll.calculatePayrollBurnrate.call({ from: otherAddress }))
		})

		it('succeeds', async () => {
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 0)
			await addEmployee()
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 2000e18)
			await payroll.setEmployeeSalary(1, 30000e18)
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 2500e18)
			await payroll.addEmployee(otherAddress, 24000e18, 0)
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 4500e18)
			await payroll.removeEmployee(1)
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 2000e18)
			await payroll.removeEmployee(2)
			assert.equal(await payroll.calculatePayrollBurnrate.call(), 0)
		})
	})

	context('calculating payroll runway', () => {
		it('throws when sender is not the owner', async () => {
			await assertThrow(payroll.calculatePayrollRunway.call({ from: otherAddress }))
		})

		it('succeeds', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			// Token salaries:
			// A 500e18
			// B 240e7
			// C 33
			// D 50e4

			await tokenA.transfer(payroll.address, 499e18)
			await tokenB.transfer(payroll.address, 239e7)
			await tokenC.transfer(payroll.address, 32)
			await tokenD.transfer(payroll.address, 49e4)
			assert.equal(await payroll.calculatePayrollRunway.call(), 0)

			await tokenA.transfer(payroll.address, 1e18)
			await tokenB.transfer(payroll.address, 1e7)
			await tokenC.transfer(payroll.address, 1)
			await tokenD.transfer(payroll.address, 1e4)
			assert.equal(await payroll.calculatePayrollRunway.call(), 30)

			await tokenA.transfer(payroll.address, 5000e18)
			await tokenB.transfer(payroll.address, 2400e7)
			await tokenC.transfer(payroll.address, 3300)
			assert.equal(await payroll.calculatePayrollRunway.call(), 30)

			await tokenD.transfer(payroll.address, 50e4)
			assert.equal(await payroll.calculatePayrollRunway.call(), 60)
		})
	})

	context('escape hatch', () => {
		it('throws when sender is not the owner', async () => {
			await assertThrow(payroll.escapeHatch.call(true, { from: otherAddress }))
		})

		it('succeeds with healthy tokens, non-forced', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			assert.equal(await tokenA.balanceOf.call(ownerAddress), 10000e18)
			assert.equal(await tokenB.balanceOf.call(ownerAddress), 10000e7)
			assert.equal(await tokenC.balanceOf.call(ownerAddress), 10000)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 10000e4)

			await web3.eth.sendTransaction({ from: ownerAddress, to: payroll.address, value: 5e18 })
			await tokenA.transfer(payroll.address, 5000e18)
			await tokenB.transfer(payroll.address, 2400e7)
			await tokenC.transfer(payroll.address, 3300)
			await tokenD.transfer(payroll.address, 50e4)

			assert.equal(await web3.eth.getBalance(payroll.address), 5e18)
			assert.equal(await tokenA.balanceOf.call(payroll.address), 5000e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2400e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3300)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 50e4)

			await payroll.escapeHatch(false)

			assert.equal(await web3.eth.getBalance(payroll.address), 0)
			assert.equal(await tokenA.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 0)

			assert.equal(await tokenA.balanceOf.call(ownerAddress), 10000e18)
			assert.equal(await tokenB.balanceOf.call(ownerAddress), 10000e7)
			assert.equal(await tokenC.balanceOf.call(ownerAddress), 10000)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 10000e4)
		})

		it('succeeds with healthy tokens, forced', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			assert.equal(await tokenA.balanceOf.call(ownerAddress), 10000e18)
			assert.equal(await tokenB.balanceOf.call(ownerAddress), 10000e7)
			assert.equal(await tokenC.balanceOf.call(ownerAddress), 10000)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 10000e4)

			await web3.eth.sendTransaction({ from: ownerAddress, to: payroll.address, value: 5e18 })
			await tokenA.transfer(payroll.address, 5000e18)
			await tokenB.transfer(payroll.address, 2400e7)
			await tokenC.transfer(payroll.address, 3300)
			await tokenD.transfer(payroll.address, 50e4)

			assert.equal(await web3.eth.getBalance(payroll.address), 5e18)
			assert.equal(await tokenA.balanceOf.call(payroll.address), 5000e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2400e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3300)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 50e4)

			await payroll.escapeHatch(true)

			assert.equal(await web3.eth.getBalance(payroll.address), 0)
			assert.equal(await tokenA.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 0)

			assert.equal(await tokenA.balanceOf.call(ownerAddress), 10000e18)
			assert.equal(await tokenB.balanceOf.call(ownerAddress), 10000e7)
			assert.equal(await tokenC.balanceOf.call(ownerAddress), 10000)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 10000e4)
		})

		it('succeeds with faulty tokens, non-forced', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			assert.equal(await tokenA.balanceOf.call(ownerAddress), 10000e18)
			assert.equal(await tokenB.balanceOf.call(ownerAddress), 10000e7)
			assert.equal(await tokenC.balanceOf.call(ownerAddress), 10000)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 10000e4)

			await web3.eth.sendTransaction({ from: ownerAddress, to: payroll.address, value: 5e18 })
			await tokenA.transfer(payroll.address, 5000e18)
			await tokenB.transfer(payroll.address, 2400e7)
			await tokenC.transfer(payroll.address, 3300)
			await tokenD.transfer(payroll.address, 50e4)

			assert.equal(await web3.eth.getBalance(payroll.address), 5e18)
			assert.equal(await tokenA.balanceOf.call(payroll.address), 5000e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2400e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3300)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 50e4)

			await tokenD.mock_setShouldSucceedTransfers(false)
			await payroll.escapeHatch(false)

			assert.equal(await tokenA.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 50e4)

			assert.equal(await tokenA.balanceOf.call(ownerAddress), 10000e18)
			assert.equal(await tokenB.balanceOf.call(ownerAddress), 10000e7)
			assert.equal(await tokenC.balanceOf.call(ownerAddress), 10000)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 9950e4)

			await tokenD.mock_setShouldSucceedTransfers(true)
			await payroll.escapeHatch(false)

			assert.equal(await web3.eth.getBalance(payroll.address), 0)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 10000e4)
		})

		it('succeeds with faulty tokens, forced', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			assert.equal(await tokenA.balanceOf.call(ownerAddress), 10000e18)
			assert.equal(await tokenB.balanceOf.call(ownerAddress), 10000e7)
			assert.equal(await tokenC.balanceOf.call(ownerAddress), 10000)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 10000e4)

			await web3.eth.sendTransaction({ from: ownerAddress, to: payroll.address, value: 5e18 })
			await tokenA.transfer(payroll.address, 5000e18)
			await tokenB.transfer(payroll.address, 2400e7)
			await tokenC.transfer(payroll.address, 3300)
			await tokenD.transfer(payroll.address, 50e4)

			assert.equal(await web3.eth.getBalance(payroll.address), 5e18)
			assert.equal(await tokenA.balanceOf.call(payroll.address), 5000e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2400e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3300)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 50e4)

			await tokenD.mock_setShouldSucceedTransfers(false)
			await payroll.escapeHatch(true)

			assert.equal(await web3.eth.getBalance(payroll.address), 0)
			assert.equal(await tokenA.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 0)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 50e4)

			assert.equal(await tokenA.balanceOf.call(ownerAddress), 10000e18)
			assert.equal(await tokenB.balanceOf.call(ownerAddress), 10000e7)
			assert.equal(await tokenC.balanceOf.call(ownerAddress), 10000)
			assert.equal(await tokenD.balanceOf.call(ownerAddress), 9950e4)
		})
	})

	context('changing address', () => {
		it('throws when sender is not employee', async () => {
			await addEmployee()
			await assertThrow(payroll.changeAddress(otherAddress, { from: otherAddress }))
		})

		it('throws when address is invalid', async () => {
			await addEmployee()
			await assertThrow(payroll.changeAddress.call(EMPTY_ADDRESS, { from: employeeAddress }))
		})

		it('succeeds', async () => {
			await addEmployee()
			await payroll.changeAddress(otherAddress, { from: employeeAddress })

			assert.equal(await employeeStorage.getAddress.call(1), otherAddress)
			assert.equal(await employeeStorage.getId.call(otherAddress), 1)
			await assertThrow(employeeStorage.getId.call(employeeAddress))
		})
	})

	context('determining allocation', () => {
		it('throws when address is invalid', async () => {
			await setExchangeRates()
			await addEmployee()
			await assertThrow(payroll.determineAllocation(
				[tokenA.address, tokenB.address, tokenC.address, tokenD.address],
				[5000, 3000, 1000, 1000],
				{ from: otherAddress }
			))
		})

		it('throws when array lengths do not match', async () => {
			await setExchangeRates()
			await addEmployee()
			await assertThrow(payroll.determineAllocation.call(
				[tokenA.address, tokenB.address, tokenC.address, tokenD.address],
				[5000, 3000, 2000],
				{ from: employeeAddress }
			))
		})

		it('throws when distribution is not 100%', async () => {
			await setExchangeRates()
			await addEmployee()
			await assertThrow(payroll.determineAllocation.call(
				[tokenA.address, tokenB.address, tokenC.address, tokenD.address],
				[5000, 3000, 1000, 500],
				{ from: employeeAddress }
			))
		})

		it('succeeds', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()

			assert.equal(await employeeStorage.getAllocatedTokenCount.call(employeeAddress), 4)
			assert.equal(await employeeStorage.getAllocatedTokenAddress.call(employeeAddress, 0), tokenA.address)
			assert.equal(await employeeStorage.getAllocatedTokenAddress.call(employeeAddress, 1), tokenB.address)
			assert.equal(await employeeStorage.getAllocatedTokenAddress.call(employeeAddress, 2), tokenC.address)
			assert.equal(await employeeStorage.getAllocatedTokenAddress.call(employeeAddress, 3), tokenD.address)
			assert.equal(await employeeStorage.getAllocatedTokenValue.call(employeeAddress, tokenA.address), 5000)
			assert.equal(await employeeStorage.getAllocatedTokenValue.call(employeeAddress, tokenB.address), 3000)
			assert.equal(await employeeStorage.getAllocatedTokenValue.call(employeeAddress, tokenC.address), 1000)
			assert.equal(await employeeStorage.getAllocatedTokenValue.call(employeeAddress, tokenD.address), 1000)

			assert.equal(await employeeStorage.getPeggedTokenCount.call(employeeAddress), 4)
			assert.equal(await employeeStorage.getPeggedTokenAddress.call(employeeAddress, 0), tokenA.address)
			assert.equal(await employeeStorage.getPeggedTokenAddress.call(employeeAddress, 1), tokenB.address)
			assert.equal(await employeeStorage.getPeggedTokenAddress.call(employeeAddress, 2), tokenC.address)
			assert.equal(await employeeStorage.getPeggedTokenAddress.call(employeeAddress, 3), tokenD.address)
			assert.equal(await employeeStorage.getPeggedTokenValue.call(employeeAddress, tokenA.address), 2e18)
			assert.equal(await employeeStorage.getPeggedTokenValue.call(employeeAddress, tokenB.address), 2.5e18)
			assert.equal(await employeeStorage.getPeggedTokenValue.call(employeeAddress, tokenC.address), 6e18)
			assert.equal(await employeeStorage.getPeggedTokenValue.call(employeeAddress, tokenD.address), 4e18)

			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenA.address), 500e18)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenB.address), 240e7)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenC.address), 33)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenD.address), 50e4)
		})

		it('throws when reallocation is not due', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()
			await assertThrow(determineAllocation())
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

			assert.equal(await employeeStorage.getAllocatedTokenCount.call(employeeAddress), 3)
			assert.equal(await employeeStorage.getAllocatedTokenAddress.call(employeeAddress, 0), tokenA.address)
			assert.equal(await employeeStorage.getAllocatedTokenAddress.call(employeeAddress, 1), tokenC.address)
			assert.equal(await employeeStorage.getAllocatedTokenAddress.call(employeeAddress, 2), tokenD.address)
			assert.equal(await employeeStorage.getAllocatedTokenValue.call(employeeAddress, tokenA.address), 3000)
			assert.equal(await employeeStorage.getAllocatedTokenValue.call(employeeAddress, tokenC.address), 5000)
			assert.equal(await employeeStorage.getAllocatedTokenValue.call(employeeAddress, tokenD.address), 2000)

			assert.equal(await employeeStorage.getPeggedTokenCount.call(employeeAddress), 4)
			assert.equal(await employeeStorage.getPeggedTokenAddress.call(employeeAddress, 0), tokenA.address)
			assert.equal(await employeeStorage.getPeggedTokenAddress.call(employeeAddress, 1), tokenB.address)
			assert.equal(await employeeStorage.getPeggedTokenAddress.call(employeeAddress, 2), tokenC.address)
			assert.equal(await employeeStorage.getPeggedTokenAddress.call(employeeAddress, 3), tokenD.address)
			assert.equal(await employeeStorage.getPeggedTokenValue.call(employeeAddress, tokenA.address), 2e18)
			assert.equal(await employeeStorage.getPeggedTokenValue.call(employeeAddress, tokenB.address), 2.5e18)
			assert.equal(await employeeStorage.getPeggedTokenValue.call(employeeAddress, tokenC.address), 6e18)
			assert.equal(await employeeStorage.getPeggedTokenValue.call(employeeAddress, tokenD.address), 4e18)

			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenA.address), 300e18)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenB.address), 0)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenC.address), 166)
			assert.equal(await employeeStorage.getSalaryTokenValue.call(employeeAddress, tokenD.address), 100e4)
		})
	})

	context('payday', () => {
		it('throws when employee does not exist', async () => {
			await assertThrow(payroll.payday({ from: employeeAddress }))
		})

		it('throws when employee is a newcomer', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()
			await employeeStorage.mock_resetLatestPayday(employeeAddress)
			await assertThrow(payroll.payday({ from: employeeAddress }))
		})

		it('succeeds', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()
			await fundPayroll()

			assert.equal(await tokenA.balanceOf.call(payroll.address), 5000e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2400e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3300)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 300e4)

			assert.equal(await tokenA.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenB.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenC.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenD.balanceOf.call(employeeAddress), 0)

			await payroll.payday({ from: employeeAddress })

			// Token salaries:
			// A 500e18
			// B 240e7
			// C 33
			// D 50e4

			assert.equal(await tokenA.balanceOf.call(payroll.address), 4500e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2160e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3267)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 250e4)

			assert.equal(await tokenA.balanceOf.call(employeeAddress), 500e18)
			assert.equal(await tokenB.balanceOf.call(employeeAddress), 240e7)
			assert.equal(await tokenC.balanceOf.call(employeeAddress), 33)
			assert.equal(await tokenD.balanceOf.call(employeeAddress), 50e4)
		})

		it('succeeds when token funds are not sufficient, succeeds re-payment', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()
			await fundPayroll(30e4)

			assert.equal(await tokenA.balanceOf.call(payroll.address), 5000e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2400e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3300)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 30e4)

			assert.equal(await tokenA.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenB.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenC.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenD.balanceOf.call(employeeAddress), 0)

			await payroll.payday({ from: employeeAddress })

			// Token salaries:
			// A 500e18
			// B 240e7
			// C 33
			// D 50e4

			assert.equal(await tokenA.balanceOf.call(payroll.address), 4500e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2160e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3267)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 30e4)

			assert.equal(await tokenA.balanceOf.call(employeeAddress), 500e18)
			assert.equal(await tokenB.balanceOf.call(employeeAddress), 240e7)
			assert.equal(await tokenC.balanceOf.call(employeeAddress), 33)
			assert.equal(await tokenD.balanceOf.call(employeeAddress), 0)

			await tokenD.transfer(payroll.address, 20e4)
			await payroll.payday({ from: employeeAddress })

			assert.equal(await tokenA.balanceOf.call(payroll.address), 4500e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2160e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3267)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 0)

			assert.equal(await tokenA.balanceOf.call(employeeAddress), 500e18)
			assert.equal(await tokenB.balanceOf.call(employeeAddress), 240e7)
			assert.equal(await tokenC.balanceOf.call(employeeAddress), 33)
			assert.equal(await tokenD.balanceOf.call(employeeAddress), 50e4)

			await assertThrow(payroll.payday({ from: employeeAddress }))
		})

		it('succeeds when token is faulty, succeeds re-payment', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()
			await fundPayroll()

			assert.equal(await tokenA.balanceOf.call(payroll.address), 5000e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2400e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3300)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 300e4)

			assert.equal(await tokenA.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenB.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenC.balanceOf.call(employeeAddress), 0)
			assert.equal(await tokenD.balanceOf.call(employeeAddress), 0)

			await tokenD.mock_setShouldSucceedTransfers(false)
			await payroll.payday({ from: employeeAddress })

			// Token salaries:
			// A 500e18
			// B 240e7
			// C 33
			// D 50e4

			assert.equal(await tokenA.balanceOf.call(payroll.address), 4500e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2160e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3267)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 300e4)

			assert.equal(await tokenA.balanceOf.call(employeeAddress), 500e18)
			assert.equal(await tokenB.balanceOf.call(employeeAddress), 240e7)
			assert.equal(await tokenC.balanceOf.call(employeeAddress), 33)
			assert.equal(await tokenD.balanceOf.call(employeeAddress), 0)

			await tokenD.mock_setShouldSucceedTransfers(true)
			await payroll.payday({ from: employeeAddress })

			assert.equal(await tokenA.balanceOf.call(payroll.address), 4500e18)
			assert.equal(await tokenB.balanceOf.call(payroll.address), 2160e7)
			assert.equal(await tokenC.balanceOf.call(payroll.address), 3267)
			assert.equal(await tokenD.balanceOf.call(payroll.address), 250e4)

			assert.equal(await tokenA.balanceOf.call(employeeAddress), 500e18)
			assert.equal(await tokenB.balanceOf.call(employeeAddress), 240e7)
			assert.equal(await tokenC.balanceOf.call(employeeAddress), 33)
			assert.equal(await tokenD.balanceOf.call(employeeAddress), 50e4)

			await assertThrow(payroll.payday({ from: employeeAddress }))
		})

		it('throws after successful payday', async () => {
			await setExchangeRates()
			await addEmployee()
			await determineAllocation()
			await fundPayroll()
			await payroll.payday({ from: employeeAddress })
			await employeeStorage.mock_resetLatestPayday(employeeAddress)
			await assertThrow(payroll.payday({ from: employeeAddress }))
		})
	})
})
