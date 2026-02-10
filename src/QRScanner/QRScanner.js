import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Image, ImageBackground, Modal, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import { Styles } from "../assets/style/styles";
import { strings } from "../strings/strings";
import { Colors } from "../assets/Utils/Color";
import { GetApiHeaders, GetApiHeaderswithLoginResponse, PostRequest } from "../NetworkUtils/NetworkUtils";
import SimpleToast from "react-native-simple-toast";
import { HTTP_ACCEPTED, HTTP_CREATED, HTTP_OK, configs } from "../helpers/URLConstants";
import CustomLoader from "../Components/CustomLoader";
import CustomSuccessLoader from "../Components/CustomSuccessLoader";
import CustomErrorLoader from "../Components/CustomErrorLoader";
import CustomButton from "../Components/CustomButton";
import moment from "moment";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
// import { RNHoleView } from "react-native-hole-view";
import { getWindowHeight, getWindowWidth } from "./Upgrade/helpers";
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);
var realm;
let scannedCoupons;
var camDevice;
function QRScanner({ route }) {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const cameraRef = useRef(null);
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const totalPoints = route?.params?.userPointsEarned;
    const [loading, setLoading] = useState(false)
    const [successLoading, setSuccessLoading] = useState(false)
    const [errorLoading, setErrorLoading] = useState(false);
    const [showQueryAlert, setShowQueryAlert] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const networkStatus = useSelector(state => state.networkStatus.value)
    const [scannedData, setScannedData] = useState(null)
    const [qrActivate, setQRActivate] = useState(true)
    const [showCustomActionSheet, setShowCustomActionSheet] = useState(false)
    const [scannedResponse, setScannedResponse] = useState(null)
    const [flashOn, setFlashOn] = useState(false)
    const [scannedCoupnStatus, setScannedCouponStatus] = useState(false)
    const getUserData = useSelector(selectUser);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const { latitude, longitude } = useSelector((state) => state.location);
    console.log("latitude_longtitude Scanner", latitude, longitude)
    camDevice = useCameraDevice('back');

    const onSuccess = (response) => {
        setQRActivate(false)
        // alert(response.data)
        if (networkStatus) {
            setScannedData(response);
            submitQRData(response)
        } else {
            // SimpleToast.show(translate('no_internet_conneccted'))
            // setQRActivate(true)
            storeQROffline(response);
        }

    };

    const storeQROffline = (data) => {
        console.log("datadata", data)
        if (scannedCoupons && scannedCoupons.length) {
            if (!couponExists(data, scannedCoupons)) {
                const couponData = {
                    qrCodeData: data,
                    geoLocations: `${latitude},${longitude}`,
                    machedRegex: "",
                    scannedDate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    isOnlineRecord: false
                };

                realm.write(() => {
                    realm.create('scannedCoupons', couponData);
                });
                setShowCustomActionSheet(true)
                setScannedCouponStatus(true)
            } else {
                // SimpleToast.show("Coupon already scanned....");
                setShowCustomActionSheet(true)
                setScannedCouponStatus(false)
            }
        } else {
            const couponData = {
                qrCodeData: data,
                geoLocations: `${latitude},${longitude}`,
                machedRegex: "",
                scannedDate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                isOnlineRecord: false
            };

            realm.write(() => {
                realm.create('scannedCoupons', couponData);
            });
            setShowCustomActionSheet(true)
            setScannedCouponStatus(true)
        }
    };

    function couponExists(data, scannedCoupons) {
        console.log("dsdsdsdsdd", data + "---" + JSON.stringify(scannedCoupons))
        return scannedCoupons.some(coupon => coupon.qrCodeData === data);
    }

    useEffect(() => {
        // alert(totalPoints)
        realm = new Realm({ path: 'User.realm' })
        scannedCoupons = realm.objects('scannedCoupons')

        console.log("SCANNED_OFFLINE", scannedCoupons);
    }, [qrActivate])
    useEffect(() => {
        // alert(totalPoints)
        realm = new Realm({ path: 'User.realm' })
        scannedCoupons = realm.objects('scannedCoupons')

        console.log("SCANNED_OFFLINE", scannedCoupons);
    }, [networkStatus])


    // useEffect(() => {
    //     return () => {
    //       if (cameraRef.current) {
    //         cameraRef.current.stop();
    //       }
    //     };
    //   }, []);

    const submitQRData = async (data) => {
        if (networkStatus) {
            setLoading(true)
            setLoadingMessage(translate('please_wait_getting_data'))

            var url = configs.BASE_URL + configs.QRSCAN.VALIDATEQR_V9;
            var getHeaders = await GetApiHeaders();

            var dataList = {
                "qrCodeScanData": [{
                    "qrCodeData": data,
                    "geoLocations": `${latitude},${longitude}`,
                    'machedRegex': "",
                    "scannedDate": moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    "isOnlineRecord": true
                }]
            }

            console.log("URL ====>", url, " \n Headers ====>", getHeaders, " \n Input Request ====>", dataList);
            console.log("BHASKAR");


            setTimeout(async () => {
                var APIResponse = await PostRequest(url, getHeaders, dataList);
                console.log("Response ====>", APIResponse);

                if (APIResponse != undefined && APIResponse != null) {


                    if (APIResponse.statusCode == HTTP_OK) {
                        // navigation.goBack()
                        var responseObj = APIResponse.response;
                        setScannedResponse(APIResponse)
                        console.log("HELLO DOCTOR", responseObj);
                        setTimeout(() => {
                            setShowCustomActionSheet(true)
                        }, 1500);
                    }
                    else if (APIResponse.statusCode == HTTP_CREATED) {
                        setScannedResponse(APIResponse)
                        // SimpleToast.show(APIResponse.message)
                        setTimeout(() => {
                            setShowCustomActionSheet(true)
                        }, 1500);
                    } else if (APIResponse.statusCode == HTTP_ACCEPTED) {
                        setScannedResponse(APIResponse)
                        // SimpleToast.show(APIResponse.message)
                        setTimeout(() => {
                            setShowCustomActionSheet(true)
                        }, 1500);
                    } else {
                        SimpleToast.show(APIResponse?.message)
                        setTimeout(() => {
                            setQRActivate(true)
                        }, 1500);
                    }

                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                }
            }, 500);
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }

    }

    function CustomActionSheet() {
        return (
            <Modal animationType="slide"
                transparent={true}
                visible={showCustomActionSheet}
                onRequestClose={() => setShowCustomActionSheet(false)}>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.blackTransparent }}>
                    <View style={{ height: 75, width: 75, borderRadius: 40, backgroundColor: 'white', bottom: -55, alignSelf: 'center', padding: 10 }}>
                        <View style={[{ height: '100%', width: '100%', backgroundColor: "#D9D9D9", borderRadius: 40 }]}>
                        </View>
                    </View>
                    <View style={[{ borderTopRightRadius: 20, borderTopLeftRadius: 20, overflow: 'hidden', backgroundColor: 'white', height: 25 }]}>
                    </View>
                    {networkStatus && <View style={[{ backgroundColor: 'white' }]}>

                        <View style={[{ height: 100, width: 100, backgroundColor: "#D9D9D9", borderRadius: 100, alignSelf: 'center' }]}>
                            <Image source={(scannedResponse != null && scannedResponse?.statusCode == HTTP_OK) ?
                                require('../assets/images/ic_default_scan.png') : require('../assets/images/ic_default_scan.png')} style={[{ height: '100%', width: '100%' }]} />
                            <Image source={(scannedResponse != null && scannedResponse?.statusCode == HTTP_OK) ? require('../assets/images/ic_tick_green.png') : undefined} style={[{ height: 20, width: 20, position: 'absolute', top: 10, right: 4 }]} />
                        </View>

                        {/* Success Text */}
                        {(scannedResponse != null && scannedResponse?.statusCode == HTTP_OK) &&
                            <ImageBackground source={require('../assets/images/success_bg.png')} style={[{ width: '60%', alignSelf: 'center', marginTop: 20, padding: 5 }]}>
                                <Text style={[styles['font_size_18_bold'], styles['text_color_black'], styles['text_align_center']]}>{translate('congratulations')}</Text>
                                <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['text_align_center'], styles['margin_top_10'], styles['padding_10']]}>{scannedResponse?.response?.message}</Text>
                            </ImageBackground>}

                        {(scannedResponse != null && scannedResponse?.statusCode != HTTP_OK) &&
                            <Text style={[styles['font_size_18_semibold'], styles['text_color_black'], styles['text_align_center'], styles['padding_10']]}>{scannedResponse != null && scannedResponse?.message}</Text>
                        }
                        {/* backgroundColor: "#1EBB000F" */}
                        {(scannedResponse != null && scannedResponse?.statusCode == HTTP_OK) &&
                            <View style={{ width: '80%', borderRadius: 15, padding: 10, backgroundColor: "#1ebb001f", alignSelf: 'center', marginTop: 10, marginBottom: 15 }}>
                                <View style={styles.flex_direction_row}>
                                    <Image style={[styles.font_size_16_semibold, { height: 50, width: 50, padding: 10, alignSelf: 'flex-start' }]} source={scannedResponse?.response == undefined ? require('../assets/images/ic_default_scan.png') : { uri: scannedResponse?.response?.productImage }} resizeMode="contain" />
                                    <View style={[styles['margin_left_15']]}>
                                        <Text style={[styles['font_size_14_regular'], { textAlign: 'center', color: 'black', padding: 2 }]}>{scannedResponse?.response?.brandName}</Text>
                                        {(scannedResponse?.response?.productDescription !== undefined && scannedResponse?.response?.productDescription !== null) &&
                                            <Text style={[styles['font_size_12_regular'], { textAlign: 'center', color: 'black', padding: 2 }]}>
                                                {scannedResponse?.response?.productDescription + " | " + scannedResponse?.response?.packSize}
                                            </Text>}

                                    </View>
                                </View>
                            </View>
                        }


                        {/* Buttons */}
                        <View style={[{ flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', width: '90%', marginBottom: 20, alignSelf: 'center' }]}>
                            <CustomButton
                                title={translate('scan_more')}
                                onPress={() => {
                                    setShowCustomActionSheet(false)
                                    setQRActivate(true)
                                }}
                                buttonBg={Colors.white}
                                btnWidth={'45%'}
                                titleTextColor={dynamicStyles.iconPrimaryColor}
                                textAlign={'center'}
                                isBoldText={true}
                                borderWidth={1}
                                borderRadius={8}
                                borderColor={dynamicStyles.iconPrimaryColor}
                            />

                            <CustomButton
                                title={translate('done')}
                                onPress={() => {
                                    setShowCustomActionSheet(false)
                                    navigation.goBack()
                                }}
                                buttonBg={dynamicStyles.primaryColor}
                                btnWidth={'45%'}
                                titleTextColor={dynamicStyles.secondaryColor}
                                textAlign={'center'}
                                isBoldText={true}
                            />
                        </View>

                    </View>}
                    {!networkStatus && <View style={[{ backgroundColor: 'white' }]}>

                        <View style={[{ height: 100, width: 100, backgroundColor: "#D9D9D9", borderRadius: 100, alignSelf: 'center' }]}>
                            <Image source={(scannedCoupnStatus != null && scannedCoupnStatus) ?
                                require('../assets/images/ic_default_scan.png') : require('../assets/images/ic_default_scan.png')} style={[{ height: '100%', width: '100%' }]} />
                            <Image source={(scannedCoupnStatus != null && scannedCoupnStatus) ? require('../assets/images/ic_tick_green.png') : require('../assets/images/ic_close_red.png')} style={[{ height: 20, width: 20, position: 'absolute', top: 10, right: 4 }]} />
                        </View>

                        {scannedCoupnStatus && <View>
                            <Text style={[styles['font_size_18_bold'], styles['text_color_black'], styles['text_align_center']]}>{translate('congratulations')}</Text>
                            <Text style={[styles['font_size_16_semibold'], styles['text_color_grey'], styles['margin_top_5'], styles['text_align_center']]}>{translate('scan_saved')}</Text>
                        </View>}

                        {!scannedCoupnStatus && <View>
                            <Text style={[styles['font_size_18_bold'], styles['text_color_black'], styles['text_align_center']]}>{translate('couponsIssuesInvalidCoupons').replace("Coupons issues - ", "")}</Text>
                            <Text style={[styles['font_size_16_semibold'], styles['text_color_grey'], styles['margin_top_5'], styles['text_align_center']]}>{translate('scanned_already')}</Text>
                        </View>}

                        {/* Buttons */}
                        <View style={[{ flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', width: '90%', marginBottom: 20, alignSelf: 'center' }]}>
                            <CustomButton
                                title={translate('scan_more')}
                                onPress={() => {
                                    setShowCustomActionSheet(false)
                                    setQRActivate(true)
                                }}
                                buttonBg={Colors.white}
                                btnWidth={'45%'}
                                titleTextColor={dynamicStyles.primaryColor}
                                textAlign={'center'}
                                isBoldText={true}
                                borderWidth={1}
                                borderRadius={8}
                                borderColor={dynamicStyles.primaryColor}
                            />

                            <CustomButton
                                title={translate('done')}
                                onPress={() => {
                                    setShowCustomActionSheet(false)
                                    navigation.goBack()
                                }}
                                buttonBg={dynamicStyles.primaryColor}
                                btnWidth={'45%'}
                                titleTextColor={dynamicStyles.secondaryColor}
                                textAlign={'center'}
                                isBoldText={true}
                            />
                        </View>

                    </View>}
                </View>
            </Modal>
        )
    }

    const goBack = async () => {
        navigation.goBack()
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: codes => {
            if (codes.length > 0) {
                if (codes[0].value) {
                    setQRActivate(false);
                    setTimeout(() => onSuccess(codes[0]?.value), 500);
                }
            }
            return;
        },
    });
    const CustomMarker = () => (
        <View style={{ width: 250, height: 250, borderRadius: 6, overflow: 'hidden' }}>
            <View style={{ width: '100%', height: '100%' }}>
                {/* Top Breaks */}
                <View style={{ width: '100%', height: '96%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', alignSelf: 'flex-start' }}>
                    <View style={{ height: 1, width: '35%', alignSelf: 'flex-start', borderWidth: 2, backgroundColor: 'white', borderColor: 'white' }} />
                    <View style={{ height: 1, width: '35%', borderWidth: 2, backgroundColor: 'white', borderColor: 'white' }} />
                </View>

                {/* Bottom Breaks */}
                <View style={{ width: '100%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', alignSelf: 'flex-end', marginBottom: -5 }}>
                    <View style={{ height: 1, width: '35%', alignSelf: 'flex-start', borderWidth: 2, backgroundColor: 'white', borderColor: 'white' }} />
                    <View style={{ height: 1, width: '35%', borderWidth: 2, backgroundColor: 'white', borderColor: 'white' }} />
                </View>

                <View style={[{ height: '100%', width: '100%', justifyContent: 'space-between', flexGrow: 1, flexDirection: 'row', position: 'absolute' }]}>
                    <View style={[{ width: 1, height: '100%', alignSelf: 'flex-start' }]}>
                        <View style={{ height: "35%", width: 1, alignSelf: 'flex-start', borderWidth: 2, backgroundColor: 'white', borderColor: 'white' }} />
                        <View style={{ height: '35%', width: 1, borderWidth: 2, backgroundColor: 'white', borderColor: 'white', marginTop: 80 }} />
                    </View>

                    <View style={[{ width: 1, height: '100%', alignSelf: 'flex-end', marginRight: 3 }]}>
                        <View style={{ height: "35%", width: 1, alignSelf: 'flex-start', borderWidth: 2, backgroundColor: 'white', borderColor: 'white' }} />
                        <View style={{ height: '35%', width: 1, borderWidth: 2, backgroundColor: 'white', borderColor: 'white', marginTop: 80 }} />
                    </View>
                </View>

            </View>
        </View>
    );

    const switchFalsh = () => {
        setFlashOn(!flashOn)
    }

    const onError = (error) => {
        Alert.alert('Error!', error.message);
    };

    return (
        <View style={[styles['full_screen'], { backgroundColor: Colors.blackTransparent }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={{ flex: 1 }}>
                <View style={[{ backgroundColor: dynamicStyles.primaryColor, borderBottomEndRadius: 10, borderBottomStartRadius: 10, height: '25%', paddingTop: Platform.OS === 'ios' ? 20 : 0 }]}>
                    <View style={[styles['flex_direction_row'], { width: '100%', justifyContent: 'space-between' }]}>
                        <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_top_10'], { width: '50%' }]} onPress={() => { goBack() }}>
                            <View style={[styles['flex_direction_row']]}>
                                <Image style={[styles['margin_left_20'], styles[''], { tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: Platform.OS == 'ios' ? 10 : 10 }]} source={require('../assets/images/previous.png')}></Image>
                                <Text style={[styles['margin_left_10'], styles[''], { color: dynamicStyles.secondaryColor }, styles[''], styles['font_size_18_bold'], { marginTop: 5 }]}>{translate('claim_points')}</Text>
                            </View>

                        </TouchableOpacity>

                        <View style={[styles['flex_direction_row'], { alignSelf: 'flex-end', width: '50%', justifyContent: 'flex-end' }]}>
                            <TouchableOpacity style={[styles['width_height_20'], {}]} onPress={() => { switchFalsh() }}>
                                <Image style={[styles['padding_5'], styles['height_100%'], styles['width_100%'], { tintColor: dynamicStyles.secondaryColor }, styles['padding_10']]} source={flashOn ? require('../assets/images/ic_flash.png') : require('../assets/images/ic_flash.png')}></Image>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setShowQueryAlert(true) }} style={[{ marginEnd: 25 }]}>
                                <Image style={[styles['margin_left_20'], styles['width_height_20'], { tintColor: dynamicStyles.secondaryColor }, styles['padding_10']]} source={require('../assets/images/ic_query.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles['flex_direction_row'], styles['width_90%'], styles['height_80'], styles['bg_white'], styles['border_radius_6'], styles['centerItems'], { marginTop: 30, marginBottom: 10 }]}>
                        <View style={[{ width: '15%' }]}>
                            <Image style={[styles['width_height_50'], { marginRight: 25, tintColor: dynamicStyles.iconPrimaryColor }]} source={require('../assets/images/ic_cummulative.png')}></Image>
                        </View>
                        <View style={[styles['flex_direction_column'], styles['margin_left_20'], { width: '60%' }]}>
                            <Text style={[styles['font_size_16_bold'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_5']]}>{totalPoints}</Text>
                            <Text style={[styles['font_size_12_semibold'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_5']]}>{translate('total_reward_points')}</Text>
                        </View>
                    </View>
                </View>
                {qrActivate &&
                    // <QRCodeScanner
                    //     onRead={onSuccess}
                    //     reactivate={qrActivate}
                    //     topViewStyle={{ marginTop: -Dimensions.get('window').height / 8 }}
                    //     reactivateTimeout={3000}
                    //     flashMode={flashOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                    //     showMarker={true}
                    //     bottomContent={<View style={[{ backgroundColor: Colors.buttonOrange, width: '98%', padding: 10, borderRadius: 5, marginTop: 40 }]}>
                    //         <View style={[styles['flex_direction_row'], styles['flexGrow_1'], styles['space_between']]}>
                    //             <View style={[{ width: '80%' }]}>
                    //                 <Text style={[styles['text_color_white']]}>
                    //                     {translate('please_make_qr_code_infocus')}
                    //                 </Text>
                    //                 <Image style={{ height: 15, width: 15, top: 5 }} source={require('../assets/images/ic_warning.png')} />
                    //             </View>
                    //             <Image style={{ height: 40, width: 40, top: 5 }} source={require('../assets/images/ic_qr.png')} />
                    //         </View>
                    //     </View>}
                    //     customMarker={<CustomMarker />} />
                    (
                        // <CameraScanner
                        //     setIsCameraShown={qrActivate}
                        //     onReadCode={onSuccess}
                        // />
                        <View style={[{ backgroundColor: 'transparent', height: '100%', width: '100%', alignItems: 'center' }]}>
                            {
                                camDevice != null && (
                                    <View style={[{ height: '100%', width: '100%', overflow: 'hidden', alignSelf: 'center', backgroundColor: 'black' }]}>
                                        <Camera
                                            ref={cameraRef}
                                            torch={flashOn ? 'on' : 'off'}
                                            device={camDevice}
                                            style={[{ height: '100%', width: '100%', position: 'absolute' }]}
                                            photo={false}
                                            enableZoomGesture
                                            onError={onError}
                                            codeScanner={codeScanner}
                                            codeScannerOptions={{ interval: 500 }}
                                            isActive={qrActivate} />

                                        <View style={[{ backgroundColor: dynamicStyles.primaryColor, width: '100%', padding: 10, borderRadius: 5, marginBottom: 15, bottom: 0, top: Dimensions.get('window').height / 1.5, position: 'absolute', alignSelf: 'center' }]}>
                                            <View style={[styles['flex_direction_row'], styles['flexGrow_1'], styles['space_between']]}>
                                                <View style={[{ width: '80%' }]}>
                                                    <Text style={{ color: dynamicStyles.secondaryColor }}>
                                                        {translate('please_make_qr_code_infocus')}
                                                        {/* <Image style={{ height: 15, width: 15, top: 5 }} source={require('../assets/images/ic_warning.png')} /> */}
                                                    </Text>
                                                </View>
                                                <Image style={{ height: 45, width: 45, top: 5 }} source={require('../assets/images/ic_qr.png')} />
                                            </View>
                                        </View>

                                        {/* <RNHoleView
                                            holes={[
                                                {
                                                    x: getWindowWidth() * 0.2,
                                                    y: getWindowHeight() * 0.15,
                                                    width: getWindowWidth() * 0.6,
                                                    height: getWindowHeight() * 0.3,
                                                    borderRadius: 10,
                                                },
                                            ]}
                                            style={[{
                                                alignSelf: 'center',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                position: 'absolute',
                                                width: '100%',
                                                height: '66.7%',
                                                flex: 1,
                                                zIndex: 100,
                                            }]}
                                        /> */}
                                        {/* <CustomMarker /> */}
                                    </View>
                                )
                            }

                        </View>
                    )
                }
            </View>
            {showCustomActionSheet && CustomActionSheet()}
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
            {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
            {showQueryAlert &&
                <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
                    <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], styles['padding_10'], { borderRadius: 8 }]}>
                        <View style={[styles['width_100%'], { flexDirection: 'row', justifyContent: 'space-between' }]}>
                            <Text style={[styles['width_100%'], styles['font_size_18_semibold'], styles['top_5'], { textAlign: 'center', color: dynamicStyles.textColor }]} >{translate('alert')}</Text>
                        </View>
                        <Image resizeMode="contain" style={{ height: (Dimensions.get('window').height * 35) / 100, width: (Dimensions.get('window').width * 75) / 100, top: 5 }} source={require('../assets/images/queryScanImage.png')} />
                        <View style={[styles['width_85%'], styles['margin_top_10'], styles['align_self_center']]}>
                            <Text style={[{ color: dynamicStyles.textColor }, styles['text_color_black'], styles['font_size_16_regular']]}>1.Scan the Coupon QR code.</Text>
                            <Text style={[{ color: dynamicStyles.textColor }, styles['text_color_black'], styles['font_size_16_regular']]}>2.Check the scanned coupon details</Text>
                        </View>
                        <View style={[styles['margin_top_20'], { flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                            <CustomButton title={translate('ok')} onPress={() => { setShowQueryAlert(false) }} buttonBg={dynamicStyles.primaryColor} btnWidth={'95%'} titleTextColor={dynamicStyles.secondaryColor} />
                        </View>
                    </View>
                </View>
            }
        </View>
    )

}

export default QRScanner;