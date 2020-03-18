import { Linking } from 'react-native'

import store from '../../store'

import NavStore from '../../components/navigation/NavStore'

import { decodeTransactionQrCode } from '../../services/Qr/QrScan'
import { strings } from '../../services/i18n'

import _ from 'lodash'
import accountDS from '../DataSource/Account/Account'
import Log from '../../services/Log/Log'

const { dispatch } = store


export function setSendData(data) {
    dispatch({
        type: 'SET_SEND_DATA',
        data: data
    })
}

export function clearSendData() {
    dispatch({
        type: 'CLEAR_SEND_DATA'
    })
}

export default new class SendActions {

    handleInitialURL = async () => {

        let initialURL = ''
        try {
            initialURL = await Linking.getInitialURL()
            if(initialURL === null) return
        } catch (e) {
            Log.err('SendActions.handleInitialURL get error ' + e.message, initialURL)
            return
        }
        Log.log('SendActions.handleInitialURL get success', initialURL)


        let res = {}
        try {
            res = await decodeTransactionQrCode({ data: initialURL })
            if (typeof (res.data) === 'undefined') {
                throw new Error('res.data is empty')
            }
        } catch (e) {
            Log.err('SendActions.handleInitialURL decode error ' + e.message)
            return
        }
        Log.log('SendActions.handleInitialURL decode success', res.data)

        try {
            if(initialURL.indexOf("trustee.page.link") === -1){
                const { currencies, selectedWallet } = store.getState().mainStore
                let currency = _.find(currencies, { currencyCode: res.data.currencyCode })
                let accounts = await accountDS.getAccountData({wallet_hash : selectedWallet.wallet_hash, currency_code : res.data.currencyCode})

                setSendData({
                    disabled: false,
                    address: res.data.address,
                    value: res.data.amount ? res.data.amount.toString() : '0',

                    account: accounts[0],
                    cryptocurrency: currency,

                    description: strings('send.description'),
                    useAllFunds: false
                })

                NavStore.goNext('SendScreen')
            }
        } catch (e) {
            Log.err('SendActions.handleInitialURL process error ' + e.message)
        }
    }
}