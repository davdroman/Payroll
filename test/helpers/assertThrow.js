const assertion = error => {
	const isError = error.message.search('invalid opcode') > -1 || error.message.search('invalid JUMP') > -1
	assert.isTrue(isError, 'Error expected');
}

module.exports = async promise => {
	try {
		await promise
	} catch(error) {
		return assertion(error)
	}
	throw new Error('Promise did not throw as expected')
}
