module.exports = (deployer, network) => {
	if (network == 'testing') { return }

	const liveNetworks = [
		'kovan',
		'ropsten'
	]

	const ERC20TokenFactory = artifacts.require('ERC20TokenFactory.sol')
	const USDExchange = artifacts.require('USDExchange.sol')
	const Payroll = artifacts.require('Payroll.sol')

	const isLive = liveNetworks.indexOf(network) > -1

	// if deploying to test network, deploy test tokens too
	if (!isLive) {
		deployer.deploy(ERC20TokenFactory).then(() => {
			return ERC20TokenFactory.at(ERC20TokenFactory.address).create(10000e18, 'Test Token A', 18, 'TTA')
		}).then(() => {
			return ERC20TokenFactory.at(ERC20TokenFactory.address).create(10000e5, 'Test Token B', 5, 'TTB')
		}).then(() => {
			return ERC20TokenFactory.at(ERC20TokenFactory.address).create(10000, 'Test Token C', 0, 'TTC')
		})
	}

	deployer.deploy(USDExchange, web3.eth.coinbase).then((exchange) => {
		return deployer.deploy(Payroll, USDExchange.address)
	})
}
