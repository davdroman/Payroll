## Payroll

A modular, ERC20 token payroll smart contract.

To keep things consistent it intentionally doesn't support ETH out of the box, just tokens. To get paid in ETH, any ERC20 wrapper for ETH will do the job (namely 0x's WETH), and hopefully no wrapper will be needed when ETH becomes an ERC20 token itself. [More info](https://weth.io).

### Structure

- `Payroll`: the main interface, where companies manage their employees and employees can determine their own token allocation and get paid when due.
- `EmployeeStorage`: separate storage contract holding all relevant employee information, owned and restricted in use to `Payroll`.
- `USDExchange`: smart contract determining the most recent prices for different tokens, from which `Payroll` draws information to calculate employee salaries.

### Possible improvements

Some minor things I left out for lack of time.

- [x] Let employees change their own account address. Let companies too in case the employee loses access to their wallet.
- [ ] Refactor index arrays + mappings into a library, since it's a common pattern in storage.
- [ ] Make `USDExchange` currency agnostic and formalize a `USD` ERC20 token (i.e. [Tether](https://tether.to)?) from which other tokens can be converted.
