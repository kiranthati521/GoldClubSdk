import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, Linking, Keyboard, TouchableOpacity, Alert } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { DEVICE_TOKEN, EDITDATA, MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, SELECTEDCOMPANY, TERMS_CONDITIONS, USERMENU, USER_ID, USER_NAME, retrieveData, storeData } from '../assets/Utils/Utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import CustomAlert from '../Components/CustomAlert';
import CustomCircularImageView from '../Components/CustomCircularImageView';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { GetApiHeaders, PostRequest, getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import SimpleToast from 'react-native-simple-toast';
import DeviceInfo from 'react-native-device-info';
import { selectUser, setUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { changeLanguage, translate } from '../Localisation/Localisation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateRetailerInfoData } from '../redux/store/slices/UpdatedReatilerInfoDataSlice';
import LogoutModal from '../Modals/LogoutModal';
import { updateOfflineCount } from '../Dashboard/synchCountUtils';
import { uploadAllComplaintsGlobal } from './HelpDesk';
import { getMastersSeedCalc, saveSavedSeedCalData } from '../Dashboard/SeedCalculator';
import { getYieldCalcMasters, SaveYieldCalcValues } from '../Dashboard/YieldCalculator';
import { saveAPIPlanningTool } from '../Dashboard/PlanningTool';
import { mobileNumber } from '../redux/store/slices/mobileNumberSlice';
import { createStyles } from '../assets/style/createStyles';
// import { ScrollView } from "react-native";

var styles = BuildStyleOverwrite(Styles);

var realm;
let scannedCoupons;
let dashboardData;

function Profile({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const networkStatus = useSelector(state => state.networkStatus.value)
  const offlineCountFromRedux = useSelector(state => state.offlineCount.count);
  const { languageCode, languageId } = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);

  const [loading, setLoading] = useState(false)
  const ekycStatus = route?.params?.ekycStatus != undefined ? route?.params?.ekycStatus : "false";
  let badgeIcon = route?.params?.badgeIcon
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))

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

  const [userImage, setUserImage] = useState('')
  const [roleType, setRoleType] = useState(undefined);
  const [userName, setUserName] = useState('')
  const [userNumber, setUserNumber] = useState('')
  const [menuItems, setMenuItems] = useState([
    { title: 'myaccount', image: require('../assets/images/myaccount.png') },
    { title: 'ekyc', image: require('../assets/images/address.png') },
    { title: 'Language', image: require('../assets/images/languageSymbol.png') },
    { title: 'accountCloser', image: require('../assets/images/deleAccount.png') }
  ])
  const [empMenuItems, setEmpMenuItems] = useState([
    { title: 'myaccount', image: require('../assets/images/myaccount.png') },
    { title: 'ekyc', image: require('../assets/images/address.png') },
    { title: 'Language', image: require('../assets/images/languageSymbol.png') },
  ])
  const [selectedCompany, setSelectedCompany] = useState("");
  const [logoutModal, setLogoutModal] = useState(false)

  const handleLoading = () => {
    setLoading(false);
  }

  useEffect(() => {
    // Define an async function inside useEffect
    const fetchData = async () => {
      realm = new Realm({ path: 'User.realm' })
      scannedCoupons = realm.objects('scannedCoupons')
      dashboardData = realm.objects('dashboardData')[0]
      setRoleType(await retrieveData(ROLENAME))
      handleLoading();
    };
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        // setTimeout(() => {
        //   setLoading(true);
        //   setLoadingMessage(translate('please_wait_getting_data'))
        // }, 50);
        try {
          const selectedCompanyName = await retrieveData(SELECTEDCOMPANY);
          setSelectedCompany(selectedCompanyName);
          const role = await retrieveData(ROLENAME);
          setRoleType(role);
          await getUserDataDetails();
          setTimeout(() => {
            setLoading(false);
          }, 500);
        } catch (error) {
          // setTimeout(() => {
          //   setLoading(false);
          //   setLoadingMessage()
          // }, 1000);
          console.error('Error refreshing profile data:', error);
        }
      };

      fetchData();

      return () => {
        console.log('profile out of focus')
      };
    }, [])
  );


  useEffect(() => {
    // Define an async function inside useEffect
    const companyRetirvee = async () => {
      const selectedCompanyName = await retrieveData(SELECTEDCOMPANY);
      setSelectedCompany(selectedCompanyName);
      setLoading(false)
      setLoadingMessage()
    };
    companyRetirvee();
  }, []);

  useEffect(() => {
    // getUserDataDetails();
    if (roleType != undefined && (roleType != 'Retailer' && roleType != 'Distributor')) {
      setMenuItems(prevMenuItems => prevMenuItems.filter(item => item.title !== 'ekyc' && item.title !== 'Language'));
    }
  }, [roleType])

  const getUserDataDetails = async () => {
    setUserName(await retrieveData(USER_NAME))
    setUserNumber(await retrieveData(MOBILE_NUMBER))
    // setUserImage(await retrieveData(PROFILEIMAGE))
  }

  useLayoutEffect(() => {
    let setData = async () => {
      setUserImage(await retrieveData(PROFILEIMAGE))
    }
    setData()
    getUserDataDetails()
  }, [])

  const goBack = async () => {
    console.log('comig heeeee')
    const roleTypeDetails = await retrieveData(ROLENAME)
    if (roleTypeDetails) {
      let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard' : 'Dashboard'
      navigation.navigate(navigateTo)
    }
    // navigation.navigate('Dashboard')
  };
  // const getProfileDetails = async () => {
  //   var getMobileNumber = (await retrieveData(MOBILE_NUMBER))
  //   // setMobileNumber(getMobileNumber.toString())
  //   // setStoreMobileNum(getMobileNumber.toString())
  //   var getUserID = (await retrieveData(USER_ID))
  //   setStoreUserID(getUserID.toString())
  // }
  const logoutButtonPress = async () => {
    const roleTypeDetails = await retrieveData(ROLENAME)
    if ((roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor')) {
      if (offlineCountFromRedux == 0) {
        showAlertWithMessage(translate('alert'), true, true, translate('are_you_sure_want_to_logout'), true, true, translate('logout'), translate('cancel'))
      }
      else {
        setShowAlert(false)
        setLogoutModal(true)
      }
    }
    else {
      setLogoutModal(false)
      showAlertWithMessage(translate('alert'), true, true, translate('are_you_sure_want_to_logout'), true, true, translate('logout'), translate('cancel'))
    }

  }
  const removeAccountClicked = async () => {
    const roleTypeDetails = await retrieveData(ROLENAME)
    if ((roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor')) {
      if (offlineCountFromRedux == 0) {
        showAlertWithMessage(translate('alert'), true, true, translate('accountDeleteWarning_wtihoutData'), true, true, translate('proceed'), translate('cancel'))
      }
      else {
        showAlertWithMessage(translate('alert'), true, true, translate('accountDeleteWarning'), true, true, translate('sync_and_proceed'), translate('cancel'))
      }
    }
  }
  const claringUserDataToLogin = async () => {
    setTimeout(async () => {
      setSuccessLoading(false)
      setSuccessLoadingMessage()
      storeData(MOBILE_NUMBER, '');
      storeData(USER_ID, '');
      storeData(USER_NAME, '');
      storeData(DEVICE_TOKEN, '');
      storeData(USERMENU, '');
      storeData(PROFILEIMAGE, '')
      storeData(ROLENAME, '')
      storeData(ROLEID, '')
      storeData(EDITDATA, false)
      storeData(TERMS_CONDITIONS, false);
      await AsyncStorage.removeItem('dontShowThisAgain')
      dispatch(updateCompanyStyles({}));
      dispatch(updateRetailerInfoData({}));
      dispatch(setUser({}))
      if (roleType == 'Retailer' || roleType == 'Distributor') { }
      else {
        changeLanguage(languageCode)
      }
      const complaints = realm.objects('ComplaintData');
      realm.write(() => {
        realm.delete(complaints);
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginNew' }], //after logout if you want to go login screen enable this else
        // routes: [{ name: 'OnBoardingScreens' }], // enable this
      });
    }, 500);
  }

  const getUserLoggedOut = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLogoutModal(false)
        setLoading(true);
        setLoadingMessage(translate('pleasewaitloggingout'));
        var url = configs.BASE_URL + configs.AUTH.LOGOUT;
        var getHeaders = await GetApiHeaders();
        var dataList = {
          userId: getHeaders.userId
        }
        console.log('url is', url)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(url, getHeaders, dataList);
        console.log('logout response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 1700);
          if (APIResponse.statusCode == HTTP_OK) {
            clearAllRealmData()
            await deleteDataFromRealm()
            updateOfflineCount(dispatch)
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('logout_successfully'))
            }, 2000);

            setTimeout(async () => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
              storeData(MOBILE_NUMBER, '');
              storeData(USER_ID, '');
              storeData(USER_NAME, '');
              storeData(DEVICE_TOKEN, '');
              storeData(USERMENU, '');
              storeData(PROFILEIMAGE, '')
              storeData(ROLENAME, '')
              storeData(ROLEID, '')
              storeData(EDITDATA, false)
              storeData(TERMS_CONDITIONS, false);
              await AsyncStorage.removeItem('dontShowThisAgain')
              dispatch(updateCompanyStyles({}));
              dispatch(updateRetailerInfoData({}));
              dispatch(setUser({}))
              if (roleType == 'Retailer' || roleType == 'Distributor') { }
              else {
                changeLanguage(languageCode)
              }
              const complaints = realm.objects('ComplaintData');
              realm.write(() => {
                realm.delete(complaints);
              });
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginNew' }], //after logout if you want to go login screen enable this else
                // routes: [{ name: 'OnBoardingScreens' }], // enable this
              });
            }, 500);
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
      } catch (error) {
        setTimeout(() => {
          setLoading(false);
          setLoadingMessage()
        }, 100);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const deleteDataFromRealm = async () => {
    try {
      realm.write(() => {
        realm.delete(realm.objects('dashboardData'));
        realm.delete(realm.objects('kycData'));
        realm.delete(realm.objects('scannedCoupons'));

        realm.delete(realm.objects('programDetailsOff'))
        realm.delete(realm.objects('productsListPscreen'))
        realm.delete(realm.objects('cropsMasterProducts'))
        realm.delete(realm.objects('companiesListInProducts'))
        realm.delete(realm.objects('couponsDataInSH'))
        realm.delete(realm.objects('cropsListDataInSH'))
        realm.delete(realm.objects('productsListDataInSH'))
        realm.delete(realm.objects('ScanHistoryResponse'))
        realm.delete(realm.objects('YieldCalculatorResponse'))
        realm.delete(realm.objects('SeedCalSubmit'))
        realm.delete(realm.objects('YieldCalSubmit'))
        realm.delete(realm.objects('fertiliserCalculatorResponse'))
        realm.delete(realm.objects('fertiliserCalculatorMaster'))
        realm.delete(realm.objects('SeedCalculatorResponse'))
        realm.delete(realm.objects('cropsListProducts'))
        realm.delete(realm.objects('productsMasterOffline'))
        realm.delete(realm.objects('Complaint'))
        realm.delete(realm.objects('ComplaintData'))
        realm.delete(realm.objects('helpDeskPageOff'))
        realm.delete(realm.objects('complaintCategoriesList'))
        realm.delete(realm.objects('RetailerEntries'))
        realm.delete(realm.objects('finalRetailerEntries'))
        realm.delete(realm.objects('companyCodeMasterPlanningTool'))
        realm.delete(realm.objects('hybridMasterPlanningTool'))
        realm.delete(realm.objects('cropMasterPlanningTool'))
        realm.delete(realm.objects('weatherRes'))
        realm.delete(realm.objects('carouselDataOff'))

      });

      console.log('All data cleared from Realm');
    } catch (error) {
      console.error('Error clearing data from Realm:', error);
    }
  }

  const clearAllRealmData = () => {
    try {
      realm.write(() => {
        realm.deleteAll();
      });
      console.log("✅ All Realm data cleared.");
    } catch (error) {
      console.error("❌ Error clearing Realm data:", error);
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


  const handleSyncLogout = async () => {
    var realm = new Realm({ path: 'User.realm' });
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      // if(updatedOfflineCount == 0) return SimpleToast.show(translate("no_data_to_upload"))
      try {
        let isAsyncFailed;
        setLoading(true);
        setLoadingMessage(translate("syncingPlz"))
        setLogoutModal(false)
        // setLoadingMessage(translate("syncingPlz"))

        // help desk
        const complaints = realm.objects('ComplaintData');
        console.log(complaints, "offline complaints list")
        if (complaints?.length > 0) {
          let checkHelpUploadStatus = await uploadAllComplaintsGlobal(complaints, dispatch)
          if (checkHelpUploadStatus) {
            // alert("succeed")
            isAsyncFailed = true
          }
        };

        // seed calc
        const seedCalcRes = realm.objects('SeedCalSubmit');
        const seedCalcOfflineData = seedCalcRes[0]?.data;
        if (seedCalcOfflineData) {
          let parseIt = JSON.parse(seedCalcOfflineData)
          let checkSeedSaveStatus = await saveSavedSeedCalData(parseIt, dispatch)
          if (checkSeedSaveStatus) {
            getMastersSeedCalc()
            isAsyncFailed = true;
          }
        }

        //3.  sync calls for yield calc
        const yieldCalcRes = realm.objects('YieldCalSubmit');
        const yieldCalcOfflineData = yieldCalcRes[0]?.data;
        if (yieldCalcOfflineData) {
          let yieldParseIt = JSON.parse(yieldCalcOfflineData)
          let checkSavedOrNot = await SaveYieldCalcValues(yieldParseIt, dispatch)
          if (checkSavedOrNot) {
            getYieldCalcMasters()
            isAsyncFailed = true
          }
        }

        // 4. planning tool
        const offlineRetailerEntriesData = realm.objects('finalRetailerEntries');
        if (offlineRetailerEntriesData.length !== 0) {
          console.log('offline data exists so----------------------------- saving in online now', offlineRetailerEntriesData)
          let dataOfRetailerEntriesData = JSON.parse(offlineRetailerEntriesData[0]?.finalRetailerEntriesData);
          let checkPlanTool = await saveAPIPlanningTool(dataOfRetailerEntriesData, dispatch)
          if (checkPlanTool) {
            isAsyncFailed = true
          }
        }
      } finally {
        setTimeout(() => {
          setLoading(false);
          setLoadingMessage('');
          getUserLoggedOut()
        }, 10000);
      }

      // if (isAsyncFailed) {
      //   getUserLoggedOut()
      // }

    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  };

  const handleSyncDeleteLogout = async () => {
    var realm = new Realm({ path: 'User.realm' });
    const getMobileNumber = await retrieveData(MOBILE_NUMBER);
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      // if(updatedOfflineCount == 0) return SimpleToast.show(translate("no_data_to_upload"))
      try {
        let isAsyncFailed;
        setLoading(true);
        setLoadingMessage(translate("syncingPlz"))
        setLogoutModal(false)
        // setLoadingMessage(translate("syncingPlz"))

        // help desk
        const complaints = realm.objects('ComplaintData');
        console.log(complaints, "offline complaints list")
        if (complaints?.length > 0) {
          let checkHelpUploadStatus = await uploadAllComplaintsGlobal(complaints, dispatch)
          if (checkHelpUploadStatus) {
            // alert("succeed")
            isAsyncFailed = true
          }
        };

        // seed calc
        const seedCalcRes = realm.objects('SeedCalSubmit');
        const seedCalcOfflineData = seedCalcRes[0]?.data;
        if (seedCalcOfflineData) {
          let parseIt = JSON.parse(seedCalcOfflineData)
          let checkSeedSaveStatus = await saveSavedSeedCalData(parseIt, dispatch)
          if (checkSeedSaveStatus) {
            getMastersSeedCalc()
            isAsyncFailed = true;
          }
        }

        //3.  sync calls for yield calc
        const yieldCalcRes = realm.objects('YieldCalSubmit');
        const yieldCalcOfflineData = yieldCalcRes[0]?.data;
        if (yieldCalcOfflineData) {
          let yieldParseIt = JSON.parse(yieldCalcOfflineData)
          let checkSavedOrNot = await SaveYieldCalcValues(yieldParseIt, dispatch)
          if (checkSavedOrNot) {
            getYieldCalcMasters()
            isAsyncFailed = true
          }
        }

        // 4. planning tool
        const offlineRetailerEntriesData = realm.objects('finalRetailerEntries');
        if (offlineRetailerEntriesData.length !== 0) {
          console.log('offline data exists so----------------------------- saving in online now', offlineRetailerEntriesData)
          let dataOfRetailerEntriesData = JSON.parse(offlineRetailerEntriesData[0]?.finalRetailerEntriesData);
          let checkPlanTool = await saveAPIPlanningTool(dataOfRetailerEntriesData, dispatch)
          if (checkPlanTool) {
            isAsyncFailed = true
          }
        }
      } finally {
        setTimeout(() => {
          setLoading(false);
          setLoadingMessage('');
          const accountCloserLinkUrl = configs.ACCOUNT_CLOSE_URL({
            mobileNumber: getMobileNumber,
            languageId: languageId,
            buttonColor: dynamicStyles.primaryColor
          });
          console.log("fetched account closer", accountCloserLinkUrl);
          setShowAlert(false)
          navigation.navigate('AccountCloser', { onClose: () => { claringUserDataToLogin() }, from: 'profilescreen', dynamicStyles: dynamicStyles, mobileNumber: getMobileNumber, loaderGif: require('../assets/images/neutralloader.gif'), accountCloseLink: accountCloserLinkUrl, title: translate('accountCloser') })
        }, 10000);
      }

    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  };

  const handleCancelAlert = () => {
    setShowAlert(false)
    setLogoutModal(false)
  }

  const handleOkAlert = async () => {
    const getMobileNumber = await retrieveData(MOBILE_NUMBER);
    if (showAlertyesButtonText == translate('continue')) {
      setShowAlert(false)
    }
    if (showAlertyesButtonText == translate('update')) {
      if (Platform.OS == 'ios') {
        Linking.openURL(storeUrl)
      } else {
        Linking.openURL(storeUrl)
      }
    }


    if (alertMessage == translate('are_you_sure_want_to_logout')) {
      getUserLoggedOut()
    }
    if (alertMessage == translate("accountDeleteWarning_wtihoutData")) {
      setTimeout(() => {
        setLoading(false);
        setLoadingMessage('');
        const accountCloserLinkUrl = configs.ACCOUNT_CLOSE_URL({
          mobileNumber: getMobileNumber,
          languageId: languageId,
          buttonColor: dynamicStyles.primaryColor
        });
        console.log("fetched account closer", accountCloserLinkUrl);
        setShowAlert(false);
        navigation.navigate('AccountCloser', { onClose: () => { claringUserDataToLogin() }, from: 'profilescreen', dynamicStyles: dynamicStyles, mobileNumber: getMobileNumber, loaderGif: require('../assets/images/neutralloader.gif'), accountCloseLink: accountCloserLinkUrl, title: translate('accountCloser') })
      }, 500);
    }
    if (showAlertyesButtonText == translate('proceed')) {
      sendOTPApiCall(userAcceptanceKey = "1")
    }
    if (alertMessage == translate("accountDeleteWarning")) {
      handleSyncDeleteLogout()
    }
    setShowAlert(false)
    setLogoutModal(false)
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

  const onPressMenuItem = async (item, index) => {

    console.log("ldjlajfla", index);
    if (networkStatus) {
      if (index == 0) {
        let name = (roleType === 'Retailer' || roleType === 'Distributor') ? 'MyAccount' : 'MyAccountEmployee';
        navigation.navigate(name, { badgeIcon: badgeIcon })
      }
      else if (index == 1 && (roleType === 'Retailer' || roleType === 'Distributor')) {
        navigation.navigate('KYC', { ekycStatus: ekycStatus })
      }
      else if (index == 2 && (roleType === 'Retailer' || roleType === 'Distributor')) {
        navigation.navigate('LanguageScreen', { from: 'profilescreen', ekycStatus: ekycStatus })
      }
      else if (index == 3 && (roleType === 'Retailer' || roleType === 'Distributor')) {
        removeAccountClicked()
      }
      else if (index == 1 && (roleType !== 'Retailer' && roleType !== 'Distributor')) {
        removeAccountClicked()
      }
      // else if (index == 2) {
      //   navigation.navigate('Address')
      // }
      // else if (index == 3) {
      //   if (Platform.OS == 'android') {
      //     IntentLauncher.startActivity({
      //         action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
      //         data: 'package:' + pkg
      //     })
      // } else {
      //     Linking.openURL('app-settings:')
      // }
      // }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  listItem = (item, index) => {
    return (
      <View style={[{ width: '90%' }, styles['centerItems']]}>

        <TouchableOpacity style={[styles['bg_white'], styles['margin_5'], styles['width_100%'], { height: 50 }]} onPress={() => onPressMenuItem(item, index)}>
          <View style={[styles['align_self_center'], styles['flex_direction_row'], styles['width_100%'], styles['height_100%'], styles['centerItems']]} >
            {item.title === 'Language' ?
              <View style={[styles['padding_5'], { backgroundColor: dynamicStyles.highLightedColor, alignItems: "center", justifyContent: "center", marginLeft: 30, borderRadius: 100 }]}>
                <Image resizeMode='contain' style={[styles['align_self_center'], { tintColor: dynamicStyles.iconPrimaryColor, height: 10, width: 10 }]} source={(item.image)} ></Image>
              </View>
              :
              <Image resizeMode='contain' style={[styles['width_height_20'], styles['padding_5'], styles['align_self_center'], { tintColor: dynamicStyles.iconPrimaryColor }, { marginLeft: 30 }]} source={(item.image)} ></Image>
            }
            <Text style={[styles['text_align_left'], styles['margin_5'], styles['padding_5'], styles['font_size_14_regular'], styles['text_color_black'], styles['width_80%'], styles['align_self_center']]} numberOfLines={1}>
              {translate(item.title)}
            </Text>
            {(item.title == translate('ekyc') && (ekycStatus != "" && ekycStatus.toLowerCase() == "Pending".toLowerCase())) &&
              <View style={[{ position: 'absolute', end: 0, marginEnd: 40 }]}>
                <Image style={[styles['width_height_20'], styles['align_self_center'], { marginRight: 25 }]} source={require('../assets/images/ic_pending.png')} ></Image>
              </View>}
            <Image style={[styles['width_height_8'], styles['align_self_center'], { marginRight: 30 }]} source={require('../assets/images/rightArrowSmall.png')} ></Image>

          </View>
          <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={[styles['full_screen'], { backgroundColor: dynamicStyles.primaryColor }]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

      <View style={[{ padding: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 15 }]}>
        <TouchableOpacity style={[styles['flex_direction_row'], { alignItems: 'center' }]} onPress={() => { goBack() }}>
          <Image style={[{ tintColor: dynamicStyles.secondaryColor, height: 15, width: 20, }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold']]}>{translate('profile')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[(Platform.OS == 'ios' && styles['padding_top_30']), styles['width_100%'], styles['flex_1']]}>

        {/* <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_20'], styles[''], styles['tint_color_white'], { height: 20, width: 25, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles[''], styles['text_color_white'], styles[''], styles['font_size_14_bold'], { marginTop: 5 }]}>{translate('profile')}</Text>
        </TouchableOpacity> */}

        <Image style={[styles['width_100%'], styles['height_40'], styles['bottom_minus_1'], styles['margin_top_30']]} resizeMode='stretch' source={require('../assets/images/pyramid.png')}></Image>
        <View style={[styles['width_100%'], { flex: 1 }]}>

          <View style={[styles['bg_white'], styles['width_100%'], Platform.OS == 'android' ? styles['height_100%'] : styles['height_80%']]}>

            <View style={[styles['top_5'], styles['align_self_center'], styles['margin_bottom_20']]}>
              {console.log("USER_IMAGE", userImage)}
              <CustomCircularImageView
                badgeIcon={badgeIcon}
                stylesOfBadge={{
                  height: 60, width: 60, resizeMode: "contain", position: "absolute", bottom: -responsiveHeight(2.5), right: responsiveWidth(-2)
                }}
                source={userImage != undefined ? (userImage.toString().includes("https:") || userImage.toString().includes("http:")) ? { uri: userImage } : require('../assets/images/profileIcon.png') : require('../assets/images/profileIcon.png')}
                size={95} />
            </View>

            <View style={[styles['']]}>
              <Text style={[styles['font_size_16_semibold'], styles['text_color_black'], styles['centerItems'], styles['text_align_center']]}>{userName}</Text>
              <Text style={[styles['font_size_12_regular'], styles['text_color_grey'], styles['centerItems'], styles['text_align_center'], styles['top_5']]}>{userNumber}</Text>
            </View>
            <View style={[styles['width_100%'], { marginTop: 5 }]}>
              <FlatList
                bounces={false}
                data={(roleType == 'Retailer' || roleType == 'Distributor') ? menuItems : empMenuItems}
                ListHeaderComponent={
                  <>
                    <View style={[styles['margin_top_20'], styles['margin_left_35']]}>
                      <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_semibold']]}>{translate('company')}</Text>
                      <Image source={{ uri: selectedCompany }} style={[
                        { height: 45, width: 45, marginTop: 5, resizeMode: "contain" }
                      ]} />
                    </View>
                  </>
                }
                ListFooterComponent={<View style={{ height: Platform.OS === 'android' ? responsiveHeight(45) : responsiveHeight(25) }} />}
                renderItem={({ item, index }) => listItem(item, index)}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={true}>
              </FlatList>
            </View>
          </View>
          <View style={[styles['centerItems'], styles['width_100%'], Platform.OS == 'android' ? undefined : styles['height_20%'], styles['bg_white'], { position: 'absolute', bottom: Platform.OS == 'android' ? 15 : 0 }]}>
            <CustomButton title={translate('logout')} onPress={logoutButtonPress} buttonBg={dynamicStyles.primaryColor} btnWidth={"90%"} titleTextColor={dynamicStyles.secondaryColor} />
            <Text style={[styles['font_size_10_regular'], styles['text_color_grey'], styles['centerItems'], styles['text_align_left']]}>{translate('version') + " " + DeviceInfo.getVersion()}</Text>
          </View>
        </View>
      </View>

      <LogoutModal
        visible={logoutModal}
        onNoSyncLogout={getUserLoggedOut}
        onSyncLogout={handleSyncLogout}
        onClose={handleCancelAlert}
      />

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

export default Profile;