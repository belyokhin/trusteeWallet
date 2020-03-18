import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Dimensions, View, Animated, Keyboard } from 'react-native'

import Navigation from '../../components/navigation/Navigation'

import AsyncStorage from '@react-native-community/async-storage'
import firebase from 'react-native-firebase'
import WebView from 'react-native-webview'
import LottieView from "lottie-react-native"
import axios from "axios"

import { strings } from '../../services/i18n'
import { showModal } from '../../appstores/Actions/ModalActions'

import accountDS from '../../appstores/DataSource/Account/Account'
import { setLoaderStatus } from '../../appstores/Actions/MainStoreActions'
import Log from '../../services/Log/Log'
import { setSendData } from '../../appstores/Actions/SendActions'
import NavStore from '../../components/navigation/NavStore'

const { height: WINDOW_HEIGHT } = Dimensions.get('window')


class MainDataScreen extends Component {

    constructor() {
        super()

        this.state = {
            confirmTransaction: true,
            script: `

                document.getElementsByClassName("header")[0].style = 'display: none;';
                document.getElementsByClassName("footer")[0].style = 'display: none;';
                
                function setNativeValue(element, value) {
                    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                    const prototype = Object.getPrototypeOf(element);
                    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                
                    if (valueSetter && valueSetter !== prototypeValueSetter) {
                      prototypeValueSetter.call(element, value);
                    } else {
                      valueSetter.call(element, value);
                    }
                }
                
                
                document.addEventListener("message", function(event) {
                    var data1 = JSON.parse(event.data);
                
                    if(data1.type === "PASTE_ADDRESS"){
                        setNativeValue(document.getElementsByName("destination")[0], data1.data.account.address);
                        
                        document.getElementsByName("destination")[0].dispatchEvent(new Event('input', { bubbles: true }));
                        document.activeElement && document.activeElement.blur();
                    }
                
                    if(data1.type === "SCROLL_TO_BOTTOM"){
                        typeof window != 'undefined' ? window.scrollTo(-200, 1000) : null;
                    }
                });
          
                
                window.addEventListener("message", function(event) {
                    var data2 = JSON.parse(event.data);
                
                    if(data2.type === "PASTE_ADDRESS"){
                        setNativeValue(document.getElementsByName("destination")[0], data2.data.account.address);
                        
                        document.getElementsByName("destination")[0].dispatchEvent(new Event('input', { bubbles: true }));
                        document.activeElement && document.activeElement.blur();
                    }
                
                    if(data2.type === "SCROLL_TO_BOTTOM"){
                        typeof window != 'undefined' ? window.scrollTo(-200, 1000) : null;
                    }
                    
                });
         
                
                function addListener2() {
                
                     if (document.getElementsByName("destination")[0].getAttribute('listener') !== 'true') {

                        document.getElementsByName("destination")[0].setAttribute('listener', 'true');
            
                        document.getElementsByName("destination")[0].addEventListener("focus", () => {
            
                            var el = document.getElementsByClassName("exchange-input exchange-input__light")[1];
                            el = el.getElementsByClassName("exchange-input--currency")[0];
                            el = el.textContent;
            
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "RECEIVE_ADDRESS_INPUT_FOCUS", currencySymbol: el }));
                        }, true);
                    }
                }
                
                
                setInterval(function () {
                   var exchangeId = window.location.href.split("/");
                   exchangeId = exchangeId[exchangeId.length - 1];
                
                   if(window.location.href.includes("txs")){ 
                       window.ReactNativeWebView.postMessage(JSON.stringify({ type: "CONFIRM_TRANSACTION", exchangeId: exchangeId }));
                   }
                }, 1000)
                
                
                setTimeout(function() { 
           
                    setInterval(function() {
                        try {
                            
                              addListener2();
                           
                            } catch (e) {}
                    }, 500);
                }, 3000)
                
                
    
                setTimeout(function() {
                   typeof window != 'undefined' ? window.scrollTo(-200, -200) : null; 
                }, 5000);    
            `,
            progress: new Animated.Value(0),
            show: true,
            status: null,
            type: null
        }

        this.exchangeId = null
        this.account = null
        this.cryptocurrency = null
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {

        setLoaderStatus(false)

        const param = this.props.navigation.getParam('exchangeMainDataScreenParam')

        this.setState({
            source: param.url,
            type: param.type
        })
    }

    componentDidMount() {

        Animated.loop(
            Animated.sequence([
                Animated.timing(this.state.progress, {
                    toValue: 1,
                    duration: 5000
                }),
                Animated.timing(this.state.progress, {
                    toValue: 0,
                    duration: 5000
                })
            ]),
            {
                iterations: 50
            }
        ).start()

        setTimeout(() => {
            this.setState({
                status: "LOAD_END"
            })
        }, 8000)
    }

    onMessage = async (event) => {

        try {

            const { selectedWallet } = this.props.mainStore
            const data = JSON.parse(event.nativeEvent.data)

            let cryptocurrencies = JSON.parse(JSON.stringify(this.props.mainStore.currencies))

            if(data.currencySymbol === "USDTERC20"){
                cryptocurrencies = cryptocurrencies.filter(item => item.currencyCode === "ETH_USDT")
            } else {
                cryptocurrencies = cryptocurrencies.filter(item => item.currencySymbol === data.currencySymbol)
            }

            console.log(cryptocurrencies)

            if(cryptocurrencies.length && data.type === "RECEIVE_ADDRESS_INPUT_FOCUS"){

                let accounts

                if(cryptocurrencies[0].currencyCode === "BTC"){
                    accounts = await accountDS.getAccountData({ wallet_hash : selectedWallet.wallet_hash, currency_code : cryptocurrencies[0].currencyCode, segwit: "segwit" })
                    accounts = accounts.segwit
                } else {
                    accounts = await accountDS.getAccountData({ wallet_hash : selectedWallet.wallet_hash, currency_code : cryptocurrencies[0].currencyCode })
                }

                showModal({
                    type: 'YES_NO_MODAL',
                    icon: "WARNING",
                    title: strings('exchangeScreen.receiveAddressModal.title'),
                    description: strings('exchangeScreen.receiveAddressModal.description1') + " \"" + selectedWallet.wallet_name + "\" " + strings('exchangeScreen.receiveAddressModal.description2') + " \"" + accounts[0].address.slice(0, 6) + '...' + accounts[0].address.slice(accounts[0].address.length - 4, accounts[0].address.length) + "\"",
                    noCallback: () => {
                        this.webRef.postMessage(JSON.stringify({ type: "SCROLL_TO_BOTTOM" }))
                    }
                }, async () => {
                    this.webRef.postMessage(JSON.stringify({ type: "PASTE_ADDRESS", data: { account: accounts[0] } }))
                    Keyboard.dismiss()
                })
            }

            if(this.state.type === "CREATE_NEW_ORDER" && data.type === "CONFIRM_TRANSACTION" && this.state.confirmTransaction){
                this.state.confirmTransaction = false

                setLoaderStatus(true)

                setTimeout(async () => {
                    try {
                        const res = await axios.get(`https://changenow.io/api/v1/transactions/${data.exchangeId}/96b632f9a3f2271bd6b3026a7aad09bfa6aa9dbbad668078c92f662b9f270413`)

                        const exchangeOrders = await AsyncStorage.getItem("EXCHANGE_ORDERS")

                        let exchangeOrdersToSave = []

                        if(exchangeOrders === null){
                            exchangeOrdersToSave.push(res.data)
                        } else {
                            exchangeOrdersToSave = JSON.parse(exchangeOrders)
                            exchangeOrdersToSave.push(res.data)
                        }

                        await AsyncStorage.setItem("EXCHANGE_ORDERS", JSON.stringify(exchangeOrdersToSave))

                        setLoaderStatus(false)

                        let cryptocurrencies = JSON.parse(JSON.stringify(this.props.mainStore.currencies))

                        if(res.data.fromCurrency.toUpperCase() === "USDTERC20"){
                            cryptocurrencies = cryptocurrencies.filter(item => item.currencyCode === "ETH_USDT")
                        } else {
                            cryptocurrencies = cryptocurrencies.filter(item => item.currencySymbol === res.data.fromCurrency.toUpperCase())
                        }

                        if(cryptocurrencies.length){

                            const accounts = await accountDS.getAccountData({ wallet_hash: selectedWallet.wallet_hash, currency_code: cryptocurrencies[0].currencyCode })

                            const dataToSend = {
                                disabled: true,
                                address: res.data.payinAddress,
                                value: res.data.expectedSendAmount.toString(),

                                account: accounts[0],
                                cryptocurrency: cryptocurrencies[0],

                                description: strings('send.description'),
                                useAllFunds: false,
                                type: 'TRADE_SEND'
                            }

                            if(typeof res.data.payinExtraId !== "undefined"){
                                dataToSend.destinationTag = res.data.payinExtraId
                            }

                            setSendData(dataToSend)

                            NavStore.goNext('SendScreen')
                        }

                    } catch (e) {
                        Log.err('Exchange/MainDataScreen.onMessage error ' + e.message)
                    }
                }, 5000)

            }

        } catch (e) {
            Log.err('Exchange/MainDataScreen.onMessage error ' + e.message)
        }
    }

    render() {

        const { exchangeStore } = this.props
        const { source, script, status } = this.state

        firebase.analytics().setCurrentScreen('Exchange.MainScreen.' + exchangeStore.tradeType)

        return (
            <View style={styles.wrapper}>
                <Navigation
                    title={strings('exchangeScreen.title')}
                    navigation={this.props.navigation}
                />
                <View style={styles.wrapper__content}>
                    {
                        status !== 'LOAD_END' ?
                            <View style={styles.img}>
                                <LottieView style={{
                                    width: 200,
                                    height: 200,
                                    marginTop: -50
                                }} source={require('../../assets/jsons/animations/loaderBlue.json')} progress={this.state.progress}/>
                            </View> : null
                    }
                    <WebView
                        ref={r => (this.webRef = r)}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        // onLoadEnd={() => this.webref.injectJavaScript(script)}
                        showsVerticalScrollIndicator={false}
                        source={{ uri: source }}
                        onMessage={this.onMessage}
                        onLoadEnd={() => this.webRef.injectJavaScript(script)}
                        useWebKit={true}
                    />
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        settingsStore: state.settingsStore,
        mainStore: state.mainStore,
        wallet: state.mainStore.selectedWallet,
        selectedAccount: state.mainStore.selectedAccount,
        exchangeStore: state.exchangeStore,
        fiatRatesStore: state.fiatRatesStore
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainDataScreen)

const styles = {
    wrapper: {
        flex: 1,
        height: WINDOW_HEIGHT,
        backgroundColor: '#fff'
    },
    wrapper__content: {
        flex: 1,

        position: "relative",

        marginTop: 80,
        backgroundColor: "#fff"
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',

        width: '100%',
        paddingHorizontal: 15
    },
    img: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: WINDOW_HEIGHT,
        zIndex: 2,
        backgroundColor: '#fff'
    },
}