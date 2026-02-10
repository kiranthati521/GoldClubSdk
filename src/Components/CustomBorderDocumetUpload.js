import { useDispatch, useSelector } from 'react-redux';
import React, { forwardRef, useMemo, useState } from 'react';
import { View, Text, TextInput, Image, Platform, TouchableOpacity } from 'react-native';
import { strings } from '../strings/strings';
import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Colors } from '../assets/Utils/Color';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const CustomBorderDocumetUpload = forwardRef(({ labelName, defaultValue, value, placeholder, editable, contextMenuHidden, maxLength, onFocus, onChangeText, onEndEditing, keyboardType, textFiledWidth, leftSpace, autoCapitalize, IsRequired, imageData, onClickDocUp }, ref) => {
    const getUserData = useSelector(selectUser);
      styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    return (
        <View style={[textFiledWidth == undefined || textFiledWidth == "" ? { width: '91%' } : { width: textFiledWidth, top: 10, marginBottom: 8, flex: 1 }]}>
            <View style={leftSpace == undefined || (leftSpace == "" && leftSpace != 0) ? { left: 15 } : { left: leftSpace }} removeClippedSubviews={true}>
                <View style={[styles['zindex_9999'], styles['absolute_position']]}>
                    <Text allowFontScaling={false} style={[{color:dynamicStyles.textColor}, styles['margin_top_minus_10'], styles['font_size_11_semibold'], styles['padding_5'], styles['bg_white'], styles['margin_left_15']]}>{labelName} {IsRequired != undefined && IsRequired ? <Text style={[styles['text_color_red'], styles['font_size_11_semibold']]}>{"*"}</Text> : ""}</Text>
                </View>

                <View style={[styles['flex_direction_row'], styles['width_99%'], styles['centerItems'], styles['top_5'], styles['border_width_1'], styles['border_color_light_grey'], styles['border_radius_6'], { justifyContent: 'space-around', elevation: Platform.OS == 'android' ? -2 : 0 }]}>
                    {labelName == translate('mobile_number') ? <Image style={[styles['margin_left_10'], styles['width_height_20']]} source={require('../assets/images/callGray.png')}></Image> : undefined}
                    {labelName == translate('mobile_number') ? <Text style={[styles['font_size_14_regular'], styles['align_self_center'], { textAlign: 'center', width: '10%', marginLeft: 5, color: dynamicStyles.textColor }]}>{translate('countery_code')}</Text> : undefined}
                    <TextInput
                        style={[{color:dynamicStyles.textColor},
                        styles['font_size_11_regular'], styles['padding_horizontal_5'],
                        { width: '80%', height: 40 , padding : 10}]}
                        defaultValue={defaultValue}
                        value={value}
                        ref={ref ? ref : undefined}
                        keyboardType={keyboardType}
                        placeholder={placeholder}
                        placeholderTextColor={Colors.darkgrey}
                        underlineColorAndroid="transparent"
                        editable={editable}
                        contextMenuHidden={contextMenuHidden}
                        multiline={false}
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
                    <TouchableOpacity style={[{ height: 25, width: 25 }]} onPress={onClickDocUp}>
                        <Image resizeMode='contain' style={[{ height: '100%', width: '100%', tintColor: imageData != undefined && imageData ? dynamicStyles.iconPrimaryColor : Colors.grey }]} source={require('../assets/images/panIcon.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
});

export default CustomBorderDocumetUpload;