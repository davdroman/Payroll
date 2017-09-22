module.exports = {
	networks: {
		live: {
			network_id: 1 // Ethereum public network
		},
		development: {
			host: 'localhost',
			port: 8545,
			network_id: '*'
		},
		testing: {
			host: 'localhost',
			port: 8555,
			network_id: '*',
			gasLimit:
			gasPrice: 0x01
		}
	}
};
