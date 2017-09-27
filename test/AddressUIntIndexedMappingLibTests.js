const AddressUIntIndexedMappingLib = artifacts.require('AddressUIntIndexedMappingLib')
const AddressUIntIndexedMappingMock = artifacts.require('AddressUIntIndexedMappingMock')

contract('AddressUIntIndexedMappingLib', accounts => {
	let mapping

	const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
	const addressA = '0x0000000000000000000000000000000000000001'
	const addressB = '0x0000000000000000000000000000000000000002'
	const addressC = '0x0000000000000000000000000000000000000003'

	beforeEach(async () => {
		const lib = await AddressUIntIndexedMappingLib.new()
		AddressUIntIndexedMappingMock.link('AddressUIntIndexedMappingLib', lib.address)
		mapping = await AddressUIntIndexedMappingMock.new()
	})

	context('setting', () => {
		it('succeeds', async () => {
			assert.equal(await mapping.mock_length.call(), 0)
			assert.equal(await mapping.mock_getAddress.call(0), EMPTY_ADDRESS)
			assert.equal(await mapping.mock_getUInt.call(addressA), 0)
			assert.equal(await mapping.mock_contains.call(addressA), false)
			await mapping.mock_set(addressA, 1)
			assert.equal(await mapping.mock_length.call(), 1)
			assert.equal(await mapping.mock_getAddress.call(0), addressA)
			assert.equal(await mapping.mock_getUInt.call(addressA), 1)
			assert.equal(await mapping.mock_contains.call(addressA), true)
			await mapping.mock_set(addressB, 4)
			assert.equal(await mapping.mock_length.call(), 2)
			assert.equal(await mapping.mock_getAddress.call(1), addressB)
			assert.equal(await mapping.mock_getUInt.call(addressB), 4)
			assert.equal(await mapping.mock_contains.call(addressB), true)
			await mapping.mock_set(addressA, 0)
			assert.equal(await mapping.mock_length.call(), 1)
			assert.equal(await mapping.mock_getAddress.call(0), addressB)
			assert.equal(await mapping.mock_getUInt.call(addressA), 0)
			assert.equal(await mapping.mock_contains.call(addressA), false)
		})
	})

	context('removing', () => {
		it('succeeds', async () => {
			await mapping.mock_remove(addressA)
			assert.equal(await mapping.mock_length.call(), 0)
			assert.equal(await mapping.mock_getAddress.call(0), EMPTY_ADDRESS)
			assert.equal(await mapping.mock_getUInt.call(addressA), 0)
			assert.equal(await mapping.mock_contains.call(addressA), false)
			await mapping.mock_set(addressA, 1)
			assert.equal(await mapping.mock_length.call(), 1)
			assert.equal(await mapping.mock_getAddress.call(0), addressA)
			assert.equal(await mapping.mock_getUInt.call(addressA), 1)
			assert.equal(await mapping.mock_contains.call(addressA), true)
			await mapping.mock_remove(addressA)
			assert.equal(await mapping.mock_length.call(), 0)
			assert.equal(await mapping.mock_getAddress.call(0), EMPTY_ADDRESS)
			assert.equal(await mapping.mock_getUInt.call(addressA), 0)
			assert.equal(await mapping.mock_contains.call(addressA), false)
		})
	})

	context('clearing', () => {
		it('succeeds', async () => {
			await mapping.mock_clear()
			assert.equal(await mapping.mock_length.call(), 0)
			assert.equal(await mapping.mock_getAddress.call(0), EMPTY_ADDRESS)
			assert.equal(await mapping.mock_getUInt.call(addressA), 0)
			assert.equal(await mapping.mock_contains.call(addressA), false)
			await mapping.mock_set(addressA, 1)
			assert.equal(await mapping.mock_length.call(), 1)
			assert.equal(await mapping.mock_getAddress.call(0), addressA)
			assert.equal(await mapping.mock_getUInt.call(addressA), 1)
			assert.equal(await mapping.mock_contains.call(addressA), true)
			await mapping.mock_set(addressB, 4)
			assert.equal(await mapping.mock_length.call(), 2)
			assert.equal(await mapping.mock_getAddress.call(1), addressB)
			assert.equal(await mapping.mock_getUInt.call(addressB), 4)
			assert.equal(await mapping.mock_contains.call(addressB), true)
			await mapping.mock_clear()
			assert.equal(await mapping.mock_length.call(), 0)
			assert.equal(await mapping.mock_getAddress.call(0), EMPTY_ADDRESS)
			assert.equal(await mapping.mock_getUInt.call(addressA), 0)
			assert.equal(await mapping.mock_contains.call(addressA), false)
		})
	})
})
