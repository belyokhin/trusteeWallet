
import React, { Component } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Linking,
} from 'react-native'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase'

import NavStore from '../../components/navigation/NavStore'

import { strings } from '../../../app/services/i18n'

import {
    setWalletMnemonic,
    setMnemonicLength,
    setWalletName,
} from '../../appstores/Stores/CreateWallet/CreateWalletActions'
import { showModal } from '../../appstores/Stores/Modal/ModalActions'

import BlocksoftExternalSettings from '../../../crypto/common/BlocksoftExternalSettings'
import BlocksoftKeys from '../../../crypto/actions/BlocksoftKeys/BlocksoftKeys'

import MarketingEvent from '../../services/Marketing/MarketingEvent'
import Log from '../../services/Log/Log'

import Header from '../../components/elements/new/Header'
import TextInput from '../../components/elements/new/TextInput'
import RadioButton from '../../components/elements/new/RadioButton'
import TwoButtons from '../../components/elements/new/buttons/TwoButtons'
import CheckBox from '../../components/elements/new/CheckBox'
import ListItem from '../../components/elements/new/list/ListItem/Basic'

import { ThemeContext } from '../../modules/theme/ThemeProvider'


class BackupSettingsScreen extends Component {
    state = {
        headerHeight: 0,
        mnemonicLength: this.props.createWalletStore.mnemonicLength,
        walletName: this.props.createWalletStore.walletName,
        isCreating: this.props.createWalletStore.flowType === 'CREATE_NEW_WALLET'
    }

    setHeaderHeight = (height) => {
        const headerHeight = Math.round(height || 0);
        this.setState(() => ({ headerHeight }))
    }

    handleApply = async () => {
        const { mnemonicLength, walletName, isCreating } = this.state
        const {
            mnemonicLength: oldMnemonicLength,
            walletName: oldWalletName,
        } = this.props.createWalletStore

        if (isCreating && mnemonicLength !== oldMnemonicLength) {
            const walletMnemonic = (await BlocksoftKeys.newMnemonic(mnemonicLength)).mnemonic

            setWalletMnemonic({ walletMnemonic })
            setMnemonicLength({ mnemonicLength })
        }

        if (walletName !== oldWalletName) setWalletName({ walletName })

        this.props.navigation.goBack()
    }

    handleBack = () => { this.props.navigation.goBack() }

    changeWalletName = (walletName) => { this.setState(() => ({ walletName })) }

    changeMnemonicLength = (mnemonicLength) => { this.setState(() => ({ mnemonicLength })) }

    handleSkip = () => {
        Log.log('WalletBackup.BackupStep1Screen handleSkip')
        const { settingsStore } = this.props

        if (+settingsStore.lock_screen_status) {
            showModal({
                type: 'INFO_MODAL',
                icon: 'INFO',
                title: strings('modal.exchange.sorry'),
                description: strings('modal.disabledSkipModal.description')
            })
            return
        }

        showModal({ type: 'BACKUP_SKIP_MODAL' })
    }

    handleSupport = async () => {
        const link = await BlocksoftExternalSettings.get('SUPPORT_BOT')
        MarketingEvent.logEvent('taki_support', { link, screen: 'SETTINGS' })
        Linking.openURL(link)
    }

    render() {
        const {
            headerHeight,
            mnemonicLength,
            walletName,
            isCreating
        } = this.state
        const {
            mnemonicLength: oldMnemonicLength,
            walletName: oldWalletName,
        } = this.props.createWalletStore
        const { GRID_SIZE, colors } = this.context
        const hasChanges = mnemonicLength !== oldMnemonicLength || walletName !== oldWalletName

        firebase.analytics().setCurrentScreen('WalletBackup.Settings')

        return (
            <View style={[styles.container, { backgroundColor: colors.common.background }]}>
                <Header
                    title={strings('walletBackup.settingsScreen.title')}
                    setHeaderHeight={this.setHeaderHeight}
                />
                {!!headerHeight && (
                    <SafeAreaView style={[styles.content, {
                        backgroundColor: colors.common.background,
                        marginTop: headerHeight,
                    }]}>
                        <View style={{ paddingHorizontal: GRID_SIZE, paddingTop: GRID_SIZE * 1.5 }}>
                            {isCreating && (
                                <View style={[styles.phraseSetting, { marginHorizontal: GRID_SIZE, marginBottom: GRID_SIZE * 2 }]}>
                                    <Text style={[styles.phraseSettingLabel, { color: colors.common.text1 }]}>{strings('walletBackup.settingsScreen.phraseLengthLabel')}</Text>
                                    <View style={styles.radioButtons}>
                                        <RadioButton
                                            label={strings('walletBackup.settingsScreen.12wordsLabel')}
                                            value={128}
                                            onChange={this.changeMnemonicLength}
                                            checked={mnemonicLength === 128}
                                        />
                                        <RadioButton
                                            label={strings('walletBackup.settingsScreen.24wordsLabel')}
                                            value={256}
                                            onChange={this.changeMnemonicLength}
                                            checked={mnemonicLength === 256}
                                            containerStyle={styles.secondRadioValue}
                                        />
                                    </View>
                                </View>
                            )}

                            <TextInput
                                label={strings('walletBackup.settingsScreen.walletNameLabel')}
                                placeholder={strings('walletBackup.settingsScreen.walletNamePlaceholder')}
                                onChangeText={this.changeWalletName}
                                value={walletName}
                            />

                            <View style={{ marginTop: GRID_SIZE * 1.5 }}>
                                <ListItem
                                    title={strings('walletBackup.settingsScreen.contactTitle')}
                                    subtitle={strings('walletBackup.settingsScreen.contactSubtitle')}
                                    iconType="support"
                                    onPress={this.handleSupport}
                                    last={!isCreating}
                                />
                                {isCreating && (
                                    <ListItem
                                        title={strings('walletBackup.settingsScreen.skipTitle')}
                                        subtitle={strings('walletBackup.settingsScreen.skipSubtitle')}
                                        iconType="skip"
                                        last
                                        onPress={this.handleSkip}
                                    />
                                )}
                            </View>
                        </View>

                        <View style={{
                            paddingHorizontal: GRID_SIZE,
                            paddingVertical: GRID_SIZE * 1.5,
                        }}>
                            <TwoButtons
                                mainButton={{
                                    disabled: !hasChanges,
                                    onPress: this.handleApply,
                                    title: strings('walletBackup.settingsScreen.apply')
                                }}
                                secondaryButton={{
                                    type: 'back',
                                    onPress: this.handleBack,
                                }}
                            />
                        </View>
                    </SafeAreaView>
                )}
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        settingsStore: state.settingsStore.data,
        createWalletStore: state.createWalletStore
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    }
}

BackupSettingsScreen.contextType = ThemeContext

export default connect(mapStateToProps, mapDispatchToProps)(BackupSettingsScreen)

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        flex: 1,
        justifyContent: 'space-between'
    },
    phraseSetting: {},
    phraseSettingLabel: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        lineHeight: 21,
        marginBottom: 12
    },
    radioButtons: {
        flexDirection: 'row'
    },
    secondRadioValue: {
        marginLeft: 24
    }
})
