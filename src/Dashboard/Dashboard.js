import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, AppState, Dimensions, Keyboard, TouchableOpacity, ScrollView, FlatList, ImageBackground, PermissionsAndroid, Modal, Linking, Alert } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { DEVICE_TOKEN, EDITDATA, MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, TERMS_CONDITIONS, USERMENU, USER_ID, USER_NAME, compareVersions, filterObjects, getAppVersion, getBuildNumber, readFileToBase64, requestMultiplePermissions, retrieveData, sortObjectsAlphabetically, storeData } from '../assets/Utils/Utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { APP_ENV_PROD, FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, HTTP_ACCEPTED, HTTP_CREATED, HTTP_OK, IOS_STORE_LINK, configs } from '../helpers/URLConstants';
import SimpleToast from 'react-native-simple-toast';
import { selectUser } from '../redux/store/slices/UserSlice';
import { useSelector } from 'react-redux';
import CustomCircularImageView from '../Components/CustomCircularImageView';
import { PERMISSIONS, check, request } from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import DeviceInfo from 'react-native-device-info';
import CustomButton from '../Components/CustomButton';
import CustomTextInput from '../Components/CustomTextInput';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import CustomListViewModal from '../Modals/CustomListViewModal';
import messaging from '@react-native-firebase/messaging';
import ImageResizer from 'react-native-image-resizer';
import firestore from '@react-native-firebase/firestore';
import CustomBorderDocumetUpload from '../Components/CustomBorderDocumetUpload';
import CustomGalleryPopup from '../Components/CustomGalleryPopup';
import { changeLanguage, translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);
var realm;
let scannedCoupons;
let dashboardData;

