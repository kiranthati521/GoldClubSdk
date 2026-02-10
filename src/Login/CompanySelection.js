import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, StatusBar, Animated, Text, Image, AppState, Linking, KeyboardAvoidingView, Keyboard, ImageBackground, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import RenderHTML from 'react-native-render-html'
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { GetApiHeaders, GetRequest, PostRequest } from '../NetworkUtils/NetworkUtils';
import { FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, HTTP_OK, SECOND_LOGIN, configs } from '../helpers/URLConstants';
import CustomAlert from '../Components/CustomAlert';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomLoader from '../Components/CustomLoader';
import SimpleToast from 'react-native-simple-toast';
import CustomBorderTextInput from '../Components/CustomBorderTextInput';
import { EDITDATA, FCM_TOKEN, LOGINONCE, TERMS_CONDITIONS, getAppVersion, storeData } from '../assets/Utils/Utils';
import { retrieveData } from '../assets/Utils/Utils';
import { RESULTS, requestNotifications } from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
import { WebView } from 'react-native-webview';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import CustomAlertDefault from '../Components/CustomAlertDefault';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomLoaderDefault from '../Components/CustomLoaderDefault';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);


function CompanySelection({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const navigation = useNavigation()
  const dispatch = useDispatch();
  const [termsLink, setTermsLink] = useState('');
  const networkStatus = useSelector(state => state.networkStatus.value)
  const [loading, setLoading] = useState(false)
  const [companiesList, setCompaniesList] = useState([])
  const [loadingMessage, setLoadingMessage] = useState('')
  const spacing = 1;
  const screenWidth = Dimensions.get('window').width;
  const secondListcolumnCount = 3.8;
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const secondCardWidth = (screenWidth - spacing * (secondListcolumnCount + 1)) / secondListcolumnCount;
  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [webViewLink, setWebViewLink] = useState(configs.TERMS_CONDIOTNS_URL);
  const [isYellowViewVisible, setIsYellowViewVisible] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
  const [selectedCompanyCode, setSelectedCompanyCode] = useState('');
  const [selectedCompanyLogo, setSelectedCompanyLogo] = useState('');
  const [selectedCompanyDesc, setSelectedCompanyDesc] = useState('');
  const [selectedCompanyLoaderPath, setSelectedCompanyLoaderPath] = useState('');
  const [selectedId, setSelectedId] = useState("");
  const [userDatafrom, setUserDatafrom] = useState(route?.params?.userData != undefined ? route.params.userData : {});
  const [selectedCompanyObject, setSelectedCompanyObject] = useState({})
  const [loginMobileNumber, setLoginMobileNumber] = useState(route?.params?.loginMobileNumber != undefined ? route?.params?.loginMobileNumber : "");
  const [isCompanySelected, setIsCompanySelected] = useState(false);


  useEffect(() => {
    setTimeout(() => {
      setLoadingMessage()
      setLoading(false)
      GetCompaniesList()
    }, 500);
  }, [])

  const approveTermsButtonClick = async () => {
    setShowWebView(false)
    // setTermsConditionsAccepted(true)
    storeData(TERMS_CONDITIONS, true)
    await onProceedClicked()
    // setMobileNumber()
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

  useFocusEffect(
    React.useCallback(() => {
      // alert('screen focused')
      GetTermsConditionDetailsApiCall()
    }, [])
  );

  const GetTermsConditionDetailsApiCall = async () => {
    if (networkStatus) {
      setTimeout(() => {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
      }, 200);
      try {
        var getURL = configs.BASE_URL + configs.AUTH.getTermsConditionsAndPrivacyPolicy;
        var getHeaders = await GetApiHeaders();
        var APIResponse = await GetRequest(getURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoadingMessage()
              setLoading(false)
            }, 500);
            setTimeout(() => {
              setTermsLink(APIResponse.response.termsAndConditions)
              setLoadingMessage()
              setLoading(false)
              // alert(APIResponse.response.termsAndConditions)
              // setPrivacyLink(APIResponse.response.privacyPolicy)
            }, 1000);

            setTimeout(() => {
              setLoadingMessage()
              setLoading(false)
            }, 1200);
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
          // setSuccessLoadingMessage(error.message)
        }, 1000);
      }
      finally {
        setTimeout(() => {
          setLoading(false)
          setLoadingMessage()
        }, 1000);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }



  const showWebViewSection = () => {
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>

        <View style={[styles['width_90%'], styles['height_90%']]}>
          {(webViewLink != configs.TERMS_CONDIOTNS_URL) && <TouchableOpacity style={[styles['width_height_20'], styles['absolute_position'], { top: 0, right: 17, zIndex: 10 }]} onPress={() => { setShowWebView(false) }}>
            <Image style={[{ height: '100%', width: "100%", tintColor: 'black', right: 10, marginTop: 5 }]}
              source={require('../assets/images/close.png')} />
          </TouchableOpacity>}
          {/* <TouchableOpacity style={[styles['width_height_20'], styles['absolute_position'], { top: 0, right: 17, zIndex: 10 }]} onPress={() => { setShowWebView(false) }}>
                <Image style={[{ height: '100%', width: "100%", tintColor: 'black'}]} source={require('../assets/images/close.png')} />
              </TouchableOpacity> */}
          <WebView
            onLoadStart={() => {
              setLoading(true)
              setLoadingMessage(translate('please_wait_getting_data'))
            }}
            onLoad={() => {
              setLoading(false)
              setLoadingMessage()
            }}
            source={{ uri: termsLink }} // Replace with your desired URL
            // source={{ uri: webViewLink }} // Replace with your desired URL
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
  const renderCompaniesList = (item, index) => {
    return (
      <Card item={item} index={index} />
    )
  }

  const handleProceed = () => {
    if (!selectedCompanyCode) {
      showAlertWithMessage(translate('alert'), true, true, translate('please_select_company_to_proceed'), true, false, translate('ok'), translate('cancel'))
    } else {
      setShowWebView(true)
    }
  };

  const Card = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => handleSelect(item.id, item, index)} style={[{ margin: 5, alignItems: "center", justifyContent: "center", backgroundColor: "red" }, { width: '45%' }, styles['padding_vertical_5'], styles['border_width_1'], { borderColor: item?.selected === "true" ? item.primaryColor : 'rgba(22, 149, 111, 0.06)', backgroundColor: item?.selected === "true" ? item?.highColor : 'white' }, styles['border_radius_6']]}>
        {item?.selected === "true" && (
          <View style={[{ position: "absolute", zIndex: 1, right: 7, top: 7, }]}>
            <Image source={require('../assets/images/tick_red.png')} resizeMode='contain' style={[styles['width_height_20'], { tintColor: item.primaryColor }]} />
          </View>
        )}
        <View style={[
          item?.selected === "true"
            ? { backgroundColor: 'white' }
            : { backgroundColor: "rgba(237, 237, 237, 1)" },
          { height: 120, width: 120, alignItems: "center", justifyContent: "center", borderRadius: 100, marginVertical: 5 }
        ]}>
          <Image source={{ uri: item.companyLogo }} style={[item?.selected === "true" ? { height: 90, width: 90, resizeMode: "contain" } : { height: 80, width: 80, resizeMode: "contain" }]} />
        </View>
        {/*  enable this when company names required
          <Text numberOfLines={2} allowFontScaling={false} style={[styles['text_color_black'], styles['margin_top_10'],styles['font_size_10_regular'], styles['text_align_left'], styles['text_align_center']]}>{item.name}</Text> */}
      </TouchableOpacity>
    )
  };

  const handleOkAlert = () => {
    setShowAlert(false)
  }

  const handleSelect = (id, item, index) => {
    setSelectedCompanyObject(item);
    const updatedCompanyList = companiesList.map((company, i) => {
      console.log(company, "comapnyyeyeyeyeyeyeyeeyy")
      if (i === index) {
        return {
          ...company,
          selected: company.selected === "true" ? "false" : "true",
        };
      } else {
        return {
          ...company,
          selected: "false",
        };
      }
    });

    setCompaniesList(updatedCompanyList);

    const selectedCompany = updatedCompanyList[index];

    if (selectedCompany.selected === "true") {
      setSelectedCompanyCode(selectedCompany.companyCode);
      setSelectedCompanyLogo(selectedCompany.companyLogo);
      setSelectedCompanyDesc(selectedCompany.companyInfo);
      setSelectedCompanyLoaderPath(selectedCompany.loaderPath)

      setSelectedId(id);
      console.log('Selected setSelectedCompanyCode', selectedCompanyLoaderPath);
    } else {
      setSelectedCompanyCode('');
      setSelectedCompanyDesc('')
      setSelectedId('');
      console.log(`No company selected`);
    }
  };

  const GetCompaniesList = async () => {
    if (networkStatus) {
      try {
        var getHeaders = await GetApiHeaders();
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var getloginURL = configs.BASE_URL + configs.MASTERS.GET_ALL_COMPANIES
        console.log('getloginURL is', getloginURL)

        // var APIResponse = await GetRequest(getloginURL, '');
        var APIResponse = await GetRequest(getloginURL, getHeaders);
        console.log("APIResponse company selection", APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            var CompanyListResp = APIResponse?.response
            let parsedResponse = JSON.stringify(APIResponse)
            console.log('companiesLists in seclect compant screen--->', parsedResponse)
            setCompaniesList(CompanyListResp?.CompanyList || [])
          }
          else {
            setTimeout(() => {
              showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
            }, 1000);
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 1000);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          // setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }
  const onProceedClicked = async () => {
    // add terms and conditions
    console.log("selectcompany obt", selectedCompanyObject)
    const tempSlectedObject = selectedCompanyObject;
    tempSlectedObject.primaryColor = (tempSlectedObject?.primaryColor != undefined && tempSlectedObject?.primaryColor != "") ? tempSlectedObject?.primaryColor : Colors.themeRed;
    tempSlectedObject.iconPrimaryColor = (tempSlectedObject?.iconPrimaryColor != undefined && tempSlectedObject?.iconPrimaryColor != "") ? tempSlectedObject?.iconPrimaryColor : Colors.themeRed;
    tempSlectedObject.secondaryColor = (tempSlectedObject?.secondaryColor != undefined && tempSlectedObject?.secondaryColor != "") ? tempSlectedObject?.secondaryColor : Colors.white;
    tempSlectedObject.HighLightedColor = (tempSlectedObject?.highColor != undefined && tempSlectedObject?.highColor != "") ? tempSlectedObject?.highColor : Colors.highlightColor;
    tempSlectedObject.textColor = (tempSlectedObject?.textColor != undefined && tempSlectedObject?.textColor != "") ? tempSlectedObject?.textColor : Colors.black;

    // tempSlectedObject.textColor = (tempSlectedObject?.textColor != undefined && tempSlectedObject?.textColor != "") ? tempSlectedObject?.textColor :  Colors.black
    // tempSlectedObject.textColor = (tempSlectedObject?.textColor != undefined && tempSlectedObject?.textColor != "") ? tempSlectedObject?.textColor :  Colors.black
    // tempSlectedObject.textColor = (tempSlectedObject?.textColor != undefined && tempSlectedObject?.textColor != "") ? tempSlectedObject?.textColor :  Colors.black
    // tempSlectedObject.textColor = (tempSlectedObject?.textColor != undefined && tempSlectedObject?.textColor != "") ? tempSlectedObject?.textColor :  Colors.black
    if (tempSlectedObject) {
      if (tempSlectedObject != undefined) {
        // dispatch(updateCompanyStyles(tempSlectedObject))

        navigation.navigate('SignUp', { selectedCompany: tempSlectedObject, loginMobileNumber: loginMobileNumber, companyLogo: selectedCompanyLogo, loaderPath: selectedCompanyLoaderPath })
        // setTimeout(() => {
        //   navigation.reset({
        //     index: 0,
        //     routes: [{
        //       name: 'SignUp',
        //       params: {selectedCompany:tempSlectedObject,loginMobileNumber:loginMobileNumber,companyLogo:selectedCompanyLogo}
        //     }]
        //   })
        //  }, 500);
      }

      // navigation.reset({
      //   index: 0,
      //   routes: [{
      //     name: 'Dashboard',
      //     params: {
      //       userData: userDatafrom
      //     }
      //   }]
      // })

    } else {
      console.error("No company found for companyCode:", companyCode);
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.purple }} edges={['top']}>
      <View style={{ flex: 1 }}>
        {Platform.OS === 'android' && <StatusBar style={{}} backgroundColor={Colors.purple} barStyle='dark-content' />}
        <ImageBackground source={require('../assets/images/login_bg.png')} resizeMode='stretch' style={[styles['full_screen']]}>
          <View style={[(Platform.OS == 'ios' ? styles['padding_top_20'] : styles['padding_20']), styles['border_bottom_left_radius_25'], styles['border_bottom_right_radius_25'], { alignItems: 'center' }, { position: "relative", backgroundColor: "rgba(132, 94, 241, 1)" }]}>
            <Image source={require('../assets/images/flower.png')} style={{ height: 80, width: 80, resizeMode: "contain", position: "absolute", right: 10, top: 10 }} />
            <Text style={[styles['text_color_white'], styles['font_size_18_bold'], styles['margin_10'], Platform.OS == "ios" && { paddingBottom: 20 }]}>{translate('select_company')}</Text>
          </View>
          <View style={[styles['bg_white'], styles['margin_horizontal_15'], styles['margin_top_15'], Styles['border_radius_10']]}>
            <View style={[styles['flex_direction_row'], styles['width_100%'], styles['centerItems'], styles['top_10'], styles['border_radius_6'], styles['padding_10']]}>
              <FlatList
                data={companiesList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => renderCompaniesList(item, index)}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'flex-start' }}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={() => {
                  return selectedCompanyCode ? (
                    <View style={{ width: '95%', alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
                      <RenderHTML source={{ html: selectedCompanyDesc }}
                        enableCSSInlineProcessing={true} />
                    </View>
                  ) : null;
                }}
                ListFooterComponentStyle={{
                  alignSelf: "center",
                  marginTop: 10,
                  alignItems: "center", justifyContent: "center"
                }}
              />
            </View>
            <View style={[styles['centerItems'], styles['width_100%'], styles['margin_bottom_10']]}>
              <CustomButton title={translate('proceed')} onPress={() => { handleProceed() }} buttonBg={selectedCompanyCode ? Colors.buttonColorPurple : 'rgba(132, 94, 241, 0.5)'} btnWidth={"90%"} titleTextColor={Colors.white} />
            </View>
          </View>
        </ImageBackground>
        {loading && <CustomLoaderDefault loading={loading} message={loadingMessage} loaderImage={loaderImage} />}

        {showWebView &&
          showWebViewSection()
        }
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
      </View>
    </SafeAreaView>
  )


}

export default CompanySelection;