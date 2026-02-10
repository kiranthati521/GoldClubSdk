import React, { useState, useEffect, useMemo, } from 'react';
import { View, Image, Platform, StatusBar, Text, Linking, ScrollView,KeyboardAvoidingView, PermissionsAndroid } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import CustomButton from '../Components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { DEVICE_TOKEN, EDITDATA, LOGINONCE, MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, SELECTEDCOMPANY, TERMS_CONDITIONS, USERMENU, USER_ID, USER_NAME, WHATSAPPCHECKED, downloadFileToLocal, getDeviceId, retrieveData, storeData } from '../assets/Utils/Utils';
import { APP_ENV_PROD, HTTP_OK, HTTP_SWITCHING_PROTOCOLS, SECOND_LOGIN, configs } from '../helpers/URLConstants';
import { FontForWeight } from '../assets/fonts/fonts';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { GetApiHeaders, PostRequest } from '../NetworkUtils/NetworkUtils';
import { setUser } from '../redux/store/slices/UserSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { useDispatch, useSelector } from 'react-redux';
import SimpleToast from 'react-native-simple-toast';
import CustomOTP from '../Components/CustomOTP';
import CustomLoaderDefault from '../Components/CustomLoaderDefault';
import CustomSuccessLoaderDefault from '../Components/CustomSuccessLoaderDefault';
import CustomErrorLoaderDefault from '../Components/CustomErrorLoaderDefault';
import CustomAlertDefault from '../Components/CustomAlertDefault';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';


var styles = BuildStyleOverwrite(Styles);

