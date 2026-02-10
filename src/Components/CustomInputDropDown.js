import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
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
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { createStyles } from '../assets/style/createStyles';
import { translate } from '../Localisation/Localisation';

var styles = BuildStyleOverwrite(Styles);
const CustomInputDropDown = (props) => {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
    }
  };

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    const appearanceListener = Appearance.addChangeListener(({ colorScheme }) => {
      if (global.isAndroid || global.colorScheme !== colorScheme) {
      }
    });

    return () => {
      appStateListener.remove();
      appearanceListener.remove();
    };
  }, []);

  return (
    <View style={[styles['centerItems'], props.width !== undefined ? props.width : styles['width_90%']]}>
      <View style={[styles['margin_bottom_5']]}>
        {props.labelName !== undefined && (
          <Text
            style={[{ color: dynamicStyles?.textColor ?? Colors.black }, styles['font_size_14_regular'], styles['left_2'], { marginLeft: 0 }, styles['top_5'], Platform.OS === 'ios' && { minHeight: 25 }]}
          >
            {props.labelName} {props.IsRequired && (<Text style={[styles['text_color_red']]}> {"*"}</Text>)}
          </Text>
        )}
        <View style={[styles['flex_direction_row'], styles['width_100%']]}>
          <TouchableOpacity
            style={[styles['width_100%'], styles['flex_direction_row'],
            // styles['bg_white'],
            props?.disabled && { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
            styles['top_10'], styles['border_width_1'], styles['border_radius_6'], { borderColor: Colors.lightish_grey, height: 45 }]}
            onPress={props.onFocus}
          >
            <TextInput
              style={[styles['font_size_14_regular'],
              props?.disabled && { backgroundColor: 'rgba(0, 0, 0, 0.0)' },
              { color: dynamicStyles?.textColor ?? Colors.black },
              styles['padding_left_10'], styles['width_92%'], { color: Colors.mid_grey, padding: 0 }]}
              value={props.value ? props.value : props.defaultValue}
              placeholder={props.placeholder}
              placeholderTextColor={props.placeholderTextColor !== undefined ? props.placeholderTextColor : "#B4B4B4"}
              defaultValue={props.defaultValue}
              editable={props.editable}
              selection={{ start: 0, end: 0 }}
              ellipsizeMode="tail"
              numberOfLines={1}
              multiline={false}
              autoCorrect={false}
              color={(props?.defaultValue == translate('select') || props?.defaultValue == translate('crop')) ? Colors.grey : Colors.black}
              showSoftInputOnFocus={false}
              onFocus={() => {
                Keyboard.dismiss();
                props.onFocus();
              }}
              onEndEditing={(e) => {
                props.onEndEditing && props.onEndEditing(e);
              }}
            />
          </TouchableOpacity>
        </View>
        <View style={[
          props?.disabled && { backgroundColor: 'rgba(0, 0, 0, 0.0)' },
          styles['absolute_position'],
          {
            right: 10,
            top: 55,   // <<< iOS FIX → Perfect vertical position
          },
        ]}>
          <Image
            style={[{ width: 14, height: (Platform.OS === 'android') ? 8 : 8 },]}
            source={require('../assets/images/grayDownArrow.png')}
          />
        </View>
      </View>
    </View>
  );
};

export default CustomInputDropDown;
