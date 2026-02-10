import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Alert, AppState, BackHandler, Dimensions, FlatList, Image, ImageBackground, KeyboardAvoidingView, Linking, Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import Sound from 'react-native-sound';
import _ from 'lodash';
import { Styles } from "../assets/style/styles";
import Realm from 'realm';
import { Colors } from "../assets/Utils/Color";
import { GetApiHeaders, PostRequest } from "../NetworkUtils/NetworkUtils";
import SimpleToast from "react-native-simple-toast";
import { HTTP_ACCEPTED, HTTP_CREATED, HTTP_OK, configs } from "../helpers/URLConstants";
import CustomLoader from "../Components/CustomLoader";
import CustomSuccessLoader from "../Components/CustomSuccessLoader";
import CustomErrorLoader from "../Components/CustomErrorLoader";
import CustomButton from "../Components/CustomButton";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { DEVICE_TOKEN, FCM_TOKEN, MOBILE_NUMBER, ROLENAME, USER_ID, USER_NAME, getAppVersion, getAppVersionCode, getDeviceId, isNullOrEmpty, retrieveData } from "../assets/Utils/Utils";
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../Components/CustomAlert';
import WebView from 'react-native-webview';
import CustomTextInput from '../Components/CustomTextInput';
import RenderHTML from 'react-native-render-html'
import { createStyles } from '../assets/style/createStyles';
const { height, width } = Dimensions.get("window")
var styles = BuildStyleOverwrite(Styles);
var realm;
let scannedCoupons;
var camDevice;
function ProductScanner({ route }) {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const { latitude, longitude } = useSelector((state) => state.location);
    const cameraRef = useRef(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [imageLink, setImageLink] = useState('')
    const navigation = useNavigation();
    const [scanning, setScanning] = useState(true);
    const [scanStatus, setScanStatus] = useState('ready');
    const dispatch = useDispatch()
    const [productDetails, setProductDetails] = useState(null);
    const totalPoints = route?.params?.userPointsEarned;
    const [loading, setLoading] = useState(false)
    const [successLoading, setSuccessLoading] = useState(false)
    const [lastScannedCode, setLastScannedCode] = useState(null);
    const [numberOfCouponsScanned, setNumberOfCouponsScanned] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorLoading, setErrorLoading] = useState(false);
    let [openAlertBox, setAlertBox] = useState(false)
    let [showGoBackAlertBox, setshowGoBackAlertBox] = useState(false)
    const [showQueryAlert, setShowQueryAlert] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [isApiInProgress, setIsApiInProgress] = useState(false);
    const isApiInProgressRef = useRef(false);
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
    const [showAlert, setShowAlert] = useState(false)
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertHeader, setShowAlertHeader] = useState(false)
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
    const [showAlertYesButton, setShowAlertYesButton] = useState(false)
    const [showAlertNoButton, setShowAlertNoButton] = useState(false)
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
    let [noOfParticipants, setnoOfParticipants] = useState('')
    let [participantPopup, setPopup] = useState(false)
    let [congratulationsContent, setCongratulationsContent] = useState(false)
    camDevice = useCameraDevice('back');
    let [renderingMdo, setRenderMDO] = useState(false)
    const [primaryColor, setPrimaryColor] = useState(route?.params?.selectedCompany?.primaryColor != undefined ? route.params.selectedCompany?.primaryColor : Colors.purple)
    const [secondaryColor, setSecondaryColor] = useState(route?.params?.selectedCompany?.secondaryColor != undefined ? route.params.selectedCompany?.secondaryColor : Colors.white)

    const [bonusMessage, setBonusMessage] = useState("");

    // useEffect(()=>{
    //     setTimeout(()=>{
    //     setPopup(true)
    //     },5000)
    // },[])

    //flag:renderMDO

    useFocusEffect(
        React.useCallback(() => {
            // if (route?.params?.showRedeemPopup === true) {
            if (route?.params?.flag === 'renderMDO') { // added this to resolve popup issue
                setRenderMDO(true);
            }
        }, [route?.params?.flag])
    );

    const onSuccess = async (response) => {
        setQRActivate(false)
        // alert(response.data)
        if (networkStatus) {
            if (renderingMdo) {
                const isValidCoupon = await validateCoupon(response);
                if (isValidCoupon) {
                    submitMDOData(response);
                    setLoading(true);
                    setLoadingMessage(translate('submittingDataWait'));
                    setQRActivate(false);
                } else {
                    playSound('error');
                    setLoading(false);
                    setLoadingMessage();
                    setQRActivate(true);
                    if (Platform.OS === 'android') {
                        SimpleToast.show(translate('Invalid_QR_Code'))
                    } else {
                        setTimeout(() => {
                            SimpleToast.show(translate('Invalid_QR_Code'))
                        }, 200);
                    }
                }
            } else {
                // playSound('success');
                submitQRData(response);
                setLoading(true);
                setQRActivate(false);
                setLoadingMessage(translate('submittingDataWait'));
            }
        } else {
            setLoading(false);
            setAlertBox(false);
            setLoadingMessage();
            SimpleToast.show(translate('no_internet_conneccted'));
        }

    };

    const isYouTubeLink = (url) => {
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
    };

    function handleBackButtonClick() {
        console.log(numberOfCouponsScanned, 'numberOfCouponsScanned')
        if (openAlertBox || showQueryAlert) {
            setShowCustomActionSheet(false);
            setAlertBox(false);
            setShowQueryAlert(false);
            return true;
        }
        else if (numberOfCouponsScanned.length > 0) {
            setshowGoBackAlertBox(true);
            setAlertBox(true)
            return true;
        }
        navigation.goBack();
        return true;
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackButtonClick
        );

        return () => {
            backHandler.remove(); // ✅ Correct cleanup
        };
    }, [showCustomActionSheet, openAlertBox, showQueryAlert, numberOfCouponsScanned]);


    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            const handleAppStateChange = (nextAppState) => {
                if (!isMounted) return;
                if (nextAppState === 'background' || nextAppState === 'inactive') {
                    setQRActivate(false);
                } else if (nextAppState === 'active') {
                    setQRActivate(true);
                }
            };
            // Initialize camera when screen focuses
            setQRActivate(true);
            // Add app state listener
            const subscription = AppState.addEventListener('change', handleAppStateChange);
            return () => {
                isMounted = false;
                // Cleanup when screen loses focus
                setQRActivate(false);
                // Remove app state listener
                subscription.remove();
            };
        }, [])
    );

    const onError = useCallback((error) => {
        console.error('Camera Error:', error);
    }, [navigation]);


    useEffect(() => {
        realm = new Realm({ path: 'User.realm' })
        scannedCoupons = realm.objects('scannedCoupons')

        console.log("SCANNED_OFFLINE", scannedCoupons);
    }, [qrActivate])

    const showAlertWithMessage = (title, header, heaertext, message, yesBtn, noBtn, yesText, noText) => {
        setShowAlert(true)
        playSound('error')
        setAlertTitle(title);
        setShowAlertHeader(header);
        setShowAlertHeaderText(heaertext)
        setAlertMessage(message);
        setShowAlertYesButton(yesBtn);
        setShowAlertNoButton(noBtn);
        setShowAlertyesButtonText(yesText);
        setShowAlertNoButtonText(noText);
        setQRActivate(false)
    }



    const validateCoupon = async (coupon) => {
        const regex = /^https:\/\/nslbeejtantra\.com\/Authentication\/dg_activity\?activity_code=[A-Z0-9]{10,}$/;
        return regex.test(coupon);
    };

    const submitMDOData = async (response) => {

        if (networkStatus && !isApiInProgressRef.current) {
            isApiInProgressRef.current = true;
            setLoading(true);
            setAlertBox(false);
            setLoadingMessage(translate('submittingDataWait'));
            try {
                var url = configs.BASE_URL + configs.QRSCAN.MDOSCAN;
                var getHeaders = await GetApiHeaders();
                var data = {
                    tfaQrCode: response.split('=')[1],
                    type: "MNA",
                    geoLocations: `${latitude},${longitude}`
                };

                var APIResponse = await PostRequest(url, getHeaders, data);
                console.log("jai_sri_ram", APIResponse)
                if (APIResponse != undefined && APIResponse != null) {
                    setLastScannedCode(null);
                    if (APIResponse?.statusCode == HTTP_OK) {
                        const rawData = APIResponse;
                        const qrResult = rawData?.response.message;
                        console.log(qrResult, "venu=======>");

                        setTimeout(() => {
                            setLoading(false);
                        }, 200);

                        setTimeout(() => {
                            setPopup(true)
                            setBonusMessage(qrResult)
                            setCongratulationsContent(true);
                        }, 500);

                    } else if (APIResponse.statusCode == HTTP_CREATED) {
                        setTimeout(() => {
                            setLoadingMessage('');
                            setLoading(false);
                            // showAlertWithMessage(
                            //     translate("Already_Scanned"),
                            //     true,
                            //     true,
                            //     APIResponse.message || translate("This_QR_code_has_already_been_scanned"),
                            //     false,
                            //     true,
                            //     translate('ok'),
                            //     translate('cancel')
                            // );
                        }, 500);
                    } else if (APIResponse.statusCode == HTTP_ACCEPTED) {
                        setTimeout(() => {
                            setLoadingMessage('');
                            setLoading(false);
                            showAlertWithMessage(
                                translate("Error"),
                                true,
                                true,
                                APIResponse.message || translate("Unable_to_process_the_QR_code"),
                                false,
                                true,
                                translate('ok'),
                                translate('cancel')
                            );
                        }, 500);
                    } else {
                        setTimeout(() => {
                            setLoadingMessage('');
                            setLoading(false);
                            showAlertWithMessage(
                                translate("Error"),
                                true,
                                true,
                                APIResponse.message || translate("Unable_to_process_the_QR_code"),
                                false,
                                true,
                                translate('ok'),
                                translate('cancel')
                            );
                        }, 500);
                    }

                    setTimeout(() => {
                        setLoadingMessage('');
                        setLoading(false);
                        setIsApiInProgress(false);
                    }, 500);
                }
            } catch (error) {
                console.error("API Error", error);
                setLoadingMessage('');
                setLoading(false);
                setIsApiInProgress(false);
                playSound('error');
                SimpleToast.show(translate('something_went_wrong'));
            } finally {
                isApiInProgressRef.current = false;
                setIsApiInProgress(false);
                setLoading(false);
                setLoadingMessage('');
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'));
        }
    };



    const submitQRData = async (response) => {
        if (networkStatus && !isApiInProgressRef.current) {
            isApiInProgressRef.current = true;
            setLoading(true);
            setAlertBox(false);
            setLoadingMessage(translate('submittingDataWait'))
            try {
                var url = configs.SUBEEJ_BASE_URL + configs.QRSCAN.NEWGENUNITYURL;
                var getHeaders = await GetApiHeaders();
                var dataList = {
                    farmerMobileNumber: getHeaders.mobileNumber,
                    qrCodeData: response,
                    farmerId: getHeaders.userId,
                    deviceType: Platform.OS,
                    type: "mobile",
                    geoLocations: {
                        latitude: latitude,
                        longitude: longitude
                    }
                }

                var APIResponse = await PostRequest(url, getHeaders, dataList);
                if (APIResponse != undefined && APIResponse != null) {
                    setLastScannedCode(null);
                    if (APIResponse.statusCode == HTTP_OK) {
                        const rawData = APIResponse;
                        const qrResult = rawData?.response;
                        console.log(qrResult, "<----------------- response")
                        setTimeout(() => {
                            setLoadingMessage();
                            setLoading(false);
                            if (qrResult?.isGenuine) {
                                setProductDetails(qrResult);
                                setModalOpen(true)
                                setQRActivate(false)
                            } else {
                                showAlertWithMessage(translate("Invalid_QR_Code"), true, true, translate("The_scanned_QR_code_is_invalid"), false, true, translate('ok'), translate('cancel'))
                            }
                        }, 1000);
                    }
                    else if (APIResponse.statusCode == HTTP_CREATED) {
                        // setShowCustomActionSheet(true);
                        // setScannedResponse(APIResponse);
                        setTimeout(() => {
                            setLoadingMessage();
                            setLoading(false);
                            // playSound('error');
                            showAlertWithMessage(translate("Already_Scanned"), true, true, APIResponse.message || translate("This_QR_code_has_already_been_scanned"), false, true, translate('ok'), translate('cancel'))
                        }, 500);
                    } else if (APIResponse.statusCode == HTTP_ACCEPTED) {
                        // setShowCustomActionSheet(true);
                        // setScannedResponse(APIResponse);
                        setTimeout(() => {
                            setLoadingMessage();
                            setLoading(false);
                            // playSound('error');
                            showAlertWithMessage(translate("Error"), true, true, APIResponse.message || translate("Unable_to_process_the_QR_code"), false, true, translate('ok'), translate('cancel'))
                        }, 500);
                    } else {
                        setTimeout(() => {
                            setLoadingMessage();
                            setLoading(false);
                            // playSound('error');
                            showAlertWithMessage(translate("Error"), true, true, APIResponse.message || translate("Unable_to_process_the_QR_code"), false, true, translate('ok'), translate('cancel'))
                        }, 500);
                    }

                    setTimeout(() => {
                        setLoadingMessage();
                        setLoading(false);
                        setIsApiInProgress(false)
                    }, 500);
                }
            } catch (error) {
                console.error("API Error", error);
                setLoadingMessage();
                setLoading(false);
                setIsApiInProgress(false)
                playSound('error');
                SimpleToast.show(translate('something_went_wrong'));
            } finally {
                isApiInProgressRef.current = false;
                setIsApiInProgress(false);
                setLoading(false);
                setLoadingMessage('');
                // !productDetails && !showAlert && setQRActivate(true);
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'));
        }
    }

    const handleCancelAlert = () => {
        setShowAlert(false)
        setQRActivate(true)
    }

    let callSubmitApi = () => {
        // setIsProcessing(true);
        setQRActivate(false);
        setTimeout(() => {
            onSuccess();
            // setIsProcessing(false);
        }, 1000);
    }

    let isSoundPlaying = false;
    const playSound = (type) => {
        if (isSoundPlaying) {
            console.log('Sound is still playing, please wait...');
            return;
        }
        const soundFile = type === 'success' ? 'success_beep.mp3' : 'failure_beep.mp3';
        const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Failed to load sound', error);
                return;
            }
            isSoundPlaying = true;
            sound.play((success) => {
                if (!success) {
                    console.log('Failed to play sound');
                }
                sound.release();
                isSoundPlaying = false;
            });
        });
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: codes => {
            if (codes.length > 0) {
                if (codes[0].value) {
                    setLoading(true);
                    setAlertBox(false);
                    setLoadingMessage(translate('submittingDataWait'))
                    setQRActivate(false);
                    playSound('success');
                    setTimeout(() => onSuccess(codes[0]?.value), 1500);
                }
            }
            return;
        },
    });

    useEffect(() => {
        if (numberOfCouponsScanned.length === 30) {
            callSubmitApi();
        }
    }, [numberOfCouponsScanned]);

    const switchFalsh = () => {
        setFlashOn(!flashOn)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.blackTransparent }} edges={['top']}>
            <View style={[{ backgroundColor: Colors.blackTransparent, flex: 1 }]}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={'rgba(51, 51, 51, 1)'} barStyle='light-content' />}
                <View style={{ flex: 1 }}>
                    {
                        // qrActivate 
                        true
                        &&
                        (
                            <View style={[{ backgroundColor: 'transparent', height: '100%', width: '100%', alignItems: 'center' }]}>
                                {camDevice != null && (
                                    <View style={[{ height: '100%', width: '100%', overflow: 'hidden', alignSelf: 'center', backgroundColor: 'black' }]}>

                                        <View
                                            style={[
                                                {
                                                    alignSelf: 'center',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(51, 51, 51, 1)',
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    zIndex: 100,
                                                },
                                            ]}
                                        >
                                            {
                                                qrActivate
                                                &&
                                                <ImageBackground
                                                    resizeMode="contain"
                                                    source={require('../assets/images/QrBorder.png')}
                                                    style={{
                                                        height: 300,
                                                        width: 300,
                                                        zIndex: 101,
                                                        position: 'absolute',
                                                        padding: 30,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <View style={[{ height: '100%', width: '100%', position: 'absolute', borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }]}>
                                                        <Camera
                                                            ref={cameraRef}
                                                            torch={flashOn ? 'on' : 'off'}
                                                            device={camDevice}
                                                            style={[{ height: '100%', width: '100%', position: 'absolute' }]}
                                                            photo={false}
                                                            enableZoomGesture={true}
                                                            onError={onError}
                                                            codeScanner={codeScanner}
                                                            codeScannerOptions={{ interval: 1000 }}
                                                            isActive={qrActivate}
                                                        />
                                                        <View style={{ height: '100%', width: '100%', position: 'absolute', overflow: 'hidden' }}>
                                                        </View>
                                                    </View>

                                                </ImageBackground>}
                                            {qrActivate && !modalOpen && <View style={[{ backgroundColor: dynamicStyles.primaryColor, width: '90%', padding: 10, borderRadius: 5, marginBottom: 15, alignSelf: 'center', marginTop: "auto" }]}>
                                                <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
                                                    <View style={[{ width: '90%' }]}>
                                                        <Text style={[{ color: dynamicStyles.secondaryColor }, styles['font_size_12_regular']]}>
                                                            {translate('please_make_qr_code_infocus')}
                                                        </Text>
                                                    </View>
                                                    <Image style={{ height: 30, width: 30 }} resizeMode='contain' source={require('../assets/images/ic_qr.png')} />
                                                </View>
                                            </View>}
                                        </View>
                                        <View style={[{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            zIndex: 101,
                                            paddingHorizontal: 10,
                                            paddingVertical: 10,
                                        }]}>
                                            <TouchableOpacity style={[{ flexDirection: 'row', alignItems: 'center' }]} onPress={() => handleBackButtonClick()}>
                                                <Image
                                                    resizeMode="contain"
                                                    style={[{ tintColor: 'rgba(255, 255, 255, 1)', height: 20, width: 20 }]}
                                                    source={require('../assets/images/previous.png')}
                                                />
                                                <Text style={[{ color: 'rgba(255, 255, 255, 1)', marginLeft: 10 }, styles['font_size_18_bold']]}>
                                                    {translate('scan')}
                                                </Text>
                                            </TouchableOpacity>

                                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                                <TouchableOpacity onPress={switchFalsh}>
                                                    <Image
                                                        style={[{ height: 20, width: 20, resizeMode: 'contain', tintColor: 'rgba(255, 255, 255, 1)' }]}
                                                        source={flashOn ? require('../assets/images/ic_flashON.png') : require('../assets/images/ic_flash.png')}
                                                    />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setShowQueryAlert(true)} style={{ marginLeft: 20 }}>
                                                    <Image
                                                        style={[{ height: 20, width: 20, resizeMode: 'contain', tintColor: 'rgba(255, 255, 255, 1)' }]}
                                                        source={require('../assets/images/ic_query.png')}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </View>
                                )}
                            </View>
                        )
                    }
                </View>
                <Modal animationType='fade'
                    transparent={true}
                    visible={openAlertBox}
                    onRequestClose={() => {
                        setAlertBox(false)
                        setshowGoBackAlertBox(false)
                        //discard_scanned_data_sofar
                        // navigation.goBack()

                    }}>
                    <View style={styleSheetStyles.centeredView}>
                        <View style={styleSheetStyles.modalView}>
                            <View style={[styleSheetStyles.headerContainer, { width: "100%" }]}>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={[styleSheetStyles.headerText2, styles['font_size_20_bold']]}>{translate('alert')}</Text>
                                <TouchableOpacity activeOpacity={0.5} onPress={() => {
                                    // setOpenSurvey(false)
                                    // setSelectedSurvey(null)
                                    setAlertBox(false)
                                    setshowGoBackAlertBox(false)
                                }}>
                                    <Image resizeMode='contain' style={styleSheetStyles.image2} source={require('../assets/images/closeWindow.png')} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 1, width: "100%", alignSelf: "center", backgroundColor: "rgba(231, 235, 238, 1)", marginVertical: responsiveHeight(2) }} />
                            <View style={{ flex: 1, width: "100%" }}>
                                {/* <Text style={[styleSheetStyles.headerText3, styles['font_size_17_regular']]}>{showGoBackAlertBox ? translate('discard_scanned_data_sofar') : translate('Doyouwanttoscanmorecoupons')}</Text> */}
                                <View style={styleSheetStyles.container}>
                                    <TouchableOpacity onPress={() => {
                                        setAlertBox(false)
                                    }} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: dynamicStyles.iconPrimaryColor }]}>
                                        <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.iconPrimaryColor }]}>{showGoBackAlertBox ? translate('cancel') : translate('scanMore')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        showGoBackAlertBox ? navigation.goBack() : callSubmitApi()
                                    }} style={[styleSheetStyles.button, styleSheetStyles.saveButton, { borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.primaryColor, }]}>
                                        <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.secondaryColor }]}>{showGoBackAlertBox ? translate('ok') : translate('submit')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
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
                                <Text style={[{ color: dynamicStyles.textColor }, styles['text_color_black'], styles['font_size_16_regular']]}>1.{translate('ScantheCouponQRcode')}</Text>
                                <Text style={[{ color: dynamicStyles.textColor }, styles['text_color_black'], styles['font_size_16_regular']]}>2.{translate('checkTheScannedCoupondetails')}</Text>
                            </View>
                            <View style={[styles['margin_top_20'], { flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                                <CustomButton title={translate('ok')} onPress={() => { setShowQueryAlert(false) }} buttonBg={dynamicStyles.primaryColor} btnWidth={'95%'} titleTextColor={dynamicStyles.secondaryColor} />
                            </View>
                        </View>
                    </View>
                }
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalOpen}
            >
                <TouchableWithoutFeedback>
                    <View style={{
                        backgroundColor: "rgba(0,0,0,0.3)",
                        flex: 1,
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        {showVideoModal && isNullOrEmpty(imageLink) ?
                            <View style={{
                                backgroundColor: "#fff",
                                padding: 15,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 4,
                                elevation: 5,
                                // borderRadius: 5,
                                width: "90%",
                                // height: "60%",
                                borderRadius: 20
                            }}>
                                <TouchableOpacity
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: 0,
                                        padding: 15,
                                        zIndex: 100
                                    }}
                                    onPress={() => {
                                        if (showVideoModal && isNullOrEmpty(imageLink)) {
                                            setShowVideoModal(false)
                                        }
                                        else {
                                            setQRActivate(true)
                                            setModalOpen(false)
                                        }

                                    }}>
                                    <Image source={showVideoModal && isNullOrEmpty(imageLink) ? require('../assets/images/closeWindow.png') : require('../assets/images/crossMark.png')} style={{ height: 20, width: 20, resizeMode: "contain" }} />
                                </TouchableOpacity>

                                <View style={{ minHeight: responsiveHeight(50), width: responsiveWidth(90), padding: 10, marginTop: 25, alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
                                    <WebView
                                        source={{ uri: imageLink }}
                                        style={[styles['centerItems'], styles['border_radius_6'], { height: '80%', width: '90%' }]}
                                        containerStyle={[styles['centerItems'], { flex: 1, width: '100%', height: '90%' }]}
                                        javaScriptEnabled={true}
                                        domStorageEnabled={true}
                                        onLoadStart={() => setLoading(true)}
                                        onLoadEnd={() => setLoading(false)}
                                        onMessage={(event) => {
                                            console.log("event", event.nativeEvent.data)
                                        }}
                                    />
                                </View>
                            </View>
                            : <View style={{
                                backgroundColor: "#fff",
                                padding: 15,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 4,
                                elevation: 5,
                                // borderRadius: 5,
                                width: "90%",
                                // height: "60%",
                                borderRadius: 20
                            }}>
                                <TouchableOpacity
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: 0,
                                        padding: 15,
                                        zIndex: 100
                                    }}
                                    onPress={() => {
                                        setQRActivate(true);
                                        setModalOpen(false);
                                    }}>
                                    <Image source={require('../assets/images/crossMark.png')} style={{ height: 20, width: 20, resizeMode: "contain" }} />
                                </TouchableOpacity>
                                <Image source={require('../assets/images/successIconMssg.png')} style={{
                                    height: 50,
                                    width: 50,
                                    resizeMode: "contain",
                                    alignSelf: "center",
                                    // marginTop: 20
                                }} />

                                <Text style={[{ color: "rgba(0, 0, 0, 1)", textAlign: "center", marginVertical: 15 }, styles['font_size_14_semibold']]}>{translate('geneuineScanned')}</Text>
                                {productDetails?.goldClubMessage && <Text style={[{ color: 'rgba(122, 122, 122, 1)', textAlign: "center", marginTop: 5, marginBottom: 10 }, styles['font_size_12_regular']]}>{productDetails?.goldClubMessage}</Text>}
                                <View style={{
                                    alignSelf: "center",
                                    backgroundColor: "#F2F6F9",
                                    borderRadius: 10,
                                    width: "100%",
                                    padding: 10,
                                    marginBottom: 5,
                                }}>
                                    <View style={{ borderRightWidth: 1, height: '105%', position: "absolute", left: '54.5%', borderColor: "rgba(229, 233, 234, 1)", marginVertical: 5 }} />
                                    <View style={{ flexDirection: "row", marginBottom: 5 }}>
                                        <View style={{ flex: 1, paddingRight: '10%' }}>
                                            <Text style={[{ color: "#000" }, styles['font_size_11_regular']]}>{translate('crop')}</Text>
                                            <Text style={[{ color: "#000" }, styles['font_size_13_semibold']]}>{productDetails?.cropName || "--"}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[{ color: "#000" }, styles['font_size_11_regular']]}>{translate('packagingDate')}</Text>
                                            <Text style={[{ color: "#000" }, styles['font_size_13_semibold']]}>{productDetails?.manufactureDate}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row", marginBottom: 5 }}>
                                        <View style={{ flex: 1, paddingRight: '10%' }}>
                                            <Text style={[{ color: "#000" }, styles['font_size_11_regular']]}>{translate('Variety')}</Text>
                                            <Text style={[{ color: "#000" }, styles['font_size_13_semibold']]}>{productDetails?.brandName}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[{ color: "#000" }, styles['font_size_11_regular']]}>{translate("netQuantity")}</Text>
                                            <Text style={[{ color: "#000" }, styles['font_size_13_semibold']]}>{`${productDetails?.packSize} ${productDetails?.packUnit}`}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row" }}>
                                        <View style={{ flex: 1, paddingRight: '10%' }}>
                                            <Text style={[{ color: "#000" }, styles['font_size_11_regular']]}>{translate('lotNumber')}</Text>
                                            <Text style={[{ color: "#000" }, styles['font_size_13_semibold']]}>{productDetails?.lotNumber}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[{ color: "#000" }, styles['font_size_11_regular']]}>{`${translate('mrpPerPkt')}`}</Text>
                                            <Text style={[{ color: "#000" }, styles['font_size_13_semibold']]}>{productDetails?.mrp}</Text>
                                        </View>
                                    </View>
                                </View>

                                {productDetails?.productImage && <Image
                                    style={{ width: 75, height: 75, resizeMode: "contain", alignSelf: "center", marginTop: 15 }}
                                    source={productDetails?.productImage ? { uri: productDetails?.productImage } : require('../assets/images/samplePacket.png')}
                                />}
                                {productDetails && <View style={{ width: "100%", flexDirection: "row", alignSelf: "center", justifyContent: "center" }}>
                                    {productDetails?.testimonial && <TouchableOpacity onPress={() => {
                                        isYouTubeLink(productDetails?.testimonial) && Linking.openURL(productDetails?.testimonial).catch(err => console.error("Couldn't load page", err))
                                    }} style={{ width: "35%", height: 43, flexDirection: "row", alignItems: "center", justifyContent: "center", marginRight: 5 }}>
                                        <Image source={require('../assets/images/Union.png')} tintColor={dynamicStyles?.primaryColor} style={{ height: 10, width: 10, resizeMode: "contain", marginRight: 5 }} />
                                        <Text style={[{ color: dynamicStyles.primaryColor, textDecorationLine: "underline" }, styles['font_size_12_semibold']]}>{translate('productVideo')}</Text>
                                    </TouchableOpacity>}

                                    {productDetails?.productLeaflet && <TouchableOpacity onPress={() => {
                                        setShowVideoModal(true)
                                        setLoading(true);
                                        setImageLink(productDetails?.productLeaflet)
                                    }} style={{ width: "35%", height: 43, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                        <Image source={require('../assets/images/Union.png')} tintColor={dynamicStyles?.primaryColor} style={{ height: 10, width: 10, resizeMode: "contain", marginRight: 5 }} />
                                        <Text style={[{ color: dynamicStyles.primaryColor, textDecorationLine: "underline" }, styles['font_size_12_semibold']]}>{translate('productInfo')}</Text>
                                    </TouchableOpacity>}
                                </View>}
                                <View style={{ width: "100%", flexDirection: "row", alignSelf: "center", marginTop: 10, justifyContent: "space-between" }}>
                                    <TouchableOpacity onPress={() => {
                                        setQRActivate(true);
                                        setModalOpen(false);
                                    }} style={{ borderRadius: 10, width: "48%", borderWidth: 1, borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.secondaryColor, height: 43, alignItems: "center", justifyContent: "center" }}>
                                        <Text style={[{ color: dynamicStyles.primaryColor }, styles['font_size_12_semibold']]}>{productDetails?.buttonTitle1}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => {
                                        setQRActivate(true);
                                        setModalOpen(false);
                                        navigation.goBack();
                                    }} style={{ borderRadius: 10, width: "48%", borderWidth: 1, borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.primaryColor, height: 43, alignItems: "center", justifyContent: "center" }}>
                                        <Text style={[{ color: dynamicStyles.secondaryColor }, styles['font_size_12_semibold']]}>{productDetails?.buttonTitle2}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>}
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Modal animationType='fade'
                transparent={true}
                visible={participantPopup}
            >
                {congratulationsContent &&
                    <View style={styleSheetStyles.centeredView}>
                        <View style={styleSheetStyles.modalView}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                alignSelf: "center",
                                // justifyContent: "space-between",
                                // alignSelf:"center",
                                width: "100%",
                                // marginLeft:5
                            }}>
                                <RenderHTML source={{ html: bonusMessage }}
                                    enableCSSInlineProcessing={true} />
                            </View>
                            <CustomButton
                                title={translate('ok')}
                                onPress={async () => {
                                    // const roleTypeDetails = await retrieveData(ROLENAME)
                                    setShowCustomActionSheet(false)
                                    navigation.goBack()
                                    // navigation.reset({ index: 0, routes: [{ name:(roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard': 'Dashboard', params: {} }] })
                                    //  roleNameNav
                                }}
                                buttonBg={primaryColor}
                                btnWidth={'100%'}
                                titleTextColor={secondaryColor}
                                textAlign={'center'}
                                isBoldText={true}
                            />
                        </View>
                    </View>
                }
            </Modal>

            {
                showAlert &&
                <CustomAlert
                    onPressClose={() => { handleCancelAlert() }}
                    title={alertTitle}
                    showHeader={showAlertHeader}
                    showHeaderText={showAlertHeaderText}
                    message={alertMessage}
                    onPressOkButton={() => { handleCancelAlert() }}
                    onPressNoButton={() => { handleCancelAlert() }}
                    showYesButton={showAlertYesButton}
                    showNoButton={showAlertNoButton}
                    yesButtonText={showAlertyesButtonText}
                    noButtonText={showAlertNoButtonText} />

            }
        </SafeAreaView>
    )

}

let styleSheetStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '95%',
        alignSelf: 'center',
        marginTop: "auto"
    },
    button: {
        width: '47.5%',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    clearButton: { backgroundColor: 'rgba(255, 255, 255, 1)' },
    saveButton: {},
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    image2: {
        height: 30,
        width: 30,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#000000d6"
    },
    headerText2: { color: "rgba(0, 0, 0, 1)" },
    headerText3: { color: "rgba(7, 28, 31, 1)", textAlign: "left", alignSelf: "center" },

    modalView: {
        flex: 0.25,
        width: responsiveWidth(90),
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#000000d6"
    },
    modalView: {
        // height: responsiveHeight(60),
        width: responsiveWidth(85),
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default ProductScanner;