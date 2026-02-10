import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, Modal, Image, Dimensions, Platform } from 'react-native';

import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { Colors } from '../assets/Utils/Color';
import { createStyles } from '../assets/style/createStyles';

const { height, width } = Dimensions.get('window');
let styles = BuildStyleOverwrite(Styles);

const CustomLoaderDefault = ({
  uriSent = false,              // true if loader comes from server
  loading = false,              // show/hide loader
  message = "Loading...",       // loader text
  loaderImage = require('../assets/images/neutralloader.gif'), // local fallback
}) => {
  // Dynamic styles for language change
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);

  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const dynamicStyles = companyStyle.value;

  // Determine the image source
  let imageSource = loaderImage;
console.log('uiuuuiu',uriSent + " "+dynamicStyles?.loaderPath)
  if (!uriSent && dynamicStyles?.loaderPath) {
    // Use downloaded GIF from server
    imageSource = { uri: "file://" + dynamicStyles.loaderPath };
  } else if (uriSent && typeof loaderImage === 'string') {
    console.log("else if")
    // Remote URL
    imageSource = { uri: loaderImage };
  }

  return (
    <Modal
      supportedOrientations={['portrait', 'landscape']}
      transparent={true}
      animationType="fade"
      visible={loading}
      onRequestClose={() => console.log('close modal')}
    >
      <View
        style={[
          styles['justify_content_center'],
          {
            backgroundColor: "#000000d6",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
          },
        ]}
      >
        <Image
          source={imageSource}
          style={{
            width: 150,
            height: 150,
            marginTop: -75,
            alignSelf: "center",
          }}
          resizeMode="contain"
        />

        <Text
          style={[
            styles['font_size_13_regular'],
            styles['textAlignCenter'],
            styles['padding_left_10'],
            styles['top_30'],
            { color: Colors.white, textAlign: "center" },
          ]}
        >
          {message}
        </Text>
      </View>
    </Modal>
  );
};

export default CustomLoaderDefault;
