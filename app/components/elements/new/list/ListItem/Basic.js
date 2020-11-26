
import React from 'react'
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native'

import AntIcon from 'react-native-vector-icons/AntDesign'

import { useTheme } from '../../../../../modules/theme/ThemeProvider'

import { strings } from '../../../../../services/i18n'

import SupportIcon from '../../../../../assets/images/support'



const getIcon = (iconType, color) => {
    switch (iconType) {
        case 'support':
            return <SupportIcon color={color} />
        case 'skip':
            return <AntIcon name="arrowright" color={color} size={20} />
        default: return null
    }
}

export default function BasicListItem(props) {
    const {
        onPress,
        last,
        title,
        subtitle,
        iconType
    } = props
    const { colors } = useTheme()

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.icon, { backgroundColor: colors.common.listItem.basic.iconBgLight }]}>
                {getIcon(iconType, colors.common.text1)}
            </View>
            <View style={[styles.textContent, last && styles.noBorder, { borderColor: colors.common.listItem.basic.borderColor }]}>
                <Text numberOfLines={!!subtitle ? 1 : 2} style={[styles.title, { color: colors.common.text1 }]}>{title}</Text>
                {!!subtitle && <Text numberOfLines={1} style={[styles.subtitle, { color: colors.common.text2 }]}>{subtitle}</Text>}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textContent: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        flex: 1,
        justifyContent: 'center'
    },
    noBorder: {
        borderBottomWidth: 0
    },
    title: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
        lineHeight: 21
    },
    subtitle: {
        marginTop: 7,
        fontFamily: 'SFUIDisplay-Semibold',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 1.75
    }
})
