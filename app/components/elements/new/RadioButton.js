
import React from 'react'
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native'

import { useTheme } from '../../../modules/theme/ThemeProvider'

import { strings } from '../../../services/i18n'


export default function RadioButton(props) {
    const {
        label = '',
        checked,
        onChange = () => {},
        value,
        containerStyle
    } = props
    const { colors } = useTheme()

    return (
        <TouchableOpacity
            style={[styles.container, containerStyle]}
            onPress={() => onChange(value)}
            disabled={checked}
            activeOpacity={0.8}
        >
            <View
                style={[
                    styles.radio,
                    { borderColor: checked ? colors.common.radioButton.checked : colors.common.radioButton.border }
                ]}
            >
                <View style={[styles.radioInner, { backgroundColor: checked ? colors.common.radioButton.checked : colors.common.radioButton.uncheckedBg }]} />
            </View>
            {!!label && <Text style={[styles.label, { color: checked ? colors.common.radioButton.checked : colors.common.radioButton.text }]}>{label}</Text>}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        padding: 3,
        borderWidth: 1,
    },
    radioInner: {
        flex: 1,
        borderRadius: 7.5,
    },
    label: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        lineHeight: 19,
        marginLeft: 12,
    }
})
