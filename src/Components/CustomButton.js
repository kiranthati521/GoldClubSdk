import React, { useMemo } from 'react';
import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Text, TouchableOpacity, View, Image, ActivityIndicator, Platform } from 'react-native';
import { Colors } from '../assets/Utils/Color';
import { createStyles } from '../assets/style/createStyles';


var styles = BuildStyleOverwrite(Styles);
const CustomButton = ({ shouldDisable, title, onPress, buttonBg, btnWidth, titleTextColor, textAlign, margin,
    isBoldText, underLine, showCall, showArrow, borderWidth, borderRadius, borderColor, addIcon, enableLoader, activeOpacity = 1 }) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);

    return (
        <View style={[{ opacity: activeOpacity }, buttonBg == 'transparent' ? undefined : margin == undefined ? styles['margin_10'] : margin, styles['button_height_45'], styles['alignItems_center'], styles['centerItems'], { width: btnWidth, borderWidth: borderWidth != undefined ? borderWidth : 0, borderRadius: borderRadius != undefined ? borderRadius : 0, borderColor: borderColor != undefined ? borderColor : Colors.white }]}>
            <TouchableOpacity disabled={shouldDisable ? true : false} style={[
                styles['height_100%'],
                // {padding:10},
                btnWidth != undefined ? styles['width_100%'] : styles['width_95%'], styles['border_radius_8'], styles['justify_content_center'], styles['align_self_center'], { backgroundColor: buttonBg }]} onPress={onPress}>
                {showCall != undefined ? <Image style={[styles['width_height_30'], styles['absolute_position'], styles['margin_left_10']]} source={require('../assets/images/callIconWhite.png')}></Image> : undefined}
                {showArrow != undefined ? <Image style={[styles['width_height_10'], styles['absolute_position'], styles['right_10'], styles['tint_color_white']]} source={require('../assets/images/rightArrowSmall.png')}></Image> : undefined}
                {enableLoader ? <ActivityIndicator color={'white'} /> :
                    <Text style={[underLine != undefined ? styles['text_underline'] : undefined, [textAlign == 'left' ? undefined : styles['text_align_center'], buttonBg == 'transparent' ? undefined : styles['margin_10'], (isBoldText == undefined) ? styles['font_size_14_semibold'] : styles['font_size_14_semibold'], { color: titleTextColor, left: showCall != undefined ? 15 : 0, lineHeight: 20, }]]} numberOfLines={2} >{title}</Text>}
                {addIcon && <Image source={require('../assets/images/whatsappIcon.png')} style={{ height: 30, width: 30, resizeMode: "contain", position: "absolute", right: 5, top: 5 }} />}
            </TouchableOpacity>
        </View>
    )
}

export default CustomButton;