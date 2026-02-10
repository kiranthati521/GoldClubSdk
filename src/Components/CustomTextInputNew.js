import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Platform, Image } from 'react-native';
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

function CustomTextInputNew({ props, labelName, IsRequired, defaultValue, value, placeholder, editable, contextMenuHidden, maxLength, onFocus, onChangeText, onEndEditing, keyboardType, textFiledWidth, leftSpace, autoCapitalize }) {
    const getUserData = useSelector(selectUser);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    return (
        <View style={textFiledWidth == undefined || textFiledWidth == "" ? { width: '91.5%' } : { width: textFiledWidth, top: 10, marginBottom: 8 }}>
            <View style={leftSpace == undefined || (leftSpace == "" && leftSpace != 0) ? { left: Platform.OS == 'android' ? 8 : 10 } : { left: leftSpace }} removeClippedSubviews={true}>
                <Text style={[styles['font_size_14_regular'],{color:dynamicStyles?.textColor ?? Colors.black},
                styles['margin_left_10'], { marginLeft: 15 }]}>{labelName} {IsRequired && <Text style={[styles['text_color_red']]}>*</Text>}</Text>

                <View
                    style={[styles['flex_direction_row'], styles['flexGrow_1'], styles['centerItems'], styles['top_5'], styles['border_radius_6'],{backgroundColor:'white'},
                    {
                        borderColor: Colors.lightish_grey, borderWidth: 1, justifyContent: 'space-around', width: "100%",
                        marginLeft: 15,
                        marginVertical:0.3
                    }]}>
                    {/* {labelName == translate('mobile_number') ? <Text style={[styles['font_size_14_regular'], styles['align_self_center'], { textAlign: 'center', width: '10%', marginLeft: 5, color:dynamicStyles?.textColor ?? Colors.black }]}>{translate('countery_code')}</Text> : undefined} */}
                    {/* styles['bg_white'], */}
                    <TextInput
                        style={[{color:dynamicStyles?.textColor ?? Colors.black},
                        labelName === translate('mobile_number') ? [{textAlignVertical: 'center',marginTop:1},styles['font_size_12_regular']] : styles['font_size_14_regular'],
                        { padding: 0, paddingLeft: 0,backgroundColor:'white', width: labelName == translate('mobile_number') ? "85%" : "95%", height: 50 }]}
                        defaultValue={defaultValue}
                        value={value}
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
                    {labelName == translate('mobile_number') ? <Image source={require('../assets/images/mobile_img.png')} style={[styles['width_height_20']]} resizeMode='contain'/> : undefined}
                </View>
            </View>
        </View>
    )
}
export default CustomTextInputNew;