import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Image, Platform } from 'react-native';
import { strings } from '../strings/strings';
import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Colors } from '../assets/Utils/Color';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const CustomBorderTextInput = forwardRef(({ labelName, defaultValue, value, placeholder, editable, contextMenuHidden, maxLength, onFocus, onChangeText, onEndEditing, keyboardType, textFiledWidth, leftSpace, autoCapitalize, IsRequired }, ref) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    return (
        <View style={[textFiledWidth == undefined || textFiledWidth == "" ? { width: '91%' } : { width: textFiledWidth, top: 10, marginBottom: 8, flex: 1 }]}>
            <View style={leftSpace == undefined || (leftSpace == "" && leftSpace != 0) ? { left: 15 } : { left: leftSpace }} removeClippedSubviews={true}>
                <View style={[styles['zindex_9999'], styles['absolute_position']]}>
                    <Text allowFontScaling={false} style={[styles['text_color_black'], styles['margin_top_minus_10'], styles['font_size_11_semibold'], styles['padding_5'], styles['bg_white'], styles['margin_left_15']]}>{labelName} {IsRequired != undefined && IsRequired ? <Text style={[styles['text_color_red'], styles['font_size_11_semibold']]}>{"*"}</Text> : ""}</Text>
                </View>

                <View style={[styles['flex_direction_row'], styles['width_99%'], styles['centerItems'], styles['top_5'], styles['border_width_1'], styles['border_color_light_grey'], styles['border_radius_6'], { justifyContent: 'space-around', elevation: Platform.OS == 'android' ? -2 : 0 }]}>
                    {labelName == translate('mobile_number') ? <Image style={[styles['margin_left_10'], styles['width_height_20']]} source={require('../assets/images/callGray.png')}></Image> : undefined}
                    {labelName == translate('mobile_number') ? <Text style={[styles['font_size_14_Regular'], styles['align_self_center'], { textAlign: 'center', width: '10%', marginLeft: 5, color: Colors.black }]}>{translate('countery_code')}</Text> : undefined}
                    <TextInput
                        style={[styles['text_color_black'],
                        styles['font_size_14_Regular'], styles['padding_horizontal_5'],
                        (labelName == translate('address') && Platform.OS === 'ios') && {paddingTop:12},
                        // {paddingTop : 15},
                        { width: labelName == translate('mobile_number') ? "80%" : "95%", height: labelName == translate('address') && value?.length > 50 ? 100 : 45 }]}
                        defaultValue={defaultValue}
                        value={value}
                        ref={ref ? ref : undefined}
                        keyboardType={keyboardType}
                        placeholder={placeholder}
                        placeholderTextColor={Colors.darkgrey}
                        underlineColorAndroid="transparent"
                        editable={editable}
                        contextMenuHidden={contextMenuHidden}
                        multiline={labelName == translate('address') ?true : false}
                        autoCapitalize={autoCapitalize}
                        onFocus={() => {
                            onFocus()
                        }}
                        onChangeText={(text) => {
                            onChangeText(text)
                        }}
                        onEndEditing={(text) => {
                            onEndEditing(text)
                        }}
                        maxLength={maxLength}
                        allowFontScaling={true}>
                    </TextInput>
                </View>
            </View>
        </View>
    )
});

export default CustomBorderTextInput;