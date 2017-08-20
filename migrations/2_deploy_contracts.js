const Ownable = artifacts.require('Ownable.sol')
// const Payroll = artifacts.require('Payroll.sol')
const EmployeesController = artifacts.require('EmployeesController.sol')

module.exports = function(deployer) {
	deployer.deploy(Ownable)
	// deployer.link(Ownable, Payroll)
	deployer.link(Ownable, EmployeesController)
	// deployer.deploy(Payroll)
	deployer.deploy(EmployeesController)
}
