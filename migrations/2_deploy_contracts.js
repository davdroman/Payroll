const Ownable = artifacts.require('./Ownable.sol')
const Payroll = artifacts.require('./Payroll.sol')

module.exports = function(deployer) {
	deployer.deploy(Ownable)
	deployer.link(Ownable, Payroll)
	deployer.deploy(Payroll)
}
