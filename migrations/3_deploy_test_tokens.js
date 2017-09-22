module.exports = (deployer, network) => {
	if (network == 'testing') { return }
	if (network == 'live') { return }

	const ERC20TokenFactory = artifacts.require('ERC20TokenFactory.sol')

	const tokens = [
		[10000e18, 'Test Token A', 18, 'TTA'],
		[10000e5, 'Test Token B', 5, 'TTB'],
		[10000, 'Test Token C', 0, 'TTC']
	]

	deployer.deploy(ERC20TokenFactory).then(() => {
		return tokens
			.map((args) => ERC20TokenFactory.at(ERC20TokenFactory.address).create.apply(this, args))
			.map((val) => val.then((result) => console.log(result.logs[0].args._name + ': ' + result.logs[0].args._address)))
			.reduce((sum, val) => sum.then(val))
	})
}
