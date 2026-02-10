import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Platform, StatusBar, Text, Image, AppState,
  Keyboard, TouchableOpacity, FlatList, ScrollView, TextInput
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomSectionButton from '../Components/CustomSectionButton';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { GetApiHeaders, getNetworkStatus, GetRequest } from '../NetworkUtils/NetworkUtils';
import { FAQDATA, isHTML, retrieveData, storeData, ROLENAME } from '../assets/Utils/Utils';
import RenderHTML from 'react-native-render-html';
import { useSelector } from 'react-redux';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import store from '../redux/store/store';
import { getLangaugeDetails } from '../redux/store/slices/LanguageSlice';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

export const GetFAQDATA = async () => {
  let realm = new Realm({ path: 'User.realm' });
  const state = store.getState();
  const lang = getLangaugeDetails(state);
  console.log(lang, "<============== lang options")
  var networkStatus = await getNetworkStatus()
  if (networkStatus) {
    try {
      var getloginURL = configs.BASE_URL + configs.MASTERS.FAQ_DETAILS;
      var getHeaders = await GetApiHeaders();
      var APIResponse = await GetRequest(getloginURL, getHeaders);
      console.log(APIResponse, "<--------------- faq data downloading inprogress")
      if (APIResponse != undefined && APIResponse != null) {
        if (APIResponse.statusCode == HTTP_OK) {
          console.log('the faq Resp is', JSON.stringify(APIResponse.response.faqTypeList))
          let faqObj = {
            langCode: lang.languageCode,
            langId: lang.languageId,
            langName: lang.languageName,
            data: APIResponse?.response?.faqTypeList
          }
          console.log(faqObj, "<<<<<<<<<<<<<<<<<<<faqObj<<<<<<<<<<<<<<<<<<<<<<<<")
          storeData(FAQDATA, faqObj);
        }
        else { }

      } else { }
    }
    catch (error) { }
  } else { }
}

