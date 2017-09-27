module.exports = (deployer, network) => {
	if (network == 'testing') return

	const USDExchange = artifacts.require('USDExchange.sol')
	const AddressUIntIndexedMappingLib = artifacts.require('AddressUIntIndexedMappingLib.sol')
	const Payroll = artifacts.require('Payroll.sol')

	const allocationFrequency = network == 'live' ? 0 : 60 // default for mainnet, 60 seconds for testnets
	const paydayFrequency = network == 'live' ? 0 : 60 // default for mainnet, 60 seconds for testnets

	deployer.deploy([
		USDExchange,
		AddressUIntIndexedMappingLib
	]).then(() => {
		deployer.link(AddressUIntIndexedMappingLib, Payroll)
		return deployer.deploy(Payroll, USDExchange.address, allocationFrequency, paydayFrequency)
	})
}
