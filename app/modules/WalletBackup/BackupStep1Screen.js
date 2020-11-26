
import React from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase'

import NavStore from '../../components/navigation/NavStore'

import { strings } from '../../../app/services/i18n'

import { showModal } from '../../appstores/Stores/Modal/ModalActions'
import { setLoaderStatus } from '../../appstores/Stores/Main/MainStoreActions'

import App from '../../appstores/Actions/App/App'
import Log from '../../services/Log/Log'

import { setCallback, proceedSaveGeneratedWallet } from '../../appstores/Stores/CreateWallet/CreateWalletActions'
import walletActions from '../../appstores/Stores/Wallet/WalletActions'


import Header from '../../components/elements/new/Header'
import TwoButtons from '../../components/elements/new/buttons/TwoButtons'
import CheckBox from '../../components/elements/new/CheckBox'
import MnemonicWord from './elements/MnemonicWord'
import SelectedMnemonic from './elements/SelectedMnemonic'

import { ThemeContext } from '../../modules/theme/ThemeProvider'


const VISIBILITY_TIMEOUT = 4000;

class BackupStep1Screen extends React.Component {
    visibilityTimer;

    constructor(props) {
        super(props)
        this.state = {
            headerHeight: 0,
            isMnemonicVisible: false,
            walletMnemonicDefault: [],
            walletMnemonicSorted: [],
            walletMnemonicSelected: [],
        }
    }

    componentDidMount() {
        this.init()
    }

    setHeaderHeight = (height) => {
        const headerHeight = Math.round(height || 0);
        this.setState(() => ({ headerHeight }))
    }

    init = () => {
        Log.log('WalletBackup.BackupStep1Screen init')

        if (typeof this.props.createWalletStore.walletMnemonic === 'undefined') {
            throw new Error('WalletBackup.BackupStep1Screen init error')
        }


        let walletMnemonicDefault
        try {
            walletMnemonicDefault = this.props.createWalletStore.walletMnemonic.split(' ')
        } catch (e) {
            throw new Error('WalletBackup.BackupStep1Screen init split error ' + e.message)
        }

        let walletMnemonicSorted = JSON.parse(JSON.stringify(walletMnemonicDefault))
        try {
            walletMnemonicSorted = walletMnemonicSorted.sort(() => {
                return .5 - Math.random()
            })
        } catch (e) {
            throw new Error('WalletBackup.BackupStep1Screen init sort error ' + e.message)
        }

        this.setState({
            walletMnemonicDefault: walletMnemonicDefault,
            walletMnemonicSorted: walletMnemonicSorted,
            walletMnemonicSelected: []
        })
    }

    handleSelectWord = (item, index) => {
        Log.log('WalletBackup.BackupStep1Screen handleSelectWord')
        const walletMnemonicSorted = JSON.parse(JSON.stringify(this.state.walletMnemonicSorted))
        const walletMnemonicSelected = JSON.parse(JSON.stringify(this.state.walletMnemonicSelected))
        walletMnemonicSelected.push(item)

        walletMnemonicSorted.splice(index, 1)

        this.setState({
            walletMnemonicSelected,
            walletMnemonicSorted
        }, () => {
            this.validateMnemonic()
        })
    }

    handleRemoveWord = (item, index) => {
        Log.log('WalletBackup.BackupStep1Screen handleRemoveWord')
        const walletMnemonicSelected = JSON.parse(JSON.stringify(this.state.walletMnemonicSelected))
        const walletMnemonicSorted = JSON.parse(JSON.stringify(this.state.walletMnemonicSorted))
        walletMnemonicSorted.push(item)

        walletMnemonicSelected.splice(index, 1)

        this.setState({
            walletMnemonicSelected,
            walletMnemonicSorted
        })
    }

    handleBack = () => { NavStore.goBack() }

