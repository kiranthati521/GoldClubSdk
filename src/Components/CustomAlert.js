import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import CustomButton from './CustomButton';
import { ROLENAME, retrieveData } from '../assets/Utils/Utils';
import { createStyles } from '../assets/style/createStyles';


var styles = BuildStyleOverwrite(Styles);

const CustomAlert = ({ onPressClose, title, showHeader, showHeaderText, message, onPressOkButton, onPressNoButton, showYesButton, showNoButton, yesButtonText, noButtonText, showCloseIcon }) => {
    const companyStyle = useSelector(getCompanyStyles);
      styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const dynamicStyles = companyStyle.value;
    let checkRole = async()=>{
        const roleTypeDetails = await retrieveData(ROLENAME)
        return roleTypeDetails
    }

    return (
        <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
            <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], styles['padding_10'], { borderRadius: 8 }]}>
                {showHeader && <View style={[styles['width_100%'], { flexDirection: 'row', justifyContent: 'space-between' }]}>
                    {showHeaderText && (<Text style={[styles['width_100%'], styles['font_size_18_semibold'], styles['top_5'], { textAlign: 'center', color: Colors.black,lineHeight:25 }]} >{title}</Text>)}
                    {showCloseIcon != undefined && <View style={[styles['width_100%'], styles['absolute_position'], { height: 30 }]}>
                        {showCloseIcon && <TouchableOpacity style={[styles['width_height_30'], { padding: 5, alignSelf: 'flex-end', marginRight: 10 }]} onPress={onPressClose}>
                            <Image style={[styles['height_100%'], styles['width_100%'], { padding: 5, alignSelf: 'flex-end', tintColor: 'red' }]} source={require('../assets/images/close.png')} />
                        </TouchableOpacity>}
                    </View>}
                </View>}

                <Text style={[styles['text_align_center'], styles['padding_left_10'], styles['top_20'], styles['text_color_black'], styles['font_size_14_regular']]}>
                    {message}
                </Text>
                <View style={[styles['margin_top_20'], { flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                    {showYesButton && <CustomButton title={yesButtonText} onPress={onPressOkButton} buttonBg={dynamicStyles.primaryColor != undefined ? dynamicStyles.primaryColor : Colors.purple} btnWidth={showNoButton ? "45%" : '95%'} titleTextColor={dynamicStyles.secondaryColor != undefined ? dynamicStyles.secondaryColor :Colors.white} />}
                    {(showYesButton && showNoButton) && <CustomButton title={noButtonText} onPress={onPressNoButton} buttonBg={""} btnWidth={showYesButton ? "45%" : '95%'} titleTextColor={checkRole() !== 'Retailer' ? dynamicStyles.primaryColor  : dynamicStyles.iconPrimaryColor} borderWidth={2} borderColor={checkRole() !== 'Retailer' ? dynamicStyles.primaryColor  : dynamicStyles.iconPrimaryColor} borderRadius={5} />}
                    {(showYesButton == false && showNoButton) && <CustomButton title={noButtonText} onPress={onPressNoButton} buttonBg={dynamicStyles.primaryColor} btnWidth={showYesButton ? "45%" : '95%'} titleTextColor={dynamicStyles.secondaryColor} />}
                </View>
            </View>
        </View>
    );
}

export default CustomAlert;