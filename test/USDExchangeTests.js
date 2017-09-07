const assertThrow = require('./helpers/assertThrow')
const USDExchange = artifacts.require('USDExchange')
const ERC20Token = artifacts.require('ERC20Token')

contract('USDExchange', accounts => {
	let tokenA
	let tokenB
	let tokenC
	let exchange

	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
	const ownerAddress = accounts[0]
	const oracleAddressA = accounts[1]
	const oracleAddressB = accounts[2]
	const userAddress = accounts[3]

	beforeEach(async () => {
		tokenA = await ERC20Token.new(10000e18, 'Test Token A', 18, 'TTA')
		tokenB = await ERC20Token.new(10000e7, 'Test Token B', 7, 'TTB')
		tokenC = await ERC20Token.new(10000, 'Test Token C', 0, 'TTC')
		exchange = await USDExchange.new(oracleAddressA)
	})

	context('setting token exchange rate', () => {
		it('throws when caller is not the oracle', async () => {
			try {
				await exchange.setExchangeRate.call(tokenA.address, 2e18, { from: userAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Exchange rate was set by other than the oracle')
		})

		it('throws when address is invalid', async () => {
			try {
				await exchange.setExchangeRate.call(EMPTY_ADDRESS, 2e18, { from: oracleAddressA })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Exchange rate was set for invalid address')
		})

		it('throws when exchange rate is zero', async () => {
			try {
				await exchange.setExchangeRate.call(tokenA.address, 0, { from: oracleAddressA })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Exchange rate was set with a value of zero')
		})

		it('succeeds', async () => {
			await exchange.setExchangeRate(tokenA.address, 2e18, { from: oracleAddressA })
			const availableTokens = await exchange.getAvailableTokens.call()
			const exchangeRates = await exchange.exchangeRates.call(tokenA.address)
			assert.deepEqual(availableTokens, [tokenA.address], 'Token was not made available')
			assert.equal(exchangeRates, 2e18, 'Exchange rate was not set')
		})
	})

	context('setting exchange rate oracle', () => {
		it('throws when caller is not the owner', async () => {
			try {
				await exchange.setExchangeRateOracle.call(oracleAddressA, { from: oracleAddressA })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Exchange rate oracle was set by other than the owner')
		})

		it('throws when address is invalid', async () => {
			try {
				await exchange.setExchangeRateOracle.call(EMPTY_ADDRESS, { from: ownerAddress })
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Exchange rate oracle was set with invalid address')
		})

		it('succeeds', async () => {
			await exchange.setExchangeRateOracle(oracleAddressB, { from: ownerAddress })
			const exchangeRateOracle = await exchange.exchangeRateOracle.call()
			assert.equal(exchangeRateOracle, oracleAddressB, 'Exchange rate oracle did not change')
		})
	})

	context('pegging with external rate', () => {
		it('returns 0 when amount is 0 regardless of other parameters', async () => {
			const value = await exchange.exchange.call(EMPTY_ADDRESS, 0, 0)
			assert.equal(value, 0, 'Pegged value should be 0 for amount 0')
		})

		it('throws when address is invalid', async () => {
			try {
				await exchange.exchange.call(EMPTY_ADDRESS, 20e18, 2e18)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Token address is invalid')
		})

		it('throws when exchange rate is 0', async () => {
			try {
				await exchange.exchange.call(tokenA.address, 20e18, 0)
			} catch (error) {
				return assertThrow(error)
			}
			throw new Error('Exchange rate was set for invalid address')
		})

		it('succeeds to peg token with 18 decimals', async () => {
			const value = await exchange.exchange.call(tokenA.address, 156.7701e18, 5.22567e18)
			assert.equal(value, 30e18, 'Pegged value did not match')
		})

		it('succeeds to peg token with 7 decimals', async () => {
			const value = await exchange.exchange.call(tokenB.address, 20.50e18, 2e18)
			assert.equal(value, 10.25e7, 'Pegged value did not match')
		})

		it('succeeds to peg token with 0 decimals', async () => {
			const value = await exchange.exchange.call(tokenC.address, 20.50e18, 2e18)
			assert.equal(value, 10, 'Pegged value did not match')
		})
	})
})
