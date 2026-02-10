import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';
import { Text, View, Modal, Image, Dimensions, Platform } from 'react-native';

import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { Colors } from '../assets/Utils/Color';
import { createStyles } from '../assets/style/createStyles';

const { height, width } = Dimensions.get('window');

const DEFAULT_LOADER_IMAGE = require('../assets/images/neutralloader.gif');

var styles = BuildStyleOverwrite(Styles);

const CustomLoader = ({ loading = false, message = "Loading...", loaderImage = DEFAULT_LOADER_IMAGE, fromCropDiag = false }) => {
  const companyStyle = useSelector(getCompanyStyles);

  const [validatedLoaderSource, setValidatedLoaderSource] = useState(loaderImage);

  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const dynamicStyles = companyStyle.value;
  console.log("dynamicStyles", dynamicStyles)


  const normalizeFileUri = (path) => {
  if (!path) return null;
  return path.startsWith('file://') ? path : `file://${path}`;
};

  // useEffect(() => {

  //   console.log("dsdsdsd", dynamicStyles.loaderPath)
  //   console.log("sasasas", loaderImage)
  //   const dynamicPath = dynamicStyles.loaderPath;

  //   if (dynamicPath && dynamicPath.length > 0) {
  //      console.log("USING DYNAMIC LOADER:", dynamicPath); // <--- ADD THIS

  //     const fileUri = Platform.OS == 'android' ? `file://${dynamicPath}` : dynamicPath;
  //     setValidatedLoaderSource({ uri: fileUri });
  //   } else {
  //     console.log("USING FALLBACK LOADER:", loaderImage); // <--- ADD THIS
  //     setValidatedLoaderSource(loaderImage);
  //   }

  // }, [dynamicStyles.loaderPath, loaderImage]);

 useEffect(() => {
  const path = dynamicStyles?.loaderPath;

  if (path && path.length > 0) {
    const uri = path.startsWith('file://') ? path : `file://${path}`;

    setValidatedLoaderSource({
      uri,
      cache: 'reload',
    });
  } else {
    setValidatedLoaderSource(DEFAULT_LOADER_IMAGE);
  }
}, [dynamicStyles?.loaderPath]);


  return (
    <Modal
      supportedOrientations={['portrait', 'landscape']}
      transparent={true}
      animationType="fade"
      visible={loading}
      onRequestClose={() => { }}
    >
      <View style={[styles['justify_content_center'], { backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center" }]}>
        {fromCropDiag ?
          <Image
            source={require('../assets/images/plant_animation.gif')}
            style={[styles['justify_content_center'], styles['align_self_center'], styles['center_align_items'], { width: 150, height: 150, marginTop: -75 }]}
            resizeMode="contain"
          />
          :
          <Image
            key={validatedLoaderSource?.uri || 'default'}
            source={validatedLoaderSource}
            style={[styles['justify_content_center'], styles['align_self_center'], styles['center_align_items'], { width: 150, height: 150, marginTop: -75 }]}
            resizeMode="contain"
          />
          
          }
        <Text
          style={[
            styles['font_size_13_regular'],
            styles['padding_left_10'],
            styles['top_10'],
            styles['text_input'],
            styles['top_30'],
            { color: dynamicStyles.secondaryColor != undefined ? dynamicStyles.secondaryColor : Colors.white, textAlign: "center" }
          ]}
        >
          {message}
        </Text>
      </View>
    </Modal>
  );
};

export default CustomLoader;