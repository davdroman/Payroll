const Owned = artifacts.require('./Owned.sol')
const PayrollInterface = artifacts.require('./PayrollInterface.sol')
const Payroll = artifacts.require('./Payroll.sol')

module.exports = function(deployer) {
	deployer.deploy(Owned)
	deployer.deploy(PayrollInterface)
	deployer.link(Owned, Payroll)
	deployer.link(PayrollInterface, Payroll)
	deployer.deploy(Payroll)
}
