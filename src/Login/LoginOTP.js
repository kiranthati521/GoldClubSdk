import React, { useState, useEffect, useMemo, } from 'react';
import { View, Image, Platform, StatusBar, Text, Linking, ScrollView } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import CustomButton from '../Components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { DEVICE_TOKEN, EDITDATA, LOGINONCE, MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, TERMS_CONDITIONS, USERMENU, USER_ID, USER_NAME, getDeviceId, retrieveData, storeData } from '../assets/Utils/Utils';
import { APP_ENV_PROD, HTTP_OK, SECOND_LOGIN, configs } from '../helpers/URLConstants';
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
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';


var styles = BuildStyleOverwrite(Styles);

function LoginOTP({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const otpResponse = route.params.otp;
  const getuserAcceptanceKey = route.params.getuserAcceptanceKey;
  const loginMobileNumber = route.params.loginMobileNumber
  const networkStatus = useSelector(state => state.networkStatus.value)
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')

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
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/vm_loader.gif'))
  // const[companyCode,setCompanyCode] = useState("1100")

  // const dispatch = useDispatch();
  const [otpFromResponse, setOtpFromResponse] = useState()
  const [companiesList,setCompaniesList]=useState([
    {
        "companyCode": "1500",
        "companyPrefix": "AAGL",
        "companyLogo": "http://3.110.159.82:8080/vyapar_mitra/CompanyIcons/AsianAgriGenetics.png",
        "name": "Asian Agri Genetics",
        "primaryColor": "#01913F",
        "id": "1500",
        "textColor": "#000000",
        "selected": "false",
        "secondaryColor": "#FFFFFF"
    },
    {
        "companyCode": "1600",
        "companyPrefix": "FHSL",
        "companyLogo": "http://3.110.159.82:8080/vyapar_mitra/CompanyIcons/FortuneHybridSeeds.png",
        "name": "Fortune Hybrid Seeds",
        "primaryColor": "#80B403",
        "id": "1600",
        "textColor": "#000000",
        "selected": "false",
        "secondaryColor": "#FFFFFF"
    },
    {
        "companyCode": "1800",
        "companyPrefix": "Global",
        "companyLogo": "http://3.110.159.82:8080/vyapar_mitra/CompanyIcons/Global.png",
        "name": "Global",
        "primaryColor": "#019D54",
        "id": "1800",
        "textColor": "#000000",
        "selected": "false",
        "secondaryColor": "#FFFFFF"
    },
    {
        "companyCode": "1100",
        "companyPrefix": "NSL",
        "companyLogo": "http://3.110.159.82:8080/vyapar_mitra/CompanyIcons/Nuziveeduseedslogo.jpg",
        "name": "Nuziveedu Seeds",
        "primaryColor": "#D9251C",
        "id": "1100",
        "textColor": "#000000",
        "selected": "false",
        "secondaryColor": "#FFFFFF"
    },
    {
        "companyCode": "1400",
        "companyPrefix": "PABL",
        "companyLogo": "http://3.110.159.82:8080/vyapar_mitra/CompanyIcons/PABLLogo.jpg",
        "name": "Prabhat Agri Bio-tech",
        "primaryColor": "#8E3EBD",
        "id": "1400",
        "textColor": "#000000",
        "selected": "false",
        "secondaryColor": "#FFFFFF"
    },
    {
        "companyCode": "1300",
        "companyPrefix": "PSPL",
        "companyLogo": "http://3.110.159.82:8080/vyapar_mitra/CompanyIcons/PSPLlogo",
        "name": "Pravardhan Seeds",
        "primaryColor": "#F68221",
        "id": "1300",
        "textColor": "#000000",
        "selected": "false",
        "secondaryColor": "#FFFFFF"
    },
    {
        "companyCode": "1200",
        "companyPrefix": "YSPL",
        "companyLogo": "http://3.110.159.82:8080/vyapar_mitra/CompanyIcons/YaagantiSeeds.png",
        "name": "Yaaganti Seeds",
        "primaryColor": "#4E9960",
        "id": "1200",
        "textColor": "#000000",
        "selected": "false",
        "secondaryColor": "#FFFFFF"
    }
]);

  const dispatch = useDispatch();
  

  useEffect(() => {
    // getProfileDetails()
    console.log("OTP_RESPONSE111", otpResponse.response);
    setOtpFromResponse(otpResponse.response)
    console.log("OTP_RESPONSE", (otpFromResponse));
  }, [otpResponse]);
  

  // const getProfileDetails = async () => {
  //   var getMobileNumber = (await retrieveData(MOBILE_NUMBER))
  //   setStoreMobileNum(getMobileNumber.toString())
  //   console.log('what is store mobile number', storeMobileNum)
  //   console.log('what is store mobile number', otpResponse.mobileNumber)
  // }

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
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('otp_verify_message'))

        var getloginURL = configs.BASE_URL + configs.AUTH.VERIFY_OTP;
        var getHeaders = await GetApiHeaders();
        var deviceId = await getDeviceId();
        var dataList = {
          "mobileNumber": loginMobileNumber,
          "otp": OTP,
          "deviceId": deviceId,
          "loggedInFirstTime": await retrieveData(EDITDATA)
        }
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        console.log('otp response isee:', JSON.stringify(APIResponse))
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 100);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('otp_verified_message'))
            }, 1000);
            var verifyOTPResponse = APIResponse.response;
            console.log('verifyOTPResponse is', verifyOTPResponse)

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



            const companyCode = "1500"; // Replace with your dynamic value
            const selectedCompanyObject = companiesList.find(company => company.companyCode === companyCode);
            if (selectedCompanyObject) {
              if (selectedCompanyObject != undefined ) {
                dispatch(updateCompanyStyles(selectedCompanyObject))
               }
            } else {
              console.error("No company found for companyCode:", companyCode);
            }
        
          
         

            setTimeout(() => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
              // navigation.navigate('Dashboard')
              navigation.reset({
                index: 0,
                routes: [{
                  name: 'Dashboard',
                  params: {
                    userData: verifyOTPResponse[0]
                  }
                }]
              })
            }, 3000);
          }
          else {
           
            setLoading(false)
            setOTP();
            setresetOTP(false);
            setresetOTP(true);
            alert(APIResponse.message)
            // setTimeout(() => {
            //   showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
            // }, 500);
          
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

  const goBack = async () => {
    navigation.navigate('Login')
  };
  onCodeChanged = (code) => {
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
    // console.log('verify Button pressed!');
    if (OTP == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('otp'), false, true, translate('ok'), translate('cancel'))
    }
    else if (OTP.length < 6) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('otp'), false, true, translate('ok'), translate('cancel'))
    }
    else {
      verifyOTPApiCall()
    }
  }
  const vyaparMitraButtonPress = async () => {
    Linking.openURL(`tel:${translate('callNumber')}`)
  }
  return (
    <View style={[styles['full_screen'], { padding: 0, margin: 0, width: '100%', height: '100%' }]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={'white'} barStyle='dark-content' />}
      <Image source={require('../assets/images/bgView.png')} resizeMode='stretch' style={[styles['full_screen']]} />

      <View style={[styles['absolute_position'], styles['padding_top_40'], styles['align_self_center']]}>
        <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true}>

          <View style={[styles['margin_top_100']]}>


            {/* <View style={[styles['absolute_position'],styles['padding_top_10']]}>
        <TouchableOpacity onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_20'],styles['width_height_30']]} source={require('../assets/images/previous.png')}></Image>
        </TouchableOpacity>
          </View> */}
            {/* <Image source={require('../assets/images/topCornerLogo.png')} style={[ styles['align_self_flex_end'],styles['width_height_60']]}/> */}




            <Image source={require('../assets/images/appIcon.png')} style={[styles['margin_left_10'], styles['width_height_100']]} resizeMode='contain' />


            <Text style={[styles['font_size_26_semibold'], styles['text_color_black'], styles['text_align_left'], styles['margin_top_50'], styles['margin_left_20']]}>{translate('verifyOTP')}</Text>
            {/* <OTPInputView
              ref={input => this.otpInput = input}
              style={[styles['centerItems'], styles['padding_top_30'], styles['textAlignCenter'], styles['height_50'], styles['width_90%']]}
              pinCount={6}
              autoFocusOnLoad={false}
              codeInputFieldStyle={{
                color: Styles['text_color_black'].color,
                width: Platform.OS === 'android' ? 40 : 45,
                height: Platform.OS === 'android' ? 40 : 45,
                borderWidth: 1,
                borderBottomWidth: 1,
                borderRadius: 10,
                textAlign: 'center',
                paddingBottom: Platform.OS == 'android' ? 10 : 0,
                borderColor: Colors.lightish_grey,
                fontFamily: FontForWeight('')
              }}
              codeInputHighlightStyle={styles.underlineStyleHighLighted}
              code={OTP} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
              onCodeChanged={code => onCodeChanged(code)}//{ this.setState({ otp: code }) }
            /> */}

            {(resetOTP || !resetOTP) && <View style={[styles['centerItems'], styles['padding_top_30'], styles['width_100%']]}><CustomOTP resetOTP={resetOTP} onEndEditting={(otp) => { onCodeChanged(otp) }} /></View>}


            {/* {!APP_ENV_PROD && <Text style={[styles['font_size_12_regular'], styles['text_color_black'], styles['text_align_center'], styles['margin_top_20']]}>{otpFromResponse}</Text>} */}

            {otpExpire == false &&
              <View style={[styles['flex_direction_row'], styles['centerItems'], styles['margin_bottom_10'], styles['padding_top_30']]}>
                <Text style={[styles['font_size_12_regular'], styles['text_color_black']]}>{translate('code_expires_in')}</Text>
                <Text style={[styles['font_size_12_regular'], { color: Colors.red }]}> {timer} Sec</Text>
              </View>
            }

            {otpExpire == true &&
              <View style={[styles['flex_direction_row'], styles['centerItems'], styles['width_100%'], styles['padding_top_20']]}>
                <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['right_10']]}>{translate('notreceivedyourcode')}</Text>
                <CustomButton title={translate('resendCode')} onPress={resendButtonPress} buttonBg={Colors.transparent} btnWidth={95} titleTextColor={Colors.themeRed} isBoldText={false} textAlign='left' />
              </View>
            }

            <View style={[styles['centerItems'], styles['width_100%']]}>
              <CustomButton title={translate('verify')} onPress={verifyOTPButtonPress} buttonBg={Colors.themeRed} btnWidth={"90%"} titleTextColor={Colors.white} />
            </View>

            <View style={[styles['centerItems'], styles['margin_top_50'], styles['width_100%']]}>
              <CustomButton title={translate('callNumber')} onPress={vyaparMitraButtonPress} buttonBg={Colors.lightGold} btnWidth={"50%"} titleTextColor={Colors.white} showCall={true} />

            </View>



          </View>
        </ScrollView>
      </View>

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

      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
    </View>
  );
}

export default LoginOTP;