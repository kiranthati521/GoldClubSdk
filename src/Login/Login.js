import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, AppState, Linking, KeyboardAvoidingView, Keyboard, ImageBackground, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { useNavigation } from '@react-navigation/native';
import { GetApiHeaders, PostRequest } from '../NetworkUtils/NetworkUtils';
import { APP_ENV_PROD, FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, HTTP_OK, SECOND_LOGIN, configs } from '../helpers/URLConstants';
import CustomAlert from '../Components/CustomAlert';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomLoader from '../Components/CustomLoader';
import SimpleToast from 'react-native-simple-toast';
import CustomBorderTextInput from '../Components/CustomBorderTextInput';
import { EDITDATA, FCM_TOKEN, LOGINONCE, TERMS_CONDITIONS, getAppVersion, getBuildNumber, storeData } from '../assets/Utils/Utils';
import { retrieveData } from '../assets/Utils/Utils';
import { RESULTS, requestNotifications } from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);


function Login() {
  const networkStatus = useSelector(state => state.networkStatus.value)
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))

  const [mobileNumber, setMobileNumber] = useState('')
  const navigation = useNavigation()

  const [storeMobileNum, setStoreMobileNum] = useState('')
  const [storeUserID, setStoreUserID] = useState('')

  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
  const [checkedUnChecked, setCheckedUnChecked] = useState(false)
  // const userData = useSelector(selectUser);
  const [userLoginOnce, setUserLoginOnce] = useState('')
  const [dataConfirmModal, showDataConfirmModal] = useState(false);
  const [oTPApiresponse, setOTPApiresponse] = useState(null)
  const [showWebView, setShowWebView] = useState(false);
  const [termsConditionsAccepted, setTermsConditionsAccepted] = useState(false)
  const [fromLogin, setFromLogin] = useState(false)
  const [isYellowViewVisible, setIsYellowViewVisible] = useState(true);
  const appState = useRef(AppState.currentState);
  const storeLink = "https://play.google.com/store/apps/details?id=com.nuziveeduseeds.nslchannel";
  const handleLoading = () => {
    setLoading(false);
  }

  useEffect(() => {
    handleLoading();
    getFCMtoken()
    requestNotificationPermission();
  }, [])

  useEffect(() => {
    console.log("AppState listener set up");

    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log("AppState changed: ", nextAppState);

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log("App has come to the foreground");

        checkForceUpdate();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      console.log("AppState listener removed");
    };
  }, []);

  useEffect(() => {
    checkForceUpdate();
  }, []);

  async function checkForceUpdate() {
    try {
      const subscriber = firestore()
        .collection(FIREBASE_VERSION_COLLECTION_NAME)
        .doc(FIREBASE_VERSION_DOC_ID)
        .onSnapshot(documentSnapshot => {
          console.log('Document snapshot received');

          if (documentSnapshot.exists) {
            const data = documentSnapshot.data();
            console.log('Document data:', data);

            if (data) {
              setLoading(false);
              setTimeout(() => {
                checkAppversionUpdate(data);
              }, 500);
            } else {
              console.error('Document data is undefined');
              setLoading(false);
            }
          } else {
            console.error('Document does not exist');
            setLoading(false);
          }
        });

      return () => subscriber();
    } catch (error) {
      console.error('Error fetching document:', error);
      setLoading(false);
    }
  }

  async function checkAppversionUpdate(documentSnapshot) {
    try {
      const appDetails = await getAppVersion();
      const appVersionCode = await getBuildNumber();
      console.log("App version details:", appDetails);
      console.log("Document snapshot data:", documentSnapshot);

      if (documentSnapshot) {
        const version = Platform.OS === 'ios' ? documentSnapshot.iosAppVersion : documentSnapshot.androidAppVersion;
        let androidAppVersionPROD = Platform.OS === 'ios' ? documentSnapshot?.iosAppVersionPROD : documentSnapshot.androidAppVersionPROD
        console.log("Version from Firestore:", version);
        let showForceUpdateOrNOT = documentSnapshot?.showForceUpdate;
        let AppVersionUAT = Platform.OS == "ios" ? documentSnapshot?.iosAppVersionUAT : documentSnapshot?.androidAppVersionUAT
        if (androidAppVersionPROD) {
          if (APP_ENV_PROD) {
            console.log('we are in LIVE server')
            if (androidAppVersionPROD && androidAppVersionPROD > appVersionCode) {
              const isMandatory = Platform.OS === 'android'
                ? documentSnapshot.isMandatoryForAndroid
                : documentSnapshot.isMandatoryForIos;
              showAlertWithMessage(translate('alert'), true, true, documentSnapshot.message || translate('update_message'), true, !isMandatory, translate('update'), translate('cancel'));
            }
          } else {
            console.log(AppVersionUAT, 'we are in UAT server', appVersionCode)
            if (AppVersionUAT && AppVersionUAT > appVersionCode) {
              const isMandatory = Platform.OS === 'android'
                ? documentSnapshot.isMandatoryForAndroid
                : documentSnapshot.isMandatoryForIos;
              showAlertWithMessage(translate('alert'), true, true, documentSnapshot.message || translate('update_message'), true, !isMandatory, translate('update'), translate('cancel'));
            }
          }
        } else {
        if (showForceUpdateOrNOT) {
        if (version && version !== appDetails) {
          const isMandatory = Platform.OS === 'android'
            ? documentSnapshot.isMandatoryForAndroid
            : documentSnapshot.isMandatoryForIos;
          console.log("Update is mandatory:", isMandatory);

          showAlertWithMessage(translate('alert'), true, true, documentSnapshot.message || translate('update_message'), true, !isMandatory, translate('update'), translate('cancel'));
        }} else {
          setShowAlert(false);
        }}
      } else {
        setShowAlert(false);
      }
    } catch (error) {
      console.error('Error in checkAppversionUpdate:', error);
      setShowAlert(false);
    }
  }

  const getFCMtoken = async () => {
    console.log("SAINATH FCM:")
    const fcmToken = await messaging().getToken();
    storeData(FCM_TOKEN, fcmToken)
    console.log("SAINATH FCM Token:", fcmToken)
  }

  async function requestNotificationPermission() {
    try {
      const { status, settings } = await requestNotifications(['alert', 'badge', 'sound']);
      if (status === RESULTS.GRANTED) {
        console.log('Notification permission granted');
        // Permission granted, you can initialize push notification library or do other actions here
      } else {
        console.log('Notification permission denied');
        // Handle the scenario where permission is denied
      }
    } catch (error) {
      console.log('Error requesting notification permission:', error);
    }
  }

  useEffect(() => {
    setLoading(false)
    setLoadingMessage()
    const fetchData = async () => {
      setUserLoginOnce(await retrieveData(LOGINONCE))
    };
    fetchData();
  }, []);

  useEffect(() => {
  }, [storeMobileNum, storeUserID])

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log("nextAppState", nextAppState)
      if (nextAppState === 'active') {
        console.log("BACK TO APPLICATION");
      }
    };
    AppState.addEventListener('change', handleAppStateChange);
  }, []);

  const checkButtonPress = async () => {
    setCheckedUnChecked(!checkedUnChecked)
    console.log('it is true or false', checkedUnChecked)

  }

  const GetTermsConditionDetailsApiCall = async () => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getURL = configs.BASE_URL + configs.AUTH.CHECK_TERMS;
        var getHeaders = await GetApiHeaders();

        var dataList = {
          'mobileNumber': mobileNumber
        }
        console.log('getURL is', getURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getURL, getHeaders, dataList);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              console.log('terms resp is here', APIResponse.response.termsAndConditionsAccepted)
              setTermsConditionsAccepted(APIResponse.response.termsAndConditionsAccepted)
              storeData(TERMS_CONDITIONS, APIResponse?.response?.termsAndConditionsAccepted)
            }, 1000);

            setTimeout(() => {
              setLoadingMessage()
              setLoading(false)

              if (APIResponse?.response?.termsAndConditionsAccepted) {
                console.log('terms resp is here 2', APIResponse.response.termsAndConditionsAccepted)
                sendOTPApiCall(0)
              }
              else {
                setShowWebView(true)
              }
            }, 1200);
          }
          else {
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 500);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const termsButtonPress = async () => {
   Linking.openURL(configs.TERMS_CONDIOTNS_URL)
  }
  const policyButtonPress = async () => {
    Linking.openURL('http://nvmuat.empover.com:8080/Privacy-Policy.html')
  }

  const signUpButtonPress = async () => {
    setFromLogin(false)
    setShowWebView(true)
    // setMobileNumber()
    // navigation.navigate('SignUp')
  }
  const vyaparMitraButtonPress = async () => {
    Linking.openURL(`tel:${translate('callNumber')}`)
  }
  const requestOTPButtonPress = async () => {

    if (mobileNumber == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('mobile_number'), false, true, translate('ok'), translate('cancel'))
    }
    else if (mobileNumber.length < 10) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('mobile_number'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (checkedUnChecked == false) {
    //   showAlertWithMessage(translate('alert'), true, true, translate('tocontinuePleaseCheck'), false, true, translate('ok'), translate('cancel'))
    // }
    else {
      // sendOTPApiCall(0)
      setFromLogin(true)
      GetTermsConditionDetailsApiCall()
    }
  }

  const showAlertWithMessage = (title, header, heaertext, message, yesBtn, noBtn, yesText, noText) => {
    setAlertTitle(title);
    setShowAlertHeader(header);
    setShowAlertHeaderText(heaertext)
    setAlertMessage(message);
    setShowAlertYesButton(yesBtn);
    setShowAlertNoButton(noBtn);
    setShowAlertyesButtonText(yesText);
    setShowAlertNoButtonText(noText);
    setShowAlert(true)
  }

  const handleCancelAlert = () => {
    setShowAlert(false)
  }

  const handleOkAlert = () => {
    if (showAlertyesButtonText == translate('continue')) {
      setShowAlert(false)
    }
    if (showAlertyesButtonText == translate('update')) {
      if (Platform.OS == 'ios') {
        Linking.openURL("")
      } else {
        Linking.openURL(storeLink)
      }
    }
    if (showAlertyesButtonText == translate('proceed')) {
      sendOTPApiCall(1)
    }
    setShowAlert(false)
  }


  const sendOTPApiCall = async (userAcceptanceKey) => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('create_new_token_message'))

        var getloginURL = configs.BASE_URL + configs.AUTH.SEND_OTP;
        var getHeaders = await GetApiHeaders();

        var dataList = {
          "mobileNumber": mobileNumber,
          "userAcceptanceKey": userAcceptanceKey,
          "termsAndConditionsAccepted": await retrieveData(TERMS_CONDITIONS),
        }

        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        console.log('login response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse?.statusCode == HTTP_OK) {
            var otpResponse = APIResponse?.response[0]
            if ((otpResponse?.registeredThrough != undefined && otpResponse?.registeredThrough.toLowerCase() == Platform.OS.toLowerCase()) || !otpResponse?.loggedInFirstTime) {
              setTimeout(() => {
                setLoading(false)
                setSuccessLoading(true)
                setSuccessLoadingMessage(translate('otp_generated_message_sms'))
              }, 1000);
            }

            setTimeout(() => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
              setOTPApiresponse(APIResponse)
              if ((otpResponse?.registeredThrough?.toLowerCase() === 'android' || otpResponse?.registeredThrough?.toLowerCase() === 'ios') || !otpResponse?.loggedInFirstTime) {
                storeData(EDITDATA, false);
                navigation.navigate('LoginOTP', { otp: APIResponse, getuserAcceptanceKey: userAcceptanceKey, loginMobileNumber: mobileNumber });
              } else {
                if (otpResponse !== undefined) {
                  showDataConfirmModal(true);
                }
              }
            }, 1500);
          }
          else if (APIResponse?.statusCode == SECOND_LOGIN) {
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, true, true, translate('proceed'), translate('cancel'))
          }
          else {
            setMobileNumber()
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
          }

        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 500);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Handle keyboard show event
        // Adjust your views here

      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Handle keyboard hide event
        // Adjust your views here
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const ShowDataModal = () => {
    var data = oTPApiresponse?.response[0]
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
        <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], styles['padding_10'], { borderRadius: 8 }]}>
          <Text style={[styles['width_100%'], styles['font_size_18_semibold'], styles['padding_5'], { textAlign: 'center', color: Colors.black }]} >{translate('retailerInfo')}</Text>
          <View style={[{ backgroundColor: Colors.very_light_grey, height: 1, width: '90%' }, styles['align_self_center']]} />
          <View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 10 }, styles['align_self_center']]}>
            <Text style={[styles['font_size_13_semibold'], styles['text_color_black'], { width: '50%' }]}>{translate('firmName')}</Text>
            <Text style={[styles['font_size_12_regular'], styles['text_color_black'],]}>{" : "}</Text>
            <Text style={[styles['font_size_12_regular'], styles['text_color_black'], { width: '50%', marginStart: 10 }]}>{data?.firmName}</Text>
          </View>
          <View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 10 }, styles['align_self_center']]}>
            <Text style={[styles['font_size_13_semibold'], styles['text_color_black'], { width: '50%' }]}>{translate('proprietorName')}</Text>
            <Text style={[styles['font_size_12_regular'], styles['text_color_black'],]}>{" : "}</Text>
            <Text style={[styles['font_size_12_regular'], styles['text_color_black'], { width: '50%', marginStart: 10 }]}>{data?.proprietorName}</Text>
          </View>
          <View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 10 }, styles['align_self_center']]}>
            <Text style={[styles['font_size_13_semibold'], styles['text_color_black'], { width: '50%' }]}>{translate('state')}</Text>
            <Text style={[styles['font_size_12_regular'], styles['text_color_black'],]}>{" : "}</Text>
            <Text style={[styles['font_size_12_regular'], styles['text_color_black'], { width: '50%', marginStart: 10 }]}>{data?.stateName}</Text>
          </View>

          <View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 10 }, styles['align_self_center']]}>
            <Text style={[styles['font_size_13_semibold'], styles['text_color_black'], { width: '50%' }]}>{translate('district')}</Text>
            <Text style={[styles['font_size_12_regular'], styles['text_color_black'],]}>{" : "}</Text>
            <Text style={[styles['font_size_12_regular'], styles['text_color_black'], { width: '50%', marginStart: 10 }]}>{data?.districtName}</Text>
          </View>


          <View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }, styles['align_self_center']]}>
            <CustomButton
              title={translate('editOnly')}
              onPress={() => {
                showDataConfirmModal(false)
                storeData(EDITDATA, true)
                navigation.navigate('LoginOTP', { otp: oTPApiresponse, getuserAcceptanceKey: 0, loginMobileNumber: mobileNumber })
              }}
              buttonBg={Colors.white}
              btnWidth={'40%'}
              titleTextColor={Colors.themeRed}
              textAlign={'center'}
              isBoldText={true}
              borderWidth={0.5}
              borderRadius={8}
              borderColor={Colors.red}
            />

            <CustomButton
              title={translate('continue')}
              onPress={() => {
                showDataConfirmModal(false)
                storeData(EDITDATA, false)
                navigation.navigate('LoginOTP', { otp: oTPApiresponse, getuserAcceptanceKey: 0, loginMobileNumber: mobileNumber })
              }}
              buttonBg={Colors.themeRed}
              btnWidth={'40%'}
              titleTextColor={Colors.white}
              textAlign={'center'}
              isBoldText={true}
            />
          </View>
        </View>
      </View>
    )
  }
  const approveTermsButtonClick = () => {
    if (fromLogin) {
      setShowWebView(false)
      setTermsConditionsAccepted(true)
      storeData(TERMS_CONDITIONS, true)
      setTimeout(() => {
        sendOTPApiCall(0)
      }, 1500);
    } else {
      setShowWebView(false)
      setMobileNumber()
      navigation.navigate('SignUp')
    }

    // setTimeout(() => {
    //   if (termsConditionsAccepted == true) {
    //     sendOTPApiCall(userAcceptanceKey = 0)
    //   }
    // }, 1000);
  }

  const handleWebViewScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const scrollPosition = contentOffset.y;
    if (scrollPosition <= 0) {
      setIsYellowViewVisible(true);
    } else {
      setIsYellowViewVisible(false);
    }
  };

  const showWebViewSection = () => {
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>

        <View style={[styles['width_90%'], styles['height_90%']]}>

          <WebView
            onLoadStart={() => {
              // setLoading(true)
              // setLoadingMessage(translate('please_wait_getting_data'))
            }}
            onLoad={() => {
              // setLoading(false)
              // setLoadingMessage()
            }}
            source={{ uri: configs.TERMS_CONDIOTNS_URL }} // Replace with your desired URL
            style={[styles['centerItems'], styles['border_radius_6'], { height: '80%', width: '90%' }]}
            containerStyle={[styles['centerItems'], { flex: 1, width: '100%', height: '90%' }]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onScroll={handleWebViewScroll}
            onMessage={(event) => {
              console.log("event", event.nativeEvent.data)
              if (event.nativeEvent.data == "Accepted") {
                approveTermsButtonClick()
              }
            }}
          />

          {isYellowViewVisible && <TouchableOpacity style={[{ position: 'absolute', top: 5, end: 20, height: 20, width: 20, borderRadius: 15, alignSelf: 'flex-end' }]} onPress={() => { setShowWebView(false) }}>
            <Image style={[{ height: '100%', width: "100%", }]} source={require('../assets/images/close.png')} />
          </TouchableOpacity>}
        </View>
      </View>
    )
  }


  return (
    // <SafeAreaView>
    <View style={[styles['full_screen'], { padding: 0, margin: 0, width: '100%', height: '100%' }]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={'white'} barStyle='dark-content' />}
      <ImageBackground source={require('../assets/images/bgView.png')} resizeMode='stretch' style={[styles['full_screen']]}>

        <View style={[styles['absolute_position'], styles['padding_top_40'], styles['align_self_center']]}>


          <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true}>
            <View style={[{ marginTop: Dimensions.get('window').height / 12 }]}>


              <Image source={require('../assets/images/appIcon.png')} style={[styles['margin_left_10'], styles['width_height_100']]} resizeMode='contain' />

              <View style={[styles['margin_left_20'], styles['margin_top_10']]}>
                <Text style={[styles['font_size_26_semibold'], styles['text_color_black'], styles['text_align_left'], styles['top_5']]}>{userLoginOnce == true ? translate('welcomeBack') : translate('WelcometoVyaparMitra')}</Text>
                <Text style={[styles['font_size_12_regular'], styles['text_color_black'], styles['text_align_left'], styles['margin_top_10']]}>{translate('signintoyouraccount')}</Text>
              </View>

              {/* Farmer Mobile Number */}
              <View style={[styles['margin_top_20']]}>
                <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} >

                  <CustomBorderTextInput style={[styles['top_100'], styles['centerItems']]}
                    labelName={translate('mobile_number')}
                    IsRequired={false}
                    maxLength={10}
                    keyboardType='number-pad'
                    placeholder={translate('enter') + " " + translate('mobile_number')}
                    value={mobileNumber}
                    editable={true}
                    onFocus={() => {
                      //console.log('this is on focus')
                    }}
                    onChangeText={(text) => {
                      var enteredText = text.replace(/^[0-5][0-9]*$/gi, "");
                      enteredText = enteredText.replace(/[`a-z!@#$%^&*()_|+\-=?;:'",.₹€£¥•’<>\{\}\[\]\\\/]/gi, "");
                      setMobileNumber(enteredText)
                    }}
                    onEndEditing={(event) => {
                      //if (mobileNumber.length < 10) {
                      // SimpleToast.show(translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('mobile_number'))numberOfLines={2}
                      //}
                    }}
                  />
                </KeyboardAvoidingView>
              </View>

              {/* <View style={[styles['margin_left_20'], styles['margin_top_20'], styles['width_90%']]}>
                <View style={[styles['flex_direction_row']]}>
                  <TouchableOpacity onPress={() => { checkButtonPress() }}>
                    <Image style={[styles['width_height_20']]} source={checkedUnChecked == false ? require('../assets/images/checkGray.png') : require('../assets/images/checkedGreen.png')}></Image>
                  </TouchableOpacity>
                  <Text style={[styles['font_size_12_regular'], styles['text_color_mid_grey'], styles['left_5']]} numberOfLines={2} >{translate('bysigningupyouagreetoour')}</Text>
                  <View style={[styles['align_self_center'], styles['top_minus_13']]}>
                    <CustomButton title={translate('termsConditions')} onPress={termsButtonPress} buttonBg={Colors.transparent} btnWidth={50} underLine={true} titleTextColor={Colors.buttonOrange} textAlign='center' />
                  </View>
                </View>
                <View style={[styles['flex_direction_row'], styles['margin_left_20'], styles['top_minus_25']]}>
                  <Text style={[styles['font_size_12_regular'], styles['text_color_mid_grey']]}>{translate('and')}</Text>
                  <View style={[styles['align_self_center'], styles['top_minus_13'], styles['left_5']]}>
                    <CustomButton title={translate('privacyPolicy')} onPress={policyButtonPress} buttonBg={Colors.transparent} btnWidth={90} underLine={true} titleTextColor={Colors.buttonOrange} textAlign='center' />
                  </View>
                </View>
              </View> */}

              {/* <View style={[styles['width_90%'], styles['flex_direction_row'], styles['top_3'], { alignItems: 'center', alignSelf: 'center' }]}>

                <TouchableOpacity onPress={checkButtonPress}>
                  <Image style={[styles['width_height_20'], styles['align_self_center']]} source={checkedUnChecked == false ? require('../assets/images/checkGray.png') : require('../assets/images/checkedGreen.png')}></Image>
                </TouchableOpacity>

                <View style={[styles['margin_top_15'], styles['top_3'], { marginLeft: 5 }]}>
                  <Text style={[styles['text_color_black']]}>
                    By signing up you agree to our{' '}
                    <TouchableOpacity onPress={termsButtonPress}>
                      <Text style={[styles['text_color_orange'], styles['top_3'], { textDecorationLine: 'underline' }]}>Terms and Conditions</Text>
                    </TouchableOpacity>{' '}
                    and{' '}
                    <TouchableOpacity onPress={policyButtonPress}>
                      <Text style={[styles['text_color_orange'], styles['top_3'], { textDecorationLine: 'underline' }]}>Privacy Policy</Text>
                    </TouchableOpacity>

                  </Text>
                </View>

              </View> */}

              <View style={[styles['align_self_center'], styles['width_100%'], styles['margin_top_20']]}>
                <CustomButton title={translate('requestOTP')} onPress={requestOTPButtonPress} buttonBg={Colors.themeRed} btnWidth={"90%"} titleTextColor={Colors.white} />
              </View>


              <View style={[styles['flex_direction_row'], styles['centerItems'], styles['width_100%']]}>
                <Text style={[styles['font_size_14_regular'], styles['text_color_black'],]}>{translate('Donthaveanaccount')}</Text>
                <CustomButton title={translate('signUp')} onPress={signUpButtonPress} buttonBg={Colors.transparent} btnWidth={60} titleTextColor={Colors.textRed} isBoldText={false} textAlign='center' />
              </View>

              <View style={[styles['align_self_center'], styles['margin_top_20'], styles['width_100%']]}>
                <CustomButton title={translate('callNumber')} onPress={vyaparMitraButtonPress} buttonBg={Colors.lightGold} btnWidth={"50%"} titleTextColor={Colors.white} showCall={true} textAlign='center' />
              </View>

            </View>

          </ScrollView>

        </View>

      </ImageBackground>


      {showWebView &&
        showWebViewSection()
      }

      {showAlert && (
        <CustomAlert
          onPressClose={() => { handleCancelAlert() }}
          title={alertTitle}
          showHeader={showAlertHeader}
          showHeaderText={showAlertHeaderText}
          message={alertMessage}
          onPressOkButton={() => { handleOkAlert() }}
          onPressNoButton={() => { handleCancelAlert() }}
          showYesButton={showAlertYesButton}
          showNoButton={showAlertNoButton}
          yesButtonText={showAlertyesButtonText}
          noButtonText={showAlertNoButtonText} />
      )}
      {dataConfirmModal && ShowDataModal()}

      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
    </View>
    // </SafeAreaView>
  )


}

export default Login;