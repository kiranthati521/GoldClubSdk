// updated code as per new design 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState, useCallback, useMemo, use } from "react";
import { Alert, Animated, AppState, BackHandler, Dimensions, FlatList, Image, ImageBackground, Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import Sound from 'react-native-sound';
import _ from 'lodash';
import { Styles } from "../assets/style/styles";
import Realm from 'realm';
import { strings } from "../strings/strings";
import { Colors } from "../assets/Utils/Color";
import { GetApiHeaders, PostRequest } from "../NetworkUtils/NetworkUtils";
import SimpleToast from "react-native-simple-toast";
import { HTTP_ACCEPTED, HTTP_CREATED, HTTP_OK, configs } from "../helpers/URLConstants";
import CustomLoader from "../Components/CustomLoader";
import CustomSuccessLoader from "../Components/CustomSuccessLoader";
import CustomErrorLoader from "../Components/CustomErrorLoader";
import CustomButton from "../Components/CustomButton";
import moment from "moment";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { DEVICE_TOKEN, FCM_TOKEN, MOBILE_NUMBER, USER_ID, USER_NAME, getAppVersion, getAppVersionCode, getDeviceId, retrieveData } from "../assets/Utils/Utils";
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateOfflineCount } from '../Dashboard/synchCountUtils';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);
var realm;
let scannedCoupons;
var camDevice;
function QRScannerNew({ route }) {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const cameraRef = useRef(null);
    const navigation = useNavigation();
    const [scanning, setScanning] = useState(true);
    const [scanStatus, setScanStatus] = useState('ready');
    const dispatch = useDispatch()
    const totalPoints = route?.params?.userPointsEarned;
    const [loading, setLoading] = useState(false)
    // const animatedValue = new Animated.Value(0);
    // const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
    const scanBoxSize = 250;
    const [successLoading, setSuccessLoading] = useState(false)
    const [lastScannedCode, setLastScannedCode] = useState(null);
    const [numberOfCouponsScanned, setNumberOfCouponsScanned] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorLoading, setErrorLoading] = useState(false);
    let [openAlertBox, setAlertBox] = useState(false)
    let [showGoBackAlertBox, setshowGoBackAlertBox] = useState(false)
    const [showQueryAlert, setShowQueryAlert] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
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
    const { latitude, longitude } = useSelector((state) => state.location);
    camDevice = useCameraDevice('back');

    console.log("latitude_longtitude Scanner New", latitude, longitude)

    useEffect(() => {
        console.log("numberOfCouponsScanned====>", JSON.stringify(numberOfCouponsScanned))
    }, [numberOfCouponsScanned])

    const onSuccess = () => {
        setQRActivate(false)
        // alert(response.data)
        if (networkStatus) {
            // setScannedData(response);
            console.log('calling online API call..............', "<===============")
            submitQRData()
        } else {
            // SimpleToast.show(translate('no_internet_conneccted'))
            // setQRActivate(true)
            storeQROffline();
        }

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
        // else if(showCustomActionSheet){
        //     navigation.goBack();
        //     return true;   
        // }
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

        // if (error.message.includes('restricted by the operating system')) {
        //   Alert.alert(
        //     'Camera Restricted',
        //     'Camera access is restricted by device policies. Please check your device settings or contact your administrator.',
        //     [{ text: 'OK', onPress: () => navigation.goBack() }]
        //   );
        // } else {
        //   // Handle other camera errors
        //   Alert.alert(
        //     'Camera Error',
        //     error.message,
        //     [{ text: 'OK' }]
        //   );
        // }
    }, [navigation]);

    const storeQROffline = async () => {
        console.log("datadata")
        setAlertBox(false)
        if (scannedCoupons && scannedCoupons.length) {
            var userId = await retrieveData(USER_ID);
            userId = userId.toString()
            var mobileNumber = await retrieveData(MOBILE_NUMBER);
            // console.log(getHeaders,"headerssszzz")
            console.log(couponExists(numberOfCouponsScanned, scannedCoupons), "em ostundo chudu")
            if (!couponExists(numberOfCouponsScanned, scannedCoupons)) {
                const couponData = {
                    "loginUserId": userId,
                    "loginMobileNumber": mobileNumber,
                    "retailerId": userId,
                    "retailerMobileNumber": mobileNumber,
                    "deviceType": "mobile",
                    "type": "",
                    "isOnlineRecord": JSON.stringify(false),
                    "scannedDate": moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    "geoLocations": `${latitude},${longitude}`,
                    "qrCodeScanData": numberOfCouponsScanned
                };

                realm.write(() => {
                    realm.create('scannedCoupons', couponData);
                });
                setShowCustomActionSheet(true)
                setNumberOfCouponsScanned([]);
                setScannedCouponStatus(true)
                updateOfflineCount(dispatch)
            } else {
                // SimpleToast.show("Coupon already scanned....");
                setShowCustomActionSheet(true)
                setNumberOfCouponsScanned([]);
                setScannedCouponStatus(false)
            }
        } else {
            var userId = await retrieveData(USER_ID);
            userId = userId.toString()
            var mobileNumber = await retrieveData(MOBILE_NUMBER);
            const couponData = {
                "loginUserId": userId,
                "loginMobileNumber": mobileNumber,
                "retailerId": userId,
                "retailerMobileNumber": mobileNumber,
                "deviceType": "mobile",
                "type": "",
                "isOnlineRecord": JSON.stringify(false),
                "scannedDate": moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                "geoLocations": `${latitude},${longitude}`,
                "qrCodeScanData": numberOfCouponsScanned
            };

            realm.write(() => {
                realm.create('scannedCoupons', couponData);
            });
            setShowCustomActionSheet(true)
            setNumberOfCouponsScanned([]);
            setScannedCouponStatus(true)
            updateOfflineCount(dispatch)
        }
    };

    // function couponExists(data, scannedCoupons) {
    //     console.log("dsdsdsdsdd", JSON.stringify(data) + "---" + JSON.stringify(scannedCoupons))
    //     // return scannedCoupons.some(coupon => coupon.qrCodeData === data);
    //     return data.some(item => 
    //         scannedCoupons.qrCodeScanData.some(coupon => coupon.qrCodeData === item.qrCodeData)
    //     );
    // }

    function couponExists(data, scannedCoupons) {
        console.log("dsdsdsdsdd", JSON.stringify(data) + "---" + JSON.stringify(scannedCoupons));

        // Check if scannedCoupons is an array and contains objects with qrCodeScanData
        if (!Array.isArray(scannedCoupons)) {
            return false; // or handle the error
        }

        // Loop through each object in scannedCoupons
        return data.some(item =>
            scannedCoupons.some(scannedCoupon =>
                Array.isArray(scannedCoupon.qrCodeScanData) &&
                scannedCoupon.qrCodeScanData.some(coupon => coupon.qrCodeData === item.qrCodeData)
            )
        );
    }



    // useEffect(() => {
    //     const startAnimation = () => {
    //         Animated.loop(
    //             Animated.sequence([
    //                 Animated.timing(animatedValue, {
    //                     toValue: 170,
    //                     duration: 1000,
    //                     useNativeDriver: true,
    //                 }),
    //                 Animated.timing(animatedValue, {
    //                     toValue: 0,
    //                     duration: 1000,
    //                     useNativeDriver: true,
    //                 }),
    //             ])
    //         ).start();
    //     };
    //     startAnimation();
    //     const intervalId = setInterval(startAnimation, 60000);

    //     return () => {
    //         clearInterval(intervalId);
    //     };
    // }, [animatedValue]);

    useEffect(() => {
        realm = new Realm({ path: 'User.realm' })
        scannedCoupons = realm.objects('scannedCoupons')

        console.log("SCANNED_OFFLINE", scannedCoupons);
    }, [qrActivate])

    const submitQRData = async () => {
        if (networkStatus && !isApiInProgressRef.current) {
            isApiInProgressRef.current = true;
            if (Platform.OS === 'android') {
                setLoading(true);
            } else {
                setTimeout(() => {
                    setLoading(true);
                }, 500);
            }


            setLoadingMessage(translate('submittingDataWait'));
            try {
                var url = configs.BASE_URL + configs.QRSCAN.VALIDATEQR_V9;
                var getHeaders = await GetApiHeaders();

                var dataList = {
                    "loginUserId": getHeaders.userId,
                    "loginMobileNumber": getHeaders.mobileNumber,
                    "retailerId": getHeaders.userId,
                    "retailerMobileNumber": getHeaders.mobileNumber,
                    "deviceType": "mobile",
                    "type": "",
                    "isOnlineRecord": true,
                    "geoLocations": `${latitude},${longitude}`,
                    "qrCodeScanData": numberOfCouponsScanned
                }

                console.log("URL ====>", url, " \n Headers ====>", getHeaders, " \n BODSY ====>", dataList);
                // setTimeout(async () => {
                var APIResponse = await PostRequest(url, getHeaders, dataList);
                console.log("Response ====>", APIResponse);

                if (APIResponse != undefined && APIResponse != null) {
                    setLastScannedCode(null);
                    if (APIResponse.statusCode == HTTP_OK) {
                        if (Platform.OS == 'android') {
                            setShowCustomActionSheet(true);
                            setScannedResponse(APIResponse);
                            setTimeout(() => {
                                setLoadingMessage();
                                setLoading(false);
                                setNumberOfCouponsScanned([]);
                            }, 1500);
                        }
                        else {
                            setTimeout(() => {
                                setLoadingMessage();
                                setLoading(false);
                                setScannedResponse(APIResponse);
                                setTimeout(() => {
                                    setShowCustomActionSheet(true);
                                    setNumberOfCouponsScanned([]);
                                }, 600)
                            }, 1000);

                        }

                    }
                    else if (APIResponse.statusCode == HTTP_CREATED) {
                        setShowCustomActionSheet(true);
                        setScannedResponse(APIResponse);
                        // SimpleToast.show(APIResponse.message);
                        setTimeout(() => {
                            setLoadingMessage();
                            setLoading(false);
                            setNumberOfCouponsScanned([]);
                        }, 1500);
                    } else if (APIResponse.statusCode == HTTP_ACCEPTED) {
                        setShowCustomActionSheet(true);
                        setScannedResponse(APIResponse);
                        // SimpleToast.show(APIResponse.message);
                        setTimeout(() => {
                            setLoadingMessage();
                            setLoading(false);
                            setNumberOfCouponsScanned([]);
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            setNumberOfCouponsScanned([]);
                            setQRActivate(true);
                            if (APIResponse?.message) { SimpleToast.show(APIResponse?.message) }
                        }, Platform.OS === 'android' ? 500 : 1500);

                    }

                    setTimeout(() => {
                        setLoadingMessage();
                        setLoading(false);
                        setIsApiInProgress(false)
                    }, Platform.OS === 'android' ? 100 : 1500);
                }
                // }, 500);
            } catch (error) {
                setTimeout(() => {
                    console.error("API Error", error);
                    setLoadingMessage();
                    setLoading(false);
                    setIsApiInProgress(false)
                    SimpleToast.show(translate('something_went_wrong'));
                }, 1000);

            } finally {
                setTimeout(() => {
                    isApiInProgressRef.current = false;
                    setIsApiInProgress(false);
                    setLoading(false);
                    setLoadingMessage('');
                }, Platform.OS === 'android' ? 0 : 1000);

            }


        } else {
            SimpleToast.show(translate('no_internet_conneccted'));
        }
    }


    

    let renderSuccessOrFailurePopup = () => {
        // console.log(scannedResponse,"scanned response<<<<<<<<<<<<<<<<<<<<<<")
        // const filteredData = scannedResponse ? Object.entries(scannedResponse?.response?.countJson)?.filter(([key, value]) => value !== 0) : []
        return (
            <Modal animationType="fade"
                transparent={true}
                visible={showCustomActionSheet}
                onRequestClose={handleBackButtonClick}>
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
                            <ImageBackground source={require('../assets/images/success_bg.png')} style={[{ alignSelf: 'center', marginTop: 20, padding: 5 }]}>
                                <Text style={[styles['font_size_18_bold'], styles['text_color_black'], styles['text_align_center']]}>{translate('congratulations')}</Text>
                                {/* {scannedResponse?.message && <Text style={[styles['font_size_18_semibold'], styles['text_color_black'], styles['text_align_center'], styles['padding_10']]}>{scannedResponse?.message}</Text>} */}
                                {scannedResponse?.message && <Text style={[styles['font_size_14_semibold'], styles['text_color_green'], styles['text_align_center'], styles['margin_top_10'], styles['padding_10']]}>{scannedResponse?.message}</Text>}
                                {/* {scannedResponse?.response?.message && <Text style={[styles['font_size_14_semibold'], styles['text_color_green'], styles['text_align_center'], styles['margin_top_10'], styles['padding_10']]}>{scannedResponse?.response?.message}</Text>} */}
                            </ImageBackground>}
                        {/* 
                        {(scannedResponse != null && scannedResponse?.statusCode != HTTP_OK) &&
                            <Text style={[styles['font_size_18_semibold'], styles['text_color_black'], styles['text_align_center'], styles['padding_10']]}>{scannedResponse != null && scannedResponse?.message}</Text>
                        } */}

                        {/* {filteredData && <FlatList
                            data={filteredData}
                            keyExtractor={([key]) => key}
                            ListFooterComponent={<View style={{height:10}}/>}
                            renderItem={({ item }) => {
                                const [key, value] = item;
                                return (
                                    <View>
                                        <Text style={[styles['font_size_14_regular'], { textAlign: 'center', color: 'black', padding: 2 }]}>{key.replace(/_/g, ' ')}: {typeof value === 'object' ? JSON.stringify(value) : value}</Text>
                                    </View>
                                );
                            }}
                        />} */}

                        <View style={[{ flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', width: '90%', marginBottom: 20, alignSelf: 'center' }]}>
                            <TouchableOpacity onPress={() => {
                                setShowCustomActionSheet(false)
                                setQRActivate(true)
                                setNumberOfCouponsScanned([])
                            }} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: dynamicStyles.iconPrimaryColor, width: "56%" }]}>
                                <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.iconPrimaryColor }]}>{translate('scanMore')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setShowCustomActionSheet(false)
                                navigation.goBack()
                            }} style={[styleSheetStyles.button, styleSheetStyles.saveButton, { borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.primaryColor, width: '41%' }]}>
                                <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.secondaryColor }]}>{translate('done')}</Text>
                            </TouchableOpacity>
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
                                    setTimeout(() => {
                                        setQRActivate(true)
                                    }, 500);
                                    setNumberOfCouponsScanned([])

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

    const validateCoupon = (coupon) => {
        const regex = /^\d+[A-Za-z]+[A-Za-z0-9]+$/;
        return regex.test(coupon);
    };

    let callSubmitApi = () => {
        // setIsProcessing(true);
        setAlertBox(false);

        setTimeout(() => {
            setQRActivate(false);
            onSuccess();
            // setIsProcessing(false);
        }, 500);
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
        onCodeScanned: (codes) => {
            if (!scanning || codes.length === 0) return;

            const scannedCode = codes[0]?.value;
            if (!scannedCode) return;

            setScanning(false);
            if (validateCoupon(scannedCode)) {
                const isAlreadyScanned = numberOfCouponsScanned.some(
                    item => item.qrCodeData === scannedCode
                );

                if (isAlreadyScanned) {
                    SimpleToast.show(translate('couponAlreadyScanned'));
                    playSound('error');
                    setScanStatus('error');
                } else {
                    setNumberOfCouponsScanned(prev => [...prev, { qrCodeData: scannedCode, scannedDate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), geoLocations: `${latitude},${longitude}` }]);
                    playSound('success');
                    setScanStatus('success');
                }
            } else {
                SimpleToast.show(translate('invalidCoupon'));
                playSound('error');
                setScanStatus('error');
            }

            // Resume scanning after 2 seconds
            setTimeout(() => {
                setScanning(true);
                setScanStatus('ready');
            }, 2000);
        }
    });

    useEffect(() => {
        if (numberOfCouponsScanned.length === 30) {
            console.log('called api due to matched with 30 points', "<<<<<<======");
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
                                                    height: '80%',
                                                    zIndex: 100,
                                                },
                                            ]}
                                        >
                                            {
                                                qrActivate
                                                // true
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
                                                            // zoom={5}
                                                            onError={onError}
                                                            codeScanner={codeScanner}
                                                            codeScannerOptions={{ interval: 1000 }}
                                                            isActive={qrActivate}
                                                        />
                                                        <View style={{ height: '100%', width: '100%', position: 'absolute', overflow: 'hidden' }}>
                                                            {/* <AnimatedLinearGradient
                                                    colors={['rgba(242, 242, 242, 0)', 'rgba(0, 135, 63, 0.8)', 'rgba(121, 121, 121, 0)']}
                                                    style={{
                                                        width: '100%',
                                                        height: '30%',
                                                        transform: [
                                                            {
                                                                translateY: animatedValue,
                                                            },
                                                        ],
                                                    }}
                                                /> */}

                                                        </View>
                                                    </View>
                                                </ImageBackground>}
                                        </View>
                                        {/* {!showCustomActionSheet && qrActivate ? <View style={{ backgroundColor: qrActivate ? "white" : "transparent", height: '25%', width: '100%', position: "absolute", bottom: 0,zIndex:101, borderTopLeftRadius: 25, borderTopRightRadius: 25 }}> */}
                                        {<View style={{ backgroundColor: "white", height: '30%', width: '100%', position: "absolute", bottom: 0, zIndex: 101, borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                                            <View style={{ borderWidth: 1, borderColor: "rgba(220, 220, 220, 1)", borderRadius: 8, marginTop: 20, padding: 10, width: "90%", height: '55%', alignSelf: "center" }}>
                                                <Text style={[{ color: dynamicStyles.textColor }, { textAlign: "center", lineHeight: 25 }, styles['font_size_16_semibold']]} >{translate('NumberOfCouponsScanned')}</Text>
                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10 }}>
                                                    <Text style={[{ color: 'rgba(0, 135, 63, 1)' }, { textAlign: "center", marginBottom: 10, marginRight: -10 }, styles['font_size_40_semibold']]} >{numberOfCouponsScanned.length}</Text>
                                                    <Image source={require('../assets/images/crossLine.png')} style={{ height: 40, width: 40, resizeMode: "contain" }} />
                                                    <Text style={[{ color: 'grey' }, { textAlign: "center", marginTop: 10, marginLeft: -10 }, styles['font_size_28_semibold']]} >{'30'}</Text>
                                                </View>
                                            </View>
                                            <View style={{ marginTop: "auto", bottom: 10 }}>
                                                <CustomButton
                                                    shouldDisable={numberOfCouponsScanned.length === 0 || numberOfCouponsScanned.length === 30}
                                                    title={translate('submit')}
                                                    onPress={() => { setAlertBox(true) }}
                                                    // buttonBg={dynamicStyles.primaryColor}
                                                    buttonBg={
                                                        numberOfCouponsScanned.length === 0 ? dynamicStyles?.highLightedColor :
                                                            dynamicStyles.primaryColor}
                                                    btnWidth={'90%'}
                                                    // titleTextColor={dynamicStyles.secondaryColor}
                                                    titleTextColor={
                                                        numberOfCouponsScanned.length === 0 ? 'white' :
                                                            dynamicStyles.secondaryColor}
                                                />
                                            </View>

                                        </View>
                                            // : <View style={{ backgroundColor:'rgba(51, 51, 51, 1)', height: '25%', width: '100%', position: "absolute", bottom: 0,zIndex:101, borderTopLeftRadius: 25, borderTopRightRadius: 25 }} />
                                        }

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
                                                <Text style={[{ color: 'rgba(255, 255, 255, 1)', marginLeft: 10 }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 26 }]}>
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
                                <Text style={[styleSheetStyles.headerText3, styles['font_size_17_regular']]}>{showGoBackAlertBox ? translate('discard_scanned_data_sofar') : translate('Doyouwanttoscanmorecoupons')}</Text>
                                <View style={styleSheetStyles.container}>
                                    <TouchableOpacity onPress={() => {
                                        // resetValues()
                                        // setSelectedCrop('')
                                        setAlertBox(false)
                                    }} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: dynamicStyles.iconPrimaryColor, width: "56%" }]}>
                                        <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.iconPrimaryColor }]}>{showGoBackAlertBox ? translate('cancel') : translate('scanMore')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        console.log('called from yes button', "<=============")
                                        showGoBackAlertBox ? navigation.goBack() : callSubmitApi()
                                    }} style={[styleSheetStyles.button, styleSheetStyles.saveButton, { borderColor: dynamicStyles.primaryColor, backgroundColor: dynamicStyles.primaryColor, width: '41%' }]}>
                                        <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.secondaryColor }]}>{showGoBackAlertBox ? translate('ok') : translate('submit')}</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Doyouwanttoscanmorecoupons */}
                            </View>
                        </View>
                    </View>
                </Modal>
                {showCustomActionSheet && renderSuccessOrFailurePopup()}
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
        marginTop: 20
        // marginTop:"auto"
    },
    button: {
        width: '47.5%',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    clearButton: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        // ,
    },
    saveButton: {
        // 
        // 
    },
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
    headerText3: { color: "rgba(7, 28, 31, 1)", textAlign: "center", alignSelf: "center" },

    modalView: {
        minHeight: responsiveHeight(25),
        // flex: 0.25,
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
});

export default QRScannerNew;