module.exports = (deployer, network) => {
	if (network == 'testing') { return }

	const USDExchange = artifacts.require('USDExchange.sol')
	const Payroll = artifacts.require('Payroll.sol')

	deployer.deploy([
		[USDExchange, web3.eth.coinbase],
		[Payroll, USDExchange.address]
	])
}
