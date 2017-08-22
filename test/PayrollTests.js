// const assertThrow = require('./helpers/assertThrow')
// const Payroll = artifacts.require('Payroll')
// const USDExchange = artifacts.require('USDExchange')
// const ERC20TokenMock = artifacts.require('ERC20TokenMock')
//
// contract('Payroll', accounts => {
// 	let tokenA
// 	let tokenB
// 	let tokenC
// 	let tokenD
//
// 	let exchange
// 	let payroll
//
// 	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
// 	const ownerAddress = accounts[0]
// 	const employeeAddress = accounts[1]
// 	const oracleAddress = accounts[2]
//
// 	before(async () => {
// 		tokenA = await ERC20TokenMock.new('Test Token A', 'TTA', 18)
// 		tokenB = await ERC20TokenMock.new('Test Token B', 'TTB', 7)
// 		tokenC = await ERC20TokenMock.new('Test Token C', 'TTC', 0)
// 		tokenD = await ERC20TokenMock.new('Test Token D', 'TTD', 4)
// 	})
//
// 	beforeEach(async () => {
// 		exchange = await USDExchange.new(oracleAddress)
// 		payroll = await Payroll.new(exchange.address)
// 	})
//
//
// })
