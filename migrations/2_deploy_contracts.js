const PayrollInterface = artifacts.require('./PayrollInterface.sol')

module.exports = function(deployer) {
	deployer.deploy(PayrollInterface)
}