    validateMnemonic = async () => {
        Log.log('WalletBackup.BackupStep1Screen validateMnemonic')

        const { flowType } = this.props.createWalletStore

        if (this.state.walletMnemonicSorted.length) return true

        if (JSON.stringify(this.state.walletMnemonicSelected) !== JSON.stringify(this.state.walletMnemonicDefault)) {
            showModal({ type: 'MNEMONIC_FAIL_MODAL' }, this.init)
        } else if (flowType === 'BACKUP_WALLET') {

            walletActions.setWalletBackedUpStatus(this.props.mainStore.selectedWallet.walletHash)

            showModal({
                type: 'INFO_MODAL',
                icon: true,
                title: strings('modal.walletBackup.success'),
                description: strings('modal.walletBackup.seedConfirm')
            }, () => {
                NavStore.reset('DashboardStack')
            })
        } else {
            const { walletName, walletMnemonic, callback } = this.props.createWalletStore

            try {
                setLoaderStatus(true)

                let tmpWalletName = walletName

                if (!tmpWalletName) {
                    tmpWalletName = await walletActions.getNewWalletName()
                }

                const storedKey = await proceedSaveGeneratedWallet({
                    walletName: tmpWalletName,
                    walletMnemonic
                })

                walletActions.setWalletBackedUpStatus(storedKey)

                setLoaderStatus(false)

                showModal({
                    type: 'INFO_MODAL',
                    icon: true,
                    title: strings('modal.walletBackup.success'),
                    description: strings('modal.walletBackup.walletCreated')
                }, async () => {
                    if (callback === null) {
                        NavStore.reset('DashboardStack')
                        await App.refreshWalletsStore({ firstTimeCall: false, source: 'WalletBackup.BackupStep1Screen' })
                    } else {
                        callback()
                        setCallback({ callback: null })
                    }
                })
            } catch (e) {
                Log.err('WalletBackup.BackupStep1Screen.validateMnemonic error ' + e.message)
            }

        }

    }

    triggerMnemonicVisible = (visible) => {
        if (this.visibilityTimer) return;
        this.setState(state => ({ isMnemonicVisible: !state.isMnemonicVisible }))
    }

    showMnemonic = () => {
        this.setState(() => ({ isMnemonicVisible: true }))

        this.visibilityTimer = setTimeout(() => {
            this.visibilityTimer = null
            this.setState(() => ({ isMnemonicVisible: false }))
        }, VISIBILITY_TIMEOUT)
    }

    render() {
        Log.log('WalletBackup.BackupStep1Screen render')
        firebase.analytics().setCurrentScreen('WalletBackup.BackupStep1Screen')

        const {
            headerHeight,
            isMnemonicVisible,
            walletMnemonicSorted,
            walletMnemonicSelected
        } = this.state
        const { GRID_SIZE, colors } = this.context

        return (
            <View style={[styles.container, { backgroundColor: colors.common.background }]}>
                <Header
                    title={strings('walletBackup.step1Screen.title')}
                    setHeaderHeight={this.setHeaderHeight}
                />
                <SafeAreaView style={[styles.content, {
                    backgroundColor: colors.common.background,
                    marginTop: headerHeight,
                }]}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        ref={ref => { this.scrollView = ref }}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <View style={{ paddingHorizontal: GRID_SIZE, paddingVertical: GRID_SIZE * 2 }}>
                            <SelectedMnemonic
                                placeholder={strings('walletBackup.step1Screen.placeholder')}
                                showButtonTitle={strings('walletBackup.step1Screen.showButton')}
                                triggerMnemonicVisible={this.triggerMnemonicVisible}
                                showMnemonic={this.showMnemonic}
                                removeWord={this.handleRemoveWord}
                                isMnemonicVisible={isMnemonicVisible}
                                data={walletMnemonicSelected}
                            />
                            <View style={[styles.wordsContainer]}>
                                {walletMnemonicSorted.map((word, i) => (
                                    <MnemonicWord
                                        value={word}
                                        key={`${word}${i}`}
                                        onPress={() => this.handleSelectWord(word, i)}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={{
                            paddingHorizontal: GRID_SIZE,
                            paddingVertical: GRID_SIZE * 1.5,
                        }}>
                            <TwoButtons
                                mainButton={{
                                    disabled: !!walletMnemonicSorted.length,
                                    onPress: this.onNext,
                                    title: strings('walletBackup.step1Screen.next')
                                }}
                                secondaryButton={{
                                    type: 'back',
                                    onPress: this.handleBack
                                }}
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        mainStore: state.mainStore,
        createWalletStore: state.createWalletStore,
    }
}

BackupStep1Screen.contextType = ThemeContext

export default connect(mapStateToProps, {})(BackupStep1Screen)

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        flex: 1,
        justifyContent: 'space-between'
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'space-between'
    },
    wordsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
})
