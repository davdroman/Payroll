module.exports = (deployer, network) => {
	if (network == 'testing') { return }

	const ERC20TokenFactory = artifacts.require('ERC20TokenFactory.sol')

	// if deploying to a test network, deploy test tokens too
	if (network != 'live') {
		deployer.deploy(ERC20TokenFactory).then(() => {
			return ERC20TokenFactory.at(ERC20TokenFactory.address).create(10000e18, 'Test Token A', 18, 'TTA')
		}).then((result) => {
			console.log('Test Token A' + ': ' + result.logs[0].args._address)
			return ERC20TokenFactory.at(ERC20TokenFactory.address).create(10000e5, 'Test Token B', 5, 'TTB')
		}).then((result) => {
			console.log('Test Token B' + ': ' + result.logs[0].args._address)
			return ERC20TokenFactory.at(ERC20TokenFactory.address).create(10000, 'Test Token C', 0, 'TTC')
		}).then((result) => {
			console.log('Test Token C' + ': ' + result.logs[0].args._address)
		})
	}
}
