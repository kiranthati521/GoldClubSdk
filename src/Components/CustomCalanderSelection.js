
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  AppState,
  Appearance,
  Keyboard,
  Platform,
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const CustomCalendarSelection = (props) => {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const [isActive, setIsActive] = useState(false);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        setIsActive(false);
        setColorScheme(Appearance.getColorScheme());
      }
    };

    const appearanceListener = ({ colorScheme: newColorScheme }) => {
      if (global.isAndroid || global.colorScheme !== newColorScheme) {
        setIsActive(false);
        setColorScheme(Appearance.getColorScheme());
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    const appearanceSubscription = Appearance.addChangeListener(appearanceListener);

    return () => {
      appStateSubscription.remove();
      appearanceSubscription.remove();
    };
  }, []);

  return (
    <View
      style={[
        styles['centerItems'],
        props.width !== undefined ? props.width : styles['width_90%'],
      ]}
    >
      <View style={[styles['margin_bottom_5']]}>
        {props.labelName !== undefined && (
          <Text
            style={[
              { color: dynamicStyles.textColor },
              styles['font_size_14_regular'],
              styles['top_5'],
              { paddingLeft: 5 },
            ]}
          >
            {props.labelName}
            {props.IsRequired}
          </Text>
        )}
        <View
          style={[
            styles['flex_direction_row'],
            styles['width_100%'],
            styles['centerItems'],
          ]}
        >
          <TouchableOpacity
            style={[
              styles['width_100%'],
              styles['flex_direction_row'],
              { height: 45 },
              styles['top_10'],
              styles['border_width_1'],
              styles['border_radius_6'],
              { borderColor: Colors.lightish_grey }
            ]}
            onPress={() => {
              props.onFocus();
            }}
          >
            <TextInput
              style={[
                styles['font_size_14_regular'],
                styles['text_color_mid_grey'],
                styles['padding_left_10'],
                Platform.OS === 'ios' && styles['top_5'],
                styles['width_90%'],
              ]}
              value={props.value}
              placeholder={props.placeholder}
              placeholderTextColor={Colors.darkgrey}
              defaultValue={props.defaultValue}
              editable={props.editable}
              multiline={true}
              color={Colors.black}
              showSoftInputOnFocus={false}
              onFocus={() => {
                Keyboard.dismiss();
                props.onFocus();
              }}
              onEndEditing={(e) => {
                props.onEndEditing?.(e.nativeEvent.text);
              }}
            />

            <Image
              style={[
                styles['align_self_center'],
                styles['width_height_15'],
                {
                  right: Platform.OS === 'android' ? 5 : 8,
                  bottom: Platform.OS === 'android' ? 2 : undefined,
                },
              ]}
              source={require('../assets/images/ic_date.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CustomCalendarSelection;
