const Owned = artifacts.require('./Owned.sol')
const Payroll = artifacts.require('./Payroll.sol')

module.exports = function(deployer) {
	deployer.deploy(Owned)
	deployer.link(Owned, Payroll)
	deployer.deploy(Payroll)
}
