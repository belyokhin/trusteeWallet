/**
 * @version 0.5
 * @param {string} addresses[]
 * @param {string} transaction.hex
 * @param {string} transaction.address
 * @param {string} transaction.vin[].txid aa31777a9db759f57fd243ef47419939f233d16bc3e535e9a1c5af3ace87cb54
 * @param {string} transaction.vin[].sequence 4294967294
 * @param {string} transaction.vin[].n 0
 * @param {string} transaction.vin[].addresses [ 'DFDn5QyHH9DiFBNFGMcyJT5uUpDvmBRDqH' ]
 * @param {string} transaction.vin[].addr '1HQzoxQsbjm44hc9rcJyX9KVmNAsyWyswB'
 * @param {string} transaction.vin[].value 44400000000
 * @param {string} transaction.vin[].hex 47304402200826f97d3432452abedd4346553de0b0c2d401ad7056b155e6462484afd98aa902202b5fb3166b96ded33249aecad7c667c0870c1
 * @param {string} transaction.vout[].value 59999824800
 * @param {string} transaction.vout[].n 0
 * @param {string} transaction.vout[].spent true
 * @param {string} transaction.vout[].hex 76a91456d49605503d4770cf1f32fbfb69676d9a72554f88ac
 * @param {string} transaction.vout[].addresses  [ 'DD4DKVTEkRUGs7qzN8b7q5LKmoE9mXsJk4' ]
 * @param {string} transaction.vout[].scriptPubKey.addresses[] [ '1HXmWQShG2VZ2GXb8J2CZmVTEoDUmeKyAQ' ]
 * @returns {Promise<{from: string, to: string, value: number, direction: string}>}
 * @constructor
 */
import BlocksoftUtils from '../../../common/BlocksoftUtils'

export default async function BtcFindAddressFunction(indexedAddresses, transaction) {

    let inputMy = BlocksoftUtils.toBigNumber(0)
    let inputOthers = BlocksoftUtils.toBigNumber(0)
    let inputMaxValue = 0
    let inputMaxAddress = ''
    let inputMyAddress = ''
    if (transaction.vin) {
        for (let i = 0, ic = transaction.vin.length; i < ic; i++) {
            let vinAddress
            const vinValue = transaction.vin[i].value
            const vinBN = BlocksoftUtils.toBigNumber(vinValue)
            if (typeof transaction.vin[i].addresses !== 'undefined') {
                vinAddress = transaction.vin[i].addresses[0]
            } else if (typeof transaction.vin[i].addr !== 'undefined') {
                vinAddress = transaction.vin[i].addr
            }
            if (typeof indexedAddresses[vinAddress] !== 'undefined') {
                inputMy = inputMy.add(vinBN)
                inputMyAddress = vinAddress
            } else {
                if (inputMaxValue < vinValue * 1 && vinAddress) {
                    inputMaxAddress = vinAddress
                    inputMaxValue = vinValue * 1
                }
                inputOthers = inputOthers.add(vinBN)
            }
        }
    }

    let outputMy = BlocksoftUtils.toBigNumber(0)
    let outputOthers = BlocksoftUtils.toBigNumber(0)
    let outputMaxValue = 0
    let outputMaxAddress = ''

    let outputMyAddress = ''
    const allMyAddresses = []
    if (transaction.vout) {
        for (let j = 0, jc = transaction.vout.length; j < jc; j++) {
            let voutAddress
            const voutValue = transaction.vout[j].value
            const voutBN = BlocksoftUtils.toBigNumber(voutValue)
            if (typeof transaction.vout[j].addresses !== 'undefined') {
                voutAddress = transaction.vout[j].addresses[0]
            } else if (typeof transaction.vout[j].scriptPubKey !== 'undefined' && typeof transaction.vout[j].scriptPubKey.addresses !== 'undefined') {
                voutAddress = transaction.vout[j].scriptPubKey.addresses[0]
            }

            if (typeof indexedAddresses[voutAddress] !== 'undefined') {
                outputMy = outputMy.add(voutBN)
                outputMyAddress = voutAddress
                allMyAddresses.push(outputMyAddress)
            } else {
                if (outputMaxValue < voutValue * 1 && voutAddress) {
                    outputMaxAddress = voutAddress
                    outputMaxValue = voutValue * 1
                }
                outputOthers = outputOthers.add(voutBN)
            }
        }
    }

    let output
    if (inputMy.toString() === '0') { // my only in output
        output = {
            direction: 'income',
            from: inputMaxAddress || 'mining',
            to: outputMyAddress,
            value: outputMy.toString()
        }
    } else if (outputMy.toString() === '0') { // my only in input
        output = {
            direction: 'outcome',
            from: inputMyAddress,
            to: outputMaxAddress,
            value: (inputOthers.toString() === '0') ? outputOthers.toString() : inputMy.toString()
        }
    } else { // both input and output
        if (outputMaxAddress) {// there are other address
            output = {
                direction: 'outcome',
                from: inputMyAddress,
                to: outputMaxAddress,
                value: outputOthers.toString()
            }
        } else {
            output = {
                direction: 'outcome',
                from: inputMyAddress,
                to: outputMyAddress,
                value: inputMy.sub(outputMy).toString()
            }
        }
    }
    output.allMyAddresses = allMyAddresses
    return output
}