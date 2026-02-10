import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    AppState,
    Appearance,
    Keyboard,
    Platform
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';

import { createStyles } from '../assets/style/createStyles';

var newStyles = BuildStyleOverwrite(Styles);

const CustomBorderInputDropDown = (props) => {
    newStyles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const [styles, setStyles] = useState(newStyles);
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
    const [isActive, setIsActive] = useState(false);
     const getUserData = useSelector(selectUser);
      const companyStyle = useSelector(getCompanyStyles);
      const [dynamicStyles,setDynamicStyles] = useState(companyStyle.value);

      console.log("props", JSON.stringify(props))

    const handleAppStateChange = useCallback((nextAppState) => {
        if (nextAppState === 'active') {
            setStyles(newStyles);
            setIsActive(false);
            setColorScheme(Appearance.getColorScheme());
        }
    }, []);

    const handleAppearanceChange = useCallback(({ colorScheme: newColorScheme }) => {
        if (global.isAndroid || global.colorScheme !== newColorScheme) {
            setStyles(newStyles);
            setIsActive(false);
            setColorScheme(newColorScheme);
        }
    }, []);

    useEffect(() => {
        const appStateListener = AppState.addEventListener('change', handleAppStateChange);
        const appearanceListener = Appearance.addChangeListener(handleAppearanceChange);

        return () => {
            appStateListener.remove();
            appearanceListener.remove();
        };
    }, [handleAppStateChange, handleAppearanceChange]);

    return (
        <View
            style={[
                styles['centerItems'],
                props.width !== undefined ? props.width : styles['width_93%'],
                { left: -3 }
            ]}>
            <View style={[styles['margin_bottom_5']]}>
                {props.labelName !== undefined && (
                    <Text
                        style={[
                            styles['text_color_black'],
                            styles['absolute_position'],
                            styles['margin_top_minus_10'],
                            styles['margin_left_15'],
                            styles['font_size_11_semibold'],
                            styles['zindex_9999'],
                            styles['bg_white'],
                            styles['padding_5']
                        ]}>
                        {props.labelName}
                        {props.IsRequired && (
                            <Text style={[styles['text_color_red']]}> {"*"}</Text>
                        )}
                    </Text>
                )}
                <View style={[styles['flex_direction_row'], styles['width_99%']]}>
                    <TouchableOpacity
                        style={[
                            styles['width_100%'],
                            styles['flex_direction_row'],
                            styles['button_height_45'],
                            styles['bg_white'],
                            styles['top_5'],
                            styles['border_width_1'],
                            styles['border_radius_6'],
                            styles['border_color_light_grey'],
                            props?.disabled && {backgroundColor:'rgba(0, 0, 0, 0.05)'},
                        ]}
                        onPress={() => {
                            props.onFocus();
                        }}>
                        <TextInput
                            style={[
                                styles['font_size_12_regular'],
                                // styles['text_color_black'],
                                { color : dynamicStyles?.textColor ?? Colors.black },
                                props?.disabled && {backgroundColor:'rgba(0, 0, 0, 0.0)'},
                                styles['padding_left_10'],
                                Platform.OS === 'ios' && styles['top_3'],
                                styles['width_92%'],
                                { color: Colors.mid_grey, padding: 0 }
                            ]}
                            value={props.value}
                            placeholder={props.placeholder}
                            placeholderTextColor={
                                props.placeholderTextColor !== undefined
                                    ? props.placeholderTextColor
                                    : '#B4B4B4'
                            }
                            defaultValue={props.defaultValue}
                            editable={props.editable}
                            selection={{ start: 0, end: 0 }}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                            multiline={false}
                            autoCorrect={false}
                            color={Colors.black}
                            showSoftInputOnFocus={false}
                            onFocus={() => {
                                Keyboard.dismiss();
                                props.onFocus();
                            }}
                            onEndEditing={(text) => {
                                props.onEndEditing && props.onEndEditing(text);
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View
                    style={[
                        styles['right_10'],
                        styles['align_items_flex_end'],
                        styles['absolute_position'],
                        styles['margin_top_22']
                    ]}>
                   {!props?.disabled &&  <Image
                        style={{
                            width: 14,
                            height: Platform.OS === 'android' ? 8 : 7
                        }}
                        source={require('../assets/images/grayDownArrow.png')}
                    />}
                </View>
            </View>
        </View>
    );
};

export default CustomBorderInputDropDown;
