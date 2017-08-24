const assertThrow = require('./helpers/assertThrow')
const PersonnelLibMock = artifacts.require('PersonnelLibMock')
// const ERC20Token = artifacts.require('ERC20Token')

contract('USDExchange', accounts => {
	let tokenA
	let tokenB
	let tokenC

	let personnel

	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
	// const ownerAddress = accounts[0]
	// const oracleAddressA = accounts[1]
	// const oracleAddressB = accounts[2]
	// const userAddress = accounts[3]

	before(async () => {
		// tokenA = await ERC20Token.new('Test Token A', 'TTA', 18)
		// tokenB = await ERC20Token.new('Test Token B', 'TTB', 7)
		// tokenC = await ERC20Token.new('Test Token C', 'TTC', 0)
	})

	beforeEach(async () => {
		personnel = await PersonnelLibMock.new()
	})

	context('initializing personnel', () => {
		it('sets nextEmployeeId to 1', async () => {
			const nextEmployeeId = await personnel.getPersonnelNextEmployeeId.call()
			assert.equal(nextEmployeeId, 1)
		})
	})
})