function LoginOTPNew({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const otpResponse = route.params.otp;
  const getuserAcceptanceKey = route.params.getuserAcceptanceKey;
  const loginMobileNumber = route.params.loginMobileNumber
  const showUserEdit = route.params.showUserEdit
  const networkStatus = useSelector(state => state.networkStatus.value)
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  let [recievedFrmLive,setReceivedFromLive] = useState(false)
  let [roleNameNav,setRoleNameNav] = useState('')

  const navigation = useNavigation()
  const [otpExpire, setOTPExpire] = useState(false)
  const [OTP, setOTP] = useState('');
  const [resetOTP, setresetOTP] = useState(false)

  var [timer, setTimer] = useState(60); // Initial timer value in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
  const userDatafrom = route?.params?.userData != undefined ? route.params.userData : {};
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const [dataConfirmModal, showDataConfirmModal] = useState(false);
  const [oTPApiresponse, setOTPApiresponse] = useState(null)

  // const dispatch = useDispatch();
  const [otpFromResponse, setOtpFromResponse] = useState()


  const dispatch = useDispatch();


  useEffect(() => {
    // getProfileDetails()
    console.log("OTP_RESPONSE111===1", otpResponse.response);
    setOtpFromResponse(otpResponse.response)
    console.log("OTP_RESPONSE", (otpFromResponse));
  }, [otpResponse]);


  

  useEffect(() => {

    let intervalId;
    if (isTimerRunning) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(intervalId);
            setIsTimerRunning(false);
            setOTPExpire(true)
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId); // Clean up the interval on component unmount

  }, [isTimerRunning]);

  const verifyOTPApiCall = async () => {
  // const verifyOTPApiCall = async (otpFromAutoFetch = undefined) => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('otp_verify_message'))

        var getloginURL = configs.BASE_URL + configs.AUTH.VERIFY_OTP;
        var getHeaders = await GetApiHeaders();
        var deviceId = await getDeviceId();
        var logFirst = getuserAcceptanceKey
        var dataList =  {
          "mobileNumber": loginMobileNumber,
          // "otp": otpFromAutoFetch ? otpFromAutoFetch : OTP,
          "otp": OTP,
          "deviceId": deviceId,
          "loggedInFirstTime": await retrieveData(EDITDATA),
          "termsAndConditionsAccepted": true,
          "optInForWhatsApp": true
          // "termsAndConditionsAccepted":await retrieveData(TERMS_CONDITIONS),
          // "optInForWhatsApp":await retrieveData(WHATSAPPCHECKED)
        }
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        // console.log('otp response isee:', JSON.stringify(APIResponse))
        if (APIResponse != undefined && APIResponse != null) {
         setTimeout(() => {
          setLoadingMessage()
          setLoading(false)
         }, 500);

         // console.log("APIResponse?.statusCode", APIResponse?.statusCode)
          if (APIResponse?.statusCode == HTTP_OK) {
            setTimeout(() => {
            setLoading(false)
            setSuccessLoading(true)
            setSuccessLoadingMessage(translate('otp_verified_message'))
             }, 1000);
            var verifyOTPResponse = APIResponse?.response;
            console.log('verifyOTPResponse is', verifyOTPResponse)
            if (verifyOTPResponse != undefined && verifyOTPResponse != null && verifyOTPResponse.length > 0) {
              setRoleNameNav(verifyOTPResponse[0].roleName)
              setOTPApiresponse(verifyOTPResponse)
              dispatch(setUser(verifyOTPResponse))
              storeData(USER_ID, verifyOTPResponse[0].id);
              storeData(USER_NAME, verifyOTPResponse[0].roleName == 'Retailer' ? verifyOTPResponse[0].proprietorName : verifyOTPResponse[0].name);
              storeData(MOBILE_NUMBER, verifyOTPResponse[0].mobileNumber);
              storeData(DEVICE_TOKEN, "");
              storeData(LOGINONCE, true)
              storeData(USERMENU, verifyOTPResponse[0].userMenuControl);
              storeData(PROFILEIMAGE, verifyOTPResponse[0].profilePic)
              storeData(ROLEID, verifyOTPResponse[0].roleId);
              storeData(ROLENAME, verifyOTPResponse[0].roleName)
              storeData(SELECTEDCOMPANY, verifyOTPResponse[0].companyLogoPath);

              const tempSlectedObject = {};
              tempSlectedObject.primaryColor = (verifyOTPResponse[0]?.primaryColor != undefined && verifyOTPResponse[0]?.primaryColor != "") ? verifyOTPResponse[0]?.primaryColor : Colors.buttonColorPurple;
              tempSlectedObject.secondaryColor = (verifyOTPResponse[0]?.secondaryColor != undefined && verifyOTPResponse[0]?.secondaryColor != "") ? verifyOTPResponse[0]?.secondaryColor : Colors.white;
              tempSlectedObject.textColor = (verifyOTPResponse[0]?.textColor != undefined && verifyOTPResponse[0]?.textColor != "") ? verifyOTPResponse[0]?.textColor : Colors.black;
              tempSlectedObject.disableColor = (verifyOTPResponse[0]?.disableColor != undefined && verifyOTPResponse[0]?.disableColor != "") ? verifyOTPResponse[0]?.disableColor : Colors.lightgrey;
              tempSlectedObject.iconPrimaryColor = (verifyOTPResponse[0]?.iconPrimaryColor != undefined && verifyOTPResponse[0]?.iconPrimaryColor != "") ? verifyOTPResponse[0]?.iconPrimaryColor : Colors.buttonColorPurple;
              if (verifyOTPResponse[0].loaderPath !== null && verifyOTPResponse[0].loaderPath !== "" && verifyOTPResponse[0].loaderPath !== undefined) {
                const filePath = await downloadFileToLocal(verifyOTPResponse[0]?.loaderPath, verifyOTPResponse[0]?.loaderPath?.split('/').pop())
                tempSlectedObject.loaderPath = filePath != undefined && filePath != null && filePath != "" ? filePath : ""
              }else{
                tempSlectedObject.loaderPath = ''
              }
              if (tempSlectedObject) {
                if (tempSlectedObject != undefined) {
                  setTimeout(()=>{
                  dispatch(updateCompanyStyles(tempSlectedObject))
                  },1500)
                }
              }

              setTimeout(() => {
                setSuccessLoading(false)
                setSuccessLoadingMessage()
                if (showUserEdit == true) {
                  showDataConfirmModal(true);
                }
                else {
                  let navigateTo = (verifyOTPResponse[0]?.roleName === 'Retailer' || verifyOTPResponse[0]?.roleName === 'Distributor') ? 'RetailerDashboard':'Dashboard';                  
                  navigation.reset({
                    index: 0,
                    routes: [{
                      name: navigateTo,
                      params: { userData: userDatafrom }
                    }]
                  })
                }
              }, 3000);
            } else {
              setTimeout(() => {
                setLoading(false)
                setSuccessLoading(false)
                setSuccessLoadingMessage()
                SimpleToast.show(translate('something_went_wrong'));
              }, 500);
            }
          }
          else if (APIResponse?.statusCode == HTTP_SWITCHING_PROTOCOLS) {
            console.log("VALIDATE_RESPONSE_101",);
            // navigation.navigate('CompanySelection',{loginMobileNumber:loginMobileNumber});
            setTimeout(() => {
              setLoading(false);
              setSuccessLoading(false);
              setErrorLoading(false);
              setShowAlert(false);
            }, 500);

            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{
                  name: 'CompanySelection',
                  params: {
                    loginMobileNumber: loginMobileNumber
                  }
                }]
              })
            }, 1500);


          }
          else {
            setLoading(false)
            setOTP();
            setresetOTP(false);
            setresetOTP(true);
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true,  translate('ok'), translate('cancel'))
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
          // setSuccessLoading(true)
          setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }

  }

  const resendOTPApiCall = async () => {
    setOTP();
    setresetOTP(false);
    setresetOTP(true);
    setLoading(true)
    setLoadingMessage(translate('create_new_token_message'))

    var url = configs.BASE_URL + configs.AUTH.RESEND_OTP;
    var getHeaders = await GetApiHeaders();

    var dataList = {
      "mobileNumber": loginMobileNumber,
      "userAcceptanceKey": getuserAcceptanceKey,
      "termsAndConditionsAccepted": await retrieveData(TERMS_CONDITIONS),
    }
    console.log('getloginURL is', url)
    console.log('getHeaders is', getHeaders)
    console.log('dataList is', dataList)
    var APIResponse = await PostRequest(url, getHeaders, dataList);
    var OTPresponses = '';
    console.log('login response is:', APIResponse)
    if (APIResponse != undefined && APIResponse != null) {
      setTimeout(() => {
        setLoadingMessage()
        setLoading(false)
      }, 500);
      if (APIResponse.statusCode == HTTP_OK) {
        OTPresponses = APIResponse.response
        console.log('Respon of otp', OTPresponses)
        setOtpFromResponse(OTPresponses)

        setTimeout(() => {
          setresetOTP(false);
          setresetOTP(true)
          setLoading(false)
          setSuccessLoading(true)
          setSuccessLoadingMessage(translate('otp_sent_successfully'))
        }, 1000);

        setTimeout(() => {
          setSuccessLoading(false)
          setSuccessLoadingMessage()
        }, 3000);
      }
      else if (APIResponse.statusCode == SECOND_LOGIN) {
        showAlertWithMessage(translate('alert'), true, true, APIResponse.message, true, true, translate('proceed'), translate('cancel'))
      }
      else {
        showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
      }
    }
    else {
      setTimeout(() => {
        setLoading(false)
        setLoadingMessage()
      }, 500);
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
    setShowAlert(false)
  }

  const ShowDataModal = () => {
    var data = oTPApiresponse[0]
    console.log("oTPApiresponse---", data);

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
                //  navigation.navigate('LoginOTPNew', { otp: oTPApiresponse, getuserAcceptanceKey: 0, loginMobileNumber: mobileNumber })
                navigation.reset({
                  index: 0,
                  routes: [{
                    name: (roleNameNav === 'Retailer' || roleNameNav === 'Distributor') ? 'RetailerDashboard':'Dashboard' ,
                    params: {
                      userData: userDatafrom
                    }
                  }]
                })
              }}
              buttonBg={Colors.white}
              btnWidth={'40%'}
              titleTextColor={Colors.buttonColorPurple}
              textAlign={'center'}
              isBoldText={true}
              borderWidth={1}
              borderRadius={8}
              borderColor={Colors.buttonColorPurple}
            />

            <CustomButton
              title={translate('continue')}
              onPress={() => {
                showDataConfirmModal(false)
                storeData(EDITDATA, false)
                // navigation.navigate('LoginOTPNew', { otp: oTPApiresponse, getuserAcceptanceKey: 0, loginMobileNumber: mobileNumber })
                navigation.reset({
                  index: 0,
                  routes: [{
                    name: (roleNameNav === 'Retailer' || roleNameNav === 'Distributor') ? 'RetailerDashboard':'Dashboard' ,
                    params: {
                      userData: userDatafrom
                    }
                  }]
                })
              }}
              buttonBg={Colors.buttonColorPurple}
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

  const goBack = async () => {
    navigation.goBack()
  };

  let onCodeChanged = (code) => {
    setOTP(code)
    console.log('what is OTP code', code);
  }
  const resendButtonPress = async () => {
    console.log('verify Button pressed!');
    setOTP();
    setresetOTP(false);
    setresetOTP(true)
    resendOTPApiCall()
    setTimer(60)
    setIsTimerRunning(true);
    setOTPExpire(false)
  }
  const verifyOTPButtonPress = async () => {
    if (OTP == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('otp'), false, true, translate('ok'), translate('cancel'))
    }
    else if (OTP.length < 6) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('otp'), false, true, translate('ok'), translate('cancel'))
    }
    else {
      verifyOTPApiCall()
      // navigation.navigate('CompanySelection')
    }
  }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''} style={{flex:1}}>
    <View style={[styles['full_screen'], { padding: 0, margin: 0, width: '100%', height: '100%' }]}>
      {Platform.OS === 'android' && <StatusBar translucent backgroundColor={'transparent'}  barStyle='dark-content' />}
      <Image source={require('../assets/images/login_bg.png')} resizeMode='stretch' style={[styles['full_screen']]} />

      <View style={[styles['absolute_position'], styles['padding_top_10'], styles['align_self_center']]}>
        {/* <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true}> */}

          <View style={[styles['margin_top_10']]}>
          
            <Image source={require('../assets/images/newAppIcon.png')} style={[{marginTop:responsiveHeight(10)},styles['margin_left_10'], styles['width_height_150']]} resizeMode='contain' />

            <Text style={[
              styles['font_size_20_bold'], styles['text_color_black'], styles['text_align_left'], styles['margin_top_5'], styles['margin_left_20'],{minHeight:30}]}>{translate('verifyOTP')}</Text>
           
        {(resetOTP || !resetOTP) && <View style={[styles['centerItems'], styles['padding_top_30'], styles['width_100%']]}><CustomOTP resetOTP={resetOTP} onEndEditting={(otp) => { onCodeChanged(otp) }} /></View>}

            {otpExpire == false &&
              <View style={[styles['flex_direction_row'], styles['centerItems'], styles['margin_bottom_10'], styles['padding_top_30']]}>
                <Text style={[ styles['font_size_12_regular'], styles['text_color_black']]}>{translate('code_expires_in')}</Text>
                <Text style={[ styles['font_size_12_regular'], { color: Colors.red }]}> {timer} {translate('Sec')}</Text>
              </View>
            }

            {otpExpire == true &&
              <View style={[styles['flex_direction_row'], styles['centerItems'], styles['width_100%'], styles['padding_top_20']]}>
                <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['right_10']]}>{translate('notreceivedyourcode')}</Text>
                <View style={Platform.OS === 'android' && {marginTop:-2}}>
                <CustomButton title={translate('resendCode')} onPress={resendButtonPress} buttonBg={Colors.transparent} btnWidth={95} titleTextColor={Colors.themeRed} isBoldText={false} textAlign='left' />
                </View>
              </View>
            }

            <View style={[styles['centerItems'], styles['width_100%']]}>
              <CustomButton title={translate('verify')} onPress={verifyOTPButtonPress} buttonBg={Colors.buttonColorPurple} btnWidth={"90%"} titleTextColor={Colors.white} />
            </View>
          </View>
      </View>

      {showAlert && (
        <CustomAlertDefault
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
      {loading && <CustomLoaderDefault loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoaderDefault loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoaderDefault loading={errorLoading} message={errorLoadingMessage} />}
    </View>
    </KeyboardAvoidingView>
  );
}

export default LoginOTPNew;