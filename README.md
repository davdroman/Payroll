## Payroll

A modular, ERC20 token payroll smart contract.

### Structure

- `Payroll`: the main interface, where companies manage their employees and employees can determine their own token allocation and get paid when due.
- `EmployeeStorage`: separate storage contract holding all relevant employee information, owned and restricted in use to `Payroll`.
- `USDExchange`: smart contract determining the most recent prices for different tokens, from which `Payroll` draws information to calculate employee salaries.

### Possible improvements

Some minor things I left out for lack of time.

- [ ] Refactor index arrays + mappings into a common structure, since it's a common pattern in storage.
- [ ] Make `USDExchange` agnostic and have a base ERC20 token from which other tokens are converted instead.
- [ ] Add an ERC20 wrapper for Ether.
