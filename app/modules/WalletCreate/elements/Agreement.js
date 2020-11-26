import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import CheckBox from '../../../components/elements/new/CheckBox'

import { ThemeContext } from '../../theme/ThemeProvider'

import { strings } from '../../../services/i18n'


export default class Agreement extends React.Component {
    getLink = (text, onPress) => {
        const { colors } = this.context
        return (<Text style={[styles.linkText, { color: colors.common.text1 }]} onPress={onPress}>&nbsp;&nbsp;{text}&nbsp;&nbsp;</Text>)
    }

    getCheckboxTitle = () => {
        const {
            handleTerms,
            handlePrivacyPolicy
        } = this.props
        const { colors } = this.context
        return (
            <View style={styles.titleContainer}>
                <Text style={[styles.text, { color: colors.common.text3 }]}>
                    {strings('walletCreateScreen.agreement1')}
                    {this.getLink(strings('walletCreateScreen.terms'), handleTerms)}
                    {strings('walletCreateScreen.agreement2')}
                    {this.getLink(strings('walletCreateScreen.privacyPolicy'), handlePrivacyPolicy)}
                </Text>
            </View>
        )
    }

    render() {
        const {
            checked,
            onPress,
            handleTerms,
            handlePrivacy
        } = this.props
        const { colors } = this.context

        return (
            <CheckBox
                checked={checked}
                onPress={onPress}
                title={this.getCheckboxTitle}
            />
        );
    }
}

const styles = StyleSheet.create({
    titleContainer: {
        marginLeft: 12,
        paddingVertical: 4,
        flex: 1,
    },
    text: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        lineHeight: 18,
    },
    linkText: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 12,
        lineHeight: 22,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginTop: 3
    }
})

Agreement.contextType = ThemeContext
