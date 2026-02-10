import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Modal,
  View,
  Platform,
  Text,
  Image,
  PermissionsAndroid,
  Linking,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';

var newStyles = BuildStyleOverwrite(Styles);

const CustomGalleryPopup = ({ showOrNot, onPressingOut, onPressingGallery, onPressingCamera }) => {
  const companyStyle = useSelector(getCompanyStyles);
  const dynamicStyles = companyStyle.value;
  newStyles = useMemo(() => createStyles(), [global.selectedLanguageCode]);

  const showPermissionAlert = (type) => {
    Alert.alert(
      translate('permission_required'),
      type === 'camera' ? translate('cameraDesc') : translate('galleryDesc'),
      [
        { text: translate('cancel'), style: 'cancel' },
        { text: translate('open_settings'), onPress: () => Linking.openSettings() },
      ],
      { cancelable: true }
    );
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const sdkVersion = Platform.Version;

        // Request camera permission
        const cameraResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );

        let storageResult = PermissionsAndroid.RESULTS.GRANTED;

        // For Android 13+ request READ_MEDIA_IMAGES
        if (sdkVersion >= 33) {
          storageResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
        } else if (sdkVersion >= 23) {
          // For Android 6 to 12, request WRITE_EXTERNAL_STORAGE
          storageResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
        }

        if (
          cameraResult === PermissionsAndroid.RESULTS.GRANTED &&
          storageResult === PermissionsAndroid.RESULTS.GRANTED
        ) {
          onPressingCamera(); // Call camera function
        } else if (
          cameraResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
          storageResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          showPermissionAlert('camera'); // Suggest open settings
        } else {
          showPermissionAlert('camera'); // Simple permission denied alert
        }
      } else if (Platform.OS === 'ios') {
        const status = await request(PERMISSIONS.IOS.CAMERA);

        if (status === RESULTS.GRANTED) {
          onPressingCamera();
        } else if (status === RESULTS.BLOCKED) {
          showPermissionAlert('camera');
        } else {
          showPermissionAlert('camera');
        }
      }
    } catch (error) {
      console.log('Camera Permission Error:', error);
    }
  };


  const requestGalleryPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        let permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const result = await PermissionsAndroid.request(permission);
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          onPressingGallery();
        } else {
          showPermissionAlert('gallery');
        }
      } else if (Platform.OS === 'ios') {
        const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
          onPressingGallery();
        } else {
          showPermissionAlert('gallery');
        }
      }
    } catch (error) {
      console.warn('Gallery Permission Error:', error);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showOrNot}
      onRequestClose={onPressingOut}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={onPressingOut}
        style={stylesSheet.overallContainer}
      >
        <TouchableWithoutFeedback>
          <View style={stylesSheet.subContainer}>
            <TouchableOpacity
              style={{ position: 'absolute', right: 0, top: 0, padding: 15, zIndex: 100 }}
              onPress={onPressingOut}
            >
              <Image
                source={require('../../src/assets/images/crossMark.png')}
                style={{ tintColor: dynamicStyles.iconPrimaryColor, height: 20, width: 20, resizeMode: 'contain' }}
              />
            </TouchableOpacity>

            <View style={stylesSheet.galleryImage}>
              <Text style={[stylesSheet.uploadText, { color: dynamicStyles.textColor }, newStyles['font_size_14_bold']]}>
                {translate('UploadImage')}
              </Text>

              <View style={stylesSheet.cameraOverallView}>
                <View style={stylesSheet.cameraView}>
                  <TouchableOpacity
                    onPress={requestCameraPermission}
                    style={[stylesSheet.viewTwentyOne, { backgroundColor: dynamicStyles.highLightedColor || 'rgba(237, 50, 55, 0.1)' }]}
                  >
                    <Image
                      source={require('../assets/images/cameraIcon.png')}
                      style={[stylesSheet.image3, { tintColor: dynamicStyles.primaryColor }]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={[stylesSheet.text11, newStyles['font_size_12_bold'], { color: dynamicStyles.textColor }]}>
                    {translate('camera')}
                  </Text>
                </View>

                <View style={stylesSheet.cameraView}>
                  <TouchableOpacity
                    onPress={requestGalleryPermission}
                    style={[stylesSheet.viewTwentyOne, { backgroundColor: dynamicStyles.highLightedColor || 'rgba(237, 50, 55, 0.1)' }]}
                  >
                    <Image
                      source={require('../assets/images/galleryIcon.png')}
                      style={[stylesSheet.image3, { tintColor: dynamicStyles.primaryColor }]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={[stylesSheet.text11, newStyles['font_size_12_bold'], { color: dynamicStyles.textColor }]}>
                    {translate('gallery')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const stylesSheet = StyleSheet.create({
  overallContainer: { flex: 1, backgroundColor: 'rgba(52,52,52,0.8)' },
  subContainer: { height: responsiveHeight(30), width: responsiveWidth(100), backgroundColor: '#fff', marginTop: 'auto', elevation: 5 },
  uploadText: { marginLeft: responsiveWidth(5), marginTop: responsiveHeight(4) },
  cameraOverallView: { flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(5), marginLeft: responsiveWidth(5) },
  cameraView: { alignItems: 'center', justifyContent: 'center' },
  viewTwentyOne: { height: responsiveHeight(8), width: responsiveWidth(16), alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginRight: responsiveWidth(10) },
  galleryImage: { flexDirection: 'column', justifyContent: 'space-around' },
  image3: { height: responsiveHeight(4), width: responsiveWidth(8) },
  text11: { marginRight: responsiveWidth(10), marginTop: responsiveHeight(2) },
});

export default CustomGalleryPopup;
