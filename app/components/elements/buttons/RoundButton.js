
import React from 'react'
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native'

import ReceiveIcon from '../../../assets/images/HomePage/receive';
import SendIcon from '../../../assets/images/HomePage/send';
import HideIcon from '../../../assets/images/HomePage/hide';


import { strings } from '../../../services/i18n'


const ICON_SET = {
    receive: ReceiveIcon,
    send: SendIcon,
    hide: HideIcon,
}


export default class ButtonIcon extends React.Component {
    render() {
        const {
            type,
            onPress,
            containerStyle,
        } = this.props
        const Icon = ICON_SET[type];

        if (!Icon) return null
        const text = strings(`homeScreen.buttons.${type}`)

        return (
            <View style={[styles.container, containerStyle]}>
                <TouchableOpacity onPress={onPress} style={styles.roundButton}>
                    <Icon />
                </TouchableOpacity>
                {!!text && <Text style={styles.text}>{text}</Text>}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    roundButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 21,
        backgroundColor: '#404040',

        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 3
        },

        elevation: 10
    },
    text: {
        marginTop: 6,
        fontFamily: 'SFUIDisplay-Semibold',
        fontSize: 12,
        lineHeight: 14,
        letterSpacing: 1.5,
        color: '#999999'
    },
})