function FAQ() {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const { languageCode, languageName, languageId } = useSelector((state) => state.language);
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const networkStatus = useSelector(state => state.networkStatus.value)
  const navigation = useNavigation()

  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
  const [searchText, setSearchText] = useState("");

  const [subSectionData, setSubSectionData] = useState("");
  const [faqSectionData, setFaqSectionData] = useState([]);
  const [faqFilterSectionData, setFaqFilterSectionData] = useState([]);

  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);



  const handleLoading = () => {
    setLoading(false);
  }

  useEffect(() => {
    handleLoading();
  }, [])

  useEffect(() => {
    setLoading(false)
    setLoadingMessage()
  }, [])

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log("nextAppState", nextAppState)
      if (nextAppState === 'active') {
        // App is coming to the foreground, check for updates again
        // and trigger a reload if needed
        console.log("BACK TO APPLICATION");
      }
    };
    AppState.addEventListener('change', handleAppStateChange);
  }, []);



  const goBack = async () => {
    const roleTypeDetails = await retrieveData(ROLENAME)
    if (roleTypeDetails) {
      let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard' : 'Dashboard'
      navigation.navigate(navigateTo)
    }
  };


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

  useFocusEffect(
    React.useCallback(() => {
      GetFAQDetailsApiCall()
      return () => {
        console.log('FAQ Screen is no longer focused!');
      };
    }, [networkStatus])
  );

  useEffect(() => {
    const handleFAQ = async () => {
      if (networkStatus) {
        GetFAQDetailsApiCall()
      } else {
        try {
          let data = await checkData()
          if (data) {
            getFAQDataDetails()
          } else {
            showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
          }
        } catch (error) {
          showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
        }
      }
    }
    handleFAQ()
  }, [])

  let checkData = async () => {
    let checkData = await retrieveData(FAQDATA)
    if (languageCode === checkData.langCode) {
      return checkData
    } else {
      return null;
    }
  }

  useEffect(() => {
    console.log('original list', faqSectionData)
    console.log('finial filter seactionData array', JSON.stringify(faqFilterSectionData))
    console.log('finial filter subSectionData array', JSON.stringify(subSectionData))
  }, [faqFilterSectionData, subSectionData, faqSectionData])

  const getFAQDataDetails = async () => {
    let data = await retrieveData(FAQDATA)
    setFaqSectionData(data?.data)
    setFaqFilterSectionData(data?.data)
    setSubSectionData()
    //console.log('faq mainData is:',await retrieveData(FAQDATA))
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

  const filterSearch = () => {
    if (networkStatus) {
      setLoading(true)
      setLoadingMessage(translate('searching'))
    }
    if (searchText == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('pleaseEnterText'), false, true, translate('ok'), translate('cancel'))
    }
    else {
      getFAQDataDetails();
      setTimeout(() => {
        var primaryArray = [];
        var secondaryArray = [];
        var sectionArray = [...faqSectionData];
        var subSectionArray = [];
        for (let i = 0; i < sectionArray.length; i++) {
          var getSubItems = sectionArray[i].subItems
          // console.log('dddd00',getSubItems)
          for (let j = 0; j < getSubItems.length; j++) {
            console.log('wwwwww', getSubItems[j])
            var getQuestionText = getSubItems[j].questions
            var getAnswersText = getSubItems[j].answers
            console.log('mmmmmm', getSubItems[j])
            if (searchText != '') {
              if (getQuestionText.toString().toLowerCase().includes(searchText.toLowerCase())) {
                sectionArray[i].sectionOpen = true
                sectionArray[i].subItems[j].subSectionOpen = true
                // subSectionArray = sectionArray[i].subItems      
              }
              else if (getAnswersText.toString().toLowerCase().includes(searchText.toLowerCase())) {
                sectionArray[i].sectionOpen = true
                sectionArray[i].subItems[j].subSectionOpen = true
              }
            }
            secondaryArray.push(sectionArray[i].subItems)
          }
          primaryArray.push(sectionArray)
        }

        setTimeout(() => {
          setLoading(false)
          setLoadingMessage()
          setFaqFilterSectionData(primaryArray[0])
          setSubSectionData(secondaryArray[0])
        }, 1500);
      }, 500);

    }
  }
  const selectSection = (item, index) => {
    console.log('first coming here on main section', item, index)
    const sectionArray = [...faqFilterSectionData];
    for (let i = 0; i < sectionArray.length; i++) {
      if (i == index) {
        sectionArray[index].sectionOpen = (!sectionArray[index].sectionOpen)
        setSubSectionData(sectionArray[index].subItems)
        setFaqFilterSectionData(sectionArray)
      }
      // else {
      //   sectionArray[i].sectionOpen = (!sectionArray[index].sectionOpen)
      //   setSubSectionData(sectionArray[index].subItems)
      //   setFaqFilterSectionData(sectionArray)
      // }
    }
  }

  const selectSubSection = (item, index, parentIndex) => {
    console.log('first coming here on subitems', item, index)
    const sectionArray = [...faqFilterSectionData];
    const subSectionArray = [...sectionArray[parentIndex]?.subItems];
    for (let i = 0; i < subSectionArray.length; i++) {
      if (i == index) {
        subSectionArray[index].subSectionOpen = (!subSectionArray[index].subSectionOpen)
        setSubSectionData(subSectionArray)
      }
    }
  }

  const sectionListItem = (item, index) => {
    return (
      <View>
        <CustomSectionButton title={item.typeName} onPress={() => selectSection(item, index)} 
        buttonBg={"#F6F6F6"} btnWidth={"90%"} titleTextColor={dynamicStyles.textColor} 
        sectionOpen={item.sectionOpen} isFromFAQ={true} isHtml={isHTML(item.typeName)} 
        isBoldText={true} btnHeight={item.typeName.length <= 50 ? 80 : 95}/>

        {(item.sectionOpen == true) &&
          <>
            <FlatList
              data={item.subItems}
              renderItem={(innerItem, innerIndex) => subSectionListItem(innerItem, innerIndex, index)}
              keyExtractor={(innerItem, innerIndex) => innerIndex.toString()}
              style={[styles['width_90%'], styles['align_self_center']]}
              scrollEnabled={true}
            // ListFooterComponent={<View style={{height:0,backgroundColor:"pink"}} />}
            >
            </FlatList>
          </>
        }
      </View>
    );
  }


  const subSectionListItem = ({ item, index }, index2, parentIndex) => {
    console.log('4646816468468', item)

    return (
      <View style={[styles['bg_white'], styles['width_100%'], styles['align_self_center'], styles['margin_top_minus_10'], styles['border_color_light_grey'], styles['border_radius_5'], { borderWidth: 1, borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, top: -10 }]}>
        {item.questions != "" &&
          <CustomSectionButton title={item.questions} onPress={() => selectSubSection(item, index, parentIndex)} buttonBg={Colors.lightwhiteGray} btnWidth={"95%"} titleTextColor={dynamicStyles.textColor} sectionOpen={item.subSectionOpen} htmlContent={item.questions} isFromFAQ={true} isHtml={isHTML(item.questions)} btnHeight={item.questions.length <= 50 ? 50 : 75} />
        }
        {item.subSectionOpen &&
          <View>
            {!isHTML(item.answers) && <Text style={[styles['font_size_12_regular'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['width_95%'], styles['centerItems'], { paddingStart: 5, paddingBottom: 8 }]}>{item.answers}</Text>}
            {isHTML(item.answers) &&
              <View style={[styles['width_95%'], styles['centerItems'], styles['top_10'], styles['bottom_10']]}>
                {item.answers != "" &&
                  <RenderHTML tagsStyles={{ p: { color: 'black' }, span: { color: 'black' }, div: { color: 'black' }, li: { color: 'black' } }} source={{ html: item.answers }} 
                  enableCSSInlineProcessing = {true}/>
                }
              </View>
            }
          </View>

        }
      </View>
    );
  }

  const GetFAQDetailsApiCall = async () => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getloginURL = configs.BASE_URL + configs.MASTERS.FAQ_DETAILS;
        var getHeaders = await GetApiHeaders();
        var APIResponse = await GetRequest(getloginURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            // var faqResp = APIResponse.response.faqTypeList
            console.log('the faq Resp is', JSON.stringify(APIResponse.response.faqTypeList))
            let faqObj = {
              langCode: languageCode,
              langId: languageId,
              langName: languageName,
              data: APIResponse?.response?.faqTypeList
            }
            storeData(FAQDATA, faqObj);
            setFaqSectionData(APIResponse.response.faqTypeList)
            setFaqFilterSectionData(APIResponse.response.faqTypeList)

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
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  return (

    <View style={[styles['full_screen'], styles['bg_white']]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

      <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[styles['flex_direction_row'], {alignItems :'center'}]} onPress={() => { goBack() }}>
          <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold']]}>{translate('faqs')}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles['height_100%'], styles['width_100%'], { Colors: { backgroundColor: dynamicStyles.primaryColor } }]}>



        <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true}>

          <View style={[styles['padding_top_10'], styles['width_100%'], styles['height_100%']]}>

            {/* Search Bar here */}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.grey,
                borderRadius: 8,
                width: '90%',
                height: 40,
                paddingHorizontal: 8,
                top: 20,
              }}
            >
              {/* Search / Clear Icon */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 6,
                  height: '100%',
                }}
                onPress={() => {
                  setTimeout(() => getFAQDataDetails(), 500);
                  if (searchText !== '') Keyboard.dismiss();
                  setSearchText('');
                }}
              >
                <Image
                  style={{
                    width: 15,
                    height: 15,
                    tintColor: '#C0C1C1',
                    resizeMode: 'contain',
                  }}
                  source={
                    searchText === ''
                      ? require('../assets/images/searchGray.png')
                      : require('../assets/images/close.png')
                  }
                />
              </TouchableOpacity>

              {/* Editable TextInput */}
              <TextInput
                value={searchText}
                onChangeText={(search) => {
                  setSearchText(search);
                  if (search === '') getFAQDataDetails();
                }}
                placeholder={translate('search')}
                placeholderTextColor={Colors.light_grey}
                keyboardType="default"
                style={{
                  flex: 1,
                  color: dynamicStyles.textColor,
                  fontSize: 14,
                  paddingLeft: 5,
                  paddingVertical: 0,
                  height: '100%',
                }}
              />

              {/* Search Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={searchText.length === 0}
                style={{
                  backgroundColor:
                    searchText.length === 0
                      ? dynamicStyles.primaryColor
                      : dynamicStyles.primaryColor,
                  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  height: 30,
                  marginLeft: 6,
                }}
                onPress={filterSearch}
              >
                <Text
                  style={{
                    color: dynamicStyles.secondaryColor,
                    fontSize: 12,
                  }}
                >
                  {translate('search')}
                </Text>
              </TouchableOpacity>
            </View>


            <View style={[styles['margin_top_10']]}>
              <FlatList
                data={faqFilterSectionData}
                renderItem={({ item, index }) => sectionListItem(item, index)}
                keyExtractor={(item, index) => index.toString()}
                style={[styles['margin_top_20'], styles['width_100%']]}
                scrollEnabled={true}
                ListFooterComponent={
                  <View style={{ height: 150 }} />
                }
              >
              </FlatList>

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
  )


}

export default FAQ;