import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, StyleSheet, StatusBar, Text, Image, AppState, Dimensions, Keyboard, TouchableOpacity, FlatList, ImageBackground, PermissionsAndroid, Modal, Linking, Alert, BackHandler, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { useDispatch, useSelector } from 'react-redux';
import { DEVICE_TOKEN, EDITDATA, MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, TERMS_CONDITIONS, USERMENU, USER_ID, USER_NAME, WHATSAPPCHECKED, clearAsyncStorage, filterObjects, getAppVersion, readFileToBase64, retrieveData, sortObjectsAlphabetically, storeData, downloadFileToLocal, getBuildNumber, compareVersions } from '../assets/Utils/Utils';
import { useFocusEffect, useNavigation, useNavigationState } from '@react-navigation/native';
import ReactNativePdf from 'react-native-pdf';
import CustomAlert from '../Components/CustomAlert';
import { selectUser, setUser } from '../redux/store/slices/UserSlice';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { APP_ENV_PROD, FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, HTTP_ACCEPTED, HTTP_CREATED, HTTP_FORBIDDEN, HTTP_OK, IOS_STORE_LINK, configs } from '../helpers/URLConstants';
import SimpleToast from 'react-native-simple-toast';
import { getCompanyStyles, updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import CustomCircularImageView from '../Components/CustomCircularImageView';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
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
import { EventRegister } from 'react-native-event-listeners';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import { setLocation } from '../redux/store/slices/locationSlice';
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import CustomGalleryPopup from '../Components/CustomGalleryPopup';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMastersSeedCalc, saveSavedSeedCalData, triggeredApi } from './SeedCalculator';
import { getFertilizerCalcRes, getMastersFertilizer } from './FertilizerCalculator';
import { getYieldCalcMasters, SaveYieldCalcValues } from './YieldCalculator';
import { getCompaniesListPlanningTool, getCropsListPlanningTool, getExistedRetailersDataPlanningTOol, getHybridsListPlanningTool, saveAPIPlanningTool } from './PlanningTool';
import { getMasterForProgramDetails } from './ProgramDetails';
import { getCropsListMasterProducts, getOfflineProductsData } from '../Products/Products';
import { getDataOfScanHistory, getProgramsList } from '../QRScanner/ScanHistory';
import { GetFAQDATA } from '../Profile/FAQ';
import { GetComplaintsApiCallGlobal, uploadAllComplaintsGlobal } from '../Profile/HelpDesk';
import { GetMastersComplaint } from '../Profile/Complaint';
import { updateOfflineCount } from './synchCountUtils';
import { getWindowHeight } from '../QRScanner/Upgrade/helpers';
import { createStyles } from '../assets/style/createStyles';
import RenderHTML from 'react-native-render-html';
import serviceMenu from './menujson';
import WebView from 'react-native-webview';
const { height, width } = Dimensions.get('window');
var styles = BuildStyleOverwrite(Styles);



