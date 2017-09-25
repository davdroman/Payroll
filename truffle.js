module.exports = {
	networks: {
		live: {
			network_id: 1 // Ethereum public network
		},
		ropsten: {
			host: 'localhost',
			port: 8545,
			network_id: 3
	    },
		development: {
			host: 'localhost',
			port: 8546,
			network_id: '*'
		},
		testing: {
			host: 'localhost',
			port: 8547,
			network_id: '*',
			gasPrice: 0x01
		}
	}
}
