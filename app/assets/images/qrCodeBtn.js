import React from 'react'
import Svg, { LinearGradient, Stop, Path } from 'react-native-svg'
import { Image } from 'react-native'
import OldPhone from '../../services/UI/OldPhone/OldPhone'

function SvgComponent(props) {
	if (OldPhone.isOldPhone()) {
		return (
			<Image
				width={24} height={24}
				resizeMode='stretch'
				source={require('../../assets/images/qrCodeBtn.png')}/>
		)
	}
	return (
		<Svg width={64} height={64} viewBox="0 0 64 64" {...props}>
			<LinearGradient
				id="prefix__a"
				gradientUnits="userSpaceOnUse"
				y1={32}
				x2={64}
				y2={32}
			>
				<Stop offset={0} />
				<Stop offset={1} />
			</LinearGradient>
			<Path
				fill={props.color || '#404040'}
				d="M64 39.375V46.5a2.5 2.5 0 01-2.5 2.5h-6.858c-1.308 0-2.499-.941-2.629-2.242A2.5 2.5 0 0154.5 44H59v-4.483c0-1.308.941-2.499 2.242-2.629A2.5 2.5 0 0164 39.375zM29.758 27.112C31.059 26.982 32 25.79 32 24.483V19h2.5a2.5 2.5 0 002.5-2.5v-14A2.5 2.5 0 0034.242.013C32.941.143 32 1.334 32 2.641V4.5h-2.358c-1.308 0-2.499.941-2.629 2.242A2.5 2.5 0 0029.5 9.5H32V14h-2.5a2.5 2.5 0 00-2.5 2.5v8.125a2.5 2.5 0 002.758 2.487zm-27 9.75C4.059 36.732 5 35.54 5 34.233v-2.358h2.483c1.308 0 2.499-.941 2.629-2.242a2.5 2.5 0 00-2.487-2.758H2.5a2.5 2.5 0 00-2.5 2.5v5a2.5 2.5 0 002.758 2.487zm36.884-4.987h6.608v7.359c0 1.307.941 2.499 2.242 2.629a2.5 2.5 0 002.758-2.487v-2.5h2.483c1.308 0 2.499-.941 2.629-2.242a2.5 2.5 0 00-2.487-2.758H51.25v-2.5a2.5 2.5 0 00-2.5-2.5H39.5a2.5 2.5 0 00-2.487 2.758c.13 1.3 1.322 2.241 2.629 2.241zm22.48-4.925a2.507 2.507 0 00-3.047 3.047 2.484 2.484 0 001.803 1.803 2.507 2.507 0 003.047-3.047 2.484 2.484 0 00-1.803-1.803zm-22.88 9.938C37.941 37.018 37 38.21 37 39.517V44h-1.108c-1.308 0-2.499.941-2.629 2.242A2.5 2.5 0 0035.75 49h3.75a2.5 2.5 0 002.5-2.5v-7.125a2.5 2.5 0 00-2.758-2.487zM39.358 59H37v-2.5a2.5 2.5 0 00-2.5-2.5H32v-2.358c0-1.308-.941-2.499-2.242-2.629A2.5 2.5 0 0027 51.5v5a2.5 2.5 0 002.5 2.5H32v2.5a2.5 2.5 0 002.5 2.5h5a2.5 2.5 0 002.487-2.758C41.857 59.941 40.665 59 39.358 59zm10.129-5.258c-.13-1.301-1.322-2.242-2.629-2.242h-.965c-1.308 0-2.499.941-2.629 2.242a2.5 2.5 0 002.487 2.758H47a2.5 2.5 0 002.487-2.758zM61.358 59H59.5v-2.358c0-1.308-.941-2.499-2.242-2.629A2.5 2.5 0 0054.5 56.5V59h-4.858c-1.308 0-2.499.941-2.629 2.242A2.5 2.5 0 0049.5 64h12a2.5 2.5 0 002.487-2.758C63.857 59.941 62.665 59 61.358 59zm-31.6-17.513c1.301-.13 2.242-1.322 2.242-2.629v-4.483a2.5 2.5 0 00-2.5-2.5h-9v-2.359c0-1.307-.941-2.499-2.242-2.629a2.5 2.5 0 00-2.758 2.487v2.5h-1.108c-1.308 0-2.499.941-2.629 2.242a2.5 2.5 0 002.487 2.758H27V39a2.5 2.5 0 002.758 2.487zM0 17.5V5a5 5 0 015-5h12.5a5 5 0 015 5v12.5a5 5 0 01-5 5H5a5 5 0 01-5-5zM5 15a2.5 2.5 0 002.5 2.5H15a2.5 2.5 0 002.5-2.5V7.5A2.5 2.5 0 0015 5H7.5A2.5 2.5 0 005 7.5V15zM64 5v12.5a5 5 0 01-5 5H46.5a5 5 0 01-5-5V5a5 5 0 015-5H59a5 5 0 015 5zm-5 2.5A2.5 2.5 0 0056.5 5H49a2.5 2.5 0 00-2.5 2.5V15a2.5 2.5 0 002.5 2.5h7.5A2.5 2.5 0 0059 15V7.5zm-36.5 39V59a5 5 0 01-5 5H5a5 5 0 01-5-5V46.5a5 5 0 015-5h12.5a5 5 0 015 5zm-5 2.5a2.5 2.5 0 00-2.5-2.5H7.5A2.5 2.5 0 005 49v7.5A2.5 2.5 0 007.5 59H15a2.5 2.5 0 002.5-2.5V49z"
			/>
		</Svg>
	)
}

export default SvgComponent
