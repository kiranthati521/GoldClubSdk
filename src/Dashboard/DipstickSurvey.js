import { Platform, Text, StatusBar, View, Alert, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Modal, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { strings } from "../strings/strings";
import { USER_ID, isNullOrEmpty, retrieveData, ROLENAME, MOBILE_NUMBER } from '../assets/Utils/Utils';
import SimpleToast from 'react-native-simple-toast';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import { GetApiHeaders, GetApiHeaderswithLoginResponse, GetRequest, PostRequest, getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, HTTP_ACCEPTED, HTTP_CREATED, HTTP_OK, configs } from '../helpers/URLConstants';
import { useNavigation } from '@react-navigation/native';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { WebView } from 'react-native-webview';
import { selectUser } from '../redux/store/slices/UserSlice';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUpdateRetailerInfoData } from '../redux/store/slices/UpdatedReatilerInfoDataSlice';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { createStyles } from '../assets/style/createStyles';

var newStyles = BuildStyleOverwrite(Styles);
const DipstickSurvey = ({ route }) => {
  newStyles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const getUserData = useSelector(selectUser);
  const getUpdatedUserData = useSelector(getUpdateRetailerInfoData);
  const userDatafrom = getUserData[0]
  const { languageCode,languageId } = useSelector((state) => state.language);
  const calcType = route?.params?.calcType;
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value); //dynamicStyles.highLightedColor
  const [loading, setLoading] = useState(false)
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  let [openSurvey, setOpenSurvey] = useState(false)
  let [saveUserID, setUserID] = useState('');
  let [saveMobileNumber, setMobileNumber] = useState('');
  let [dipstickData, setDipstickData] = useState('')
  let [selectedSurvey, setSelectedSurvey] = useState(null)
  let [htmlContent, setHtmlContent] = useState(`
  <div>
    <h1>Form Example</h1>
    <form>
      <label for="name">Name:</label><br>
      <input type="text" id="name" name="name"><br><br>

      <label for="gender">Gender:</label><br>
      <select id="gender" name="gender">
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select><br><br>

      <label for="age">Age:</label><br>
      <input type="number" id="age" name="age"><br><br>

      <input type="submit" value="Submit">
    </form>
  </div>
`)

  const navigation = useNavigation()

  function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
}

  useEffect(() => {
    getDipstickData()
  }, [])

  let getDipstickData = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getYeildCalcURL = configs.BASE_URL + configs.MASTERS.getAllSurveys;
        var getUserID = (await retrieveData(USER_ID))
        var mobNumber = await retrieveData(MOBILE_NUMBER);
        setUserID(getUserID)
        setMobileNumber(mobNumber)
        var getHeaders = await GetApiHeaders()
        getHeaders.retailerId = getUserID;
        //  alert(JSON.stringify(getUpdatedUserData.value.stateId))
        var APIResponse = await PostRequest(getYeildCalcURL, getHeaders, {
          "StateName": getUpdatedUserData?.value?.stateName ? getUpdatedUserData?.value?.stateName :  userDatafrom?.stateName,
          "companyCode": getUserData[0]?.companyCode
        });
        // var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse?.response
            if (masterResp != undefined && masterResp != null) {
              console.log(masterResp, "data from all surverys listttttt")
              let listOfSurveys = masterResp?.surveyList
              setDipstickData(listOfSurveys)
            }
          }
          else {
            Alert.alert(APIResponse?.message)
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
        SimpleToast.show(error.message)
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  let returnTitleDesc = (item) => {
    switch (languageCode) {
      case 'te':
        return {title: item?.SurveyNameTelugu,desc : item?.descriptionInTelugu}

      case 'mr':
        return {title: item?.SurveyNameMarathi,desc : item?.descriptionInMarathi}

      case 'hi':
        return {title: item?.SurveyNameHindi,desc : item?.descriptionInHindi}


      default:
        return {title: item?.surveyName,desc : item?.description}
    }
  }

  return (

    <SafeAreaView style={{flex: 1, backgroundColor: dynamicStyles.primaryColor}} edges={['top']}>
    <View style={[styles.flexFull, styles.gray300bg]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
        <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { width:"100%",paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 20 : 20 }]}>
          <TouchableOpacity style={[{flexDirection:"row",alignItems:"center",maxWidth:"55%"}]} onPress={() => navigation.goBack()}>
            <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20,marginRight:10 }]} source={require('../assets/images/previous.png')}></Image>
            <Text style={[ { color: dynamicStyles.secondaryColor }, newStyles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('DipstickSurvey')}</Text>
          </TouchableOpacity>
        </View>
      {/* <TouchableOpacity
        style={[styles.header, { backgroundColor: dynamicStyles.primaryColor }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/images/previous.png')} style={{
            height: 18, width: 18, tintColor: dynamicStyles.secondaryColor, marginTop: 15, marginLeft: 10
          }} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: dynamicStyles.secondaryColor,lineHeight:25 }]}>
          {translate('DipstickSurvey')}
        </Text>
      </TouchableOpacity> */}

      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {/* {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />} */}
      {(dipstickData !== null && dipstickData?.length > 0) ? <FlatList
        style={{ marginBottom: 10 }}
        data={dipstickData}
        initialNumToRender={3}
        nestedScrollEnable={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        renderItem={({ item, index }) => {
          const disableButton=item?.buttonName === "Coming Soon"||item?.buttonName ==="Completed";
          return (
            <View key={`${item?.id}-${index}`} style={styles.dabba}>
              <View style={styles.headerContainer}>
                <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,newStyles['font_size_15_bold']]}>{returnTitleDesc(item)?.title}</Text>
                {item?.count > 0 && <View style={styles.notificationCircle}>
                  <Text style={[styles.notificationText,newStyles['font_size_10_bold']]}>{item?.count}</Text>
                </View>}
              </View>
              {item?.description && <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.subText,newStyles['font_size_10_regular']]}>{returnTitleDesc(item)?.desc}</Text>}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item?.imagePath }}
                  resizeMode='contain'
                  style={styles.image}
                />
                <TouchableOpacity 
                disabled={disableButton}
                // disabled={!item?.surveyStatus}
                onPress={() => {
                  // item?.surveyStatus && setOpenSurvey(true)
                  // item?.surveyStatus && setSelectedSurvey(item)
                  // !item?.surveyStatus && SimpleToast.show(translate('feature_not_available'))
                  setOpenSurvey(true)
                  setSelectedSurvey(item)
                }
                } activeOpacity={0.5} style={[styles.surveyButton, { backgroundColor: !disableButton ? dynamicStyles.primaryColor : dynamicStyles.highLightedColor.replace(/(\d(\.\d+)?)(\))$/, '0.4)'), }]}>
                  <Text style={[newStyles['font_size_12_semibold'],styles.buttonText,{color:dynamicStyles.secondaryColor}]}>{item?.buttonText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
        keyExtractor={(item, index) => `${item?.id || index}`}
          contentContainerStyle={{ paddingBottom: 10 }}
        /> : <View style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
          height: responsiveHeight(60)
        }}>
          <Text style={[{
            color: dynamicStyles?.primaryColor
          },newStyles['font_size_16_regular']]}>
            {translate('NoActivitiesfound')}
          </Text>
        </View>}
      <Modal animationType='fade'
        transparent={true}
        visible={openSurvey}
        onRequestClose={() => setOpenSurvey(false)}>
        <View style={styleSheetStyles.centeredView}>
          <View style={styleSheetStyles.modalView}>
            <View style={[styles.headerContainer, { width: "100%" }]}>
              {/* 
              returnTitleDesc(item)?.title

              selectedSurvey?.surveyName
              */}
              <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.headerText2,newStyles['font_size_15_bold']]}>{returnTitleDesc(selectedSurvey)?.title}</Text>
              <TouchableOpacity activeOpacity={0.5} onPress={() => {
                setOpenSurvey(false)
                setSelectedSurvey(null)
              }}>
                <Image resizeMode='contain' style={styles.image2} source={require('../assets/images/closeWindow.png')} />
              </TouchableOpacity>
            </View>
            <View style={{flex: 1, width: "100%"}}>
              <WebView
                // source={{ uri: `${selectedSurvey?.pageLink}?retailerId=${saveUserID}&mobileNumber=${saveMobileNumber}&buttonColor=${hexToRgbA(dynamicStyles.primaryColor)}&companyCode=${getUserData[0]?.companyCode}` }}
                source={{ uri: `${selectedSurvey?.pageLink}?retailerId=${saveUserID}&mobileNumber=${saveMobileNumber}&buttonColor=${hexToRgbA(dynamicStyles.primaryColor)}&applicationName=${strings.VyaparMitraTwo}&companyCode=${getUserData[0]?.companyCode}&productName=${selectedSurvey?.productName}&surveyId=${selectedSurvey?.id}&languageId=${languageId}` }}
                style={{ width: '100%', height: '100%',flex:1,alignItems:"center",justifyContent:"center" }}
                javaScriptEnabled={true}
                startInLoadingState={true}
                renderLoading={() => <ActivityIndicator size="large" style={{  width: '100%', flex:15,alignItems:"center",justifyContent:"center"}} color={dynamicStyles.iconPrimaryColor} />}
                onError={(error) => console.log('WebView error: ', error)}
                onNavigationStateChange={(event) => {
                  console.log(dynamicStyles.primaryColor,"dynamicStyles.iconPrimaryColor",event.url,"<urlllll")
                  const queryString = event?.url?.split('?')[1];
                  const params = queryString?.split('&').reduce((acc, param) => {
                    const [key, value] = param?.split('=');
                    acc[key] = value;
                    return acc;
                  }, {});
                  const status = params?.status;
                  if (status === 'success') {
                    setOpenSurvey(false);
                    setSelectedSurvey(null);
                    getDipstickData();
                    setTimeout(() => {
                    SimpleToast.show(`${returnTitleDesc(selectedSurvey)?.title} ${translate("submission_successfully")}`);
                  }, 150);
                  } else if (status === 'error') {
                    setOpenSurvey(false);
                    setSelectedSurvey(null);
                    setTimeout(() => {
                      SimpleToast.show(`${returnTitleDesc(selectedSurvey)?.title} ${translate("submission_failed")}`);
                    }, 150);
                  }
                }}
                
              />
            </View>
          </View>
        </View>
      </Modal >
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText2: { color: "rgba(0, 0, 0, 1)" },
  notificationCircle: {
    backgroundColor: "rgba(219, 113, 14, 1)",
    height: 26,
    width: 26,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    color: "rgba(255, 255, 255, 1)",
  },
  subText: {
    color: "rgba(0, 0, 0, 1)",
    marginTop: 5,
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 5,
  },
  image: {
    height: 50,
    width: 50,
  },
  image2: {
    height: 30,
    width: 30,
  },
  surveyButton: {
    width: "40%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "rgba(255, 255, 255, 1)",
  },
  viewShot: {
    width: '100%',
    height: '100%',
  },
  flexFull: { flex: 1 },
  gray300bg: { backgroundColor: '#f5f5f5' },
  header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
  dabba: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    width: "90%",
    alignSelf: "center",
    // height: 200,
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    // borderColor:'rgba(0, 0, 0, 0.06)',borderWidth:2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
});

let styleSheetStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#000000d6"
  },
  modalView: {
    // minHeight: responsiveHeight(60),
    flex: 0.8,
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

export default DipstickSurvey;
