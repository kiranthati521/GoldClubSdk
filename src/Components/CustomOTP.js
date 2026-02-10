import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, TextInput } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);
function CustomOTP(props) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    useEffect(() => { setOtp(['', '', '', '', '', '']) }, [props.resetOTP])

    useEffect(() => {
        if (props?.otpValues) {
            setOtp(props?.otpValues);
        }
    }, [props?.otpValues]);

    // useEffect(() => {
    //     console.log(props?.otpValues,"sdfsdfsdfmsdfkldsfklsfdlksdkllkds")
    //     if (props?.otpValues?.length > 1) {
    //         inputRefs.current[0]?.focus();
    //         setOtp(props?.otpValues);
    //         props?.otpValues?.forEach((value, index) => {
    //             if (value && inputRefs.current[index + 1]) {
    //                 inputRefs.current[index + 1].focus();
    //             }
    //         });
    //     }
    // }, [props?.otpValues]);
    


    const handleChange = (index, value) => {
        if (/^[0-9]*$/.test(value) && value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyPress = (index, key) => {
        if (key === 'Backspace' && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    useEffect(() => {
        const isValid = otp.every(element => element && element >= 0 && element <= 9);
        if (isValid) {
            props?.onEndEditting(otp.join(''))
        }
    }, [otp])
    return (

        <View style={[styles['flex_direction_row'], styles['width_100%'], styles['space_evenly']]}>
            {otp.map((value, index) => (
                <TextInput
                    key={index}
                    style={[styles['font_size_12_regular'],{ borderWidth: 1, borderColor: Colors.lightish_grey, borderRadius: 10, color: 'black', paddingHorizontal: 10, marginHorizontal: 5, width: Platform.OS === 'android' ? 40 : 45, height: Platform.OS === 'android' ? 40 : 45, textAlign: 'center' }]}
                    value={value}
                    onChangeText={(text) => handleChange(index, text)}
                    onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                    keyboardType="numeric"
                    maxLength={1}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                />
            ))}
        </View>
    )


}

export default CustomOTP;