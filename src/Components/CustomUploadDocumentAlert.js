import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, Image, Dimensions, Platform, PermissionsAndroid, Modal, FlatList } from 'react-native';
import { check, PERMISSIONS } from 'react-native-permissions';
import { pick, isCancel, types } from '@react-native-documents/picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import DeviceInfo from 'react-native-device-info';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { strings } from '../strings/strings';
import { requestMultiplePermissions } from '../assets/Utils/Utils';
import CustomButton from './CustomButton';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';




var styles = BuildStyleOverwrite(Styles)

const CustomUploadDocumentAlert = ({ onPressClose, documentTitle, documentButtonText, documentName, selectedImageUri, onPressUploadButton, documentObject, moduleName }) => {
    const [selectionModal, setSelectionModal] = useState(false)
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const [showPermissionAlert, setShowPermissionAlert] = useState({
        showAlert: false,
        strMessage: '',
        strYesBtnText: translate('enable'),
        strNoBtnText: translate('cancel'),
        showYesBtn: true,
        showCancelBtn: true
    })
    // const {showAlert, strMessage, strYesBtnText,strNoBtnText,showYesBtn,showCancelBtn} = showPermissionAlert;
    const [documentTypes, setDocumentTypes] = useState([
        { title: translate('camera'), id: 1 },
        { title: translate('gallery'), id: 2 },
        { title: translate('pdf'), id: 3 },
    ])

    const [selectedImage, setSelectedImage] = useState(require('../assets/images/ic_document.png'))

    useEffect(() => {
        if (moduleName == translate('stockinWard')) {
            setDocumentTypes(prevOptions => prevOptions.slice(0, -1))
        }
        if (selectedImageUri != "") {
            setSelectedImage({ uri: selectedImageUri })
        }
    }, [])
    const pickItemToUpload = async () => {
        try {
            const res = await pick({
                allowMultiSelection: false, // single file
                type: [types.pdf, types.xls, types.xlsx], // supported formats
            });

            if (res && res.length > 0) {
                const file = res[0];
                documentObject(file); // your custom handler
                console.log('res : ' + JSON.stringify(file));
            }
        } catch (err) {
            if (isCancel(err)) {
                console.log('Canceled from single doc picker');
            } else {
                console.log('Unknown Error: ' + JSON.stringify(err));
                throw err;
            }
        }
    };
    const requestPermissions = async () => {
        if (Platform.OS == 'android') {
            const androidVersion = await DeviceInfo.getSystemVersion();
            if (androidVersion >= 13) {
                var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES]);
                if (result['android.permission.CAMERA'] && result['android.permission.READ_MEDIA_IMAGES']) {
                    // pickItemToUpload()
                    setSelectionModal(true)
                } else {
                    requestPermissions()
                }
            } else {
                var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]);
                if (result['android.permission.CAMERA'] && result['android.permission.READ_EXTERNAL_STORAGE'] && result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted') {
                    // pickItemToUpload()
                    setSelectionModal(true)
                } else {
                    requestPermissions()
                }
            }
        }
        else {
            if (Platform.OS == 'ios') {
                let status = await check(PERMISSIONS.IOS.CAMERA)
                if (status == "blocked" || status == "denied") {
                    showAlertWithMessage(translate('alert'), true, true, translate('camera_permission_ios'), true, true, translate('enable'), translate('cancel'))
                    return;
                }
                else {
                    setSelectionModal(true)
                }
            }
        }
    }
    const showImageFilePickOptions = () => {
        if (selectionModal) {
            return (
                <Modal transparent={true} animationType='slide' visible={true} onRequestClose={() => { console.log('close modal') }}>
                    <View style={{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }} onStartShouldSetResponder={() => { }}>
                        <View style={[styles['width_100%'], { height: 230 }, styles['absolute_position'], styles['bottom_0'], styles['centerItems'], styles['border_top_left_radius_circle'], styles['border_top_right_radius_circle']]}>
                            <FlatList
                                data={documentTypes}
                                renderItem={({ item, index }) => _listItem(item, index)}
                                keyExtractor={(item, index) => index.toString()}
                                horizontal={false}
                                scrollEnabled={false}
                                style={[styles['top_20'], styles['width_100%']]}
                            />

                            <TouchableOpacity style={[styles['width_90%'], styles['bg_white'], styles['height_50'], styles['centerItems'], styles['margin_bottom_10']]} onPress={() => { setSelectionModal(false) }}>
                                <Text style={[styles['font_size_14_regular'], styles['text_color_red'], styles['text_align_center'], styles['margin_5'],]}>{translate('cancel')}</Text>
                                <View style={[styles['light_grey_bg_color'], styles['height_1'], styles['width_95%'], styles['centerItems'], styles['absolute_position'], styles['bottom_1']]}></View>

                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )
        }
    }

    const _listItem = (item, index) => {
        return (
            <TouchableOpacity key={index.toString()} style={[styles['width_90%'], styles['bg_white'], styles['height_50'], styles['centerItems']]} onPress={() => { onPressItems(item) }}>
                <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['text_align_center'], styles['margin_5'],]}>{item.title}</Text>
                <View style={[styles['bg_grey'], styles['height_1'], styles['width_95%'], styles['centerItems'], styles['absolute_position'], styles['bottom_1'], { top: -1 }]}></View>
            </TouchableOpacity>
        )
    }

    const onPressItems = (item) => {
        setSelectionModal(false)
        setTimeout(() => {
            if (item.id == 1) {
                openCamera()
            } else if (item.id == 2) {
                openImagePicker()
            } else {
                pickItemToUpload()
            }
        }, 1000);
    }

    const openCamera = async () => {
        if (Platform.OS == 'ios') {
            let status = await check(PERMISSIONS.IOS.CAMERA)
            if (status == "blocked" || status == "denied") {
                setTimeout(() => {
                    showCustomAlert(true, translate('camera_permission_ios'), translate('enable'), translate('cancel'), true, true)
                }, 500);
                return;
            }
        }
        else {
            let status = await check(PERMISSIONS.ANDROID.CAMERA)
            let storagePermission;
            const androidVersion = DeviceInfo.getSystemVersion();

            if (androidVersion >= 13) {

                const permissionsToRequest = [
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                ];

                let grantedPermissions = await requestMultiplePermissions(permissionsToRequest)
                console.log("grantedPermissions---1", JSON.stringify(grantedPermissions))
                console.log("grantedPermissions---1", JSON.stringify(grantedPermissions[permissionsToRequest[0]]))
                console.log("grantedPermissions---2", JSON.stringify(grantedPermissions[permissionsToRequest[1]]))

                if (grantedPermissions[permissionsToRequest[0]] != "granted" || grantedPermissions[permissionsToRequest[1]] != "granted") {
                    return
                }
            } else {

                const permissionsToRequest = [
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                ];
                let grantedPermissions = await requestMultiplePermissions(permissionsToRequest)
                console.log("grantedPermissions---1", JSON.stringify(grantedPermissions))
                console.log("grantedPermissions---1", JSON.stringify(grantedPermissions[permissionsToRequest[0]]))
                console.log("grantedPermissions---2", JSON.stringify(grantedPermissions[permissionsToRequest[1]]))
                if (grantedPermissions[permissionsToRequest[0]] != "granted" || grantedPermissions[permissionsToRequest[1]] != "granted"
                    || grantedPermissions[permissionsToRequest[2]] != "granted") {
                    return
                }
            }
        }

        var image = await ImageCropPicker.openCamera({
            cropping: false,
            includeBase64: false,
            compressImageQuality: 1.0,
            mediaType: 'photo'
        })
        var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
        console.log(response)
        setSelectedImage({ uri: response.uri })
        documentObject(response)
    }

    const openImagePicker = async () => {
        if (Platform.OS == 'ios') {
            let status = await check(PERMISSIONS.IOS.CAMERA)
            if (status == "blocked" || status == "denied") {
                setTimeout(() => {
                    showCustomAlert(true, translate('camera_permission_ios'), translate('enable'), translate('cancel'), true, true)
                }, 500);
                return;
            }
        }
        else {
            let status = await check(PERMISSIONS.ANDROID.CAMERA)
            const androidVersion = await DeviceInfo.getSystemVersion();
            let storagePermission = '';

            if (androidVersion >= 13) {

                const permissionsToRequest = [
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                ];

                let grantedPermissions = await requestMultiplePermissions(permissionsToRequest)
                console.log("grantedPermissions---1", JSON.stringify(grantedPermissions))
                console.log("grantedPermissions---1", JSON.stringify(grantedPermissions[permissionsToRequest[0]]))
                console.log("grantedPermissions---2", JSON.stringify(grantedPermissions[permissionsToRequest[1]]))

                if (grantedPermissions[permissionsToRequest[0]] != "granted" || grantedPermissions[permissionsToRequest[1]] != "granted") {
                    return
                }
            } else {

                const permissionsToRequest = [
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                ];
                let grantedPermissions = await requestMultiplePermissions(permissionsToRequest)
                console.log("grantedPermissions---1", JSON.stringify(grantedPermissions))
                console.log("grantedPermissions---1", JSON.stringify(grantedPermissions[permissionsToRequest[0]]))
                console.log("grantedPermissions---2", JSON.stringify(grantedPermissions[permissionsToRequest[1]]))
                if (grantedPermissions[permissionsToRequest[0]] != "granted" || grantedPermissions[permissionsToRequest[1]] != "granted"
                    || grantedPermissions[permissionsToRequest[2]] != "granted") {
                    return
                }
            }
        }

        var image = await ImageCropPicker.openPicker({
            cropping: false,
            includeBase64: false,
            compressImageQuality: 1.0,
            mediaType: 'photo'
        })
        var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
        console.log(response)
        setSelectedImage({ uri: response.uri })
        documentObject(response)
    }


    const showCustomAlert = (showAlert, strMessage, yesBtnText, noBtnText, showYesBtn, showNoButton) => {
        showPermissionAlert.showAlert = showAlert
        showPermissionAlert.strMessage = strMessage
        showPermissionAlert.strYesBtnText = yesBtnText
        showPermissionAlert.strNoBtnText = noBtnText
        showPermissionAlert.showYesBtn = showYesBtn
        showPermissionAlert.showCancelBtn = showNoButton
        setShowPermissionAlert(showPermissionAlert)
    }

    return (
        <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
            <View style={[styles['width_80%'], styles['height_40%'], styles['align_self_center'], styles['bg_white'], styles['padding_10'], styles['border_radius_8']]}>
                <Text style={[styles['width_100%'], styles['text_color_black'], styles['text_align_center'], styles['margin_top_30'], styles['font_size_14_semibold'], { textAlign: 'center', fontSize: 16 }]} >{documentTitle}</Text>
                <View style={[styles['width_100%'], styles['absolute_position'], styles['height_30'], { right: -20, top: -10 }]}>
                    <TouchableOpacity style={[styles['width_height_30'], styles['margin_right_10'], styles['padding_5'], styles['align_self_flex_end']]} onPress={onPressClose}>
                        <Image style={[styles['height_100%'], styles['width_100%'], styles['padding_5'], styles['align_self_flex_end'], styles['tint_color_red']]} source={require('../assets/images/cancel.png')} />
                    </TouchableOpacity>
                </View>

                <View style={[styles['width_95%'], styles['margin_10'], styles['border_radius_8'], styles['border_width_1'], styles['border_color_grey'], styles['centerItems']]}>
                    <TouchableOpacity style={[styles['centerItems'], styles['top_10']]} onPress={requestPermissions}>
                        <Image source={selectedImage} resizeMode='contain' style={{ width: Dimensions.get('window').width / 5.8, height: Dimensions.get('window').height / 8 }} />
                    </TouchableOpacity>

                    <Text style={[styles['textAlignCenter'], styles['text_color_black'], styles['font_size_14_regular'], styles['padding_bottom_10'], styles['margin_horizontal_10']]}
                        numberOfLines={2}>{documentName}</Text>
                </View>
                {<CustomButton title={documentButtonText} onPress={onPressUploadButton} buttonBg={Colors.blue} btnWidth={'95%'} titleTextColor={Colors.white} />}
            </View>
            {showImageFilePickOptions()}
        </View>
    )
}
export default CustomUploadDocumentAlert;