function RetailerDashboard({ route }) {
  var realm = new Realm({ path: 'User.realm' });
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const networkStatus = useSelector(state => state.networkStatus.value)
  const offlineCountFromRedux = useSelector(state => state.offlineCount.count);
  const [hideSyncBtn, setHideSyncBtn] = useState(false)

  const callMasters = async () => {

    try {
      setHideSyncBtn(true)
      // 1. sync call for seed calc
      const seedCalcRes = realm.objects('SeedCalSubmit');
      const seedCalcOfflineData = seedCalcRes[0]?.data;
      if (seedCalcOfflineData) {
        let parseIt = JSON.parse(seedCalcOfflineData)
        saveSavedSeedCalData(parseIt, dispatch)
        // masters call for seed calc
        getMastersSeedCalc()
      } else {
        // masters call for seed calc
        getMastersSeedCalc()
      }


      //  2.  sync call for fertilizer calc
      getMastersFertilizer()
      getFertilizerCalcRes()

      //3.  sync calls for yield calc
      const yieldCalcRes = realm.objects('YieldCalSubmit');
      const yieldCalcOfflineData = yieldCalcRes[0]?.data;
      if (yieldCalcOfflineData) {
        let yieldParseIt = JSON.parse(yieldCalcOfflineData)
        SaveYieldCalcValues(yieldParseIt, dispatch)
        // masters call for yield calc
        getYieldCalcMasters()
      } else {
        // masters call for yield calc
        getYieldCalcMasters()
      }


      // 4. planning tool
      const offlineRetailerEntriesData = realm.objects('finalRetailerEntries');
      getCropsListPlanningTool()
      getHybridsListPlanningTool()
      getCompaniesListPlanningTool()
      if (offlineRetailerEntriesData.length !== 0) {
        console.log('offline data exists so----------------------------- saving in online now', offlineRetailerEntriesData)
        let dataOfRetailerEntriesData = JSON.parse(offlineRetailerEntriesData[0]?.finalRetailerEntriesData);
        saveAPIPlanningTool(dataOfRetailerEntriesData, dispatch)
      } else {
        console.log('offline data  doesnt exists so calling get api')
        getExistedRetailersDataPlanningTOol()
      }


      // 5.program details
      getMasterForProgramDetails()

      // 6. scan history
      getDataOfScanHistory()
      getProgramsList()

      //7. FAQ's
      GetFAQDATA()

      // 8. help desk
      GetComplaintsApiCallGlobal()
      const complaints = realm.objects('ComplaintData');
      console.log(complaints, "offline complaints list")
      if (complaints?.length > 0) {
        uploadAllComplaintsGlobal(complaints, dispatch)
      };


      // 9. complaint
      GetMastersComplaint()

      // 10. products
      getOfflineProductsData()
      getCropsListMasterProducts()


    } catch (e) {
      console.log(e)
    } finally {
      setTimeout(() => {
        setHideSyncBtn(false)
      }, 5000)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      setkycDetailsPopUp(false)
      if (networkStatus) {
        callMasters()
      }
      else {
        updateOfflineCount(dispatch)
      }
    }, [networkStatus])
  );

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false)
  const { latitude, longitude } = useSelector((state) => state.location);
  const [successLoading, setSuccessLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [roleId, setRoleId] = useState(0)
  const [homePageDataBE, setHomePageDataBE] = useState(null)
  const [homePageData, setHomePageData] = useState(serviceMenu || [])
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const flatListRef = useRef(null);
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [alertStatusMessage, setAlertStatusMessage] = useState('');
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const navigation = useNavigation()
  const getUserData = useSelector(selectUser);
  const userDatafrom = getUserData[0]
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [badgeIcon, setBadgeIcon] = useState('')
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
  const [weatherInfo, setWeatherInfo] = useState(null)
  const [territoryName, setTerritoryName] = useState('')
  const [territoryMobileNo, setTerritoryMobileNo] = useState('')
  const [showDetailViewModal, setShowDetailViewModal] = useState(false)
  const [kycDetailsPopUp, setkycDetailsPopUp] = useState(false)
  const [kycDetailsMandatory, setkycDetailsMandatory] = useState(false)
  const [htmlcontent, sethtmlcontent] = useState(null)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [weatherIsVisible, setWeatherIsVisible] = useState(false)
  const [proprietorName, setProprietorName] = useState('')
  const [firmName, setFirmName] = useState('')
  const [ekycSubmitted, setEkycSubmitted] = useState(false)
  const [dropDownData, setdropDownData] = useState();
  const [showDropDowns, setShowDropDowns] = useState(false)
  const [selectedCalc, setSelectedCalc] = useState(null)
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
  const [iconsList, setIconsList] = useState(null)
  const { height, width } = Dimensions.get('window');
  const [roleType, setRoleType] = useState(undefined);
  const [panKeyboardType, setPanKeyboardType] = useState('default');
  const [panNumber, setPanNumber] = useState("");
  const [selectedPan, setSelectedPan] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedPanImage, setSelectedPanImage] = useState(false)
  const [panImageData, setPanImageData] = useState(null);
  const [calledOnce, setCalledOnce] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [base64ImageData, setBase64ImageData] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [calculatorOptions, setCalculatorOptions] = useState(false)
  const [dataEditable, setDataEditable] = useState(true);
  const [dashboardDataCopy, setDashboardDataCopy] = useState(null);
  const appState = useRef(AppState.currentState);
  const storeLink = "https://play.google.com/store/apps/details?id=com.nuziveeduseeds.nslchannel";
  const [couponCount, setcouponCount] = useState(0)
  const [showCustomActionSheet, setShowCustomActionSheet] = useState(false)
  const [selectedPoints, setSelectedPoints] = useState(0)
  const [couponScanHistoryList, setCouponScanHistoryList] = useState([])
  const [showRewardPoints, setShowRewardPoints] = useState(false);
  const [showQuickProceed, setShowQuickProceed] = useState(false);
  const [isCouponSelected, setisCouponSelected] = useState(false);
  const [showRedeemKyc, setShowRedeemKyc] = useState(false);
  const [editKyc, setEditKyc] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLink, setVideoLink] = useState('')
  const [showYtBtn, setShowYtBtn] = useState(false);
  const [pdfLink, setPdfLink] = useState('')
  const [ekycStatusMsg, setEkycStatusMsg] = useState('');
  const [reedemKycRejected, setReedemKycRejected] = useState('Your KYC has been rejected. Please try again.');
  const [showApprovalDetails, setShowApprovalDetails] = useState(null);
  const [carouselData, setCarouselData] = useState([])
  const [showEdit, setShowEdit] = useState(false);
  const [availablePoint, setAvailablePoints] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState(true);
  const [selectedBuy, setSelectedBuy] = useState(false);
  const [pointsLoader, setPointsLoader] = useState(false);
  const pdfRef = useRef(null);
  let couponsSyncing = false;
  const isImageBeingCaptured = useRef(false); // it is required for kycpopup disabling
  const [updatedOfflineCount, setUpdatedOfflineCount] = useState(offlineCountFromRedux)
  const routeName = useNavigationState(state => {
    const route = state.routes[state.index];
    return route.name;
  });


  // Auto scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselData?.length > 0 && !isManual) {
        let nextIndex = (currentIndex + 1) % carouselData.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      }
    }, 3000); // 👈 auto slide every 3s

    return () => clearInterval(interval);
  }, [currentIndex, isManual, carouselData]);

  useEffect(() => {
    if (homePageDataBE) {
      const updated = homePageData.map(section => {
        const matchedBESection = homePageDataBE.find(s => s.layout === section.layout);

        if (!matchedBESection || !section.servicesList) return section;

        const updatedServices = section.servicesList.map(service => {
          const matchedService = matchedBESection.servicesList?.find(s => s.title === service.title);

          if (!matchedService) return service;

          return {
            ...service,
            status: matchedService?.status,
            visibility: matchedService?.isVisible,
            ...(service.title === "HDPS" && {
              HDPSVedioLink: matchedService.HDPSVedioLink,
              HDPSPdfLink: matchedService.HDPSPdfLink,
              HDPSWatchBtnEnable: matchedService.HDPSWatchBtnEnable
            })
          };
        });

        return { ...section, servicesList: updatedServices };
      });

      setHomePageData(updated);
    }
  }, [homePageDataBE]);


  useEffect(() => {
    console.log("dsdssdssss", offlineCountFromRedux)
    setUpdatedOfflineCount(offlineCountFromRedux)
  }, [offlineCountFromRedux])

  useEffect(() => {
    // Add listener once
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    // Cleanup
    return () => subscription.remove();
  }, [handleBackButton]);

  useEffect(() => {
    setTimeout(() => {
      getCarouselData();
    }, 1000);
  }, []);

  let getCarouselData = useCallback(async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(false)
        setLoadingMessage(translate('please_wait_getting_data'))
        var getCarouselDataURL = configs.BASE_URL + configs.MASTERS.GETCAROUSELDATA;
        var getHeaders = await GetApiHeaders()
        var APIResponse = await PostRequest(getCarouselDataURL, getHeaders,
          {
            "notificationType": strings.card,
            "roleId": userDatafrom?.roleId,
            "companyCode": userDatafrom?.companyCode,
            "stateId": userDatafrom?.stateId,
            // "territoryId":userDatafrom?.territoryId !== null ?userDatafrom?.territoryId  : 0,
            "filterValue": ""
          }
        );
        setTimeout(() => {
          setLoadingMessage()
          setLoading(false)
        }, 200);
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse.response
            if (masterResp != undefined && masterResp != null) {
              console.log("Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", JSON.stringify(masterResp?.promotionsList))
              // setCarouselData(masterResp?.promotionsList)
              let data = await traverseAndReplaceUrls(masterResp?.promotionsList)
              if (data) {
                insertDataOfCarousel(data)
                setCarouselData(data)
              }
            }
          }
          else {
            setLoadingMessage(APIResponse?.message ?? "")
            setLoading(false)
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
        }, 500);
        SimpleToast.show(error.message)
      }
    }
  }, [userDatafrom]);

  useEffect(() => {
    const listener = EventRegister.addEventListener('LogoutEvent', logOutUser);
    return () => {
      if (listener) {
        EventRegister.removeEventListener(listener);
      }
    };
  }, []);

  const logOutUser = async () => {
    realm.write(() => {
      realm.deleteAll();
    })
    clearAsyncStorage();
    navigation.reset({ index: 0, routes: [{ name: 'LoginNew', params: {} }] })
  }

  const handleBackButton = useCallback(() => {
    console.log(showCustomActionSheet);
    if (showCustomActionSheet) {
      const list = [...couponScanHistoryList];
      list.map((obj) => {
        return { ...obj, isSelected: false }
      })
      console.log(list)
      setCouponScanHistoryList(list)
      return true;
    } else {
      navigation.goBack();
      return true;
    }
  }, [showCustomActionSheet, couponScanHistoryList]);

  useEffect(() => {
    requestPhotoPermission();
  }, [])

  useEffect(() => {
    const initLocationUpdates = async () => {
      const hasPermission = await requestLocationPermission();
      console.log("Permission Status:", hasPermission);

      if (hasPermission && Platform.OS == 'android') {
        const isGpsEnabled = await checkIfGpsEnabled();
        console.log("GPS Enabled:", isGpsEnabled);

        if (isGpsEnabled) {
          fetchLocation(); // Get initial location
        }
      } else if (hasPermission && Platform.OS == 'ios') {
        fetchLocation(); // Get initial location
      }
    };


    if (latitude == null || longitude == null) {
      const interval = setInterval(() => {
        console.log("Updating location...1");
        initLocationUpdates();
      }, 40000); // Call every 20 seconds

      return () => clearInterval(interval); // Cleanup on unmount
    }
    else {
      console.log('calling weather apiiiiiiiiiiiiiiiiiiiiiiiiiii')
      getWeatherData()
    }
  }, [latitude, longitude]);

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        return (
          granted["android.permission.ACCESS_FINE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.ACCESS_COARSE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS always allows location permissions when requested
  };

  const checkIfGpsEnabled = async () => {
    try {
      await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 20000,
        fastInterval: 6000,
      });
      return true;
    } catch (err) {
      try {
        Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
      } catch (e) {
        Alert.alert("Enable GPS", "Please enable your device’s GPS", [
          { text: "Cancel", style: "cancel" }
        ]);
      }
      return false;
    }
  };

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Location fetched1:", latitude, longitude);
        dispatch(setLocation({ latitude, longitude }));
      },
      (error) => {
        console.error("Error fetching location1:", error);

        // Retry if location fetch fails
        if (error.code === 3 || error.code === 2) {
          Geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              console.log("Fallback Location:", latitude, longitude);
              dispatch(setLocation({ latitude, longitude }));
            },
            (fallbackError) => {
              console.error("Fallback location error:", fallbackError);
              // Alert.alert("Location Error", "Please check GPS settings and try again.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          // Alert.alert("Location Error", "Please enable GPS and try again.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 }
    );
  };

  const resetSelectedItems = () => {
    const list = couponScanHistoryList.map((obj) => ({ ...obj, isSelected: false }));
    setCouponScanHistoryList(list);
    setSelectedPoints(0);
    setisCouponSelected(false);
    setShowCustomActionSheet(false);
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log("AppState changed: ", nextAppState);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log("App has come to the foreground");
        // ⚠️ should be here only once when coming foreground
        checkForceUpdate();
        if (isImageBeingCaptured) {
          console.log("Skipping refresh because camera/gallery was used");
          appState.current = nextAppState;
          setkycDetailsPopUp(false)
          return; // skip refresh
        }
        refreshData();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
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

  const handleBuy = () => {
    SimpleToast.show(translate('feature_not_available'));
  }

  const handleVoucher = () => {
    setSelectedBuy(false);
  }

  useEffect(() => {
    console.log('dimension window height', height)
  }, [territoryName, territoryMobileNo])


  useEffect(() => {
    // Define an async function inside useEffect
    const fetchData = async () => {
      try {
        const dataEdit = await retrieveData(EDITDATA);
        setShowDetailViewModal(dataEdit);
        if (dataEdit === true && networkStatus) {
          await GetMastersApiCall();
        }
        handleLoading();
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    };
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    setLoading(false)
    setLoadingMessage()
  }, [ekycSubmitted])

  useEffect(() => {
    requestNotificationPermission();
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      setkycDetailsPopUp(false)
      if (route?.params?.showRedeemPopup === true && editKyc === true) { // added this to resolve popup issue
        setShowCustomActionSheet(true);
      }
    }, [route?.params?.showRedeemPopup])
  );


  const refreshData = async () => {
    let nam = await retrieveData(USER_NAME)
    const networkStatus = await getNetworkStatus();
    if (networkStatus) {
      setUserName(nam)
      setPointsLoader(true);
      GetPointsOnly();
      getCarouselData();
      callMasters();
      getWeatherData();
    } else {
      setUserName(nam)
      setCalledOnce(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      setkycDetailsPopUp(false)
      let data = async () => {
        let nam = await retrieveData(USER_NAME)
        const networkStatus = await getNetworkStatus();
        let offlineData = await checkDataFromRealm()
        console.log("poipoi", nam)
        if (networkStatus) {
          setUserName(nam)
          setPointsLoader(true);
          GetPointsOnly();
          getCarouselData();
          handleFocus();
          getWeatherData();
        } else {
          setUserName(nam)
          setCalledOnce(false)
        }
      };
      data();
      return () => {
        console.log('Screen is no longer focused!');
        setkycDetailsPopUp(false)
      };

    }, [networkStatus])
  );

  useEffect(() => {
    console.log("kycDetailsPopUpkycDetailsPopUp", kycDetailsPopUp)
  }, [kycDetailsPopUp])

  const storeProfileDataOff = async (value) => {
    console.log(value, "<0000000000000000000000 profile image")
    if (value) {
      try {
        await AsyncStorage.removeItem('profileOffline');
        let fileName = value.split('/').pop()
        let offlinePath = await downloadFileToLocal(value, fileName)
        await AsyncStorage.setItem('profileOffline', JSON.stringify(offlinePath));
      } catch (e) {
        console.error(e)
      }
    }
  };

  const storeDataPoints = async (value) => {
    try {
      await AsyncStorage.setItem('pointsData', JSON.stringify(value));
    } catch (e) {
      console.error(e)
    }
  };

  const checkData = async () => {
    try {
      const result = await AsyncStorage.getItem('pointsData');
      return JSON.parse(result);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const GetPointsOnly = useCallback(async alertSync => {
    const networkStatus = await getNetworkStatus();
    if (!networkStatus) {
      setPointsLoader(true);
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }
    try {
      const getloginURL =
        configs.BASE_URL + configs.MASTERS.DASHBOARD_MASTER;
      const getHeaders = await GetApiHeaders();
      const dataList = {
        userId: getHeaders.userId,
        mobileNumber: getHeaders.mobileNumber,
        latitude,
        longitude,
      };
      const APIResponse = await PostRequest(
        getloginURL,
        getHeaders,
        dataList,
      );
      setTimeout(() => {
        setPointsLoader(false);
      }, 2000);
      if (APIResponse?.statusCode === HTTP_OK) {
        const dashboardResp = APIResponse.response;
        insertDataToRealm(dashboardResp);
        console.log("<---------------- userlist", JSON.stringify(dashboardResp))
        setkycDetailsMandatory(APIResponse?.response?.panUpdateDetails?.isPopupMandatory)
        setkycDetailsPopUp(APIResponse?.response?.panUpdateDetails?.showPanPopup)
        sethtmlcontent(APIResponse?.response?.panUpdateDetails?.kycHtml)
        storeDataPoints(dashboardResp)
        setUserPointsEarned(dashboardResp?.userPointsEarned);
        setUserPointsReedemed(dashboardResp?.userPointsReedemed);
        setTotalRetailers(dashboardResp?.totalRetailers);
        setActiveRetailers(dashboardResp?.activeRetailers);
        setNotificationCount(dashboardResp?.userList[0].notificationCount);
        setHomePageDataBE(dashboardResp?.userMenuControl);
        setUserImage(dashboardResp?.userList[0].profilePic != undefined ? dashboardResp?.userList[0].profilePic : dashboardResp?.userList[0]?.profileImage)
        storeProfileDataOff(dashboardResp?.userList[0].profilePic != undefined ? dashboardResp?.userList[0].profilePic : dashboardResp?.userList[0]?.profileImage)
        // setUserName((roleType == 'Retailer' || roleType == 'Distributor') ? dashboardResp?.userList[0].proprietorName : dashboardResp?.userList[0].name);
        storeData(PROFILEIMAGE, dashboardResp?.userList[0].profilePic != undefined ? dashboardResp?.userList[0]?.profilePic : dashboardResp?.userList[0]?.profileImage)  //profileImage  kiran
        storeData(USER_NAME, (roleType == 'Retailer' || roleType == 'Distributor') ? dashboardResp?.userList[0]?.proprietorName : dashboardResp?.userList[0]?.name);
        storeData(MOBILE_NUMBER, dashboardResp?.userList[0].mobileNumber);
      } else if (APIResponse?.statusCode === 601) {
        SimpleToast.show(APIResponse?.message);
        showAlertWithMessage(
          translate('alert'),
          true,
          true,
          APIResponse.message,
          true,
          false,
          translate('ok'),
          translate('cancel'),
        );
      } else { }
    } catch (error) {
      console.error('Dashboard Fetch Error:', error.message);
      setSuccessLoadingMessage(error.message);
    } finally {
      setPointsLoader(false);
    }
  }, []);

  const handleOkAlert = async () => {
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
    if (alertMessage == reedemKycRejected) {
      setShowLinkModal(true)
    }
    if (alertMessage == translate('pancardsubmittedsuccessfully')) {
      setShowCustomActionSheet(true);
    }
    if (alertMessage == translate('camera_permission_ios')) {
      if (Platform.OS == 'android') {
        // IntentLauncher.startActivity({
        //   action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
        //   data: 'package:' + pkg
        // })
        const pkg = DeviceInfo.getBundleId();
        await Linking.openSettings(); // Works for most permissions/settings screens
        // or for app-specific settings:
        await Linking.openURL(`package:${pkg}`);
      } else {
        Linking.openURL('app-settings:')
      }
    }
    if (alertMessage == translate('photo_permission_ios')) {
      if (Platform.OS == 'android') {
        // IntentLauncher.startActivity({
        //   action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
        //   data: 'package:' + pkg
        // })
        const pkg = DeviceInfo.getBundleId();
        await Linking.openSettings(); // Works for most permissions/settings screens
        // or for app-specific settings:
        await Linking.openURL(`package:${pkg}`);
      } else {
        Linking.openURL('app-settings:')
      }
    }
  }
  const handleFocus = async () => {
    console.log('Screen is focused!');
    setCalledOnce(false)
    // await checkDataFromRealm()
    const roleTypeDetails = await retrieveData(ROLENAME)
    setRoleType(roleTypeDetails)
    GetRedeemPointsList();
    setTimeout(() => {
      getUserDataDetails();
    }, 500);
    let a = await retrieveData(ROLEID)
    setRoleId(a)
    getCarouselData();
  };

  const mergeData = async (data) => {
    // Initialize an empty array for storing unique qrCodeScanData
    let mergedQrCodeScanData = [];

    data.forEach(item => {
      // Ignore items with empty qrCodeScanData
      if (item.qrCodeScanData && item.qrCodeScanData.length > 0) {
        item.qrCodeScanData.forEach(qrCode => {
          console.log(qrCode, ",----- item qr code")
          mergedQrCodeScanData.push(qrCode);
        });
      }
    });

    console.log(mergedQrCodeScanData, "<<<<<<<<<<ASasdasd")

    var userId = await retrieveData(USER_ID);
    userId = userId.toString()
    var mobileNumber = await retrieveData(MOBILE_NUMBER);

    return {
      "loginUserId": userId,
      "loginMobileNumber": mobileNumber,
      "retailerId": userId,
      "retailerMobileNumber": mobileNumber,
      "deviceType": "mobile",
      "type": "",
      "geoLocations": `${latitude},${longitude}`,
      "isOnlineRecord": false,
      "qrCodeScanData": mergedQrCodeScanData
    };
  };

  let setOfflineImage = async () => {
    let profilePic = await AsyncStorage.getItem('profileOffline');
    let parsedImage = JSON.parse(profilePic)
    if (parsedImage) {
      setUserImage(parsedImage)
    }
  }

  const checkDataFromRealm = async () => {
    realm = new Realm({ path: 'User.realm' });
    const scannedCoupons = realm.objects('scannedCoupons');
    const dashboardData = realm.objects('dashboardData')[0];
    let weatherResVar = realm.objects('weatherRes');
    let homepageIcons = realm.objects('homePageIconsList');
    let carouselDataOff = realm.objects('carouselDataOff');
    let userMenu = await retrieveData(USERMENU)
    console.log(scannedCoupons, "<00000000000000000000000000 copouns string")
    setOfflineImage()
    setTimeout(async () => {
      if (weatherResVar) {
        setWeatherInfoOff(weatherResVar)
      }
      if (carouselDataOff) {
        console.log(carouselDataOff[0].carouselInfo, "<-------------------- carousel data offline")
        let data = JSON.parse(carouselDataOff[0].carouselInfo || '{}');
        if (JSON.stringify(data) !== JSON.stringify(carouselData)) {
          console.log(data, "??? data of carousel we are settings")
          setCarouselData(data);
        }
      }
      console.log("oioioioioioi", scannedCoupons.length + " " + networkStatus + " " + couponsSyncing)
      if (scannedCoupons.length > 0 && networkStatus && couponsSyncing == false) {
        console.log("qb0")
        couponsSyncing = true;
        console.log("qb01")
        const url = `${configs.BASE_URL}${configs.QRSCAN.VALIDATEQR_V9}`;
        console.log("qb", url)
        const getHeaders = await GetApiHeaders();
        console.log("qb1", getHeaders)
        const dataList = await mergeData(scannedCoupons);
        console.log("qb2", dataList)
        console.log(JSON.stringify(dataList), "<----------- scannned coupons list")
        setcouponCount(dataList?.qrCodeScanData?.length);
        updateOfflineCount(dispatch)
        console.log("SCANNEDCOUPON_REALM_OFFLINE_API", JSON.stringify(dataList));
        console.log("SCANNEDCOUPON_REALM_OFFLINE_API2", (dataList.qrCodeScanData.length), "calledonce>>>", calledOnce, ">>>");
        if (!calledOnce) {
          if (networkStatus) {
            setLoading(true)
            setLoadingMessage(translate('syncingPlz'))
          }
          const APIResponse = await PostRequest(url, getHeaders, dataList);
          console.log("URL===>", url, 'BODSY====>', JSON.stringify(dataList), "Response ====>", APIResponse);

          if (APIResponse && [HTTP_OK, HTTP_CREATED, HTTP_ACCEPTED].includes(APIResponse.statusCode)) {
            couponsSyncing = false;
            realm.write(() => {
              realm.delete(realm.objects('scannedCoupons'));
            });
            updateOfflineCount(dispatch)
            const remainingCoupons = await realm.objects('scannedCoupons').length;
            console.log(remainingCoupons, "???? remaining copunszzz")
            setcouponCount(remainingCoupons);
            if (remainingCoupons == 0) {
              setTimeout(() => {
                setLoadingMessage()
                setLoading(false)
              }, 100);
            }
            GetDashboardDetailsApiCall(null);
            setCalledOnce(true)
          } else {
            couponsSyncing = false;
            console.error("Failed to sync coupon:", coupon.qrCodeData);
          }
        }
      } else {
        couponsSyncing = false;
        setcouponCount(0);
      }
    }, 500);

    if (!networkStatus) {
      if (dashboardData !== undefined && dashboardData !== null) {
        getDashboardKYCData(dashboardData);
      }
      if (userMenu) {
        setHomePageDataBE(userMenu)
      }
      if (homepageIcons) {
        setHomePageIcons(homepageIcons)
      }
      let pointsData = await checkData()
      if (pointsData) {
        setUserPointsEarned(pointsData?.userPointsEarned)
        setUserPointsReedemed(pointsData?.userPointsReedemed)
      } else if (!pointsData && dashboardData?.userPointsEarned) {
        setUserPointsEarned(dashboardData?.userPointsEarned)
        setUserPointsReedemed(dashboardData?.userPointsReedemed)
      }
    } else {
      console.log("DASHBOARD_REALM_ONLINE", dashboardData);
      clearDashboardRealmData();
      setTimeout(() => {
        GetDashboardDetailsApiCall(null);
        getWeatherData()
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

  const requestPermissionsProductScan = async (flag = null) => {
    if (Platform.OS == 'android') {
      var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA]);
      if (result['android.permission.CAMERA'] === 'granted') {
        if (flag === 'sendToMDO') {
          navigation.navigate('ProductScanner', { flag: "renderMDO" });
        } else {
          navigation.navigate('ProductScanner');
        }
      } else {
        showPermissionAlert();
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
          if (flag === 'sendToMDO') {
            navigation.navigate('ProductScanner', { flag: "renderMDO" });
          } else {
            navigation.navigate('ProductScanner');
          }
        }
      }
    }
  }

  const initLocationUpdatesQRScanner = async () => {
    const hasPermission = await requestLocationPermission();
    console.log("Permission Status:", hasPermission);

    if (hasPermission && Platform.OS == 'android') {
      const isGpsEnabled = await checkIfGpsEnabled();
      console.log("GPS Enabled:", isGpsEnabled);

      if (isGpsEnabled) {
        fetchLocation(); // Get initial location
      }
    } else if (hasPermission && Platform.OS == 'ios') {
      fetchLocation(); // Get initial location
    }
  };

  const requestPermissions = async (checkProductScan = null) => {
    try {
      if (Platform.OS == 'android') {
        const androidVersion = DeviceInfo.getSystemVersion();
        if (androidVersion >= 13) {
          var result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA]);
          if (result['android.permission.CAMERA'] === 'granted') {

            await initLocationUpdatesQRScanner()

            checkProductScan === 'productScan' ?
              navigation.navigate('ProductScanner') :
              navigation.navigate('QRScannerNew', { userPointsEarned: userPointsEarned })
          } else {
            showPermissionAlert();
          }
        } else {
          var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA]);
          if (result['android.permission.CAMERA'] === 'granted') {
            await initLocationUpdatesQRScanner()
            navigation.navigate('QRScannerNew', { userPointsEarned: userPointsEarned })
          } else {
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
              navigation.navigate('QRScannerNew', { userPointsEarned: userPointsEarned })
            } else {
              setShowLinkModal(true)
            }
          }
        }
      }
    } catch (error) {
      console.error('Permission error:', error);
      showAlertWithMessage(
        translate('alert'),
        true,
        true,
        translate('something_went_wrong'),
        false,
        true,
        translate('ok'),
      );
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

  const getUserDataDetails = async () => {
    setUserName(await retrieveData(USER_NAME))
    setFirmName(getUserData[0]?.firmName)
    setState(getUserData[0]?.stateName)
    setStateID(getUserData[0]?.stateId)
    setDistrict(getUserData[0]?.districtName)
    setDistrictID(getUserData[0]?.districtId)
    setProprietorName(getUserData[0]?.proprietorName)
    console.log('gggggggg123', userDatafrom?.proprietorName)
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

  const cancelBtnPress = () => {
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
    setShowPanEntryModal(true)
  }

  const handleContinue = () => {
    setShowEdit(false);
    setShowCustomActionSheet(true);
  }

  let setWeatherInfoOff = async (res) => {
    if (res && res.length > 0) {
      let data = JSON.parse(res[0]?.weatherInfo || '{}');
      if (JSON.stringify(data) !== JSON.stringify(weatherInfo)) {
        console.log(data, "??? data of weather we are settings")
        setWeatherInfo(data);
      }
    }
  }

  let setHomePageIcons = async (res) => {
    console.log(res, "icons list in offline")
    if (res) {
      let data = res[0];
      setIconsList(data)
    }
  }


  const getDashboardKYCData = async (dashboardResp) => {
    console.log("<---------------- userlist offline", JSON.stringify(dashboardResp))
    // setUserPointsEarned(dashboardResp?.userPointsEarned)
    // setUserPointsReedemed(dashboardResp?.userPointsReedemed)
    setTotalRetailers(dashboardResp?.totalRetailers)
    setActiveRetailers(dashboardResp?.activeRetailers)
    // storeProfileDataOff(dashboardResp?.userList[0].profilePic != undefined ? dashboardResp?.userList[0].profilePic : dashboardResp?.userList[0]?.profileImage)
    setEkycStatus(dashboardResp?.userList[0].ekycStatus)
    setEkycSubmitted(dashboardResp?.userList[0].ekycSubmitted)
    setTerritoryName(dashboardResp?.userList[0].territoryManagerName)
    setTerritoryMobileNo(dashboardResp?.userList[0].territoryManagerMobileNumber)
    setDashboardDetails(dashboardResp)
    storeData(USER_NAME, (roleType == 'Retailer' || roleType == 'Distributor') ? dashboardResp?.userList[0].proprietorName : dashboardResp?.userList[0].name);
    storeData(MOBILE_NUMBER, dashboardResp?.userList[0].mobileNumber);
    storeData(PROFILEIMAGE, dashboardResp?.userList[0].profilePic != undefined ? dashboardResp?.userList[0]?.profilePic : dashboardResp?.userList[0]?.profileImage)  //profileImage  kiran
    setNotificationCount(dashboardResp?.userList[0].notificationCount)
    setRaiseRequestStatus(dashboardResp?.userList[0].ekycRaiseRequestStatus)
    setRaiseRequest(dashboardResp?.userList[0].raiseRequest)
  }
  const requestPhotoPermission = async () => {
    await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
    let status1 = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
    if (status1 == "blocked" || status1 == "denied") {
    }
  }

  const checkRedeemPortal = useCallback(async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      if (selectedVoucher) {
        try {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))

          var getloginURL = configs.BASE_URL + configs.REDEEM.REDEEM_PORTAL;
          var getHeaders = await GetApiHeaders()
          console.log('getloginURL is', getloginURL)
          console.log('getHeaders is', getHeaders)

          var APIResponse = await GetRequest(getloginURL, getHeaders);
          if (APIResponse != undefined && APIResponse != null) {
            setTimeout(() => {
              setLoadingMessage()
              setLoading(false)
            }, 500);
            if (APIResponse.statusCode == HTTP_OK) {
              var masterResp = APIResponse.response
              console.log('the master resp is', masterResp)
              if (masterResp != undefined && masterResp != null) {
                setShowCustomActionSheet(false)
                // setSelectedVoucher(!selectedVoucher)
                navigation.navigate('RedeemPortal', { item: masterResp != undefined && masterResp != null ? masterResp : '' })
              }
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
          }, 500);
          SimpleToast.show(error.message)
        }
      } else {
        SimpleToast.show(translate('pleaseSelectAoption'))
      }
    }
  }, [])

  const renderRewardPointsList = (item, index) => {
    return (<Card item={item} index={index} />)
  }

  const Card = ({ item, index }) => {
    return (
      <TouchableOpacity
        disabled={true}
        style={[styles['alignItems_center'], styles['padding_vertical_3'], styles['border_width_1'],
        { borderColor: item?.primaryColor }, styles['border_radius_10'], styles['margin_top_10'], styles['width_100%']]}>

        <View style={[styles['flex_direction_row'], { alignItems: "center", width: "100%", paddingHorizontal: responsiveWidth(3), paddingVertical: responsiveHeight(1) }]}>
          <View style={[styles['align_self_center'], styles['width_height_60'], { backgroundColor: "rgba(237, 237, 237, 1)", alignItems: "center", justifyContent: "center", borderRadius: 60 }]}>
            {item?.companyLogo && <Image source={{ uri: item?.companyLogo }} resizeMode='contain' style={[styles['width_height_45'], styles['border_radius_10']]} />}
          </View>
          <View style={[styles['left_10'], styles['align_self_center']]}>
            <Text allowFontScaling={false} style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['text_align_left']]}>{item.companyName || ''}</Text>
            <View style={[styles['flex_direction_column'], styles['margin_top_3']]}>

              {/* Row 1 */}
              <View style={[styles['flex_direction_row']]}>
                <Text
                  allowFontScaling={false}
                  style={[
                    { color: dynamicStyles.textColor, minWidth: 125 }, // fixed width for alignment
                    styles['font_size_10_regular']
                  ]}
                >
                  {translate('redeemable_points')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[{ color: dynamicStyles.textColor }, styles['font_size_10_bold']]}
                >
                  : {item.availablePoints || '0'}
                </Text>
              </View>

              {/* Row 2 */}
              <View style={[styles['flex_direction_row']]}>
                <Text
                  allowFontScaling={false}
                  style={[
                    { color: dynamicStyles.textColor, minWidth: 125 }, // same width as above
                    styles['font_size_10_regular']
                  ]}
                >
                  {translate('redeemed_points')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[{ color: dynamicStyles.textColor }, styles['font_size_10_bold']]}
                >
                  : {item.totalRedeemedPoints || '0'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  };


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

            <View style={[{ marginLeft: 12 }, styles['top_5'], { marginBottom: 15 }]}>
              <Text style={[styles['text_color_black'], styles['centerItems']]}>
                {translate('please_complete')}{' '}
                <TouchableOpacity style={[]} onPress={ekycButtonPress}>
                  <Text style={[styles['text_color_blue'], styles['top_3'], { textDecorationLine: 'underline' }]}>{translate('kyc')}</Text>
                </TouchableOpacity>{' '}
              </Text>
              <Text style={[styles['text_color_black'], styles['centerItems'], styles['top_10']]}> {translate('or')} {' '}</Text>
              <Text style={[styles['text_color_black'], styles['centerItems'], styles['top_10']]}> {translate('send_approval')}{' '}
                <TouchableOpacity style={[styles['']]} onPress={raiseButtonPress}>
                  <Text style={[styles['text_color_blue'], styles['top_3'], { textDecorationLine: 'underline' }]}>{translate('request')}</Text>
                </TouchableOpacity>
                <Text style={[styles['text_color_black'], styles['top_10']]}> {translate('to_territory_manager')} {' '} </Text>
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

            <View style={[{ marginLeft: 12 }, styles['top_5'], { marginBottom: 15 }]}>
              <Text style={[styles['text_color_black'], styles['centerItems']]}>
                {translate('please_complete')}{' '}
                <TouchableOpacity style={[]} onPress={ekycButtonPress}>
                  <Text style={[styles['text_color_blue'], styles['top_3'], { textDecorationLine: 'underline' }]}>kyc</Text>
                </TouchableOpacity>{' '}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    )
  }


  const CustomActionSheet = () => {
    return (
      <Modal animationType="slide"
        transparent={true}
        visible={showCustomActionSheet}
        onRequestClose={() => resetSelectedItems()}>
        <TouchableWithoutFeedback onPress={() => resetSelectedItems()}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.blackTransparent }}>
            <Image style={[styles['margin_top_20'], styles['width_100%'], styles['height_40'], styles['bottom_minus_10']]} resizeMode='stretch' source={require('../assets/images/pyramid.png')}></Image>
            <View style={[{ overflow: 'hidden', padding: 25, backgroundColor: "white", height: responsiveHeight(60) }]}>
              <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_16_bold']]}>{translate('reward_points')}</Text>

              <View style={[{ height: responsiveHeight(30) }]}>
                {couponScanHistoryList.length > 0 ?
                  <FlatList
                    //  data={rewardPointsDetailsList}
                    data={couponScanHistoryList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) =>
                      renderRewardPointsList(item, index)
                    }
                    showsVerticalScrollIndicator={false}
                  />
                  :
                  <Text style={[{
                    color: dynamicStyles.textColor, width: "100%", textAlign: 'center',
                    fontSize: 20, fontWeight: 700, marginTop: 50
                  }]}>{translate('no_active_points')}</Text>
                }
              </View>
              <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], Platform.OS == "android" ? styles['margin_top_15'] : undefined]}>{translate('totalPointsAvailable')}</Text>
              <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_bold'], styles['margin_top_2']]}>{availablePoint || '0'}</Text>
              <View style={[styles['flex_direction_row'], styles['align_self_center'], styles['gap_10'], styles['space_between'], styles['margin_top_5']]}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: 70 }}>
                  {/* Buy Button */}
                  <View style={{
                    flexDirection: 'column', alignItems: 'center', width: '45%', height: 70
                  }}>
                    {selectedBuy ? (
                      <View
                        style={{
                          width: '100%',
                          borderRadius: 10,
                          alignItems: 'center',
                          backgroundColor: dynamicStyles?.highLightedColor,
                          borderColor: dynamicStyles.primaryColor,
                          borderWidth: 1,
                        }}
                      >
                        <TouchableOpacity
                          style={{ width: '50%', alignItems: 'center', padding: 15, borderRadius: 10 }}
                          onPress={() => handleBuy()}
                        >
                          <Image
                            style={{
                              height: 40,
                              width: 40,
                              resizeMode: 'contain',
                            }}
                            source={require('../assets/images/buy.png')}
                          />
                          <Image
                            style={{
                              height: 20,
                              resizeMode: 'contain',
                              position: 'absolute',
                              right: -30,
                              top: 10,
                              tintColor: dynamicStyles.primaryColor,
                            }}
                            source={require('../assets/images/tickMark.png')}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 1)', 'rgba(242, 246, 249, 1)']}
                        style={{
                          width: '100%',
                          borderRadius: 10,
                          alignItems: 'center',
                          borderColor: 'rgba(242, 246, 249, 1)',
                          borderWidth: 1,
                        }}
                      >
                        <TouchableOpacity
                          style={{ width: '50%', alignItems: 'center', padding: 15, borderRadius: 10 }}
                          onPress={() => handleBuy()}
                        >
                          <Image
                            style={{
                              height: 40,
                              width: 40,
                              resizeMode: 'contain',
                            }}
                            source={require('../assets/images/buy.png')}
                          />
                        </TouchableOpacity>
                      </LinearGradient>
                    )}
                    <Text allowFontScaling={false} style={[{ color: 'rgba(58, 68, 73, 1)', marginTop: 2.5 }, styles['font_size_10_bold']]}>
                      {translate('Buy')}
                    </Text>
                  </View>

                  {/* Voucher Button */}
                  <View style={{ flexDirection: 'column', alignItems: 'center', width: '45%', height: 70 }}>
                    {selectedVoucher ? (
                      <View
                        style={{
                          width: '100%',
                          borderRadius: 10,
                          alignItems: 'center',
                          backgroundColor: dynamicStyles?.highLightedColor,
                          borderColor: dynamicStyles.primaryColor,
                          borderWidth: 1,
                        }}
                      >
                        <TouchableOpacity
                          style={{ width: '50%', alignItems: 'center', padding: 15, borderRadius: 10 }}
                          onPress={() => handleVoucher()}
                        >
                          <Image
                            style={{
                              height: 40,
                              width: 40,
                              resizeMode: 'contain',
                            }}
                            source={require('../assets/images/voucher.png')}
                          />
                          <Image
                            style={{
                              height: 20,
                              resizeMode: 'contain',
                              position: 'absolute',
                              right: -40,
                              top: 10,
                              tintColor: dynamicStyles.primaryColor,
                            }}
                            source={require('../assets/images/tickMark.png')}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 1)', 'rgba(242, 246, 249, 1)']}
                        style={{
                          width: '100%',
                          borderRadius: 10,
                          alignItems: 'center',
                          borderColor: 'rgba(242, 246, 249, 1)',
                          borderWidth: 1,
                        }}
                      >
                        <TouchableOpacity
                          style={{ width: '50%', alignItems: 'center', padding: 15, borderRadius: 10 }}
                          onPress={() => handleVoucher()}
                        >
                          <Image
                            style={{
                              height: 40,
                              width: 40,
                              resizeMode: 'contain',
                            }}
                            source={require('../assets/images/voucher.png')}
                          />
                        </TouchableOpacity>
                      </LinearGradient>
                    )}
                    <Text allowFontScaling={false} style={[{ color: 'rgba(58, 68, 73, 1)', marginTop: 2.5 }, styles['font_size_10_bold']]}>
                      {translate('Voucher')}
                    </Text>
                  </View>
                </View>

              </View>
            </View>
            <View style={{ backgroundColor: "white", width: '100%', bottom: 10 }}>
              <CustomButton
                // shouldDisable={true}
                title={translate('proceed')}
                onPress={() => { (showQuickProceed && couponScanHistoryList.length > 0) ? checkRedeemPortal() : SimpleToast.show(translate('you_dont_have_sufficient_balance')) }}
                btnWidth={'90%'}
                // buttonBg={(couponScanHistoryList.length > 0) ? dynamicStyles.primaryColor : dynamicStyles?.highLightedColor?.replace(/(\d(\.\d+)?)(\))$/, '0.4)')}
                buttonBg={dynamicStyles.primaryColor}

                titleTextColor={
                  couponScanHistoryList.length === 0 ? 'white' :
                    dynamicStyles.secondaryColor}
                activeOpacity={couponScanHistoryList.length === 0 ? 0.5 : 1}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  const handleCancelAlert = () => {
    setShowAlert(false)
    if (alertMessage === "Successfully loaded amount in to the card") {
      GetRedeemPointsList()
      showQuickProceed && checkRedeemPortal()
    }
  }

  const profileButtonPress = async () => {
    if (networkStatus) {
      navigation.navigate('Profile', { ekycStatus: ekycStatus, badgeIcon: badgeIcon })
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }



  const notificationBtnClicked = async () => {
    if (networkStatus) {
      // navigation.navigate('MandiPricesScreen')
      navigation.navigate('Notifications')
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }



  async function showPopup(screenName, enableOrNot) {
    try {

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: translate("Location_Permission"),
            message: translate('need_to_access'),
            buttonNeutral: translate('storagePermissionNeutral'),
            buttonNegative: translate('storagePermissionNegative'),
            buttonPositive: translate("storagePermissionPositive")
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission granted");
          // GetUserLocation();
          navigation.navigate(screenName, { enablePestForecast: enableOrNot })
        } else {
          console.log("Location permission denied");
          showPermissionDeniedAlert();
        }
      } else {
        const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (permission === RESULTS.GRANTED) {
          console.log("iOS location permission granted");
          // GetUserLocation();
          navigation.navigate(screenName, { enablePestForecast: enableOrNot })
        } else {
          console.log("iOS location permission denied");
          showPermissionDeniedAlert();
        }
      }

    } catch (err) {
      console.warn(err, "<--------");
    }
  }

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      translate('Location_Permission_Required'),
      translate("deny_desc"),
      [
        { text: translate('open_settings'), onPress: () => Linking.openSettings() },
        { text: translate('storagePermissionNegative'), style: 'cancel' },
      ]
    );
  };

  const cloudBtnClicked = async () => {
    if (networkStatus) {
      showPopup('WeatherScreen', false)
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const showVideoPlayer = () => {
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center', }]} onStartShouldSetResponder={() => { }}>
          <View style={[styles['bg_white'], styles['width_90%'], styles['align_self_center'], styles['border_radius_6'], { height: getWindowHeight() - 80 }]}>
            <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]} onPress={() => {
              setShowVideoModal(false)
            }} >
              <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
            </TouchableOpacity>


            <View style={{ backgroundColor: 'rgba(255, 255, 255, 1)', height: '85%', elevation: 10, borderRadius: 10, width: responsiveWidth(90), alignSelf: 'center', marginTop: responsiveHeight(1) }}>
              <View style={{ height: '100%', width: responsiveWidth(90), padding: 0, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
                {pdfLink ? (
                  <View style={{ height: '100%', width: "100%" }}>

                    <ReactNativePdf
                      ref={pdfRef}
                      source={
                        { uri: pdfLink, cache: true, type: 'url' }
                      }
                      trustAllCerts={false}
                      scale={1.0}
                      minScale={1.0}
                      maxScale={3.0}
                      fitPolicy={2}
                      spacing={4}
                      enablePaging={false}
                      style={{ flex: 1, width: '100%', height: '100%' }}
                      onLoadComplete={(pages) => {
                        console.log(`PDF Loaded: ${pages} pages`);
                      }}
                      onError={(error) => {
                        console.log('Failed to load PDF:', error);
                        SimpleToast.show(translate('downloadFailed'));
                      }}
                    />



                  </View>
                ) : (
                  <View style={{ height: '100%', width: "100%", alignItems: "center", justifyContent: "center" }}>

                  </View>
                )}
              </View>
            </View>
            {showYtBtn && <View style={{ marginTop: 'auto', bottom: responsiveHeight(1) }}>
              <CustomButton
                onPress={() => {
                  if (networkStatus) {
                    isYouTubeLink(videoLink) ? Linking.openURL(videoLink).catch(err => console.error("Couldn't load page", err)) : SimpleToast.show(translate('no_internet_conneccted'))
                  } else {
                    SimpleToast.show(translate('no_internet_conneccted'))
                  }
                }}
                title={translate('watchVideo')}
                buttonBg={dynamicStyles.primaryColor}
                btnWidth={'95%'}
                titleTextColor={dynamicStyles.secondaryColor}
                textAlign='center'
              />
            </View>}
          </View>
        </View>
      </Modal>
    )
  }

  const onPressDashboardItem = async (item, index) => {
    if (item?.status != true) {
      SimpleToast.show(translate('feature_not_available'));
      return;
    }
    if (networkStatus) {
      if (item.title == strings.faq) {
        navigation.navigate('FAQ')
      }
      else if (item.title === strings.Agronomy) {
        navigation.navigate("Agronomy")
      }
      else if (item.title === strings.CropDiag) {
        navigation.navigate("CropDiagonstic")
      }
      else if (item.title === strings.pestForecast) {
        navigation.navigate('WeatherScreen', { enablePestForecast: true })
      }
      else if (item.title === strings.AdvancedKnowledgeCenter || item.title === strings.KnowledgeCenter) {
        navigation.navigate('AdvancedKnowledgeCenter')
      }
      else if (item.title === strings.HDPS) {
        console.log("nnnnnnnnnn", item?.HDPSPdfLink)
        isYouTubeLink(item?.HDPSPdfLink) ?
          Linking.openURL(item?.HDPSPdfLink).catch(err => console.error("Couldn't load page", err)) : setShowVideoModal(true)
        setVideoLink(item?.HDPSVedioLink)
        setPdfLink(item?.HDPSPdfLink)
        setShowYtBtn(item?.HDPSWatchBtnEnable)
      }
      else if (item.title == strings.helpCenter) {
        navigation.navigate('HelpDesk')
      }
      else if (item.title == strings.DipstickSurvey) {
        navigation.navigate('DipstickSurvey')
      }
      else if (item.title == strings.Tool) {
        navigation.navigate('PlanningTool')
      }
      else if (item.title == strings.promotions) {
        navigation.navigate('Promotions')
      }
      else if (item.title == strings.kycApprovalCap) {
        navigation.navigate('KYCApproval')
      }
      else if (item.title == strings.salesTeam) {
        navigation.navigate('SalesTeam')
      }
      else if (item.title == strings.products) {
        navigation.navigate('Products')
      }
      else if (item.title == strings.scan) {
        requestPermissions()
      }
      else if (item.title == strings.productScan) {
        requestPermissionsProductScan()
      }
      else if (item.title == strings.Field_activity_QR) {
        requestPermissionsProductScan('sendToMDO')
      }
      else if (item.title == strings.ProgramDetails) {
        navigation.navigate('ProgramDetails')
      }
      else if (item.title == strings.MandiPrices) {
        navigation.navigate('MandiPricesScreen')
      }
      else if (item.title == strings.Calculator) {
        setCalculatorOptions(!calculatorOptions)
      }
      else if (item.title == strings.scan_history) {
        console.log('the role type is', roleType)
        if (roleType == 'Retailer' || roleType == 'Distributor') {
          navigation.navigate('ScanHistory', { userPointsEarned: userPointsEarned })
        }
        else {
          navigation.navigate('EmployeeScanHistory', { roleid: (await retrieveData(ROLEID)) })
        }
      }

      else if (item.title == strings.redeem) {
        console.log('ssssssssssssssssssssss', showRedeemKyc);
        console.log('eeeeeeeeeeeeeeeeeeeeeee', editKyc);
        // if (userPointsReedemed == 0) {
        //   SimpleToast.show(translate('you_dont_have_sufficient_balance'))
        //   return
        // }

        if (showRedeemKyc) {
          // setShowLinkModal(true)
          setShowPanEntryModal(true)
        } else if (editKyc) {
          setShowEdit(true);
        } else if (showRewardPoints) {
          //  setSelectedVoucher(false)
          setShowCustomActionSheet(true);
        } else {
          checkRedeemPortal();
        }
      }
      else if (item.title == strings.redemHistory || strings.redemHistory2) {
        // else if (item.title == translate('redemHistory') || translate('redemHistory2')) {
        if (roleType == 'Retailer' || roleType == 'Distributor') {
          navigation.navigate('RedemptionsHistory')
        } else {
          navigation.navigate('EmployeeRedemptionsHistory', { roleid: (await retrieveData(ROLEID)) })
        }
      }
    } else {
      if (item.title == strings.scan) {
        requestPermissions()
      }
      else if (item.title == strings.ProgramDetails) {
        navigation.navigate('ProgramDetails')
      }
      else if (item.title == strings.Tool) {
        navigation.navigate('PlanningTool')
      }
      else if (item.title == strings.Calculator) {
        setCalculatorOptions(!calculatorOptions)
      }
      else if (item.title == strings.products) {
        navigation.navigate('Products')
      }
      else if (item.title == strings.scan_history) {
        navigation.navigate('ScanHistory', { userPointsEarned: userPointsEarned })
      }
      else {
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
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Handle keyboard hide event
        // Adjust your views here
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const GetMastersApiCall = useCallback(async () => {
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
        console.log(APIResponse, "apiiiiiiiiiiii responseee")
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse.response
            console.log('the master resp is', masterResp)
            setStateList(sortObjectsAlphabetically(masterResp?.statesList, 'name'))
            setDistrictListOriginal(masterResp?.districtsList)
            console.log('the 002 is', masterResp.statesList)
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
        }, 500);
        SimpleToast.show(error.message)
      }
    }
  }, [userDatafrom?.roleId, userDatafrom?.companyCode, userDatafrom?.stateId])



  const GetRedeemPointsList = useCallback(async (mobileNumber) => {

    if (!networkStatus) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }

    if (networkStatus) {
      try {
        var getloginURL = configs.BASE_URL + configs.REDEEM.GET_REWARD_POINTS;

        // var getHeaders = await GetApiHeaders();
        var getHeaders = await GetApiHeaders();
        const mobileNumber = await retrieveData(MOBILE_NUMBER)
        var dataList = {
          "mobileNumber": mobileNumber,
        }
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        console.log('TM response is:', APIResponse)
        setTimeout(() => {
          setLoading(false)
          setLoadingMessage("")
        }, 1500);
        if (APIResponse != undefined && APIResponse != null) {

          if (APIResponse.statusCode == HTTP_OK) {
            console.log('ressspp mdo', APIResponse)

            // var resppp = APIResponse.response.couponScanHSummaryList
            const showRewardPoints = APIResponse.response.showRewardPoints;
            const showRewardProceed = APIResponse.response.showProceedBtn;
            const showRedeemKyc = APIResponse.response.showRedeemKyc;
            const ekycStatusMsg = APIResponse.response.ekycStatusMsg;
            const editKycDetails = APIResponse.response.ekycDetails;
            const showEdit = APIResponse.response.editKyc;
            console.log(editKycDetails, 'llllllllllllllllllllllllllllllllll', showEdit);

            setEkycStatusMsg(ekycStatusMsg)
            setShowRedeemKyc(showRedeemKyc)
            setEditKyc(showEdit);
            setShowRewardPoints(showRewardPoints);
            setShowQuickProceed(showRewardProceed);
            setShowApprovalDetails(editKycDetails);

            console.log("fetched response is", APIResponse.response.couponScanHSummaryList);
            var list = APIResponse.response.couponScanHSummaryList.map((obj) => {
              return {
                ...obj, isSelected: false
              }
            })
            // console.log('what is reposee cart 123', APIResponse.response.cartList)
            console.log('what is reposee cart 123', list)
            const totalAvailablePoints = list.reduce((sum, obj) => sum + obj.availablePoints, 0);
            console.log("Total Available Points:", totalAvailablePoints);
            setAvailablePoints(totalAvailablePoints);
            list = list.filter(item => item.toBeSyncedPoints >= 0)
            setCouponScanHistoryList(list)

            setTimeout(() => {
              setLoading(false);
            }, 500);
          }
          else {
            // setLoading(false);
            setTimeout(() => {
              console.log(APIResponse?.message)
            }, 2000);

          }

        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 1000);
        }
      }
      catch (error) {
        setLoading(false)
        setTimeout(() => {
          console.log(APIResponse?.message)
        }, 500);
      }
    }

  }, [networkStatus])

  const submitApiCall = async (userDataForm) => {
    var networkStatus = await getNetworkStatus()
    // console.log("SAINATH_1");
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('submitting_data'))

        var getloginURL = configs.BASE_URL + configs.PROFILE.UPDATE_PROFILE;
        var getHeaders = await GetApiHeaders();
        // console.log("SAINATH_2", userDataForm);
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
        const formData = new FormData();

        // Append JSON data
        formData.append('jsonData', JSON.stringify(jsonData));
        formData.append('profileImage', "");

        var APIResponse = await uploadFormData(formData, getloginURL, getHeaders);

        console.log('complent response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 100);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
              SimpleToast.show(translate('retailerInfo_updated_successfully'), SimpleToast.LONG)
              storeData(EDITDATA, false)
              setShowDetailViewModal(false)
              storeData(USER_NAME, proprietorName)
            }, 100);

            setTimeout(() => {
              getUserDataDetails()
            }, 100);
          }


        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
            setSuccessLoading(false)
            setSuccessLoadingMessage()
          }, 100);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 100);
      } finally {
        setLoading(false)
        setLoadingMessage()
        setSuccessLoading(false)
        setSuccessLoadingMessage()
      }
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
          'retailerMobileNumber': getHeaders.mobileNumber,
          "panImage": "mobile_img.png",
          'fromRedeem': true
          // 'fromRedeem': kycUpdate === null ? true : false,
          // 'fromDashBoard': kycUpdate !== null ? true : false,
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
          }, 100);
          if (APIResponse.statusCode == HTTP_OK) {
            const dashboardRespBYPASS = APIResponse.response.ekycSuccessMsg
            console.log(dashboardRespBYPASS.ekycSuccessMsg);

            setEkycStatusMsg('')
            setShowRedeemKyc(false)
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setAlertStatusMessage(dashboardRespBYPASS);
              setSuccessLoadingMessage("Your KYC request has been successfully submitted")
              setTimeout(() => {
                setSuccessLoading(false)
              }, 1000)
            }, 100);
            console.log('the dash board Resp is BYPASS', dashboardRespBYPASS)

            setTimeout(() => {
              GetDashboardDetailsApiCall(true);
            }, 500)

            setPanImageData("")
            setShowRedeemKyc(false);
            setPanNumber("")
          } else {
            setPanImageData(null), setPanNumber("")
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 100);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 100);
      }
    }
  }

  const traverseAndReplaceUrls = async (data) => {
    // Check if a value is a URL and not a YouTube URL
    const isDownloadableUrl = (value) => {
      if (typeof value !== 'string') return false;
      const isHttpUrl = value.match(/^https?:\/\//);
      const isYouTube = value.includes('youtube.com') || value.includes('youtu.be') || value.includes('sharepoint') || value.includes('drive');
      return isHttpUrl && !isYouTube;
    };

    // Generate a filename from the URL
    const getFileNameFromUrl = (url) => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1] || `file_${Date.now()}.png`;
    };

    // Recursive traversal
    const traverse = async (obj) => {
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          obj[i] = await traverse(obj[i]);
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (isDownloadableUrl(obj[key])) {
              const fileName = getFileNameFromUrl(obj[key]);
              try {
                const localPath = await downloadFileToLocal(obj[key], fileName);
                obj[key] = localPath;
              } catch (error) {
                console.warn(`Failed to download ${obj[key]}:`, error);
              }
            } else {
              obj[key] = await traverse(obj[key]);
            }
          }
        }
      }
      return obj;
    };

    const clonedData = JSON.parse(JSON.stringify(data));
    return await traverse(clonedData);
  };

  let getWeatherData = useCallback(async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        var getloginURL = configs.BASE_URL + configs.MASTERS.getWeatherDetailsV1;
        var getHeaders = await GetApiHeaders();
        var dataList = {
          "userId": getHeaders.userId,
          'mobileNumber': getHeaders.mobileNumber,
          "latitude": latitude,
          "longitude": longitude
        }
        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(async () => {
              setWeatherIsVisible(APIResponse?.response?.isVisible)
              setWeatherInfo(APIResponse?.response?.dailyBaseWeatherInfo?.forecast[0])
              insertDataOfWeather(APIResponse?.response?.dailyBaseWeatherInfo?.forecast[0])
            }, 100);
          }
          else if (APIResponse.statusCode === HTTP_FORBIDDEN || APIResponse.statusCode === 999) {
            setWeatherIsVisible(APIResponse?.response?.isVisible);
            setWeatherInfo(null)
          }
          else if (APIResponse.statusCode == 601) {
            SimpleToast.show(APIResponse?.message)
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, true, false, translate('ok'), translate('cancel'))
          }
          else {
            setLoadingMessage()
            setLoading(false)
            setWeatherIsVisible(APIResponse?.response?.isVisible ?? weatherIsVisible)
            setWeatherInfo(null)
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 100);
        }
        // getDashboardKYCData(dashboardData);
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 100);
      }
    }
  }, [longitude, latitude])


  const GetDashboardDetailsApiCall = useCallback(async (alertSync) => {
    const networkStatus = await getNetworkStatus();
    if (!networkStatus) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }
    try {
      let weatherResVar = realm.objects('weatherRes');
      if (weatherResVar.length === 0) {
      }

      const getloginURL = configs.BASE_URL + configs.MASTERS.DASHBOARD_MASTER;
      const getHeaders = await GetApiHeaders();
      const dataList = {
        userId: getHeaders.userId,
        mobileNumber: getHeaders.mobileNumber,
        latitude,
        longitude,
      };
      const APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
      setTimeout(() => {
        setLoadingMessage()
        setLoading(false)
      }, 2000);

      if (APIResponse?.statusCode === HTTP_OK) {
        const dashboardResp = APIResponse.response;
        let getIcons = dashboardResp?.headerFooterMenu;
        insertDataOfIcons(getIcons)
        setIconsList(dashboardResp?.headerFooterMenu || []);
        setBadgeIcon(dashboardResp?.userBadge);
        setHomePageDataBE(dashboardResp?.userMenuControl);
        console.log(JSON.stringify(dashboardResp), "JSON.stringify(dashboardResp)")
        // setWeatherInfo(dashboardResp?.weatherInfo?.weatherInfo);
        let data = await traverseAndReplaceUrls(APIResponse?.response?.userMenuControl)
        storeData(USERMENU, data);
        setDashboardDataCopy(dashboardResp);
        setUserPointsEarned(dashboardResp?.userPointsEarned);
        setUserPointsReedemed(dashboardResp?.userPointsReedemed);
        setTotalRetailers(dashboardResp?.totalRetailers);
        setActiveRetailers(dashboardResp?.activeRetailers);
        getDashboardKYCData(dashboardResp);
        insertDataToRealm(dashboardResp);
        if (dashboardResp?.userList?.[0]?.proprietorName) {
          storeData(USER_NAME, dashboardResp.userList[0].proprietorName);
          getUserDataDetails();
        }
        const companyColorsList = dashboardResp?.companyInfo;
        const filePath = await downloadFileToLocal(
          companyColorsList?.loaderPath,
          companyColorsList?.loaderPath.split('/').pop()
        );
        const tempSelectedObject = {
          primaryColor: companyColorsList?.primaryColor || Colors.buttonColorPurple,
          iconPrimaryColor: companyColorsList?.iconPrimaryColor || Colors.buttonColorPurple,
          secondaryColor: companyColorsList?.secondaryColor || Colors.white,
          textColor: companyColorsList?.textColor || Colors.black,
          disableColor: companyColorsList?.disableColor || Colors.lightgrey,
          highLightedColor: companyColorsList?.highColor || Colors.buttonColorPurple,
          loaderPath: filePath || '',
        };
        dispatch(updateCompanyStyles(tempSelectedObject));
        if (alertSync) {
          showAlertWithMessage(translate('alert'), true, true, translate('pancardsubmittedsuccessfully'), true, false, translate('ok'), translate('cancel'));
        }
      } else if (APIResponse?.statusCode === 601) {
        SimpleToast.show(APIResponse?.message);
        showAlertWithMessage(translate('alert'), true, true, APIResponse.message, true, false, translate('ok'), translate('cancel'));
      }
    } catch (error) {
      console.error('Dashboard Fetch Error:', error.message);
      setSuccessLoadingMessage(error.message);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [latitude, longitude, dispatch]);



  const clearDashboardRealmData = () => {
    try {
      // setHomePageData([])
      realm.write(async () => {
        await realm.delete(realm.objects('dashboardData'));
        await realm.delete(realm.objects('weatherRes'));
        await realm.delete(realm.objects('homePageIconsList'));
        await realm.delete(realm.objects('carouselDataOff'));
        await realm.delete(realm.objects('kycData'));
        await realm.refresh();
      });

      console.log('All data cleared from Realm');
    } catch (error) {
      console.error('Error clearing data from Realm:', error);
    }
  };

  const insertDataOfIcons = async (response) => {
    try {
      const fileKeys = ['Buy', 'appIcon', 'faq', 'home', 'samadhan', 'scan'];

      const downloadedPaths = {};

      for (const key of fileKeys) {
        const url = response?.[key];
        if (url) {
          const filename = url.split('/').pop();
          downloadedPaths[key] = await downloadFileToLocal(url, filename);
        }
      }

      realm.write(() => {
        realm.delete(realm.objects('homePageIconsList'));
        // realm.refresh();
        realm.create('homePageIconsList', downloadedPaths);
      });
    } catch (error) {
      console.error("Error inserting data into Realm: homepageicons", error);
    }
  }

  const insertDataOfCarousel = (response) => {
    if (!response) {
      console.log("Invalid response");
      return;
    }
    try {
      const res = JSON.stringify(response);
      realm.write(() => {
        realm.delete(realm.objects('carouselDataOff'));
        realm.create('carouselDataOff', {
          carouselInfo: res
        });
      });
    } catch (error) {
      console.error("Error inserting data into Realm: carousel", error);
    }
  }


  const insertDataOfWeather = (response) => {
    if (!response) {
      console.log("Invalid response");
      return;
    }
    // console.log("SAINATH_ONLINE_WEATHER_RESPONSE", response);
    try {
      const res = JSON.stringify(response);
      const weatherData = {
        weatherInfo: res
      };

      realm.write(() => {
        realm.delete(realm.objects('weatherRes'));
        // realm.refresh();
        realm.create('weatherRes', weatherData);
      });

      console.log("Data inserted successfully into Realm");
    } catch (error) {
      console.error("Error inserting data into Realm: weATHER", error);
    }
  };



  const insertDataToRealm = (response) => {
    if (!response) {
      console.log("Invalid response");
      return;
    }
    // console.log("SAINATH_ONLINE", response);
    try {
      realm.write(() => {
        const userList = response.userList[0];

        const ekycDoneDate = new Date(userList.ekycDoneDate);

        const kycData = {
          ekycSubmitted: userList.ekycSubmitted != undefined ? userList.ekycSubmitted : false,
          ekycDoneDate: ekycDoneDate.toString(),
          notificationCount: userList.notificationCount != undefined ? userList.notificationCount : 0,
          mobileNumber: userList.mobileNumber != undefined ? userList.mobileNumber : "",
          profilePic: userList?.profileImage != undefined ? userList?.profileImage : userList?.profilePic != undefined ? userList?.profilePic : "",
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
        // realm.delete(realm.objects('dashboardData'))
        realm.create('dashboardData', dashboardData);
      });
      console.log("Data inserted successfully into Realm");
    } catch (error) {
      console.error("Error inserting data into Realm:", error);
    }
  };

  useEffect(() => {
    if (!carouselData || carouselData.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselData.length;
        if (nextIndex >= 0 && nextIndex < carouselData.length) {
          flatListRef?.current?.scrollToIndex({ index: nextIndex, animated: true });
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [carouselData]);


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
          }, 100);
          if (APIResponse.statusCode == HTTP_OK) {
            const clearAsync = await clearAsyncStorage();
            if (clearAsync) {
              setTimeout(() => {
                setLoading(false)
                setSuccessLoading(true)
                setSuccessLoadingMessage(translate('logout_successfully'))
              }, 100);

              setTimeout(async () => {
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
                storeData(WHATSAPPCHECKED, false)
                await AsyncStorage.removeItem('dontShowThisAgain')
                dispatch(updateCompanyStyles({}));
                dispatch(updateRetailerInfoData({}));
                dispatch(setUser({}))
                const complaints = realm.objects('ComplaintData');
                realm.write(() => {
                  realm.delete(complaints);
                });
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'LoginNew' }],
                });

              }, 3000);
            } else {
              showAlertWithMessage(translate('alert'), true, true, translate('something_went_wrong'), false, true, translate('ok'), translate('cancel'))
            }
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 100);
        }
      } catch (error) {
        setTimeout(() => {
          setLoading(false);
          setLoadingMessage()
        }, 100);
      }
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
            <CustomButton title={translate('update')} onPress={submitButtonPress} buttonBg={dynamicStyles.primaryColor} btnWidth={"90%"} titleTextColor={dynamicStyles.secondaryColor} />
          </View>

        </View>
      </View>
    )
  }
  const renderCalculatorOptions = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={calculatorOptions}
        onRequestClose={() => {
          setSelectedCalc(null)
          setCalculatorOptions(!calculatorOptions);
        }}>
        <View style={styleOfSheet.centeredView}>
          <View style={styleOfSheet.modalView}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 10
            }}>
              <Text style={[styles['font_size_22_semibold'], styleOfSheet.modalText]}>{translate('select')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCalc(null)
                  setCalculatorOptions(!calculatorOptions)
                }
                }>
                <Image source={require('../../src/assets/images/crossMark.png')} style={{ tintColor: dynamicStyles.iconPrimaryColor, height: 20, width: 20, resizeMode: "contain" }} />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", alignSelf: "center", width: responsiveWidth(90) }}>
              <View style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 3.5, width: '30%', }}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCalc(dummyCalculatorData[2])
                    setTimeout(() => {
                      navigateMe(dummyCalculatorData[2])
                    }, 500)
                  }}
                  style={[
                    selectedCalc?.title === dummyCalculatorData[2]?.title && { borderColor: dynamicStyles.primaryColor, borderWidth: 1 },
                    {
                      height: height * 0.09, width: width * 0.19, backgroundColor: "rgba(0, 0, 0, 0.03)", borderRadius: 10, alignItems: "center", justifyContent: "center"
                    }]}>
                  <Image source={dummyCalculatorData[2]?.image} style={{
                    height: 40, width: 40, resizeMode: "contain"
                  }} />
                </TouchableOpacity>
                <Text style={[
                  selectedCalc?.title === dummyCalculatorData[2]?.title ? { color: dynamicStyles.primaryColor } : { color: dynamicStyles.textColor },
                  styles['font_size_9_semibold'], {
                    marginTop: 5, textAlign: "center"
                    // width: '60%'
                  }]}
                  numberOfLines={2} ellipsizeMode='tail'
                >{dummyCalculatorData[2]?.title}</Text>
              </View>
              <View style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 3.5, width: '30%' }}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCalc(dummyCalculatorData[0])
                    setTimeout(() => {
                      navigateMe(dummyCalculatorData[0])
                    }, 500)
                  }}
                  style={[selectedCalc?.title === dummyCalculatorData[0]?.title && { borderColor: dynamicStyles.primaryColor, borderWidth: 1 }, {
                    height: height * 0.09, width: width * 0.19, backgroundColor: "rgba(0, 0, 0, 0.03)", borderRadius: 10, alignItems: "center", justifyContent: "center"
                  }]}>
                  <Image source={dummyCalculatorData[0]?.image} style={{
                    height: 40, width: 40, resizeMode: "contain"
                  }} />
                </TouchableOpacity>
                <Text style={[
                  selectedCalc?.title === dummyCalculatorData[0]?.title ? { color: dynamicStyles.primaryColor } : { color: dynamicStyles.textColor },
                  { marginTop: 5 }, styles['font_size_9_semibold']]}
                  numberOfLines={1} ellipsizeMode='tail'
                >{dummyCalculatorData[0]?.title}</Text>
              </View>
              <View style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 3.5, width: '30%' }}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCalc(dummyCalculatorData[1])
                    setTimeout(() => {
                      navigateMe(dummyCalculatorData[1])
                    }, 500)
                  }}
                  style={[
                    selectedCalc?.title === dummyCalculatorData[1]?.title && { borderColor: dynamicStyles.primaryColor, borderWidth: 1 },
                    {
                      height: height * 0.09, width: width * 0.19, backgroundColor: "rgba(0, 0, 0, 0.03)", borderRadius: 10, alignItems: "center", justifyContent: "center"
                    }]}>
                  <Image source={dummyCalculatorData[1]?.image} style={{
                    height: 40, width: 40, resizeMode: "contain"
                  }} />
                </TouchableOpacity>
                <Text style={[
                  selectedCalc?.title === dummyCalculatorData[1]?.title ? { color: dynamicStyles.primaryColor } : { color: dynamicStyles.textColor },
                  styles['font_size_9_semibold'], { marginTop: 5 }]}
                  numberOfLines={1} ellipsizeMode='tail'
                >{dummyCalculatorData[1]?.title}</Text>
              </View>
            </View>

          </View>
        </View>
      </Modal>
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

  const openCameraProfilePic = async () => {
    try {
      isImageBeingCaptured = true; // mark capture start
      var image = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo'
      })
      var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
      // console.log(response)
      // setImageData(response)
      var base64Img = await readFileToBase64(response.uri)
      setBase64ImageData(base64Img)
      setSelectedPanImage(true)
      setPanImageData(response)
    } catch (err) {
      console.error(err)
    }
    finally {
      isImageBeingCaptured = false
    }
    setShowSelectionModal(false)
  }


  const openImagePickerProfilePic = async () => {
    try {
      isImageBeingCaptured = true; // mark capture start
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
    finally {
      isImageBeingCaptured = false
    }
    setShowSelectionModal(false)
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
                <CustomButton title={translate('delete')} onPress={handleDeleteButtonPress} buttonBg={dynamicStyles.primaryColor} btnWidth={"90%"} titleTextColor={dynamicStyles.secondaryColor} />
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

  let uploadOfflineSYnc = async () => {
    if (networkStatus) {
      if (updatedOfflineCount == 0) return SimpleToast.show(translate("no_data_to_upload"))

      try {
        let isAsyncFailed;
        setLoading(true);
        setLoadingMessage(translate("syncingPlz"))

        // help desk
        const complaints = realm.objects('ComplaintData');
        console.log(complaints, "offline complaints list")
        if (complaints?.length > 0) {
          let checkHelpUploadStatus = await uploadAllComplaintsGlobal(complaints, dispatch)
          if (checkHelpUploadStatus) {
            isAsyncFailed = true
          }
        };

        // seed calc
        const seedCalcRes = realm.objects('SeedCalSubmit');
        console.log(seedCalcRes, "offline seedCalcRes list")
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
        console.log(yieldCalcRes, "offline yieldCalcRes list")
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
        console.log(offlineRetailerEntriesData, "offline offlineRetailerEntriesData list")
        getCropsListPlanningTool()
        getHybridsListPlanningTool()
        getCompaniesListPlanningTool()
        if (offlineRetailerEntriesData.length !== 0) {
          console.log('offline data exists so----------------------------- saving in online now', offlineRetailerEntriesData)
          let dataOfRetailerEntriesData = JSON.parse(offlineRetailerEntriesData[0]?.finalRetailerEntriesData);
          let checkPlanTool = await saveAPIPlanningTool(dataOfRetailerEntriesData, dispatch)
          if (checkPlanTool) {
            isAsyncFailed = true
          }
        }
        updateOfflineCount(dispatch)
      } finally {
        setTimeout(() => {
          setLoading(false);
          setLoadingMessage('');
        }, 10000);
      }

    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
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

  const isYouTubeLink = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
  };

  let greet = (new Date().getHours() >= 18)
    ? translate('GoodEvening')
    : (new Date().getHours() >= 12)
      ? translate('GoodAfternoon')
      : translate('GoodMorning')


  const dummyCalculatorData = [
    {
      id: 1,
      title: translate('FertilizerCalculator'),
      image: require('../../src/assets/images/fertilizerCalculator.png'),
    },
    {
      id: 2,
      title: translate('YieldCalculator'),
      image: require('../../src/assets/images/yieldCalculator.png'),
    },
    {
      id: 3,
      title: translate('SeedPopulationCalculator'),
      image: require('../../src/assets/images/seedPopulationCalculator.png'),
    }
  ]


  const renderUserMenu = (item, index) => {
    return (
      item?.showViewAll && <View style={[
        {
          width: "90%", alignSelf: "center", backgroundColor: "white", borderRadius: 15, elevation: 5, marginBottom: 10, padding: 10, paddingVertical: 12
        }]}>
        <Text style={[styles['font_size_14_bold'], { lineHeight: Platform.OS == 'android' ? 30 : 25, textAlign: "left", color: dynamicStyles.textColor, marginBottom: 3 }]}
          numberOfLines={1}>{translate(item?.displayName)}</Text>
        <View style={{
          width: "100%",
          // backgroundColor:"grey"
          marginTop: 5
        }}>
          <FlatList
            data={item?.servicesList.filter((tile, index) => tile?.visibility)}
            nestedScrollEnable={true}
            scrollEnabled={false}
            initialNumToRender={4}
            numColumns={4}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            renderItem={({ item, index }) => {
              return (
                <View key={index} style={{
                  width: width * 0.19,
                  height: responsiveHeight(15),
                  alignItems: "center",
                  justifyContent: "flex-start",
                  marginHorizontal: 3.5,
                }}>
                  <TouchableOpacity
                    onPress={() => onPressDashboardItem(item, index)}
                    style={{
                      height: height * 0.10,
                      width: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.03)",
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item?.status !== true && (
                      <Image
                        source={require('../assets/images/comingSoon.png')}
                        style={{
                          height: responsiveHeight(1),
                          width: '50%',
                          position: "absolute",
                          top: responsiveHeight(0.25),
                        }}
                      />
                    )}
                    <Image
                      source={item?.serviceImage}
                      style={{
                        height: responsiveHeight(5),
                        width: responsiveHeight(5),
                        resizeMode: "contain",
                      }}
                    />
                  </TouchableOpacity>

                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={[
                      styles['font_size_9_semibold'], {
                        color: item?.fontColor,
                        marginTop: 5,
                        textAlign: "center",
                        maxWidth: '100%',
                        minHeight: responsiveHeight(4.5),
                        maxHeight: responsiveHeight(5),
                      }]}
                  >
                    {translate(item?.translatedTitle)}
                  </Text>
                </View>
              )
            }}
            keyExtractor={(item, index) => `${item?.name}_${index}`}
            style={{ width: '100%' }}
            showsHorizontalScrollIndicator={false}
            mt={2}
          />
        </View>
      </View>
    )
  }

  const navigateMe = (item) => {
    switch (item.title) {
      case translate('YieldCalculator'):
        setCalculatorOptions(!calculatorOptions)
        navigation.navigate('YieldCalculator', { calcType: item.title })
        setSelectedCalc(null)
        break;
      case translate('FertilizerCalculator'):
        setCalculatorOptions(!calculatorOptions)
        navigation.navigate('FertilizerCalculator', { calcType: item.title })
        setSelectedCalc(null)
        break;
      case translate('SeedPopulationCalculator'):
        setCalculatorOptions(!calculatorOptions)
        navigation.navigate('SeedCalculator', { calcType: item.title })
        setSelectedCalc(null)
        break;

      default:
        break;
    }
  }

  const getPanModal = () => {
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
        <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], styles['padding_10'], { borderRadius: 8 }]}>
          <View style={[styles['width_100%'], { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={[styles['font_size_16_regular'], styles['top_5'], { color: dynamicStyles.textColor }]} >{translate('enterPanDetails')}</Text>
            <TouchableOpacity onPress={() => { setShowPanEntryModal(false), setPanImageData(null), setPanNumber("") }}><Image style={[styles['margin_left_20'], styles['width_height_30']]} source={require('../assets/images/closeWindow.png')}></Image></TouchableOpacity>
          </View>
          <View style={[styles['margin_top_20']]}>
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
              }}
              onEndEditing={event => {
                const upperCaseText = panNumber.toUpperCase();
                setPanNumber(upperCaseText);
              }}
            />
          </View>
          <View style={[styles['margin_top_20'], { flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
            <CustomButton title={translate('submit')} onPress={() => { handleRasiseRequest() }} buttonBg={dynamicStyles.primaryColor} btnWidth={'95%'} titleTextColor={dynamicStyles.secondaryColor} />
          </View>
        </View>
      </View>
    )
  }
  const getShowEditUI = () => {
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
        <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], { borderRadius: 8 }]}>
          <View style={[styles['width_100%'], styles['padding_10'], { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: dynamicStyles.primaryColor, borderRadius: 8 }]}>
            <Text style={[styles['width_80%'], styles['font_size_18_semibold'], { textAlign: 'left', color: dynamicStyles.secondaryColor }]} >{translate('KycDetails')}</Text>
            <TouchableOpacity style={[{ alignItems: "center", justifyContent: "center" }, styles['width_height_30']]} onPress={() => { setShowEdit(false) }}>
              <Image style={[{ resizeMode: 'contain', height: 30, width: 30 },]} source={require('../assets/images/closeWindow.png')} />
            </TouchableOpacity>
          </View>
          <View style={[styles['width_90%'], styles['align_self_center']]}>
            <View>
              {showApprovalDetails?.retailer?.proprietorName &&
                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('name')}</Text>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.retailer?.proprietorName}</Text>
                </View>
              }
              {showApprovalDetails?.retailerMobileNumber &&
                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('mobile_number')}</Text>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.retailerMobileNumber}</Text>
                </View>
              }
              {showApprovalDetails?.gstNumber &&
                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('gstNumber')}</Text>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.gstNumber}</Text>
                </View>
              }
              {showApprovalDetails?.panNumber &&
                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('panNumber')}</Text>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.panNumber}</Text>
                </View>
              }
              {showApprovalDetails?.seedLicenseNumber &&
                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('seedLicenseNumber')}</Text>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.seedLicenseNumber}</Text>
                </View>
              }
              {showApprovalDetails?.ekycStatus &&
                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                  <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('status')}</Text>
                  <Text style={[styles['text_align_left'], styles['font_size_16_regular'], { width: '55%' }, showApprovalDetails?.ekycStatus === 'Approved' ? { color: 'rgba(0, 159, 74, 1)' } : { color: dynamicStyles.textColor }]}>: {showApprovalDetails?.ekycStatus}</Text>
                </View>
              }
            </View>
            {showApprovalDetails?.panImage &&
              <View style={[styles['margin_bottom_10']]}>
                <Image source={{ uri: showApprovalDetails?.panImage }} style={[styles['align_self_center'], styles['margin_top_10'], { height: 200, width: 250, resizeMode: 'cover', borderRadius: 5 }]} />
              </View>
            }
            <View style={[styles['flex_direction_row'], styles['align_self_center']]}>
              <CustomButton title={translate('editOnly')} onPress={() => {
                setShowEdit(false)
                navigation.navigate('KYC', {
                  ekycStatus: ekycStatus
                })
              }} buttonBg={dynamicStyles.primaryColor} btnWidth={'50%'} titleTextColor={dynamicStyles.secondaryColor} />
              <CustomButton title={translate('continue')} onPress={() => handleContinue()} buttonBg={dynamicStyles.primaryColor} btnWidth={'50%'} titleTextColor={dynamicStyles.secondaryColor} />

            </View>
          </View>
        </View>
      </View>
    )
  }
  const renderWeatherCard = () => {
    return (
      <TouchableOpacity onPress={() => { cloudBtnClicked() }} activeOpacity={0.5} style={stylesheetStyles.container}>
        <View style={stylesheetStyles.tempContainer}>
          {weatherInfo?.max_temp ? (
            <View style={stylesheetStyles.tempWrapper}>
              <Text style={[styles['font_size_34_semibold'], { color: dynamicStyles.textColor }]}>
                {Math.round(weatherInfo?.max_temp)}
              </Text>
              <Text style={[stylesheetStyles.degreeText, { color: dynamicStyles.textColor }, styles['font_size_12_regular']]}>{"°c"}</Text>
            </View>
          ) : (
            <Text style={[styles['font_size_34_semibold'], { color: dynamicStyles.textColor }]}>
              {'--'}
            </Text>
          )}

          <View style={stylesheetStyles.rangeContainer}>
            {weatherInfo?.max_temp ? (
              <View style={stylesheetStyles.tempWrapper}>
                <Text style={[stylesheetStyles.rangeText, styles['font_size_13_regular'], Platform.OS === 'ios' && { lineHeight: 25 }]}>
                  {`${translate('High')} ${Math.round(weatherInfo?.max_temp)}`}
                </Text>
                <Text style={[stylesheetStyles.degree2Text, styles['font_size_13_regular']]}>{"°"}</Text>
              </View>
            ) : (
              <Text style={[stylesheetStyles.rangeText, styles['font_size_34_semibold']]}>
                {'--'}
              </Text>
            )}
            {weatherInfo?.min_temp ? (
              <View style={stylesheetStyles.tempWrapper}>
                <Text style={[stylesheetStyles.rangeText, styles['font_size_13_regular'], Platform.OS === 'ios' && { lineHeight: 25 }]}>
                  {`${translate('Low')} ${Math.round(weatherInfo?.min_temp)}`}
                </Text>
                <Text style={[stylesheetStyles.degree2Text, styles['font_size_13_regular']]}>{"°"}</Text>
              </View>
            ) : (
              <Text style={[styles['font_size_34_semibold'], { color: '#d3d3d3' }]}>
                {'--'}
              </Text>
            )}
          </View>
        </View>
        <View style={stylesheetStyles.divider} />

        <View style={stylesheetStyles.iconContainer}>
          <Image source={{ uri: weatherInfo?.image }} style={stylesheetStyles.weatherIcon} />
          <View>
            <View style={stylesheetStyles.locationContainer}>
              <Image source={require('../../src/assets/images/weatherScreen/locationImg.png')} style={stylesheetStyles.locationIcon} />
              <Text numberOfLines={1} ellipsizeMode='tail'
                style={[stylesheetStyles.locationText, styles['font_size_12_semibold'], { color: dynamicStyles.textColor }]}>
                {(weatherInfo?.city) || '--'}
              </Text>
            </View>
            <View style={stylesheetStyles.weatherDescription}>
              <Text style={[stylesheetStyles.weatherDescText, styles['font_size_12_semibold']]}>
                {weatherInfo?.weather_description || "--"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Capture manual scroll
  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(offsetX / itemWidth);
    setCurrentIndex(index); // update with manual scroll
    setIsManual(true);

    // Resume auto scroll after short delay
    setTimeout(() => setIsManual(false), 5000); // 👈 resume auto after 5s
  };

  const renderCarouseItem = ({ item, index }) => {
    return (
      <View>
        {item?.fileName?.length > 0 &&
          item?.fileName?.[0]?.imageUrl &&
          typeof item?.fileName?.[0]?.imageUrl === "string" && (
            <View
              style={[
                styleOfSheet.card,
                index === carouselData?.length - 1 && { marginRight: 15 },
              ]}
            >
              <Image
                source={
                  item.fileName[0].imageUrl.startsWith("http")
                    ? { uri: item.fileName[0].imageUrl }
                    : { uri: "file://" + item.fileName[0].imageUrl }
                }
                style={styleOfSheet.image}
              />

              {item?.buttonEnable && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(item?.navigationTo, { data: item })
                  }
                  activeOpacity={0.5}
                  style={[
                    styleOfSheet.button,
                    { backgroundColor: dynamicStyles.primaryColor },
                  ]}
                >
                  <Text
                    style={[
                      styleOfSheet.buttonText,
                      { color: dynamicStyles.secondaryColor },
                      styles["font_size_10_bold"],
                    ]}
                  >
                    {item?.buttonName}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
      </View>

    );
  };

  const getCarouselUi = () => {
    return (
      <FlatList
        ref={flatListRef}
        data={carouselData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCarouseItem}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    )
  }

  const getUserMenUCOntrollerUI = () => {
    return (
      <View style={{
        position: "relative",
        alignSelf: "center",
        width: responsiveWidth(100),
        paddingBottom: (weatherIsVisible && weatherInfo) ? 120 : 20,
        paddingTop: (weatherIsVisible && weatherInfo) ? 20 : 10
      }}>
        {(homePageData !== null && homePageData?.length > 0) && <FlatList
          style={{ marginBottom: 10 }}
          data={homePageData}
          initialNumToRender={4}
          nestedScrollEnable={true}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={carouselData?.length > 0 ? getCarouselUi() : null}
          ListHeaderComponentStyle={carouselData?.length > 0 ? { marginBottom: responsiveHeight(2) } : {}}
          ListFooterComponent={

            <View style={{ height: (weatherIsVisible && weatherInfo) ? 10 : 50 }} />
          }
          windowSize={5}
          renderItem={({ item, index }) => renderUserMenu(item, index)}
          keyExtractor={(item, index) => `${item?.id || index}`}
        />}
      </View>
    )
  }
  const tabBarUI = () => {
    return (
      <View style={styleOfSheet.tabBar}>
        <TouchableOpacity
          style={styleOfSheet.iconTouch}
          onPress={() => { }}>
          <Image source={
            require('../assets/images/tabBar/tabOne.png')
          } style={[styleOfSheet.iconn, { tintColor: dynamicStyles.iconPrimaryColor }]} />
          <Text style={[styleOfSheet.tabLabel, styles['font_size_10_regular'], { color: dynamicStyles.iconPrimaryColor }]}>
            {translate('Home')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styleOfSheet.iconTouch}
          onPress={() => {
            SimpleToast.show(translate('feature_not_available'))
          }}>
          <Image source={
            require('../assets/images/tabBar/tabTwo.png')
          } style={[styleOfSheet.iconn, { tintColor: dynamicStyles.iconPrimaryColor }]} />
          <Text style={[styleOfSheet.tabLabel, styles['font_size_10_regular'], { color: dynamicStyles.iconPrimaryColor, maxWidth: 80, }]}>
            {translate('Buy')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={requestPermissions}
          style={[styleOfSheet.scanButton, {
            backgroundColor: dynamicStyles.primaryColor,
          }]}>
          <Image source={
            require('../assets/images/tabBar/scan.png')
          } style={[styleOfSheet.iconn, { tintColor: dynamicStyles.secondaryColor }]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styleOfSheet.iconTouch}
          onPress={() => navigation.navigate('FAQ')}>
          <Image source={
            require('../assets/images/tabBar/tabThree.png')
          } style={[styleOfSheet.iconn, { tintColor: dynamicStyles.iconPrimaryColor }]} />
          <Text style={[styleOfSheet.tabLabel, styles['font_size_10_regular'], { color: dynamicStyles.iconPrimaryColor }]}>
            {translate('FAQ')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styleOfSheet.iconTouch}
          onPress={() => navigation.navigate('HelpDesk')}>
          <Image source={
            require('../assets/images/tabBar/tabFour.png')
          } style={styleOfSheet.iconn3} />
          <Text style={[styleOfSheet.tabLabel, styles['font_size_10_regular'], { color: dynamicStyles.iconPrimaryColor }]}>
            {translate('HelpDesk')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  const renderCOINSRow = () => {
    return (
      <View style={[styles['flex_direction_row'], styles['width_90%'], styles['margin_top_60'], styles['border_radius_6'], styles['centerItems'], styles['space_between'], styles['left_5']]}>
        <TouchableOpacity
          disabled={pointsLoader}
          style={[styles['flex_direction_row'], styles['width_48%'], styles['height_65'], styles['bg_white'], styles['border_radius_6'], styles['centerItems']]}
          onPress={() => {
            navigation.navigate('Points', { userPointsEarned: userPointsEarned, type: 'total' })
          }}
        >
          <TouchableOpacity style={[{ position: "absolute", right: 5, top: 5, zIndex: 10000 }]} onPress={() => {
            if (networkStatus) {
              refreshData()
            } else {
              SimpleToast.show(translate('no_internet_conneccted'));
            }
          }}>
            <Image style={[{ tintColor: dynamicStyles.primaryColor, height: 30, width: 30 }]} source={require('../assets/images/dataRefresh.png')} resizeMode='contain'></Image>
          </TouchableOpacity>
          <Image style={[styles['width_height_40']]} source={require('../assets/images/points_img.png')}></Image>
          <View style={[styles['flex_direction_column'], { width: '65%' }]}>
            {!(userImage != undefined && userImage != null) || pointsLoader ? <ActivityIndicator style={[{ alignItems: "center", justifyContent: "flex-start", alignSelf: "flex-start", left: 10 }, styles['top_5'],]} size={'small'} color={dynamicStyles.iconPrimaryColor} /> : <Text style={[styles['font_size_16_bold'], styles['text_color_black'], styles['text_align_left'], styles['left_7'], styles['width_100%'], styles['top_5'], { color: dynamicStyles.textColor }]}>{userPointsEarned}</Text>}
            <Text style={[styles['font_size_10_regular'], styles['text_color_black'], styles['text_align_left'], styles['left_7'], styles['top_5'], { color: dynamicStyles.textColor }, Platform.OS === 'ios' && { lineHeight: 25 }]}>{translate('total_reward_points')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          // disabled={true}
          disabled={pointsLoader}
          activeOpacity={0.5} style={[styles['flex_direction_row'], styles['width_48%'], styles['height_65'], styles['bg_white'], styles['border_radius_6'], styles['centerItems']]} onPress={() => {
            // navigation.navigate('Points', { userPointsEarned: userPointsReedemed, type: 'redeem' }) // add this if we need to nav to points page using redeem btn
            if (networkStatus) {
              if (userPointsReedemed == 0) {
                SimpleToast.show(translate('you_dont_have_sufficient_balance'))
                return
              }
              setShowCustomActionSheet(true)
            } else {
              SimpleToast.show(translate('no_internet_conneccted'));
            }
          }}>
          <Image style={[styles['width_height_40']]} source={require('../assets/images/redeem_points_icon.png')}></Image>
          <View style={[styles['flex_direction_column'], { width: '65%' }]}>
            {!(userImage != undefined && userImage != null) || pointsLoader ? <ActivityIndicator style={[{ alignItems: "center", justifyContent: "flex-start", alignSelf: "flex-start", left: 10 }, styles['top_5'],]} size={'small'} color={dynamicStyles.iconPrimaryColor} /> : <Text style={[styles['font_size_16_bold'], , styles['text_color_black'], styles['text_align_left'], styles['left_7'], styles['width_100%'], styles['top_5'], { color: dynamicStyles.textColor }]}>{userPointsReedemed}</Text>}
            <Text style={[styles['font_size_10_regular'], styles['text_color_black'], styles['text_align_left'], styles['left_7'], {
            }, styles['top_5'], { color: dynamicStyles.textColor }]}>{translate('redeemable_points')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  const headerSec = () => {
    return (
      <View style={[{ borderBottomEndRadius: 25, borderBottomStartRadius: 25, overflow: 'hidden', width: '100%', height: Dimensions.get('window').height / 2.7, position: 'absolute', top: 0 }]}>
        <ImageBackground style={[{ height: '100%', width: Dimensions.get('window').width, backgroundColor: dynamicStyles.primaryColor }]}>
          <Image source={require('../../src/assets/images/leaaafImg.png')} style={stylesheetStyles.leafHome} />
          <Image source={require('../../src/assets/images/leaffafhb.png')} style={stylesheetStyles.leftLeaf} />
          <View style={{ height: 150, width: 150, backgroundColor: "white", borderRadius: 100, alignItems: "center", justifyContent: "flex-end", alignSelf: "center", position: "absolute", top: -100 }}>
            <Image source={
              require('../assets/images/newAppIcon.png')
            } style={[{ height: 50, width: 50, marginTop: 60 }]} resizeMode='contain' />
          </View>
          <View style={[styles['flex_direction_row'],
          (styles['padding_top_10']), styles['width_90%'],
          styles['align_self_center'], styles['border_radius_6']]}>
            <TouchableOpacity style={[]} onPress={() => { profileButtonPress() }}>
              {
                networkStatus ? <CustomCircularImageView
                  onPressImageClick={() => { profileButtonPress() }}
                  style={[{ height: 30, width: 30 }]}
                  source={(userImage != undefined && userImage != null) ? (userImage.toString().includes("https:") || userImage.toString().includes("http:")) ? { uri: userImage } : require('../assets/images/profileIcon.png') : require('../assets/images/profileIcon.png')}
                  size={30}
                  badgeIcon={badgeIcon}
                  stylesOfBadge={{ height: 30, width: 30, resizeMode: "contain", position: "absolute", bottom: -responsiveWidth(2.5), left: responsiveWidth(3) }}
                  height={35} />
                  : <CustomCircularImageView
                    onPressImageClick={() => { profileButtonPress() }}
                    style={[{ height: 30, width: 30 }]}
                    source={
                      userImage && typeof userImage === 'string' && userImage.trim().length > 0
                        ? userImage.startsWith('http') || userImage.startsWith('https')
                          ? { uri: userImage }
                          : { uri: 'file://' + userImage.trim() }
                        : require('../assets/images/profileIcon.png')
                    }
                    size={30}
                    badgeIcon={badgeIcon}
                    stylesOfBadge={{ height: 30, width: 30, resizeMode: "contain", position: "absolute", bottom: -responsiveWidth(2.5), left: responsiveWidth(3) }}
                    height={35} />
              }
            </TouchableOpacity>
            {showVideoModal && showVideoPlayer()}
            <View style={[styles['flex_direction_column'], styles['centerItems'], { marginLeft: 2 }]}>
              <TouchableOpacity onPress={() => { profileButtonPress() }}>
                <Text style={[styles['font_size_8_regular'], styles['text_align_left'], { color: dynamicStyles.secondaryColor }]}>{greet}</Text>
                <Text style={[styles['font_size_10_semibold'], styles['text_align_left'], { width: 80, color: dynamicStyles.secondaryColor }]}
                  numberOfLines={2}
                  ellipsizeMode="tail">{`${userName != null ? userName : ''}`}</Text>
                {(roleType != 'Retailer' && roleType != 'Distributor') &&
                  <View style={[styles['flex_direction_row']]}>
                    <Text style={[styles['font_size_10_regular'], styles['text_color_white'], styles['text_align_left'], styles['left_5']]}>
                      {dashboardDataCopy?.userList?.[0]?.roleBased != undefined && dashboardDataCopy?.userList?.[0]?.roleBased != null ? dashboardDataCopy?.userList?.[0]?.roleBased : ""}
                    </Text>
                  </View>
                }
              </TouchableOpacity>
            </View>
            {
              (notificationCount != undefined && notificationCount != null && notificationCount != "") &&
              <View style={stylesheetStyles.circle} />
            }

            <View style={[styles['align_self_center'], styles['right_0'], styles['absolute_position'], styles['flex_direction_row'], { top: Platform.OS == 'android' ? -25 : 0 }]}>
              <TouchableOpacity
                onPress={() => {
                  if (!hideSyncBtn) {
                    uploadOfflineSYnc()
                  } else {
                    console.log("it is not calling")
                  }
                }}
                style={{
                  marginTop: Platform.OS == "ios" ? 15 : 35
                }}
              >
                <View>
                  <Image
                    source={require('../assets/images/upload.png')}
                    style={{ height: 30, width: 30, tintColor: dynamicStyles.secondaryColor }}
                  />

                  <View
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: 'red',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={[{ color: 'white', textAlign: 'center' }, styles['font_size_10_bold']]}>
                      {updatedOfflineCount}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles['flex_direction_row'], { marginTop: Platform.OS == 'ios' ? 15 : 35, marginLeft: 20 }]} onPress={() => { notificationBtnClicked() }}>
                <Image style={[styles['width_height_25'], { tintColor: dynamicStyles.secondaryColor }]} source={require('../assets/images/notification.png')} resizeMode='contain'></Image>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    )
  }
  const renderPANUpdatePopUp = () => {
    return (
      <Modal
        transparent
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{
            flex: 1,
            backgroundColor: "#000000d6",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <View style={[
              styles['bg_white'],
              styles['width_85%'],
              styles['border_radius_5'],
              { padding: 16, alignItems: 'center', justifyContent: 'center' }
            ]}>
              {!kycDetailsMandatory && (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    backgroundColor: dynamicStyles.primaryColor,
                    alignItems: "center",
                    justifyContent: "center",
                    height: 25,
                    width: 25,
                    borderRadius: 12.5,
                    zIndex: 10
                  }}
                  onPress={() => setkycDetailsPopUp(false)}>
                  <Image
                    style={{ width: 15, height: 15, tintColor: '#FFFFFF' }}
                    source={require('../assets/images/crossMark.png')}
                  />
                </TouchableOpacity>
              )}

              <RenderHTML
                contentWidth={Dimensions.get('window').width * 0.8}
                source={{ html: htmlcontent }}
                enableCSSInlineProcessing={true}
              // tagsStyles={{
              //   div: { textAlign: 'center', alignItems: 'center' },
              //   h2: { fontWeight: 'bold', color: '#000' },
              //   p: { fontSize: 13, color: '#000', marginTop: 6 },
              //   img: { alignSelf: 'center' }
              // }}
              />

              <CustomButton
                title={translate('proceed_btn_ttile')}
                onPress={() => {
                  setkycDetailsPopUp(false);
                  navigation.navigate('KYC', { ekycStatus: ekycStatus });
                }}
                buttonBg={dynamicStyles.primaryColor}
                btnWidth={'95%'}
                titleTextColor={dynamicStyles.secondaryColor}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      <View style={[styles['full_screen'], styles['bg_light_grey_color']]}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
        {headerSec()}
        {renderCOINSRow()}
        <View style={[{ marginTop: 5, position: 'relative', flex: 1 }]}>
          {weatherIsVisible && weatherInfo && renderWeatherCard()}
          {getUserMenUCOntrollerUI()}
        </View>
        {kycDetailsPopUp && routeName == 'RetailerDashboard' && renderPANUpdatePopUp()}
        {!isKeyboardVisible && tabBarUI()}
        {calculatorOptions && renderCalculatorOptions()}
        {showDetailViewModal && showDetailViewSection()}
        {showLinkModal == true && showLinkALert()}
        {showLinkModalRedeem == true && showLinkALertRedeem()}
        {showDropDowns && <CustomListViewModal dropDownType={dropDownType} listItems={dropDownData} selectedItem={selectedDropDownItem} onSelectedState={(item) => onSelectedState(item)} onSelectedDistrict={(item) => onSelectedDistrict(item)} closeModal={() => setShowDropDowns(false)} />}
        {showPanEntryModal && getPanModal()}
        {showAlert && <CustomAlert onPressClose={() => { handleCancelAlert() }} title={alertTitle} showHeader={showAlertHeader} showHeaderText={showAlertHeaderText} message={alertMessage} onPressOkButton={() => { handleOkAlert() }} onPressNoButton={() => { handleCancelAlert() }} showYesButton={showAlertYesButton} showNoButton={showAlertNoButton} yesButtonText={showAlertyesButtonText} noButtonText={showAlertNoButtonText} />}
        {showEdit && getShowEditUI()}
        <CustomGalleryPopup showOrNot={showSelectionModal} onPressingOut={() => setShowSelectionModal(false)} onPressingCamera={() => openCameraProfilePic()} onPressingGallery={() => openImagePickerProfilePic()} />
        {showCustomActionSheet && CustomActionSheet()}
        {isModalVisible && showUploadedImage()}
        {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
        {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}

      </View>
    </SafeAreaView>
  )

}
const stylesheetStyles = StyleSheet.create({
  title: {
    width: '50%',
    color: "rgba(255, 255, 255, 1)",
    position: "absolute"
  },
  circle: {
    height: 10,
    width: 10,
    borderRadius: 100,
    backgroundColor: "rgba(0, 177, 122, 1)",
    position: "absolute",
    right: 0,
    top: 12,
    zIndex: 100,
  },
  leafHome: {
    height: 250,
    width: 250,
    resizeMode: "contain",
    position: "absolute",
    right: -60,
    // tintColor:"transparent"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: responsiveHeight(10),
    width: "90%",
    backgroundColor: "white",
    alignSelf: "center",
    borderRadius: 10,
    marginVertical: 15,
    paddingHorizontal: 10,
    elevation: 5
  },
  tempContainer: {
    width: "40%"
  },
  tempWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: Platform.OS === 'ios' ? 0 : 0,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginLeft: 10
  },
  tempText: { marginHorizontal: 5 },
  degreeText: { marginLeft: 2 },
  weatherIcon: { width: 50, height: 50, resizeMode: "contain", marginLeft: 2, marginRight: 10 },
  weatherDescription: { marginLeft: 5, marginTop: 1 },
  weatherDescText: { color: 'rgba(255, 181, 1, 1)', textTransform: 'capitalize', marginEnd: 5 },
  leftLeaf: {
    height: 200,
    width: 200,
    resizeMode: "contain",
    position: "absolute",
    left: -40,
  },
  divider: { width: 1, height: '60%', backgroundColor: '#d3d3d3', marginLeft: 5 },
  degree2Text: { color: '#d3d3d3', marginTop: -5 },
  rangeText: { color: '#d3d3d3' },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { width: 20, height: 20, resizeMode: "contain" },
  locationText: { marginLeft: 5, width: '70%' },
});
let styleOfSheet = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  dabba: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.03)",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    height: 80,
    width: 80,
    // alignSelf: "center",
    // padding: 20,
    borderRadius: 10,
    // marginVertical: 10
  },
  modalText: {
    textAlign: "center",
    color: "rgba(0, 0, 0, 1)",
  },
  modalView: {
    // height: responsiveHeight(50),
    width: responsiveWidth(100),
    // margin: 20,
    backgroundColor: 'white',
    // borderTopRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    marginTop: "auto"
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#000000d6"
  },
  iconn: { height: 25, width: 25, resizeMode: "contain" },
  iconn2: { height: 20, width: 20, resizeMode: "contain" },
  iconn3: { height: 20, width: 50, resizeMode: "contain" },
  makeCen: { alignItems: "center", justifyContent: "center" },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Platform.OS == 'android' ? "white" : '#F8F8F8',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  iconTouch: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 70,
  },
  iconn: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  iconn3: {
    height: 20,
    width: 50,
    resizeMode: 'contain',
  },
  tabLabel: {
    color: '#f28c38',
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    height: 60,
    width: 60,
    position: 'relative',
    top: -40,
  },
  card: {
    width: width * 0.85,
    height: height * 0.185,
    borderRadius: 15,
    overflow: "hidden",
    marginLeft: 15,
    // marginBottom:5,
    // elevation: 5,
    // backgroundColor:"white",
  },
  image: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    position: "relative",
    // backgroundColor: 'rgba(52, 52, 52, 0.8)',
  },
  imageStyle: {
    borderRadius: 15,
  },
  button: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 15,
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  buttonText: {
    color: Platform.OS == 'android' ? "white" : "#fff",
  },
})
export default RetailerDashboard;