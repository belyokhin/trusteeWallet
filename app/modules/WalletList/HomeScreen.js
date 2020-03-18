import React, { Component } from 'react'
import {
    Text,
    TouchableOpacity,
    SafeAreaView,
    View,
    Animated,
    ScrollView,
    RefreshControl} from 'react-native'
import { connect } from 'react-redux'

import AsyncStorage from '@react-native-community/async-storage'
import firebase from 'react-native-firebase'
import Snow from 'react-native-snow'
import Feather from 'react-native-vector-icons/Feather'

import GradientView from '../../components/elements/GradientView'
import NavStore from '../../components/navigation/NavStore'

import Currency from './elements/Currency'
import BottomNavigation from './elements/BottomNavigation'
import WalletInfo from './elements/WalletInfo'

import Log from '../../services/Log/Log'
import { strings } from '../../services/i18n'
import updateCurrencyRateDaemon from '../../services/Daemon/classes/UpdateCurrencyRate'
import updateAccountBalanceDaemon from '../../services/Daemon/classes/UpdateAccountTransactions'

import SendActions from '../../appstores/Actions/SendActions'

import Theme from '../../themes/Themes'
import { setLoaderStatus } from '../../appstores/Actions/MainStoreActions'
import FiatRatesActions from '../../appstores/Actions/FiatRatesActions'
import VersionControl from '../../services/VersionControl'

let styles


class HomeScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            refreshing: false,
            isHeaderTransparent: false,
            opacity: new Animated.Value(0),
            isSnow: false,
            isSnowEnable: false
        }
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {

        SendActions.handleInitialURL()
        styles = Theme.getStyles().homeScreenStyles
        // this._onFocusListener = this.props.navigation.addListener('didFocus', (payload) => {
        //     setTimeout(() => {
        //         setCurrencies()
        //     }, 10000)
        // })
    }

    async componentDidMount() {

        setLoaderStatus(false)

        const isSnow = true

        if(!isSnow){
            await AsyncStorage.setItem("isSnowEnable", JSON.stringify(null))
            this.setState({ isSnowEnable: false, isSnow: false })
        } else if(isSnow){
            let isSnowEnable = await AsyncStorage.getItem("isSnowEnable")
            isSnowEnable = JSON.parse(isSnowEnable)

            isSnowEnable == null ? await AsyncStorage.setItem("isSnowEnable", JSON.stringify(false)) : null

            this.setState({ isSnowEnable: isSnowEnable == null ? false : isSnowEnable, isSnow: true })
        }
    }

    onPress = () => {
        this.props.navigation.navigate('CryptoList')
    }

    handleRefresh = async () => {

        const { fiatRatesStore } = this.props

        this.setState({
            isHeaderTransparent: false
        })

        Log.log('WalletList.HomeScreen is refreshing')

        this.setState({
            refreshing: true
        })

        await updateCurrencyRateDaemon.forceDaemonUpdate()
        await updateAccountBalanceDaemon.forceDaemonUpdate()

        if(!fiatRatesStore.fiatRates.length){
            await FiatRatesActions.init()
        }

        this.setState({
            refreshing: false
        })
    }

    handleAddCoin = () => {
        NavStore.goNext('AddAssetScreen')
    }

    renderTooltip = (props) => {
        return (
            <TouchableOpacity style={styles.topBlock__btn} onPress={this.handleAddCoin} {...props}>
                <Text style={styles.topBlock__btn__text}>
                    { (strings('assets.mainTitle')).toUpperCase() }
                </Text>
                <Feather style={styles.topBlock__btn_icon} name={'plus-circle'} />
            </TouchableOpacity>
        )
    }

    renderHeaderTransparent = () => {

        // const { opacity } = this.state

        // return (
        //     <Animated.View style={{...styles.notch, opacity }}>
        //         <View style={{
        //             flex: 1,
        //             width: '100%',
        //
        //             backgroundColor: '#fff',
        //             shadowColor: "#000",
        //             shadowOffset: {
        //                 width: 0,
        //                 height: 2,
        //             },
        //             shadowOpacity: 0.25,
        //             shadowRadius: 3.84,
        //
        //             elevation: 5,
        //         }}>
        //             <GradientView
        //                 style={{
        //                     flex: 1,
        //                     width: '100%',
        //                     borderBottomLeftRadius: 10,
        //                     borderBottomRightRadius: 10,
        //                 }}
        //                 array={styles_.bg_header.array}
        //                 start={styles_.bg_header.start}
        //                 end={styles_.bg_header.end} />
        //         </View>
        //     </Animated.View>
        // )
        return <View />
    }

    onScroll = (event) => {
        const { isHeaderTransparent, opacity } = this.state

        let isHeaderTransparentTmp = false

        if(event.nativeEvent.contentOffset.y > 150){

            Animated.timing(
                opacity, {
                    toValue: 1,
                    duration: 200,
                }
            ).start()

            isHeaderTransparentTmp = true
        } else {
            Animated.timing(
                opacity, {
                    toValue: 0,
                    duration: 200,
                }
            ).start()
        }

        if(isHeaderTransparent !== isHeaderTransparentTmp){
            this.setState({
                isHeaderTransparent: isHeaderTransparentTmp
            })
        }
    }

    scrollToEnd = () => {
        this.refHomeScreenSV.scrollToEnd({ animated: true })
    }

    toggleSnow = async () => {
        await AsyncStorage.setItem("isSnowEnable", JSON.stringify(!this.state.isSnow))

        this.setState({
            isSnowEnable: !this.state.isSnowEnable
        })
    }



    render() {
        firebase.analytics().setCurrentScreen('WalletList.HomeScreen')

        Log.log('WalletList.HomeScreen is rendered')

        const currencies = this.props.currencies

        return (
            <View style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 0, backgroundColor: '#f5f5f5' }} />
                <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
                    <GradientView
                        style={{ flex: 1 }}
                        array={styles_.bg.array}
                        start={styles_.bg.start}
                        end={styles_.bg.end}>
                            { this.renderHeaderTransparent() }
                        <ScrollView
                            ref={ref => this.refHomeScreenSV = ref}
                            style={{ flex: 1, position: 'relative', marginBottom: -20, zIndex: 2 }}
                            showsVerticalScrollIndicator={false}
                            onScrollBeginDrag={this.onScroll}
                            onScrollEndDrag={this.onScroll}
                            onMomentumScrollStart={this.onScroll}
                            onMomentumScrollEnd={this.onScroll}
                            refreshControl={
                                <RefreshControl
                                    tintColor={'#404040'}
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.handleRefresh}
                                />
                            }>
                            <WalletInfo isSnow={this.state.isSnow} toggleSnow={this.toggleSnow} />
                            <View style={{ flex: 1, paddingBottom: 30,  backgroundColor: '#f5f5f5' }}>
                                <Text style={{
                                    marginLeft: 31,
                                    fontFamily: "Montserrat-Bold",
                                    color: "#404040",
                                    fontSize: 14
                                }}>{ strings('homeScreen.assets') }</Text>
                                <View style={styles.cryptoList}>
                                    {
                                        currencies.map((item, index) => {
                                            return !item.is_hidden ? <Currency key={index} currency={item}/> : null
                                        })
                                    }
                                </View>
                            </View>
                        </ScrollView>
                        <BottomNavigation />
                    </GradientView>
                     {
                        // this.state.isSnowEnable ? <Snow snowfall={'medium'} /> : null
                     }
                </SafeAreaView>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        main: state.mainStore,
        toolTipsStore: state.toolTipsStore,
        account: state.mainStore.selectedAccount,
        selectedWallet: state.mainStore.selectedWallet,
        currencies: state.mainStore.currencies,
        fiatRatesStore: state.fiatRatesStore,
    }
}

export default connect(mapStateToProps, {})(HomeScreen)


const styles_ = {
    cryptoList__icoWrap_bitcoin: {
        array: ['#8879D9', '#E770B2'],
        start: { x: 0.0, y: 0.5 },
        end: { x: 1, y: 0.5 }
    },
    cryptoList__icoWrap_eth: {
        // array: ["#5b8df1","#a1bef7"],
        array: ['#145de3', '#4ec8f7'],
        start: { x: 0.0, y: 0.5 },
        end: { x: 1, y: 0.5 }
    },
    cryptoList__ico: {
        color: '#FBFFFF',
        size: 24
    },
    cryptoList__item: {
        array: ['#fff', '#fff'],
        start: { x: 0.0, y: 0.5 }
    },
    bg: {
        array: ['#f5f5f5', '#f5f5f5'],
        start: { x: 0.0, y: 0.5 },
        end: { x: 0, y: 1 }
    },
    bg_header: {
        array: ['#f2f2f2', '#f2f2f2'],
        start: { x: 0.0, y: 1 },
        end: { x: 1, y: 1 }
    },
}