function Dashboard({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const [loading, setLoading] = useState(false)
  const networkStatus = useSelector(state => state.networkStatus.value)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/vm_loader.gif'))
  const userDatafrom = route?.params?.userData != undefined ? route.params.userData : {};
  const navigation = useNavigation()
  const getUserData = useSelector(selectUser);
  // const networkStaus = useSelector(getNetwork)
  const [userData, setUserData] = useState('');
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
  const [dashboardDetails, setDashboardDetails] = useState()
  const [userPointsEarned, setUserPointsEarned] = useState('0')
  const [userPointsReedemed, setUserPointsReedemed] = useState('0')
  const [totalRetailers, setTotalRetailers] = useState('0')
  const [activeRetailers, setActiveRetailers] = useState('0')
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')
  const [ekycStatus, setEkycStatus] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showLinkModalRedeem, setShowLinkModalRedeem] = useState(false)

  const [showPanEntryModal, setShowPanEntryModal] = useState(false)
  const [faqSectionData, setFaqSectionData] = useState([])
  const [territoryName, setTerritoryName] = useState('')
  const [territoryMobileNo, setTerritoryMobileNo] = useState('')
  const [showDetailViewModal, setShowDetailViewModal] = useState(false)
  const [proprietorName, setProprietorName] = useState('')
  const [firmName, setFirmName] = useState('')
  const [ekycSubmitted, setEkycSubmitted] = useState(false)
  const [dropDownData, setdropDownData] = useState();
  const [showDropDowns, setShowDropDowns] = useState(false)
  const [dropDownType, setDropDownType] = useState("");
  const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
  const [stateList, setStateList] = useState()
  const [state, setState] = useState('')
  const [stateID, setStateID] = useState('')
  const [districtListOriginal, setDistrictListOriginal] = useState()
  const [districtList, setDistrictList] = useState()
  const [district, setDistrict] = useState('')
  const [districtID, setDistrictID] = useState('')
  const [notificationCount, setNotificationCount] = useState(null)
  const [raiseRequestStatus, setRaiseRequestStatus] = useState(false)
  const [raiseRequest, setRaiseRequest] = useState(false)
  const { height, width } = Dimensions.get('window');
  const [roleType, setRoleType] = useState(undefined);
  const [panKeyboardType, setPanKeyboardType] = useState('default');
  const [panNumber, setPanNumber] = useState("");
  const [selectedPan, setSelectedPan] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedPanImage, setSelectedPanImage] = useState(false)
  const [panImageData, setPanImageData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [base64ImageData, setBase64ImageData] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [dataEditable, setDataEditable] = useState(true);
  const [dashboardDataCopy, setDashboardDataCopy] = useState(null);
  const appState = useRef(AppState.currentState);
  const storeLink = "https://play.google.com/store/apps/details?id=com.nuziveeduseeds.nslchannel";
  const [couponCount, setcouponCount] = useState(0)
  const types = [
    {
      title: translate('camera'),
      id: 1
    },
    {
      title: translate('gallery'),
      id: 2
    },
  ]

  //   useEffect(() => {
  //     console.log('the user end point is',userPointsEarned)
  // }, [userPointsEarned, userPointsReedemed, totalRetailers, activeRetailers])

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
                if (Platform.OS == 'android') {
                  checkAppversionUpdate(data);
                } else {
                  checkAppversionUpdateIOS(data);
                }
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
  async function checkAppversionUpdateIOS(documentSnapshot) {

    const localVersion = DeviceInfo.getVersion(); // Need to change for Android in future

    let remoteVersion = '';

    if (APP_ENV_PROD) {
      if (Platform.OS === 'android') {
        remoteVersion = documentSnapshot.androidAppVersionPROD;
      } else {
        remoteVersion = documentSnapshot.iosAppVersionPROD;
      }
    } else {
      if (Platform.OS === 'android') {
        remoteVersion = documentSnapshot.androidAppVersionUAT;
      } else {
        remoteVersion = documentSnapshot.iosAppVersionUAT;
      }
    }
    let showForceUpdate = Platform.OS == 'ios' ? documentSnapshot?.showForceUpdateIOS : documentSnapshot?.showForceUpdate;
    let isMandatory = Platform.OS == 'ios' ? documentSnapshot.isMandatoryForIOS : documentSnapshot.isMandatoryForAndroid;

    console.log(`Local: ${localVersion} | Remote: ${remoteVersion}`);
    if (showForceUpdate) {
      if (compareVersions(localVersion, remoteVersion) < 0) {
        showAlertWithMessage(translate('alert'), true, true, documentSnapshot.message || translate('update_message'), true, !isMandatory, translate('update'), translate('cancel'));
      }
    } else {
      setShowAlert(false)
    }
  }

  async function checkAppversionUpdate(documentSnapshot) {
    try {
      if (documentSnapshot) {
        const appDetails = await getAppVersion();
        const appVersionCode = await getBuildNumber();
        const showForceUpdateOrNOT = documentSnapshot?.showForceUpdate;
        const messageToRender = documentSnapshot?.message || translate('update_message');
        const version = documentSnapshot?.androidAppVersion;
        const platformProdVersion = documentSnapshot?.androidAppVersionPROD;
        const platformUATVersion = documentSnapshot?.androidAppVersionUAT;
        const isMandatory = documentSnapshot?.isMandatoryForAndroid;
        const shouldShowUpdate = (versionToCheck) => versionToCheck && versionToCheck > appVersionCode;
        const showUpdateAlert = () => showAlertWithMessage(translate('alert'), true, true, messageToRender, true, !isMandatory, translate('update'), translate('cancel'));
        if (APP_ENV_PROD ? shouldShowUpdate(platformProdVersion) : shouldShowUpdate(platformUATVersion)) {
          showUpdateAlert()
        } else if (showForceUpdateOrNOT && version && version !== appDetails) {
          showUpdateAlert()
        } else {
          setShowAlert(false);
        }
      } else {
        setShowAlert(false);
      }
    } catch (error) {
      console.error('Error in checkAppversionUpdate:', error);
      setShowAlert(false);
    }
  }

  const handleLoading = () => {
    setLoading(false);
  }

  useEffect(() => {
    // alert(networkStatus)
    console.log('dimension window height', height)
  }, [territoryName, territoryMobileNo])

  useEffect(() => {
    const dataEditMethod = async () => {
      var dataEdit = await retrieveData(EDITDATA)
      // setNetworkStatus(await getNetworkStatus())
      console.log("SAINATH_LATEST", userDatafrom);
      setShowDetailViewModal(dataEdit)
      if (dataEdit == true && networkStatus) {
        GetMastersApiCall()
      }
    }

    dataEditMethod()
    handleLoading();
  }, [])

  useEffect(() => {
    setLoading(false)
    setLoadingMessage()
  }, [ekycSubmitted])

  useEffect(() => {
    requestNotificationPermission();
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      handleFocus();
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [networkStatus])
  );

  const handleOkAlert = () => {
    setShowAlert(false)
    if (alertMessage == translate('update_message')) {
      if (Platform.OS == 'ios') {
        Linking.openURL(IOS_STORE_LINK)
      } else {
        Linking.openURL(storeLink)
      }
    }
    if (alertMessage == translate('are_you_sure_want_to_logout') || alertMessage == translate('logged_in_other_device') || alertMessage == "New Update Is Available Please Update") {
      getUserLoggedOut()
    }
  }
  const handleFocus = async () => {
    console.log('Screen is focused!');
    const roleTypeDetails = await retrieveData(ROLENAME)
    setRoleType(roleTypeDetails)
    // roleType == 'Retailer' || roleType == 'Distributor'
    if (roleType == 'Retailer' || roleType == 'Distributor') {

    } else {
      changeLanguage('en')
    }
    console.log('845188165', await retrieveData(USERMENU))

    getUserDataDetails();
    checkDataFromRealm()
  };

  const checkDataFromRealm = async () => {
    realm = new Realm({ path: 'User.realm' });
    const scannedCoupons = realm.objects('scannedCoupons');
    const dashboardData = realm.objects('dashboardData')[0];
    setTimeout(async () => {
      if (scannedCoupons.length > 0) {
        setcouponCount(scannedCoupons.length);

        for (let i = 0; i < scannedCoupons.length; i++) {
          const coupon = scannedCoupons[i];

          try {
            const url = `${configs.BASE_URL}${configs.QRSCAN.VALIDATEQR_V9}`;
            const getHeaders = await GetApiHeaders();
            const dataList = { qrCodeScanData: [coupon] };

            console.log("SCANNEDCOUPON_REALM_OFFLINE_API", JSON.stringify(dataList));

            const APIResponse = await PostRequest(url, getHeaders, dataList);
            console.log("Response ====>", APIResponse);

            if (APIResponse && [HTTP_OK, HTTP_CREATED, HTTP_ACCEPTED].includes(APIResponse.statusCode)) {
              realm.write(() => {
                realm.delete(coupon);
              });

              const remainingCoupons = realm.objects('scannedCoupons').length;
              setcouponCount(remainingCoupons);
              GetDashboardDetailsApiCall(null);
              // getDashboardKYCData(dashboardData);
            } else {
              console.error("Failed to sync coupon:", coupon.qrCodeData);
            }
          } catch (error) {
            console.error("Error submitting QR data", error);
          }
        }
      } else {
        setcouponCount(0)
        getDashboardKYCData(dashboardData);
      }
    }, 500);

    if (!networkStatus) {
      if (dashboardData !== undefined && dashboardData !== null) {
        getDashboardKYCData(dashboardData);
        console.log("DASHBOARD_REALM_OFFLINE", JSON.stringify(dashboardData));
      }
    } else {
      console.log("DASHBOARD_REALM_ONLINE", dashboardData);
      clearDashboardRealmData();
      setTimeout(() => {
        GetDashboardDetailsApiCall(null);
      }, 500);
    }
  };

  const requestNotificationPermission = async () => {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      console.log('User has notification permissions enabled.');
    } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
      console.log('User has provisional notification permissions.');
    } else {
      console.log('User has notification permissions disabled');
    }
  }

  const requestPermissions = async () => {
    // console.log('ekycSubmitted is what',ekycSubmitted)
    // console.log('ekycStatus is what',ekycStatus)
    if (Platform.OS == 'android') {
      const androidVersion = DeviceInfo.getSystemVersion();
      if (androidVersion >= 13) {
        var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA]);
        if (result['android.permission.CAMERA'] === 'granted') {
          if (raiseRequest || ekycSubmitted) {
            if ((raiseRequest && raiseRequestStatus.toLowerCase() == translate('approve').toLowerCase()) || (ekycSubmitted && ekycStatus.toLowerCase() == translate('approve').toLowerCase())) {
              navigation.navigate('QRScanner', { userPointsEarned: userPointsEarned })
            } else if ((raiseRequest && raiseRequestStatus.toLowerCase() == translate('pending').toLowerCase()) || (ekycSubmitted && ekycStatus.toLowerCase() == translate('pending').toLowerCase())) {
              showAlertWithMessage(translate('alert'), true, true, translate('ekycSubmitted'), false, true, translate('ok'), translate('cancel'))
            }
          } else {
            setShowLinkModal(true)
          }
        } else {
          // requestPermissions()
          showPermissionAlert();
        }
      } else {
        var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA]);
        if (result['android.permission.CAMERA'] === 'granted') {
          if (raiseRequest || ekycSubmitted) {
            if ((raiseRequest && raiseRequestStatus.toLowerCase() == translate('approve').toLowerCase()) || (ekycSubmitted && ekycStatus.toLowerCase() == translate('approve').toLowerCase())) {
              navigation.navigate('QRScanner', { userPointsEarned: userPointsEarned })
            } else if ((raiseRequest && raiseRequestStatus.toLowerCase() == translate('pending').toLowerCase()) || (ekycSubmitted && ekycStatus.toLowerCase() == translate('pending').toLowerCase())) {
              showAlertWithMessage(translate('alert'), true, true, translate('ekycSubmitted'), false, true, translate('ok'), translate('cancel'))
            }
          } else {
            setShowLinkModal(true)
          }
        } else {
          // requestPermissions()
          showPermissionAlert();
        }
      }
    }
    else {
      if (Platform.OS == 'ios') {
        let status = await request(PERMISSIONS.IOS.CAMERA)
        if (status == "blocked" || status == "denied") {
          showAlertWithMessage(translate('alert'), true, true, translate('camera_permission_ios'), true, true, translate('enable'), translate('cancel'))
          return;
        }
        else {
          if (raiseRequest || ekycSubmitted) {
            if ((raiseRequest && raiseRequestStatus.toLowerCase() == translate('approve').toLowerCase()) || (ekycSubmitted && ekycStatus.toLowerCase() == translate('approve').toLowerCase())) {
              navigation.navigate('QRScanner', { userPointsEarned: userPointsEarned })
            } else if ((raiseRequest && raiseRequestStatus.toLowerCase() == translate('pending').toLowerCase()) || (ekycSubmitted && ekycStatus.toLowerCase() == translate('pending').toLowerCase())) {
              showAlertWithMessage(translate('alert'), true, true, translate('ekycSubmitted'), false, true, translate('ok'), translate('cancel'))
            }
          } else {
            setShowLinkModal(true)
          }
        }
      }
    }
  }

  const showPermissionAlert = () => {
    Alert.alert(
      translate('permission_required'),
      translate('camera_permission_message'),
      [
        { text: translate('cancel'), style: 'cancel' },
        { text: translate('open_settings'), onPress: () => Linking.openSettings() }
      ],
      { cancelable: true }
    );
  };

  const requestPermissionsRedeem = async () => {
    // console.log('ekycSubmitted is what',ekycSubmitted)
    // console.log('ekycStatus is what',ekycStatus)
    if (raiseRequest || ekycSubmitted) {
      if ((raiseRequest && raiseRequestStatus.toLowerCase() == translate('approve').toLowerCase()) || (ekycSubmitted && ekycStatus.toLowerCase() == translate('approve').toLowerCase())) {
        navigation.navigate('Redeem')
      } else if (ekycStatus.toLowerCase() != translate('pending').toLowerCase() && ekycStatus.toLowerCase() != translate('approve').toLowerCase()) {
        setShowLinkModalRedeem(true)
      }
    }
  }

  const getUserDataDetails = async () => {
    setUserName(await retrieveData(USER_NAME))
    setFirmName(userDatafrom?.firmName)
    setState(userDatafrom?.stateName)
    setStateID(userDatafrom?.stateId)
    setDistrict(userDatafrom?.districtName)
    setDistrictID(userDatafrom?.districtId)
    setProprietorName(userDatafrom?.proprietorName)
    console.log('gggggggg123', userDatafrom?.proprietorName)
  }

  // useEffect(() => {
  //   const handleAppStateChange = (nextAppState) => {
  //     console.log("nextAppState", nextAppState)
  //     if (nextAppState === 'active') {
  //       // App is coming to the foreground, check for updates again
  //       // and trigger a reload if needed
  //       console.log("BACK TO APPLICATION");
  //       // callForceUpdateApi();
  //     }
  //   };
  //   AppState.addEventListener('change', handleAppStateChange);

  //   //callForceUpdateApi();
  // }, []);


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

  const cancelBtnPress = () => {
    console.log('ddddddddkkkk')
    setShowLinkModal(false);
    setShowLinkModalRedeem(false)
  }

  const closeBtnPress = () => {
    setShowDetailViewModal(false)
    getUserLoggedOut()
  }

  const ekycButtonPress = async () => {
    setShowLinkModal(false);
    setShowLinkModalRedeem(false)
    navigation.navigate('KYC', { ekycStatus: ekycStatus })

  }
  const raiseButtonPress = async () => {
    setShowLinkModal(false);
    setShowLinkModalRedeem(false)
    // rasiseRequestAPICall();
    setShowPanEntryModal(true)
  }

  const getDashboardKYCData = async (dashboardResp) => {
    setUserPointsEarned(dashboardResp?.userPointsEarned)
    setUserPointsReedemed(dashboardResp?.userPointsReedemed)
    setTotalRetailers(dashboardResp?.totalRetailers)
    setActiveRetailers(dashboardResp?.activeRetailers)
    setUserImage(dashboardResp?.userList[0].profilePic != undefined ? dashboardResp?.userList[0].profilePic : dashboardResp?.userList[0].profileImage)
    setEkycStatus(dashboardResp?.userList[0].ekycStatus)
    setEkycSubmitted(dashboardResp?.userList[0].ekycSubmitted)
    setTerritoryName(dashboardResp?.userList[0].territoryManagerName)
    setTerritoryMobileNo(dashboardResp?.userList[0].territoryManagerMobileNumber)
    setDashboardDetails(dashboardResp)
    //storeData(USER_NAME, (roleType == 'Retailer' || roleType == 'Distributor') ? dashboardResp?.userList[0].proprietorName : dashboardResp?.userList[0].name);
    storeData(USER_NAME, (roleType == 'Retailer' || roleType == 'Distributor') ? dashboardResp?.userList[0].proprietorName : dashboardResp?.userList[0].name);
    storeData(MOBILE_NUMBER, dashboardResp?.userList[0].mobileNumber);
    storeData(PROFILEIMAGE, dashboardResp?.userList[0].profilePic != undefined ? dashboardResp?.userList[0].profilePic : dashboardResp?.userList[0].profileImage)  //profileImage  kiran
    setNotificationCount(dashboardResp?.userList[0].notificationCount)
    setRaiseRequestStatus(dashboardResp?.userList[0].ekycRaiseRequestStatus)
    setRaiseRequest(dashboardResp?.userList[0].raiseRequest)
    // setFaqSectionData(await retrieveData(USERMENU))
  }
  const requestPhotoPermission = async () => {
    await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
    let status1 = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
    if (status1 == "blocked" || status1 == "denied") {

    }
  }

  const showLinkALert = () => {
    console.log('what is coming in selecte item')
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>

          <View style={[styles['bg_white'], styles['width_90%'], styles['border_radius_5'], { padding: 10 }]}>
            <View style={[styles['flex_direction_row'], styles['margin_top_10'], styles['space_between']]}>
              <Text allowFontScaling={false} style={[styles['margin_left_20'], styles['font_size_16_semibold'], styles['text_color_black'], styles['text_align_left']]} numberOfLines={2}>
                {translate('alert')}
              </Text>
              <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'],]} onPress={() => { cancelBtnPress() }}>
                <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
              </TouchableOpacity>
            </View>

            <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems'], styles['margin_top_10']]} ></View>

            {/* <View style={[styles['centerItems'], styles['margin_top_2'], styles['width_90%'], styles['height_250'], styles['cellBgColor']]}>
              <Image source={{ uri: item.productImage }} style={[styles['width_height_200'], styles['centerItems']]} resizeMode="contain" />
            </View> */}

            {/* {isNullOrEmpty(item.name) &&
              <Text allowFontScaling={false} style={[styles['top_5'], styles['margin_left_20'], styles['font_size_16_semibold'], styles['text_color_black'], styles['text_align_left']]} numberOfLines={2}>
                {item.name}
              </Text>
            } */}

            <View style={[{ marginLeft: 12 }, styles['top_5'], { marginBottom: 15 }]}>
              <Text style={[styles['text_color_black'], styles['centerItems']]}>
                Please complete{' '}
                <TouchableOpacity style={[]} onPress={ekycButtonPress}>
                  <Text style={[styles['text_color_blue'], styles['top_3'], { textDecorationLine: 'underline' }]}>{translate("kyc")}</Text>
                </TouchableOpacity>{' '}
              </Text>
              <Text style={[styles['text_color_black'], styles['centerItems'], styles['top_10']]}> (or) {' '}</Text>
              <Text style={[styles['text_color_black'], styles['centerItems'], styles['top_10']]}> {translate('send_approval')}{' '}
                <TouchableOpacity style={[styles['']]} onPress={raiseButtonPress}>
                  <Text style={[styles['text_color_blue'], styles['top_3'], { textDecorationLine: 'underline' }]}>{translate('request')}</Text>
                </TouchableOpacity>
                <Text style={[styles['text_color_black'], styles['top_10'], styles['']]}> {translate('to_territory_manager')} {' '} </Text>
              </Text>
            </View>

          </View>
        </View>
      </Modal>
    )
  }
  const showLinkALertRedeem = () => {
    console.log('what is coming in selecte item')
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>

          <View style={[styles['bg_white'], styles['width_90%'], styles['border_radius_5'], { padding: 10 }]}>
            <View style={[styles['flex_direction_row'], styles['margin_top_10'], styles['space_between']]}>
              <Text allowFontScaling={false} style={[styles['margin_left_20'], styles['font_size_16_semibold'], styles['text_color_black'], styles['text_align_left']]} numberOfLines={2}>
                {translate('alert')}
              </Text>
              <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'],]} onPress={() => { cancelBtnPress() }}>
                <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
              </TouchableOpacity>
            </View>

            <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems'], styles['margin_top_10']]} ></View>

            {/* <View style={[styles['centerItems'], styles['margin_top_2'], styles['width_90%'], styles['height_250'], styles['cellBgColor']]}>
              <Image source={{ uri: item.productImage }} style={[styles['width_height_200'], styles['centerItems']]} resizeMode="contain" />
            </View> */}

            {/* {isNullOrEmpty(item.name) &&
              <Text allowFontScaling={false} style={[styles['top_5'], styles['margin_left_20'], styles['font_size_16_semibold'], styles['text_color_black'], styles['text_align_left']]} numberOfLines={2}>
                {item.name}
              </Text>
            } */}

            <View style={[{ marginLeft: 12 }, styles['top_5'], { marginBottom: 15 }]}>
              <Text style={[styles['text_color_black'], styles['centerItems']]}>
                Please complete{' '}
                <TouchableOpacity style={[]} onPress={ekycButtonPress}>
                  <Text style={[styles['text_color_blue'], styles['top_3'], { textDecorationLine: 'underline' }]}>{translate('kyc')}</Text>
                </TouchableOpacity>{' '}
              </Text>
              {/* <Text style={[styles['text_color_black'], styles['centerItems'], styles['top_10']]}> (or) {' '}</Text>
              <Text style={[styles['text_color_black'], styles['centerItems'], styles['top_10']]}> Send approval{' '}
                <TouchableOpacity style={[styles['']]} onPress={raiseButtonPress}>
                  <Text style={[styles['text_color_blue'], styles['top_3'], { textDecorationLine: 'underline' }]}>Request</Text>
                </TouchableOpacity>
                <Text style={[styles['text_color_black'], styles['top_10'], styles['']]}> to Territory manager {' '} </Text>
              </Text> */}
            </View>

          </View>
        </View>
      </Modal>
    )
  }

  const handleCancelAlert = () => {
    setShowAlert(false)
  }

  const profileButtonPress = async () => {
    if (networkStatus) {
      navigation.navigate('Profile', { ekycStatus: ekycStatus })
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const notificationBtnClicked = async () => {
    if (networkStatus) {
      navigation.navigate('Notifications')
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const onPressDashboardItem = async (item, index) => {
    if (networkStatus) {
      if (item.title == translate('faq')) {
        navigation.navigate('FAQ')
      }
      else if (item.title == translate('helpCenter')) {
        navigation.navigate('HelpDesk')
      }
      else if (item.title == translate('promotions')) {
        navigation.navigate('Promotions')
      }
      else if (item.title == translate('kycApprovalCap')) {
        navigation.navigate('KYCApproval')
        // navigation.navigate('SalesTeam')
      }
      else if (item.title == translate('salesTeam')) {
        navigation.navigate('SalesTeam')
      }
      else if (item.title == translate('products')) {
        navigation.navigate('Products')
      }
      else if (item.title == translate('scan')) {
        requestPermissions()
      }
      else if (item.title == translate('scan_history')) {
        console.log('the role type is', roleType)
        // if (roleType == 'Retailer' || roleType == 'Distributor') {
        if (roleType == 'Retailer' || roleType == 'Distributor') {
          navigation.navigate('ScanHistory', { userPointsEarned: userPointsEarned })
          // navigation.navigate('EmployeeScanHistory', { userPointsEarned: userPointsEarned, roleid: (await retrieveData(ROLEID)) })
        }
        else {
          navigation.navigate('EmployeeScanHistory', { roleid: (await retrieveData(ROLEID)) })
        }

      }
      else if (item.title == translate('redeem')) {
        // navigation.navigate('Redeem')
        // requestPermissionsRedeem()
        showAlertWithMessage(translate('alert'), true, true, translate('redemportalnotopen'), false, true, translate('ok'), translate('cancel'))
      }
      else if (item.title == translate('redemHistory')) {
        // if (roleType == 'Retailer' || roleType == 'Distributor') {
        //   navigation.navigate('RedemptionsHistory')
        // }
        // else {
        //   showAlertWithMessage(translate('alert'), true, true, translate('redemportalnotopen'), false, true, translate('ok'), translate('cancel'))
        // }
        // navigation.navigate('EmployeeRedemptionsHistory', { roleid: (await retrieveData(ROLEID)) })
        showAlertWithMessage(translate('alert'), true, true, translate('redemportalnotopen'), false, true, translate('ok'), translate('cancel'))
      }
    } else {
      if (item.title == translate('scan')) {
        requestPermissions()
      } else {
        SimpleToast.show(translate('no_internet_conneccted'))
      }
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

  const ListItem = (item, index) => {
    return (
      <View style={[styles['centerItems'], { height: Dimensions.get('window').width / 3, width: Dimensions.get('window').width / 2.5, backgroundColor: item.backGroundColour, opacity: 1.0, borderRadius: 10, margin: 8, elevation: 1.5 }]}>
        <TouchableOpacity style={[styles['centerItems'], styles['width_100%'], styles['height_100%'], { elevation: 5 }]} onPress={() => { onPressDashboardItem(item, index) }}>
          <Image source={{ uri: item.icon }} style={[styles['width_height_50'], styles['alignItems_center'], { tintColor: item.tint_color != undefined ? item.tint_color : Colors.white_color }]} resizeMode="contain" />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={[styles['bottom_20'], styles['font_size_14_semibold'], styles['text_color_white'], { color: item.fontColour != undefined ? item.fontColour : Colors.white_color, textAlign: 'center' }]} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    );
  }

  const GetMastersApiCall = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getloginURL = configs.BASE_URL + configs.MASTERS.USER_MASTERS;
        var getHeaders = await GetApiHeaders();
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)

        var APIResponse = await GetRequest(getloginURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            // setLoadingMessage()
            // setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse.response
            console.log('the master resp is', masterResp)
            setStateList(sortObjectsAlphabetically(masterResp?.statesList, 'name'))
            setDistrictListOriginal(masterResp?.districtsList)
            console.log('the 002 is', masterResp.statesList)
          }
          else {
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
          }

        } else {
          setTimeout(() => {
            // setLoading(false)
            // setLoadingMessage()
          }, 500);
        }
      }
      catch (error) {
        setTimeout(() => {
          // setLoading(false)
          // setSuccessLoadingMessage(error.message)
        }, 1000);
        SimpleToast.show(error.message)
      }
    } else {
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const submitApiCall = async (userDataForm) => {
    var networkStatus = await getNetworkStatus()
    console.log("SAINATH_1");
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('submitting_data'))

        var getloginURL = configs.BASE_URL + configs.PROFILE.UPDATE_PROFILE;
        var getHeaders = await GetApiHeaders();
        console.log("SAINATH_2", userDataForm);
        var jsonData = {
          "id": userDataForm?.id != undefined ? userDataForm?.id : "",
          "profilePic": userDataForm?.profilePic != undefined ? userDataForm?.profilePic : "",
          // "profileImage": userDataForm?.profileImage != undefined ? userDataForm?.profileImage : "",
          "roleId": userDataForm?.roleId != undefined ? userDataForm?.roleId : "",
          "roleName": userDataForm?.roleName != undefined ? userDataForm?.roleName : "",
          "firmName": firmName,
          "proprietorName": proprietorName,
          "mobileNumber": userDataForm?.mobileNumber != undefined ? userDataForm?.mobileNumber : "",
          "dateofBirth": userDataForm?.dateofBirth != undefined ? userDataForm?.dateofBirth : "",
          "storeName": userDataForm?.storeName != undefined ? userDataForm?.storeName : "",
          "email": userDataForm?.email != undefined ? userDataForm?.email : "",

          "address": userDataForm?.address != undefined ? userDataForm?.address : "",
          "landMark": userDataForm?.landMark != undefined ? userDataForm?.landMark : "",
          "block": userDataForm?.taluk != undefined ? userDataForm?.taluk : "",
          "stateId": stateID != undefined ? stateID : "",
          "stateName": state != undefined ? state : "",
          "districtId": districtID != undefined ? districtID : "",
          "districtName": district != undefined ? district : "",
          "village": userDataForm?.village != undefined ? userDataForm?.village : "",
          "pincode": userDataForm?.pincode != undefined ? userDataForm?.pincode : "",
          "loggedInFirstTime": false,
          "status": true
        }
        console.log("SAINATH_3", jsonData);
        const formData = new FormData();

        // Append JSON data
        formData.append('jsonData', JSON.stringify(jsonData));
        formData.append('profileImage', "");

        console.log("SAINATH_4", formData);
        var APIResponse = await uploadFormData(formData, getloginURL, getHeaders);

        console.log('complent response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('retailerInfo_updated_successfully'))
              storeData(EDITDATA, false)
              setShowDetailViewModal(false)
              storeData(USER_NAME, proprietorName)
            }, 1000);

            setTimeout(() => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
              getUserDataDetails()
              // navigation.navigate('Profile')
            }, 3000);
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

  const rasiseRequestAPICall = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_mpin_verifing'))

        var getloginURL = configs.BASE_URL + configs.MASTERS.KYCBYPASS;
        var getHeaders = await GetApiHeaders();

        var dataList = {
          "retailerId": getHeaders.userId,
          "panNumber": panNumber,
          'retailerMobileNumber': getHeaders.mobileNumber
        }

        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(dataList));

        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)
        console.log('what is here body', formData)


        if (panImageData != undefined && panImageData != null && panImageData != "") {
          formData.append('panImage', {
            uri: panImageData.uri,
            type: 'image/jpeg',
            name: panImageData.name
          });
        }
        else {
          formData.append('panImage', "");
        }

        console.log("FormData:", JSON.stringify(formData));

        const APIResponse = await uploadFormData(formData, getloginURL, getHeaders);
        console.log('APIResponse APIResponseis:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
            }, 1000);

            var dashboardRespBYPASS = APIResponse.response
            console.log('the dash board Resp is BYPASS', dashboardRespBYPASS)
            // setTimeout(() => {
            GetDashboardDetailsApiCall(true);
            setPanImageData("")
            setPanNumber("")
            // navigation.navigate('LoginOTP', { otp: APIResponse, getuserAcceptanceKey: userAcceptanceKey, loginMobileNumber: mobileNumber })
            // }, 1500);
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

  const GetDashboardDetailsApiCall = async (alertSync) => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setTimeout(() => {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))
        }, 50);
        var getloginURL = configs.BASE_URL + configs.MASTERS.DASHBOARD_MASTER;
        var getHeaders = await GetApiHeaders();
        // console.log('getloginURL is', getloginURL)
        // console.log('getHeaders is', getHeaders)

        var dataList = {
          "userId": getHeaders.userId,
          'mobileNumber': getHeaders.mobileNumber
        }
        // console.log('dataList is', dataList)
        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        console.log("SAINATH", JSON.stringify(APIResponse));
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              var dashboardResp = APIResponse.response
              setLoadingMessage()
              setLoading(false)
              getDashboardKYCData(dashboardResp);
              storeData(USERMENU, APIResponse?.response?.userMenuControl);
              setFaqSectionData(APIResponse?.response?.userMenuControl)
              insertDataToRealm(dashboardResp);
              setDashboardDataCopy(APIResponse?.response);
              // setNotificationCount(99)

              setUserPointsEarned(APIResponse?.response?.userPointsEarned)
              setUserPointsReedemed(APIResponse?.response?.userPointsReedemed)
              setTotalRetailers(APIResponse?.response?.totalRetailers)
              setActiveRetailers(APIResponse?.response?.activeRetailers)

              console.log('89186', dashboardResp.userList[0].territoryManagerName)
              console.log('what is coming in ekyc statuss after adding001', dashboardResp?.userList[0].ekycSubmitted)
            }, 100);
            if (alertSync) { showAlertWithMessage(translate('alert'), true, true, translate('RequesthasBeenSubmit').replace('Name', APIResponse.response.userList[0].territoryManagerName).replace('mobileNumber', APIResponse.response.userList[0].territoryManagerMobileNumber), false, true, translate('ok'), translate('cancel')) }

            setTimeout(() => {
              console.log('what is coming in ekyc statuss after adding', ekycSubmitted)
              setLoadingMessage()
              setLoading(false)
            }, 1200);
          }
          else if (APIResponse.statusCode == 601) {
            SimpleToast.show(APIResponse?.message)
            // setLoadingMessage()
            // setLoading(false)
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, true, false, translate('ok'), translate('cancel'))
          }
          else {
            setLoadingMessage()
            setLoading(false)
            showAlertWithMessage(translate('alert'), true, true, APIResponse?.message, false, true, translate('ok'), translate('cancel'))
          }

        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 500);
        }
        getDashboardKYCData(dashboardData);
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

  const clearDashboardRealmData = () => {
    try {
      realm.write(() => {
        realm.delete(realm.objects('dashboardData'));

        realm.delete(realm.objects('kycData'));
      });

      console.log('All data cleared from Realm');
    } catch (error) {
      console.error('Error clearing data from Realm:', error);
    }
  };


  const insertDataToRealm = (response) => {
    if (!response) {
      console.log("Invalid response");
      return;
    }
    console.log("SAINATH_ONLINE", response);
    try {
      realm.write(() => {
        const userList = response.userList[0];

        const ekycDoneDate = new Date(userList.ekycDoneDate);

        const kycData = {
          ekycSubmitted: userList.ekycSubmitted != undefined ? userList.ekycSubmitted : false,
          ekycDoneDate: ekycDoneDate.toString(),
          notificationCount: userList.notificationCount != undefined ? userList.notificationCount : 0,
          mobileNumber: userList.mobileNumber != undefined ? userList.mobileNumber : "",
          profilePic: userList.profileImage != undefined ? userList.profileImage : userList.profilePic != undefined ? userList.profilePic : "",
          ekycRaiseRequestStatus: userList.ekycRaiseRequestStatus != undefined ? userList.ekycRaiseRequestStatus : "",
          proprietorName: userList.proprietorName != undefined ? userList.proprietorName : "",
          territoryManagerMobileNumber: userList.territoryManagerMobileNumber != undefined ? userList.territoryManagerMobileNumber : "",
          raiseRequest: userList.raiseRequest != undefined ? userList.raiseRequest : false,
          ekycStatus: userList.ekycStatus != undefined ? userList.ekycStatus : "",
          territoryManagerName: userList.territoryManagerName != undefined ? userList.territoryManagerName : "",
        };

        const dashboardData = {
          userList: [kycData],
          userPointsReedemed: response.userPointsReedemed != undefined ? response.userPointsReedemed : 0,
          userPointsEarned: response.userPointsEarned != undefined ? response.userPointsEarned : 0,
        };

        realm.create('kycData', kycData, Realm.UpdateMode.Modified);

        realm.create('dashboardData', dashboardData, Realm.UpdateMode.Modified);
      });
      console.log("Data inserted successfully into Realm");
    } catch (error) {
      console.error("Error inserting data into Realm:", error);
    }
  };



  const getUserLoggedOut = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
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
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('logout_successfully'))
            }, 1000);

            setTimeout(() => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
              storeData(MOBILE_NUMBER, '');
              storeData(USER_ID, '');
              storeData(USER_NAME, '');
              storeData(DEVICE_TOKEN, '');
              storeData(USERMENU, '');
              storeData(PROFILEIMAGE, '')
              storeData(EDITDATA, false)
              storeData(TERMS_CONDITIONS, false)
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginNew' }],
              });
            }, 3000);
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
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }


  const showDetailViewSection = () => {
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
        <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], styles['padding_10'], { borderRadius: 8 }]}>

          <View style={[styles['flex_direction_row'], styles['space_between']]}>

            <Text allowFontScaling={false} style={[styles['top_10'], styles['alignItems_center'], styles['font_size_18_bold'], styles['text_color_black'], styles['text_align_center'], { marginLeft: 25 }]} numberOfLines={2}>
              {translate('retailerInfo')}
            </Text>

            <TouchableOpacity style={[styles['flex_direction_row'], styles['width_height_30'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]} onPress={() => { closeBtnPress() }}>
              <Image style={[styles['width_height_30']]} source={require('../assets/images/closeWindow.png')}></Image>
            </TouchableOpacity>
          </View>

          <View style={[styles['bg_lightish_grey'], styles['top_10'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>

          {/* firmName */}
          <View style={[styles['margin_top_10']]}>
            <CustomTextInput
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('firmName')}
              IsRequired={false}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('firmName')}
              value={firmName}
              maxLength={30}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                var enteredText = text.replace(/[`1234567890!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '')
                setFirmName(enteredText)
              }}
              onEndEditing={event => {

              }}
            />
          </View>

          {/* proprietorName */}
          <View style={[styles['margin_top_10']]}>
            <CustomTextInput
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('proprietorName')}
              IsRequired={false}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('proprietorName')}
              value={proprietorName}
              maxLength={30}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                var enteredText = text.replace(/[`1234567890!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '')
                setProprietorName(enteredText)
              }}
              onEndEditing={event => {

              }}
            />
          </View>

          {/* state*/}
          <View style={[styles['margin_top_5'], styles['centerItems'], { width: '90%', marginLeft: 10 }]}>
            <CustomInputDropDown
              width={[styles['width_100%']]}
              defaultValue={state != undefined && state != translate('select') ? state : translate('select')}
              labelName={translate('state')}
              IsRequired={false}
              placeholder={translate('state')}
              onEndEditing={async event => {
                // calculateTotalOrderValue()
              }}
              onFocus={() => {
                changeDropDownData(stateList, strings.state, state)
              }}
            />
          </View>

          <View style={[styles['margin_top_5'], styles['centerItems'], { width: '90%', marginLeft: 10 }]}>
            <CustomInputDropDown
              width={[styles['width_100%']]}
              defaultValue={district != undefined && district != translate('select') ? district : translate('select')}
              labelName={translate('district')}
              IsRequired={false}
              placeholder={translate('district')}
              onEndEditing={async event => {
                // calculateTotalOrderValue()
              }}
              onFocus={() => {
                changeDropDownData(districtList, strings.district, district)
              }}
            />
          </View>

          <View style={[styles['margin_top_20'], styles['align_self_center'], styles['width_100%'], styles['bottom_10']]}>
            <CustomButton title={translate('update')} onPress={submitButtonPress} buttonBg={Colors.themeRed} btnWidth={"90%"} titleTextColor={Colors.white} />
          </View>

        </View>
      </View>
    )
  }

  const changeDropDownData = (dropDownData, type, selectedItem) => {
    setShowDropDowns(true);
    setdropDownData(dropDownData);
    setDropDownType(type);
    setSelectedDropDownItem(selectedItem);
  }

  const onSelectedState = async (item) => {
    setShowDropDowns(false);
    setState(item.name)
    setStateID(item.id);
    setDistrict('')
    setDistrictID('');

    if (item?.code.toLowerCase() == translate('all').toLowerCase()) {
      setDistrictList(sortObjectsAlphabetically(districtListOriginal, 'name'))
    } else {
      var filterDistList = await filterObjects(districtListOriginal, "stateId", item.id)
      setDistrictList(sortObjectsAlphabetically(filterDistList, 'name'))
    }
  }

  const onSelectedDistrict = (item) => {
    setShowDropDowns(false);
    setDistrict(item.name)
    setDistrictID(item.id);
  }

  const submitButtonPress = async () => {

    if (firmName == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('firmName'), false, true, translate('ok'), translate('cancel'))
    }
    else if (proprietorName == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('proprietorName'), false, true, translate('ok'), translate('cancel'))
    }
    else if (state == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('state'), false, true, translate('ok'), translate('cancel'))
    }
    else {
      submitApiCall(userDatafrom)
    }
  }
  const handlePancard = (input) => {
    const filteredText = input.replace(/[^\w\s]/gi, '').toUpperCase();
    if (filteredText.length <= 4) {
      setPanKeyboardType('default')
    } else if (filteredText.length >= 5 && filteredText.length < 9) {
      setPanKeyboardType('numeric')
    } else {
      setPanKeyboardType('default')
    }

    if (filteredText.length <= 5) {
      const regex = /^[a-zA-Z]{0,5}$/;
      if (regex.test(filteredText))
        setPanNumber(filteredText);
    } else if (filteredText.length > 5 && filteredText.length <= 9) {
      const regexNum = /^[a-zA-Z]{5}\d{0,4}$/;
      if (regexNum.test(filteredText))
        setPanNumber(filteredText);
    }
    else {
      const regexEnd = /^[a-zA-Z]{5}\d{4}[a-zA-Z]{0,1}$/;
      if (regexEnd.test(filteredText))
        setPanNumber(filteredText);
    }
  }

  const handleViewClicked = (docType) => {
    if (docType == translate('upload_pan_doc')) {
      setSelectedPan(true)
    }
    setIsModalVisible(true)
  }
  const gstDocumentPress = (docType) => {
    if (docType == translate('upload_pan_doc')) {
      setSelectedPan(true)
    }
    setShowSelectionModal(true)
  }

  onPressCancelBtn = () => {
    setShowSelectionModal(false)
  }

  let openCameraProfilePic = async () => {
    setShowSelectionModal(false)
    try {
      var image = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo'
      })
      var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
      console.log(response)
      // setImageData(response)
      var base64Img = await readFileToBase64(response.uri)
      setBase64ImageData(base64Img)
      setSelectedPanImage(true)
      setPanImageData(response)
    }
    catch (err) {
      console.error(err)
    }
  }


  let openImagePickerProfilePic = async () => {
    setShowSelectionModal(false)
    try {
      var image = await ImagePicker.openPicker({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo'
      })
      var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
      // setImageData(response)
      var data = await readFileToBase64(response.uri)
      setBase64ImageData(data)
      setSelectedPanImage(true)
      setPanImageData(response)
    } catch (err) {
      console.error(err)
    }
  }
  const requestGalleryPermission = async () => {
    try {
      if (Platform.OS == 'ios') {
        let status = await check(PERMISSIONS.IOS.CAMERA)
        if (status == "blocked" || status == "denied") {
          showAlertWithMessage(translate('alert'), true, true, translate('camera_permission_ios'), true, true, translate('enable'), translate('cancel'))
          return;
        }
        openImagePickerProfilePic();
      } else {
        const androidVersion = DeviceInfo.getSystemVersion();

        if (androidVersion >= 13) {

          const permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          ];

          let grantedPermissions = await requestMultiplePermissions(permissionsToRequest)

          if (grantedPermissions[permissionsToRequest[0]] != "granted") {
            return
          }
        } else {

          const permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ];
          let grantedPermissions = await requestMultiplePermissions(permissionsToRequest)
          if (grantedPermissions[permissionsToRequest[0]] != "granted" || grantedPermissions[permissionsToRequest[1]] != "granted") {
            return
          }
        }
        openImagePickerProfilePic();
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  }

  const showUploadedImage = () => {
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>
          <View style={[styles['bg_white'], styles['width_90%'], styles['align_self_center'], styles['border_radius_6']]}>
            <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]} onPress={() => { setIsModalVisible(false) }} >
              <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
            </TouchableOpacity>

            <TouchableOpacity style={[styles['centerItems'], styles['margin_top_2'], styles['cellBgColor'], { padding: 15, margin: 10, elevation: 5, height: Dimensions.get('screen').height / 3.25, width: Dimensions.get('screen').width / 1.5 }]} onLongPress={() => { setShowDeleteButton(true) }}>
              <Image source={{ uri: panImageData?.uri }} style={[styles['centerItems'], { height: '90%', width: '90%' }]} resizeMode="contain" />
            </TouchableOpacity>

            {(dataEditable && showDeleteButton) &&
              <View style={[styles['margin_10']]}>
                {/* <TouchableOpacity style={[{ position: 'absolute', end: 20, top: 30 }]} onPress={() => { }}>
                  <Image source={require('../assets/images/deleteCircle.png')} />
                </TouchableOpacity> */}
                <CustomButton title={translate('delete')} onPress={handleDeleteButtonPress} buttonBg={Colors.themeRed} btnWidth={"90%"} titleTextColor={Colors.white} />
              </View>}
          </View>
        </View>
      </Modal>
    )
  }
  const handleDeleteButtonPress = () => {
    setPanImageData(null)
    setIsModalVisible(false)
  }

  const handleRasiseRequest = () => {

    if (panNumber == undefined || panNumber == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('panNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if (panNumber != "" && panNumber.length < 10) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('panNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if (panImageData == null) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('upload_pan_doc'), false, true, translate('ok'), translate('cancel'))
    }
    else {
      setShowPanEntryModal(false);
      rasiseRequestAPICall()
    }
  }


  return (
    <View style={[styles['full_screen'], styles['bg_light_grey_color']]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={Colors.themeRed} barStyle='dark-content' />}
      <View style={[{ borderBottomEndRadius: 25, borderBottomStartRadius: 25, overflow: 'hidden', width: '100%', height: Dimensions.get('window').height / 2.7, position: 'absolute', top: 0 }]}>
        <ImageBackground style={[{ height: '100%', width: Dimensions.get('window').width, backgroundColor: Colors.themeRed }]}>
          <View style={[styles['flex_direction_row'], (Platform.OS == 'ios' ? styles['padding_top_60'] : styles['padding_top_10']), styles['width_90%'], styles['align_self_center'], styles['border_radius_6']]}>
            <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { profileButtonPress() }}>
              <CustomCircularImageView
                onPressImageClick={() => { profileButtonPress() }}
                style={[{ height: 40, width: 40 }]}
                source={(userImage != undefined && userImage != null) ? (userImage.toString().includes("https:") || userImage.toString().includes("http:")) ? { uri: userImage } : require('../assets/images/profileIcon.png') : require('../assets/images/profileIcon.png')}
                size={40}
                height={45} />
            </TouchableOpacity>

            <View style={[styles['flex_direction_column'], styles['centerItems'], styles['margin_left_10']]}>
              <TouchableOpacity onPress={() => { profileButtonPress() }}>
                <Text style={[styles['font_size_10_regular'], styles['text_color_white'], styles['text_align_left'], styles['left_5']]}>{translate('profile')}</Text>
                <Text style={[styles['font_size_16_semibold'], styles['text_color_white'], styles['text_align_left'], styles['left_5'], { width: 250 }]}>{userName}</Text>
                {/*  {(roleType != 'Retailer' && roleType != 'Distributor') &&  */}
                {(roleType != 'Retailer' && roleType != 'Distributor') &&
                  <View style={[styles['flex_direction_row']]}>
                    <Text style={[styles['font_size_10_regular'], styles['text_color_white'], styles['text_align_left'], styles['left_5']]}>
                      {dashboardDataCopy?.userList?.[0]?.roleBased != undefined && dashboardDataCopy?.userList?.[0]?.roleBased != null ? dashboardDataCopy?.userList?.[0]?.roleBased : ""}
                      {/* {dashboardDataCopy?.userList?.[0]?.roleName == "MDO" ? dashboardDataCopy?.userList?.[0]?.headquarter : dashboardDataCopy?.userList?.[0]?.roleName == "Territory Manager" ? dashboardDataCopy?.userList?.[0]?.territory : dashboardDataCopy?.userList?.[0]?.roleName == "Regional Manager" ? dashboardDataCopy?.userList?.[0]?.region : dashboardDataCopy?.userList?.[0]?.roleName == "Zonal Manager" ? dashboardDataCopy?.userList?.[0]?.zone : ""} */}
                    </Text>
                    {/* {dashboardDataCopy?.userList?.[0]?.roleName == "MDO" || dashboardDataCopy?.userList?.[0]?.roleName == "Admin" ?
                      <Text style={[styles['font_size_10_regular'], styles['text_color_white'], styles['text_align_left']]}>
                        {dashboardDataCopy?.userList?.[0]?.roleName}</Text>
                      :
                      <Text style={[styles['font_size_10_regular'], styles['text_color_white'], styles['text_align_left']]}>
                        -{dashboardDataCopy?.userList?.[0]?.roleName}</Text>
                    } */}
                  </View>
                }
                {/* <Text style={[styles['font_size_14_regular'], styles['text_color_white'], styles['text_align_left'], styles['left_5'], styles['width_100%']]}>{userName}</Text> */}
              </TouchableOpacity>
            </View>
            {
              (notificationCount != undefined && notificationCount != null && notificationCount != "") &&
              <View style={[{ backgroundColor: Colors.white, borderRadius: notificationCount != undefined && notificationCount != null && notificationCount.toString().length > 2 ? 15 : 10, position: 'absolute', top: notificationCount != undefined && notificationCount != null && notificationCount.toString().length > 2 ? 10 : 20, end: 0, width: notificationCount != undefined && notificationCount != null && notificationCount.toString().length > 2 ? 30 : 20, height: notificationCount != undefined && notificationCount != null && notificationCount.toString().length > 2 ? 30 : 20, alignContent: 'center', justifyContent: 'center', marginTop: Platform.OS == 'ios' ? 30 : 0 }]}>
                <Text
                  style={[{ color: Colors.themeRed }, styles['font_size_11_semibold'], styles['text_align_center'],]}>
                  {notificationCount != undefined ? notificationCount : ""}
                </Text>
              </View>
            }

            {
              (couponCount != undefined && couponCount != null && couponCount != "") &&
              <View style={[{ backgroundColor: Colors.white, borderRadius: couponCount != undefined && couponCount != null && couponCount.toString().length > 2 ? 15 : 10, position: 'absolute', top: couponCount != undefined && couponCount != null && couponCount.toString().length > 2 ? 10 : 20, end: 0, width: couponCount != undefined && couponCount != null && couponCount.toString().length > 2 ? 30 : 20, height: couponCount != undefined && couponCount != null && couponCount.toString().length > 2 ? 30 : 20, alignContent: 'center', justifyContent: 'center', marginTop: Platform.OS == 'ios' ? 30 : 0, marginRight: 40 }]}>
                <Text
                  style={[{ color: Colors.themeRed }, styles['font_size_11_semibold'], styles['text_align_center'],]}>
                  {couponCount != undefined ? couponCount : ""}
                </Text>
              </View>
            }

            <View style={[styles['align_self_center'], styles['right_10'], styles['absolute_position'], styles['flex_direction_row'], { top: Platform.OS == 'android' ? -20 : 10 }]}>
              {(roleType == 'Retailer' || roleType == 'Distributor') && (couponCount != undefined && couponCount != null && couponCount != "" && couponCount != 0) && <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_top_50']]} onPress={() => { notificationBtnClicked() }}>
                {/* {(roleType == 'Retailer' || roleType == 'Distributor') && (couponCount != undefined && couponCount != null && couponCount != "" && couponCount != 0) && <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_top_50']]} onPress={() => { notificationBtnClicked() }}> */}
                <Image style={[styles['margin_left_10'], styles['width_height_25']]} source={require('../assets/images/upload.png')} resizeMode='contain'></Image>
              </TouchableOpacity>
              }
              <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_top_50']]} onPress={() => { notificationBtnClicked() }}>
                <Image style={[styles['margin_left_10'], styles['width_height_25']]} source={require('../assets/images/notification.png')} resizeMode='contain'></Image>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles['flex_direction_row'], styles['width_90%'], styles['margin_top_20'], styles['border_radius_6'], styles['centerItems'], styles['space_between'], styles['left_5']]}>

            <View style={[styles['flex_direction_row'], styles['width_48%'], styles['height_80'], styles['bg_white'], styles['border_radius_6'], styles['centerItems']]}>
              {/* 
    let navigateTo = (roleType === 'Retailer' || roleType === 'Distributor') ? 'RetailerDashboard': 'Dashboard'
              
              */}
              <Image style={[styles['width_height_40']]} source={roleType == 'Retailer' || roleType == 'Distributor' ? require('../assets/images/rupeeIcon.png') : require('../assets/images/ic_retailer.png')}></Image>
              <View style={[styles['flex_direction_column'], { width: '65%' }]}>
                <Text style={[styles['font_size_17_semibold'], styles['text_color_black'], styles['text_align_left'], styles['left_7'], styles['width_100%'], styles['top_5']]}>{roleType == 'Retailer' || roleType == 'Distributor' ? userPointsEarned : totalRetailers}</Text>
                <Text style={[styles['font_size_10_regular'], styles['text_color_black'], styles['text_align_left'], styles['left_7'], styles['top_5']]}>{roleType == 'Retailer' || roleType == 'Distributor' ? translate('total_reward_points') : translate('registeredRetailer')}</Text>
              </View>
            </View>

            <View style={[styles['flex_direction_row'], styles['width_48%'], styles['height_80'], styles['bg_white'], styles['border_radius_6'], styles['centerItems']]}>
              <Image style={[styles['width_height_40']]} source={roleType == 'Retailer' || roleType == 'Distributor' ? require('../assets/images/rupeeIcon.png') : require('../assets/images/ic_activeRetailer.png')}></Image>
              <View style={[styles['flex_direction_column'], { width: '65%' }]}>
                <Text style={[styles['font_size_17_semibold'], styles['text_color_black'], styles['text_align_left'], styles['left_7'], styles['width_100%'], styles['top_5']]}>{roleType == 'Retailer' || roleType == 'Distributor' ? userPointsReedemed : activeRetailers}</Text>
                <Text style={[styles['font_size_10_regular'], styles['text_color_black'], styles['text_align_left'], styles['left_7'], { width: roleType == 'Retailer' || roleType == 'Distributor' ? '75%' : '100%' }, styles['top_5']]}>{roleType == 'Retailer' || roleType == 'Distributor' ? translate('redeemed_points') : translate('activeRetailers').replace(" :", "")}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
      <View style={[{
        flex: 1, width: '100%', height: Dimensions.get('window').height / 1.15, position: 'relative', marginTop: Platform.OS == 'android' ? Dimensions.get('window').height / 3.8 : (Platform.OS === 'ios' &&
          (height > 800) ? Dimensions.get('window').height / 3.8 : Dimensions.get('window').height / 3.0)
      }]}>
        <ScrollView nestedScrollEnabled style={[{ width: '90%', alignSelf: 'center' }]} showsVerticalScrollIndicator={false}>
          <View style={[{ marginBottom: 35 }]}>
            <View style={[{ height: '100%', paddingTop: 10, backgroundColor: 'white', width: '100%', alignSelf: 'center', borderRadius: 10, paddingBottom: 10, }]}>
              <FlatList
                data={faqSectionData}
                renderItem={({ item, index }) => ListItem(item, index)}
                keyExtractor={(item, index) => index.toString()}
                style={[styles['align_self_center']]}
                scrollEnabled={false}
                numColumns={2}
              />
              {/* <TouchableOpacity onPress={() => { navigation.navigate('KYCApproval') }}>
                <Image style={[styles['width_height_100'], styles['border_radius_5']]} source={require('../assets/images/kycApprovalTile.png')} />
              </TouchableOpacity> */}
            </View>
          </View>
        </ScrollView>
      </View>

      {
        showDetailViewModal &&
        showDetailViewSection()
      }
      {
        showLinkModal == true &&
        showLinkALert()
      }
      {
        showLinkModalRedeem == true &&
        showLinkALertRedeem()
      }

      {
        showDropDowns &&
        <CustomListViewModal
          dropDownType={dropDownType}
          listItems={dropDownData}
          selectedItem={selectedDropDownItem}
          onSelectedState={(item) => onSelectedState(item)}
          onSelectedDistrict={(item) => onSelectedDistrict(item)}
          closeModal={() => setShowDropDowns(false)} />
      }

      {showPanEntryModal &&
        <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
          <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], styles['padding_10'], { borderRadius: 8 }]}>
            <View style={[styles['width_100%'], { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <Text style={[styles['font_size_16_regular'], styles['top_5'], { color: Colors.black }]} >{translate('enterPanDetails')}</Text>
              <TouchableOpacity onPress={() => { setShowPanEntryModal(false), setPanImageData(null), setPanNumber("") }}><Image style={[styles['margin_left_20'], styles['width_height_30']]} source={require('../assets/images/closeWindow.png')}></Image></TouchableOpacity>
            </View>
            <View style={[styles['margin_top_20']]}>
              {/* <CustomTextInput
                style={[]}
                labelName={translate('panNumber')}
                maxLength={10}
                IsRequired={true}
                keyboardType={panKeyboardType}
                placeholder={translate('enter') + " " + translate('panNumber')}
                value={panNumber}
                editable={true}
                onFocus={() => {
                }}
                onChangeText={(text) => {
                  handlePancard(text)
                  // setPanNumber(text)
                  // const filteredText = text.replace(/[^\w\s]/gi, '');
                  // setPanNumber(filteredText)
                }}
                onEndEditing={event => {
                  const upperCaseText = panNumber.toUpperCase();
                  setPanNumber(upperCaseText);
                }}
              /> */}
              <CustomBorderDocumetUpload
                style={[styles['centerItems']]}
                labelName={translate('panNumber')}
                IsRequired={true}
                maxLength={10}
                keyboardType={panKeyboardType}
                placeholder={translate('enter') + " " + translate('panNumber')}
                value={panNumber}
                autoCapitalize="characters"
                editable={dataEditable}
                imageData={panImageData != null ? true : false}
                onFocus={() => {
                }}
                onClickDocUp={() => { panNumber != undefined && panNumber != "" ? panImageData != null ? handleViewClicked(translate('upload_pan_doc')) : gstDocumentPress(translate('upload_pan_doc')) : SimpleToast.show(translate('Please_enter_PAN_number')) }}
                onChangeText={(text) => {
                  handlePancard(text)
                  // const filteredText = text.replace(/[^\w\s]/gi, '');
                  // setPanNumber(filteredText)
                }}
                onEndEditing={event => {
                  const upperCaseText = panNumber.toUpperCase();
                  setPanNumber(upperCaseText);
                }}
              />
            </View>
            <View style={[styles['margin_top_20'], { flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
              <CustomButton title={translate('submit')} onPress={() => { handleRasiseRequest() }} buttonBg={'#ED3237'} btnWidth={'95%'} titleTextColor={Colors.white} />

            </View>
          </View>
        </View>
      }
      {
        showAlert &&
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

      }
      <CustomGalleryPopup
        showOrNot={showSelectionModal}
        onPressingOut={() => setShowSelectionModal(false)}
        onPressingCamera={() => openCameraProfilePic()}
        onPressingGallery={() => openImagePickerProfilePic()}
      />
      {isModalVisible && showUploadedImage()}
      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
    </View>
  )


}

export default Dashboard;