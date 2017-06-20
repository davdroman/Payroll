const assertThrow = require('./helpers/assertThrow')
const Payroll = artifacts.require('Payroll')

contract('Payroll', accounts => {
	let payroll
	let sender

	beforeEach(async () => {
		payroll = await Payroll.new()
		sender = accounts[Math.random() * accounts.length>>0] // picks random sender address for each test case
	})
})
