const assertThrow = require('./helpers/assertThrow')
const PersonnelMock = artifacts.require('PersonnelMock')
const USDExchange = artifacts.require('USDExchange')
const ERC20Token = artifacts.require('ERC20Token')

contract('Payroll', accounts => {
	let tokenA
	let tokenB
	let tokenC
	let tokenD
	let exchange
	let personnel

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

	const determineAllocation = async () => {
		await personnel.determineAllocation(
			[tokenA.address, tokenB.address, tokenC.address],
			[5000, 3000, 2000],
			{ from: employeeAddress }
		)
	}

	const addEmployee = async () => {
		await personnel.addEmployee(employeeAddress, 24000e18)
	}

	beforeEach(async () => {
		tokenA = await ERC20Token.new('Test Token A', 'TTA', 18)
		tokenB = await ERC20Token.new('Test Token B', 'TTB', 7)
		tokenC = await ERC20Token.new('Test Token C', 'TTC', 0)
		tokenD = await ERC20Token.new('Test Token D', 'TTD', 4)
		exchange = await USDExchange.new(oracleAddress)
		personnel = await PersonnelMock.new(exchange.address)
	})


})
