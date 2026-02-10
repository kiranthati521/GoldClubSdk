import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, Linking, Keyboard, TouchableOpacity, Modal, ImageBackground, Dimensions, Alert, PermissionsAndroid, TextInput, requireNativeComponent, NativeEventEmitter, NativeModules, StyleSheet } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import CustomButton from '../Components/CustomButton';
import RenderHTML from 'react-native-render-html'
import { Colors } from '../assets/Utils/Color';
import { DEVICE_TOKEN, LOGINONCE, MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, SELECTEDCOMPANY, USERMENU, USER_ID, USER_NAME, downloadFileToLocal, filterObjects, retrieveData, sortObjectsAlphabetically, storeData } from '../assets/Utils/Utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import CustomBorderInputDropDown from '../Components/CustomBorderInputDropDown';
import { GetApiHeaders, GetRequest, PostRequest, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { APP_ENV_PROD, HTTP_OK, MAP_MY_INDIA_KEY, MAP_MY_INDIA_URL, configs } from '../helpers/URLConstants';
import CustomListViewModal from '../Modals/CustomListViewModal';
import SimpleToast from 'react-native-simple-toast';
import { WebView } from 'react-native-webview';
import CustomBorderTextInput from '../Components/CustomBorderTextInput';
import { useDispatch, useSelector } from 'react-redux';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import CustomSuccessLoaderDefault from '../Components/CustomSuccessLoaderDefault';
import CustomErrorLoaderDefault from '../Components/CustomErrorLoaderDefault';
import CustomLoaderDefault from '../Components/CustomLoaderDefault';
import CustomAlertDefault from '../Components/CustomAlertDefault';
import { setUser } from '../redux/store/slices/UserSlice';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import axios from 'axios';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { translate } from '../Localisation/Localisation';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { createStyles } from '../assets/style/createStyles';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Geolocation from 'react-native-geolocation-service';
import { setLocation } from '../redux/store/slices/locationSlice';
var styles = BuildStyleOverwrite(Styles);


function SignUp({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  console.log('rrrrr', route?.params?.loaderPath);

  // const MapplsMapView = requireNativeComponent("MapplsMapView");
  const dispatch = useDispatch();
  const networkStatus = useSelector(state => state.networkStatus.value)
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  let [roleNameNav, setRoleNameNav] = useState('')
  let [loaderFile, setLoaderFile] = useState('')
  const [loginMobileNumber, setLoginMobileNumber] = useState(route?.params?.loginMobileNumber)
  const [companyLogo, setCompanyLogo] = useState(route?.params?.companyLogo != undefined ? route?.params?.companyLogo : '');
  const [HighLightedColor, setHighLightedColor] = useState(route?.params?.selectedCompany?.HighLightedColor != undefined ? route.params.selectedCompany?.HighLightedColor : Colors.highlightColor)
  const [iconPrimaryColor, setIconPrimaryColor] = useState(route?.params?.selectedCompany?.iconPrimaryColor != undefined ? route.params.selectedCompany?.iconPrimaryColor : Colors.highlightColor)
  const [primaryColor, setPrimaryColor] = useState(route?.params?.selectedCompany?.primaryColor != undefined ? route.params.selectedCompany?.primaryColor : Colors.purple)
  const [secondaryColor, setSecondaryColor] = useState(route?.params?.selectedCompany?.secondaryColor != undefined ? route.params.selectedCompany?.secondaryColor : Colors.white)
  const [textColor, setTextColor] = useState(route?.params?.selectedCompany?.textColor != undefined ? route.params.selectedCompany?.textColor : Colors.black)
  const navigation = useNavigation()

  const [showAlert, setShowAlert] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
  const [proprietorName, setProprietorName] = useState('')
  const [firmName, setFirmName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [state, setState] = useState('')
  const [stateID, setStateID] = useState('')
  const [district, setDistrict] = useState('')
  const [districtID, setDistrictID] = useState('')
  const [tm, setTM] = useState('')
  const [tmID, setTMID] = useState('')
  const [mdo, setMDO] = useState('')
  const [mdoID, setMDOID] = useState('')
  const [landMark, setLandMark] = useState('')
  const [village, setVillage] = useState('')
  const [pincode, setPincode] = useState('')
  const [stateName, setStateName] = useState('')
  const [DistrictName, setDistrictName] = useState('')
  const [address, setAddress] = useState('')
  const [longitude, setLongitude] = useState('')
  const [fetchLocation, setFetchLocation] = useState(false)
  const [latitude, setLatitude] = useState('')
  const [block, setBlock] = useState('')
  const [role, setRole] = useState('')
  const [roleID, setRoleID] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationId, setLocationId] = useState('')
  const [roleList, setRoleList] = useState()
  const [stateList, setStateList] = useState()
  const [filteredStateList, setFilteredStateList] = useState([]);
  const [districtListOriginal, setDistrictListOriginal] = useState()
  const [districtList, setDistrictList] = useState()
  const [filteredDistrictList, setFilteredDistrictList] = useState([]);
  const [tmList, setTMList] = useState()
  const [mdoList, setMDOList] = useState()
  const [dropDownData, setdropDownData] = useState();
  const [showDropDowns, setShowDropDowns] = useState(false)
  const [dropDownType, setDropDownType] = useState("");
  const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
  const [showWebView, setShowWebView] = useState(false)
  const [termsConditionsAccepted, setTermsConditionsAccepted] = useState(true)
  const firmNameRef = useRef(null);
  const propriatorNameRef = useRef(null);
  const mobileNumberRef = useRef(null);
  const addressRef = useRef(null);
  const landMarkRef = useRef(null);
  const villageRef = useRef(null);
  const stateRef = useRef(null);
  const districtRef = useRef(null);
  const tashilBlockRef = useRef(null);
  const pincodeRef = useRef(null);
  const [showCustomActionSheet, setShowCustomActionSheet] = useState(false)
  const [bonusMessage, setBonusMessage] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const screenWidth = Dimensions.get('window').width;
  const spacing = 4.4;
  const secondListcolumnCount = 5;
  const secondCardWidth = (screenWidth - spacing * (secondListcolumnCount + 1)) / secondListcolumnCount;

  const [selectedCompany, setSelectedCompany] = useState(route?.params?.selectedCompany != undefined ? route.params.selectedCompany : {});

  const [locationsList, setLocationsList] = useState([])
  const [selectedCompanyCode, setSelectedCompanyCode] = useState('');
  const [villageName, setVillageName] = useState();
  const [coordinates, setCoordinates] = useState(null);
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [mapZoomingLevel, setMapZoomingLevel] = useState(18)
  const { latti, longi } = useSelector((state) => state.location);
  const [btnVisibility, setBtnVisibility] = useState(true)
  const [isComingFromMap, setIsComingFromMap] = useState(false)
  // const route = useRoute();

  useFocusEffect(
    React.useCallback(() => {
      console.log('screen focused')
      console.log(route.params)
      if (route?.params?.latitudes) {
        const { latitudes, longitudes, address, zoom } = route?.params;
        setLatitude(latitudes);
        setLongitude(longitudes);

        setAddress(address);
        setMapZoomingLevel(zoom);
        setIsComingFromMap(true)
        console.log(latitude, longitude, 'latitude,longitudelatitude,longitude', address, "addresss")
        getDetailsFromLatlong(route?.params?.latitudes, route?.params?.longitudes);
      }
    }, [route?.params])
  );

  useEffect(() => {
    if (latitude && longitude && fetchLocation) {
      setLoaderFile(route?.params?.loaderPath ? route?.params?.loaderPath : loaderFile)
      navigation.navigate('Location', { primaryColor: primaryColor, secondaryColor: secondaryColor, textColor: textColor, screen: "SignUp", address: address, latitude: latitude, longitude: longitude, loaderPath: route?.params?.loaderPath, zoom: mapZoomingLevel })
      setFetchLocation(false)
    }
  }, [latitude, longitude, fetchLocation])

  const navigateToMap = (lat, long) => {
    setLoaderFile(route?.params?.loaderPath ?? loaderFile);

    navigation.navigate("Location", {
      primaryColor,
      secondaryColor,
      textColor,
      screen: "SignUp",
      address,
      latitude: lat,
      longitude: long,
      loaderPath: route?.params?.loaderPath,
      zoom: mapZoomingLevel
    });
  };

  useEffect(() => {
    if (latti && longi) {
      setLatitude(latti);
      setLongitude(longi);
    }
  }, [latti, longi])


  const handleLoading = () => {
    setLoading(false);
  }

  const checkIfGpsEnabled = async () => {
    if (Platform.OS === "android") {
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
    }
    else {
      try {
        const authStatus = await Geolocation.requestAuthorization('whenInUse');

        if (authStatus === 'granted' || authStatus === 'always') {
          // ✅ On iOS, permission = OK
          return true;
        }

        Alert.alert(
          "Permission Denied",
          "Location permission is required. Please enable it in Settings.",
          [{ text: "Open Settings", onPress: () => Linking.openSettings() }]
        );
        return false;

      } catch (err) {
        console.error("iOS location permission error:", err);
        return false;
      }
    }

  };

  const handleLocation = async () => {

    const hasPermission = await requestLocationPermission();
    console.log("hasPermission", hasPermission)
    if (!hasPermission) {
      console.log("Location permission not granted");
      return; // stop here if permission not granted
    }

    // Next, check if GPS is enabled
    const isGpsEnabled = await checkIfGpsEnabled();
    console.log("isGpsEnabled", isGpsEnabled)
    if (!isGpsEnabled) {
      console.log("GPS not enabled");
      return; // stop if GPS is not enabled
    }

    if (latitude && longitude) {
      navigateToMap(latitude, longitude);
      return;
    }

    if (latti && longi) {
      navigateToMap(latti, longi);
      return;
    }

    await GetUserLocation("MAP")
  }

  useEffect(() => {
    handleLoading();
  }, [])


  useEffect(() => {
    setLoading(false)
    setLoadingMessage()
  }, [])

  useEffect(() => {
    // setShowWebView(true)
    GetAllLocationsList()
    // getDetailsFromLatlong()
  }, [])

  useEffect(() => {
    if (networkStatus) {
      GetMastersApiCall()
    }

  }, [districtID])
  useEffect(() => {

    setTimeout(() => {
      setLoadingMessage()
      setLoading(false)

    }, 2000);

  }, [])

  useEffect(() => {
    const init = async () => {
      await requestLocationPermission();
      await checkIfGpsEnabled();
    }
    init()
  }, []);

  async function requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: translate("Location_Permission"),
            message: translate("need_to_access"),
            buttonNeutral: translate("storagePermissionNeutral"),
            buttonNegative: translate("storagePermissionNegative"),
            buttonPositive: translate("storagePermissionPositive"),
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission granted");
          return true;
        } else {
          console.log("Location permission denied");
          showPermissionDeniedAlert();
          return false;
        }
      }
      else {
        const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

        if (permission === RESULTS.GRANTED) {
          console.log("✅ iOS location permission granted");
          return true;
        } else {
          console.log("❌ iOS location permission denied");
          showPermissionDeniedAlert();
          return false;
        }
      }

    } catch (err) {
      console.warn("requestLocationPermission error:", err);
      return false;
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

  let setValues = (latitude, longitude) => {
    setLatitude(latitude);
    setLongitude(longitude);
    setFetchLocation(true)
  }
  const GetUserLocation = async (flag) => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const isGpsEnabled = await checkIfGpsEnabled();
      console.log("isGpsEnabled", isGpsEnabled);
      if (!isGpsEnabled) return;

      // ✔ Already have saved location
      if (latti && longi) {
        setLatitude(latti);
        setLongitude(longi);
        if (flag === "MAP") setFetchLocation(true);
        Platform.OS == 'ios' && setValues(latti, longi)
        console.log("SignUp Location:", latti, longi);
        dispatch(setLocation({ latti, longi }));
        return;
      }

      setLoading(true);

      // ----------- FAST LOCATION (NON-ACCURATE) -----------
      const fastOptions = {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 10000,
      };

      const gpsOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
      };

      // TRY FAST FIRST
      Geolocation.getCurrentPosition(
        async (pos) => {
          setLoading(false);
          const { latitude, longitude } = pos.coords;

          setLatitude(latitude);
          setLongitude(longitude);

          if (flag === "MAP") setFetchLocation(true);
          Platform.OS == 'ios' && setValues(latitude, longitude)
          console.log("FAST LOCATION", latitude, longitude);
          dispatch(setLocation({ latitude, longitude }));
        },
        // FAST FAILED → try GPS
        async (err1) => {
          console.log("FAST FAILED → Trying GPS", err1);

          Geolocation.getCurrentPosition(
            (pos2) => {
              setLoading(false);
              const { latitude, longitude } = pos2.coords;

              setLatitude(latitude);
              setLongitude(longitude);

              if (flag === "MAP") setFetchLocation(true);
              Platform.OS == 'ios' && setValues(latitude, longitude)
              console.log("GPS LOCATION", latitude, longitude);
              dispatch(setLocation({ latitude, longitude }));
            },
            // GPS FAILED → fallback
            (err2) => {
              setLoading(false);
              console.log("GPS FAILED", err2);

              if (latti && longi) {
                setLatitude(latti);
                setLongitude(longi);
                if (flag === "MAP") setFetchLocation(true);
                Platform.OS == 'ios' && setValues(latti, longi)
                console.log("SignUp Location:", latti, longi);
                dispatch(setLocation({ latti, longi }));
              }
            },
            gpsOptions
          );
        },
        fastOptions
      );
    } catch (err) {
      setLoading(false);
      console.log("Unexpected error", err);
    }
  };



  const goBack = async () => {
    navigation.goBack()
  };


  const signUPButtonPress = async () => {
    console.log('lllllllllllllllllllllll', latitude);

    if (role == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('memberType'), false, true, translate('ok'), translate('cancel'))
    } else if (!role?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('memberType'), false, true, translate('ok'), translate('cancel'))
    }
    else if (firmName == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('firmName'), false, true, translate('ok'), translate('cancel'))
    } else if (!firmName?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('firmName'), false, true, translate('ok'), translate('cancel'))
    }
    else if (proprietorName == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('proprietorName'), false, true, translate('ok'), translate('cancel'))
    } else if (!proprietorName?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('proprietorName'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (mobileNumber == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('mobile_number'), false, true, translate('ok'), translate('cancel'))
    // }
    // else if (mobileNumber.length < 10) {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('mobile_number'), false, true, translate('ok'), translate('cancel'))
    // }
    else if (address == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('address'), false, true, translate('ok'), translate('cancel'))
    } else if (!address?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('address'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (landMark == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('landMark'), false, true, translate('ok'), translate('cancel'))
    // } 
    // else if (landMark && !landMark?.match(/[a-zA-Z]/)) {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('landMark'), false, true, translate('ok'), translate('cancel'))
    // }
    // else if (village == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('village'), false, true, translate('ok'), translate('cancel'))
    // } else if (!village?.match(/[a-zA-Z]/)) {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('village'), false, true, translate('ok'), translate('cancel'))
    // }
    // else if (block == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('tashilBlock'), false, true, translate('ok'), translate('cancel'))
    // } else if (!block?.match(/[a-zA-Z]/)) {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + "Block", false, true, translate('ok'), translate('cancel'))
    // }
    else if (state == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('state'), false, true, translate('ok'), translate('cancel'))
    } else if (!state?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('state'), false, true, translate('ok'), translate('cancel'))
    }
    else if (district == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('district'), false, true, translate('ok'), translate('cancel'))
    }
    else if (!district?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('district'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (tm == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('tm'), false, true, translate('ok'), translate('cancel'))
    // }
    // else if (mdo == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('MDO'), false, true, translate('ok'), translate('cancel'))
    // }
    else if (pincode == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('pincode'), false, true, translate('ok'), translate('cancel'))
    }
    else if (pincode.length < 6) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('pincode'), false, true, translate('ok'), translate('cancel'))
    }
    else if (longitude == "" || latitude == "" || latitude == undefined || longitude == undefined) {
      // requestLocationPermission()
      SimpleToast.show(translate('no_gps'))
      await GetUserLocation("")
      if (!isComingFromMap) {
        setBtnVisibility(false)
        signUPApiCall()
      }
    }
    else {
      setBtnVisibility(false)
      signUPApiCall()
    }
  }


  const GetMastersApiCall = async () => {
    if (networkStatus) {
      try {
        setTimeout(() => {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))
        }, 50);
        var getloginURL = configs.BASE_URL + configs.MASTERS.USER_MASTERS;
        var getHeaders = await GetApiHeaders();
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)

        var APIResponse = await GetRequest(getloginURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoadingMessage()
              setLoading(false)
            }, 1000);
            var masterResp = APIResponse.response
            console.log('the master resp is', JSON.stringify(masterResp))
            setRoleList(masterResp?.rolesList)
            setStateList(sortObjectsAlphabetically(masterResp?.statesList, 'name'))
            console.log(sortObjectsAlphabetically(masterResp?.statesList, 'name'), "sortObjectsAlphabetically(masterResp?.statesList, 'name')")
            setDistrictListOriginal(masterResp?.districtsList)
            // console.log("District_Data", JSON.stringify(masterResp?.districtsList));
            if (masterResp?.rolesList.length == 1) {
              setRole(masterResp?.rolesList[0].name)
              setRoleID(masterResp?.rolesList[0].id)
            }
            console.log('the 001 is', roleList)
            console.log('the 002 is', stateList)
            console.log('the 003 is', districtListOriginal)
          }
          else {
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
          }

        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 2500);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 3000);
      }
    } else {
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const GetTMApiCall = async (id) => {
    if (networkStatus) {
      try {
        // setLoading(true)
        // setLoadingMessage(translate('please_wait_creating_account'))

        var getloginURL = configs.BASE_URL + configs.MASTERS.GET_TM;
        var getHeaders = await GetApiHeaders();

        console.log('coming districtID', id)
        var dataList = {
          "districtId": id,
        }
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        console.log('TM response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          // setTimeout(() => {
          //   setLoadingMessage()
          //   setLoading(false)
          // }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            console.log('ressspp tm', APIResponse)
            // setTimeout(() => {
            //   setLoading(false)
            // }, 1000);
            var resppp = APIResponse.response.territoryManagerList
            setTMList(resppp)
            //  console.log('resssppsss tm name', APIResponse.response.territoryManagerList[0].name)
            if (APIResponse?.response?.territoryManagerList && APIResponse?.response?.territoryManagerList?.length > 0) {
              setTM(APIResponse.response.territoryManagerList[0].name);
              setTMID(APIResponse.response.territoryManagerList[0].id);
            }
            console.log('what is in tm & tmid data', tm, tmID)


          }
          else {
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
          }

        } else {
          // setTimeout(() => {
          //   setLoading(false)
          //   setLoadingMessage()
          // }, 500);
        }
      }
      catch (error) {
        setTimeout(() => {
          // setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }

  }

  const GetAllLocationsList = async () => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var getloginURL = configs.BASE_URL + configs.MASTERS.GET_ALL_LOCATIONS;
        var getHeaders = await GetApiHeaders();
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)
        var APIResponse = await GetRequest(getloginURL, '');
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 2000);
          if (APIResponse.statusCode == HTTP_OK) {
            var ListResp = APIResponse.response
            console.log('the locations resp is', JSON.stringify(ListResp))
            setLocationsList(ListResp.locationJsonList)
            setLocationName(ListResp?.locationJsonList[0].name)
            setLocationId(ListResp?.locationJsonList[0].id)
          }
          else {
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
          }

        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 2000);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 3000);
      }
    } else {
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const GetMDOApiCall = async (id) => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_creating_account'))

        var getloginURL = configs.BASE_URL + configs.MASTERS.GET_MDO;
        var getHeaders = await GetApiHeaders();

        var dataList = {
          "districtId": id,
        }
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        console.log('TM response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            console.log('ressspp mdo', APIResponse)
            setTimeout(() => {
              setLoading(false)
            }, 1000);
            var resppp = APIResponse.response.mdoManagerList
            setMDOList(resppp)
            // console.log('ressspp ddddd', mdoList)
            if (APIResponse?.response?.mdoManagerList && APIResponse?.response?.mdoManagerList?.length > 0) {
              setMDO(APIResponse.response.mdoManagerList[0].name)
              setMDOID(APIResponse.response.mdoManagerList[0].id);
            }
            console.log('what is in mdo & mdoID data', mdo, mdoID)
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

  const signUPApiCall = async () => {
    if (networkStatus) {
      try {

        setLoading(true)
        setLoadingMessage(translate('please_wait_creating_account'))

        var getloginURL = configs.BASE_URL + configs.AUTH.SIGNUP;
        var getHeaders = await GetApiHeaders();

        var jsonData =
        {
          "id": 0,
          "roleId": roleID,
          "roleName": role,
          "firmName": firmName,
          "proprietorName": proprietorName,
          "mobileNumber": loginMobileNumber,
          "address": address,
          "landMark": landMark,
          "village": village,
          "block": block,
          "districtId": districtID,
          'longitude': longitude,
          'latitude': latitude,
          "districtName": district,
          "stateId": stateID,
          "stateName": state,
          "pincode": pincode,
          "profilePic": "",
          "storeName": "",
          "status": true,
          'tm': tm,
          'tmId': tmID,
          'mdo': mdo,
          'mdoId': mdoID,
          'termsAndConditionsAccepted': termsConditionsAccepted,
          'companyCode': selectedCompany.companyCode,
          "latitude": latitude.toString(),
          "longitude": longitude.toString(),
        }
        // {  "id": 0,  
        //   "roleId": 6,  
        //   "roleName": "Retailer", 
        //   "firmName": "ABC Enterprises",  
        //   "proprietorName": "John Doe", 
        //   "mobileNumber": "34222244444", 
        //   "address": "123, Elm Street",  
        //   "landMark": "Near Central Park",  
        //   "village": "Green Valley",  
        //   "block": "Block A", 
        //    "districtId": 101,  
        //    "districtName": "District 1", 
        //    "stateId": 5,  
        //    "stateName": "California",  
        //    "pincode": "123456", 
        //    "profilePic": "path/to/profile_pic.jpg",  
        //    "storeName": "ABC Store",  
        //    "status": true,  
        //    "tm": "Team Manager", 
        //    "tmId": 1001, 
        //    "mdo": "Marketing Director", 
        //    "mdoId": 2002,  
        //    "termsAndConditionsAccepted": true,
        //    "companyCode": "1100",
        //    "longitude":"1233",
        //    "latitude":"22222"
        // }

        const formData = new FormData();

        // Append JSON data
        formData.append('jsonData', JSON.stringify(jsonData));
        formData.append('profileImage', "")
        formData.append('panImage', "")
        formData.append('gstImage', "")

        console.log('mmmmmm0111')
        console.log('what is here01 url', getloginURL)
        console.log('what is here01 headers', getHeaders)
        console.log('what is here01 body', formData)

        // const response = await fetch(getloginURL, {
        //   method: 'POST',
        //   headers: getHeaders,
        //   body: formData,
        // });
        // console.log('complent response is:', response)

        var APIResponse = await uploadFormData(formData, getloginURL, getHeaders);
        const tempResponse = APIResponse.response
        console.log('complete response is:', tempResponse.retailerInfo)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            console.log("fetched api response", APIResponse.retailerInfo)
            setTimeout(async () => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('account_created_successfully'))
              var verifyOTPResponse = APIResponse?.response.retailerInfo;
              if (verifyOTPResponse != undefined && verifyOTPResponse != null && verifyOTPResponse.length > 0) {
                dispatch(setUser(verifyOTPResponse))
                setRoleNameNav(verifyOTPResponse[0].roleName)
                storeData(USER_ID, verifyOTPResponse[0].id);
                storeData(USER_NAME, verifyOTPResponse[0].roleName == 'Retailer' ? verifyOTPResponse[0].proprietorName : verifyOTPResponse[0].name);
                storeData(MOBILE_NUMBER, verifyOTPResponse[0].mobileNumber);
                storeData(DEVICE_TOKEN, "");
                storeData(LOGINONCE, true)
                storeData(USERMENU, verifyOTPResponse[0].userMenuControl);
                storeData(PROFILEIMAGE, verifyOTPResponse[0]?.profilePic)
                storeData(ROLEID, verifyOTPResponse[0].roleId);
                storeData(ROLENAME, verifyOTPResponse[0].roleName)
                storeData(SELECTEDCOMPANY, verifyOTPResponse[0].companyLogoPath)
                const tempSlectedObject = {};
                tempSlectedObject.primaryColor = (verifyOTPResponse[0]?.primaryColor != undefined && verifyOTPResponse[0]?.primaryColor != "") ? verifyOTPResponse[0]?.primaryColor : Colors.buttonColorPurple;
                tempSlectedObject.iconPrimaryColor = iconPrimaryColor
                tempSlectedObject.secondaryColor = (verifyOTPResponse[0]?.secondaryColor != undefined && verifyOTPResponse[0]?.secondaryColor != "") ? verifyOTPResponse[0]?.secondaryColor : Colors.white;
                tempSlectedObject.textColor = (verifyOTPResponse[0]?.textColor != undefined && verifyOTPResponse[0]?.textColor != "") ? verifyOTPResponse[0]?.textColor : Colors.black;
                tempSlectedObject.disableColor = (verifyOTPResponse[0]?.disableColor != undefined && verifyOTPResponse[0]?.disableColor != "") ? verifyOTPResponse[0]?.disableColor : Colors.lightgrey;
                tempSlectedObject.highLightedColor = HighLightedColor;
                const filePath = await downloadFileToLocal(verifyOTPResponse[0].loaderPath, verifyOTPResponse[0].loaderPath.split('/').pop())
                tempSlectedObject.loaderPath = filePath != undefined && filePath != null && filePath != "" ? filePath : ""
                if (tempSlectedObject) {
                  if (tempSlectedObject != undefined) {
                    dispatch(updateCompanyStyles(tempSlectedObject))
                  }
                }
                // dispatch(updateCompanyStyles(selectedCompany))
                // navigation.navigate('Dashboard')
              } else {
                SimpleToast.show(translate('something_went_wrong'));
                navigation.goBack()
              }
            }, 1000);
            setBonusMessage(APIResponse?.response?.bonusPointsDescription)
            setTimeout(() => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
              setShowCustomActionSheet(true)
              // navigation.navigate('Login')r
            }, 3000);

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
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
          }, 1000);
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

    setBtnVisibility(true)
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

  const onSelectedLocationName = (itemdata) => {
    if (itemdata != null) {
      setLocationId(itemdata?.id)
      setLocationName(itemdata?.name)
      setShowDropDowns(false);
    }
  }

  const handleCancelAlert = () => {
    if (alertMessage?.includes(translate('firmName'))) { firmNameRef.current.focus(); }
    else if (alertMessage?.includes(translate('proprietorName'))) { propriatorNameRef.current.focus(); }
    else if (alertMessage?.includes(translate('mobile_number'))) { mobileNumberRef.current.focus(); }
    else if (alertMessage?.includes(translate('address'))) { addressRef.current.focus(); }
    else if (alertMessage?.includes(translate('landMark'))) { landMarkRef.current.focus(); }
    else if (alertMessage?.includes(translate('village'))) { villageRef.current.focus(); }
    else if (alertMessage?.includes(translate('tashilBlock'))) { tashilBlockRef.current.focus(); }
    else if (alertMessage?.includes(translate('pincode'))) { pincodeRef.current.focus(); }
    setShowAlert(false)
    if (alertMessage == translate('already_registered')) {
      navigation.goBack()
    }
  }

  function CustomActionSheet() {
    return (
      <Modal animationType="slide"
        transparent={true}
        visible={showCustomActionSheet}
        onRequestClose={() => setShowCustomActionSheet(false)}>
        <View style={styleSheetStyles.centeredView}>
          <View style={styleSheetStyles.modalView}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              // justifyContent: "space-between",
              // alignSelf:"center",
              width: "100%",
              // marginLeft:5
            }}>
              <RenderHTML source={{ html: bonusMessage }}
                enableCSSInlineProcessing={true} />
            </View>
            <CustomButton
              title={translate('ok')}
              onPress={async () => {
                const roleTypeDetails = await retrieveData(ROLENAME)
                setShowCustomActionSheet(false)
                navigation.reset({ index: 0, routes: [{ name: (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard' : 'Dashboard', params: {} }] })
                //  roleNameNav
              }}
              buttonBg={primaryColor}
              btnWidth={'100%'}
              titleTextColor={secondaryColor}
              textAlign={'center'}
              isBoldText={true}
            />
          </View>
        </View>
      </Modal >
    )
  }

  const handleOkAlert = () => {
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
    if (showAlertyesButtonText == translate('proceed')) {
      sendOTPApiCall(userAcceptanceKey = "1")
    }
    setShowAlert(false)
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


  const changeDropDownData = (dropDownData, type, selectedItem) => {
    console.log(dropDownData, "? dropdown daraaaaaaaaaaaaa")
    setShowDropDowns(true);
    setdropDownData(dropDownData);
    setDropDownType(type);
    setSelectedDropDownItem(selectedItem);
  }

  onSelectedRole = (item) => {
    setShowDropDowns(false);
    setRole(item.name)
    setRoleID(item.id);
    console.log('it is type01', item)
  }

  // onSelectedState = async (item) => {
  //   console.log('afterSelectingState',item);

  //   setShowDropDowns(false);
  //   setState(item.name)
  //   setStateID(item.id);
  //   // setDistrict('')
  //   // setDistrictID('');
  //   console.log('022', item)
  //   if (item?.code.toLowerCase() == translate('all').toLowerCase()) {
  //     setDistrictList(sortObjectsAlphabetically(districtListOriginal, 'name'))
  //   } else {
  //     let filterDistList = await filterObjects(districtListOriginal, "stateId", item.id)
  //     setDistrictList(sortObjectsAlphabetically(filterDistList, 'name'))
  //     if(district != ''){
  //       console.log('022districts', filterDistList);
  //       console.log('ddddddddddddddddddddde',district);

  //       const filteredDistrict  = filterDistList.filter(districts => districts.name.includes(district));
  //       if (filteredDistrict.length === 0) {
  //         filteredDistrict.push({
  //             id: -99,
  //             name: district,
  //             remarks: "",
  //             stateId: item.id,
  //             status: true
  //         });
  //     }
  //       setFilteredDistrictList(filteredDistrict);
  //       console.log('bbbbbbbbbbbbbbbb',filteredDistrict);

  //     }
  //   }
  // }
  onSelectedState = async (item) => {
    console.log('afterSelectingState', item);
    console.log('itemInState', item.name);
    console.log('previousState', state);

    if (item.name != state) {
      console.log('true');
      setDistrict('');
    }
    setShowDropDowns(false);
    setState(item.name);
    setStateID(item.id);
    // setDistrict('');

    if (item?.code.toLowerCase() == translate('all').toLowerCase()) {
      setDistrictList(sortObjectsAlphabetically(districtListOriginal, 'name'));
    } else {
      let filterDistList = await filterObjects(districtListOriginal, "stateId", item.id);
      setDistrictList(sortObjectsAlphabetically(filterDistList, 'name'));
      // setTimeout(() => {
      //   if (district !== '') {
      //     console.log('022districts', filterDistList);
      //     console.log('ddddddddddddddddddddde', district);

      //     let filteredDistrict = filterDistList.filter(districts => districts.name.includes(district));
      //     // If the district is not found, add a new object
      //     if (filteredDistrict.length === 0) {
      //         filteredDistrict = [{
      //             id: 0,
      //             name: district,
      //             remarks: "",
      //             stateId: item.id,
      //             status: true
      //         }];
      //     }
      //     const districtObject = Object.assign({}, ...filteredDistrict);
      //     setFilteredDistrictList(filteredDistrict);
      //     onSelectedDistrict(districtObject);
      //     // setDistrict('');
      //     console.log('bbbbbbbbbbbbbbbb', filteredDistrict);
      // } 
      // }, 2000);
    }
  };


  onSelectedDistrict = (item) => {
    console.log('dededede', item);

    setShowDropDowns(false);
    setDistrict(item.name)
    setDistrictID(item.id);
    console.log('it is type03', item.id)
    // setTimeout(() => {
    //   GetTMApiCall(item.id)
    //   GetMDOApiCall(item.id)
    // }, 500);

  }

  onSelectedTM = (item) => {
    setShowDropDowns(false);
    setTM(item.name)
    setTMID(item.id);
    console.log('it is type04', item)
  }
  onSelectedMDO = (item) => {
    setShowDropDowns(false);
    setMDO(item.name)
    setMDOID(item.id);
    console.log('it is type05', item)
  }

  const validatePincode = (input) => {
    if (input === '') {
      return true;
    }

    if (input[0] === '0') {
      return false;
    }

    const isNumeric = /^[0-9]*$/.test(input);
    return isNumeric;
  };


  const approveTermsButtonClick = () => {
    setShowWebView(false)
    setTermsConditionsAccepted(true)
  }

  const getDetailsFromLatlong = async (latitude, longitude) => {
    console.log('reachedhere');
    const url = MAP_MY_INDIA_URL;
    console.log('uuuu', url);

    try {
      let urll = `${url}?lat=${latitude}&lng=${longitude}`
      const response = await axios.get(urll);
      console.log('laaaaatiAndLoooooong', response.data.results);

      if (response.data && response.data.results) {
        const { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality } = response.data.results[0];
        const cleanedDistrict = district.replace(/District$/, "").trim();
        setState(state)
        setPincode(pincode)
        setDistrict(cleanedDistrict)
        setLandMark(subLocality)  // as per client req added this.
        setBlock(subDistrict) // as per client req added this.
        setVillage(locality) // as per client req added this.
        // setAddress(formatted_address)
        console.log('sssssssss', stateList);
        console.log('uuuuuuuuuu', state);
        const stateToBeFiltered = state;
        // const telanganaState = stateList.find(state => state.name === stateToBeFiltered);
        const filteredState = stateList.filter(state => state.name.includes(stateToBeFiltered));
        const stateObject = Object.assign({}, ...filteredState);
        console.log('tttttttttttt', stateObject);

        console.log('tttttttttttt', filteredState);
        setFilteredStateList(filteredState);
        // onSelectedState(stateObject);
        setDistrict(cleanedDistrict);
        setStateID(stateObject.id);
        const filteredDistrict = districtListOriginal.filter(districts => districts.name.includes(cleanedDistrict));

        const finalDistrictList = filteredDistrict.length > 0
          ? filteredDistrict
          : [{
            id: 0,
            name: cleanedDistrict,
            remarks: "",
            stateId: stateObject.id,
            status: true
          }];
        const districtObject = Object.assign({}, ...finalDistrictList);
        setFilteredDistrictList(finalDistrictList);
        onSelectedDistrict(districtObject);
        return { pincode, state, district, poi, subDistrict, village, formatted_address };
      } else {
        console.warn('No results found from reverse geocoding');
        return null;
      }
    } catch (error) {
      console.error('Error fetching reverse geocode data:', error.message);
      return null;
    }

  }


  const showWebViewSection = () => {
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
        <WebView
          onLoadStart={() => {
            setLoading(true)
            setLoadingMessage(translate('please_wait_getting_data'))
          }}
          onLoad={() => {
            setLoading(false)
            setLoadingMessage()
          }}
          source={{ uri: configs.TERMS_CONDIOTNS_URL }} // Replace with your desired URL
          style={[styles['centerItems'], styles['border_radius_6'], { height: '80%', width: '90%' }]}
          containerStyle={[styles['centerItems'], { flex: 0, width: '90%', height: '80%' }]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            console.log("event", event.nativeEvent.data)
            if (event.nativeEvent.data == "GoBack") {
              approveTermsButtonClick()
            } else if (event.nativeEvent.data == "Accepted") {
              approveTermsButtonClick()
            }
          }}
        />
      </View>
    )
  }


  // const filterItems = (item) => {
  //   var listItems = stateList;
  //   if (item.code != 0) {
  //       var array = listItems.filter(data => data.productStoreLocationID === item.code);
  //       setDuplicateData(array)
  //       setfilteredIndex(array)
  //   }
  //   else {
  //       setfilteredIndex(listItems)
  //       setDuplicateData([])
  //   }
  // }

  return (
    <View style={[styles['full_screen'], styles['bg_white']]}>
      {(selectedCompany?.companyCode != undefined
        // && selectedCompany?.companyCode == "1100"  enable when the logo is req only for nuziveedu seeds
      ) && <Image source={require('../assets/images/newAppIcon.png')} style={[{ height: 75, width: 75, resizeMode: "contain", position: 'absolute', right: 15, top: Platform.OS == 'android' ? 15 : 25 }]} />}
      {Platform.OS === 'android' && <StatusBar backgroundColor={primaryColor} barStyle='dark-content' />}

      <View style={[styles['absolute_position'], styles['padding_top_50'], styles['height_100%']]}>

        <TouchableOpacity style={[styles['width_50']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_20'], styles['width_height_25'], { tintColor: primaryColor }]} source={require('../assets/images/previous.png')} resizeMode='contain'></Image>
        </TouchableOpacity>


        <View style={[styles['margin_left_30'], styles['top_20']]}>
          <Image source={companyLogo != "" ? { uri: companyLogo } : require('../assets/images/newAppIcon.png')} resizeMode='contain' defaultSource={require('../assets/images/newAppIcon.png')} style={[styles['width_height_75']]} />
          <Text style={[styles['font_size_26_semibold'], styles['text_color_black'], styles['text_align_left'], styles['margin_top_20'], Platform.OS == "ios" && { paddingBottom: 3 }]}>{translate('register')}</Text>
          <Text style={[styles['font_size_12_regular'], styles['text_color_black'], styles['text_align_left'], styles['margin_top_10'],]}>{translate('pleaseEnterAllTheDetails')}</Text>
        </View>

        <ScrollView style={[styles['margin_top_30'], styles['margin_left_10'], { width: '100%' }]} automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true}>
          {/* Role*/}
          <CustomBorderInputDropDown
            width={[styles['width_91%'], styles['margin_top_10'], styles['centerItems']]}
            defaultValue={role != undefined && role != translate('select') ? role : translate('select')}
            labelName={translate('memberType')}
            IsRequired={true}
            placeholder={translate('memberType')}
            onEndEditing={async event => {
              // calculateTotalOrderValue()
            }}
            onFocus={() => {
              roleList?.length === 0 ? SimpleToast.show(translate("no_data_available")) :
                changeDropDownData(roleList, strings.memberType, role)
            }}
          />

          {/* firmName */}
          <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={firmNameRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('firmName')}
              IsRequired={true}
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
          <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={propriatorNameRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('proprietorName')}
              IsRequired={true}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('proprietorName')}
              value={proprietorName}
              maxLength={30}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                var enteredText = text.replace(/[^a-zA-Z\s]/g, '');
                setProprietorName(enteredText)
              }}
              onEndEditing={event => {
              }}
            />
          </View>

          {/*  Mobile Number */}
          <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={mobileNumberRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('mobile_number')}
              IsRequired={true}
              maxLength={10}
              keyboardType='number-pad'
              placeholder={translate('enter') + " " + translate('mobile_number')}
              value={loginMobileNumber}
              editable={false}
              onFocus={() => {
                //console.log('this is on focus')
              }}
              onChangeText={(text) => {
                console.log('this is on change text', text)
                var enteredText = text.replace(/^[0-5][0-9]*$/gi, "");
                enteredText = enteredText.replace(/[`a-z!@#$%^&*()_|+\-=?;:'",.₹€£¥•’<>\{\}\[\]\\\/]/gi, "");
                setMobileNumber(enteredText)
              }}
              onEndEditing={(event) => {
                if (mobileNumber.length < 10) {
                  // SimpleToast.show(translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('mobile_number'))
                }
              }}
            />
          </View>
          {/* <View style={[styles['margin_top_20']]}>
            <CustomBorderInputDropDown
              width={[styles['width_91%'], styles['margin_top_10'], styles['centerItems']]}
              defaultValue={locationName != undefined && locationName != translate('select') ? locationName : translate('select')}
              labelName={translate('geotagging')}
              IsRequired={true}
              placeholder={translate('geotagging')}
              onEndEditing={async event => {
                // calculateTotalOrderValue()
              }}
              onFocus={() => {
                changeDropDownData(locationsList, strings.geotagging, locationName)
              }}
            />
          </View> */}
          <View style={[styles['margin_top_20']]}>
            <View style={[styles['margin_bottom_5'], styles['align_self_center']]}>

              <Text style={[styles['text_color_black'], styles['absolute_position'], styles['margin_top_minus_10'], styles['margin_left_15'], styles['font_size_11_semibold'], styles['zindex_9999'], styles['bg_white'], styles['padding_5']]}>{translate('geotagging')}<Text style={[styles['text_color_red']]}> {"*"}</Text></Text>
              <View style={[styles['flex_direction_row'], styles['width_90%']]}>
                <View style={[styles['width_100%'], styles['flex_direction_row'], styles['button_height_45'], styles['bg_white'], styles['top_5'], styles['border_width_1'], styles['border_radius_6'], styles['border_color_light_grey']]}>
                  <TextInput
                    style={[
                      styles['font_size_14_regular'], { color: dynamicStyles.textColor }, styles['padding_left_10'], Platform.OS === 'ios' && styles['top_3'], styles['width_90%'], { color: Colors.mid_grey, padding: 0 }]}
                    // value={props.value}
                    placeholder={translate('geotagging')}
                    placeholderTextColor={'#B4B4B4'}
                    defaultValue={locationName != undefined && locationName != translate('select') ? locationName : translate('select')}
                    // editable={props.editable}
                    selection={{ start: 0, end: 0 }}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    multiline={false}
                    autoCorrect={false}
                    color={Colors.black}
                    showSoftInputOnFocus={false}
                    onFocus={() => {
                      Keyboard.dismiss();
                      // props.onFocus();
                      changeDropDownData(locationsList, strings.geotagging, locationName)
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // props.onFocus();
                  changeDropDownData(locationsList, strings.geotagging, locationName)
                }}
                style={[styles['right_45'], styles['align_items_flex_end'], styles['absolute_position'], styles['margin_top_22']]}>
                <Image style={{ width: 14, height: Platform.OS === 'android' ? 8 : 7 }} source={require('../assets/images/grayDownArrow.png')} />
              </TouchableOpacity>
              <View
                style={[styles['right_30'], styles['align_items_flex_end'], styles['absolute_position'], styles['margin_top_15']]}>
                <Image style={{ width: 10, height: 22, resizeMode: 'contain' }} source={require('../assets/images/line.png')} />
              </View>
              <TouchableOpacity onPress={() => { handleLocation(); }} style={[styles['right_5'], styles['align_items_flex_end'], styles['absolute_position'], Platform.OS === 'android' ? styles['margin_top_15'] : styles['margin_top_15']]}>
                <Image style={{ width: 25, height: Platform.OS === 'android' ? 20 : 20, resizeMode: 'contain' }} source={require('../assets/images/locationMarker.png')} />
              </TouchableOpacity>
            </View>
          </View>

          {/* address */}
          <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={addressRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('address')}
              IsRequired={true}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('address')}
              value={address}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                var enteredText = text.replace(/[^a-zA-Z0-9,\/\- \.;:]/g, '');
                setAddress(enteredText)
              }}
              onEndEditing={event => {
              }}
            />
          </View>

          {/* landMark */}

          <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={landMarkRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('landMark')}
              IsRequired={false}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('landMark')}
              value={landMark}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                var enteredText = text.replace(/[^a-zA-Z0-9,\/\- \.;:]/g, '');

                setLandMark(enteredText)
              }}
              onEndEditing={event => {

              }}
            />
          </View>

          {/* village */}

          <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={villageRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('villagecity')}
              IsRequired={false}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('village')}
              value={village}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                const filteredText = text.replace(/[^\w\s]/gi, '');
                setVillage(filteredText)
              }}
              onEndEditing={event => {

              }}
            />
          </View>


          {/* Block */}

          <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={tashilBlockRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('tashilBlock')}
              IsRequired={false}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('tashilBlock')}
              value={block}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                const filteredText = text.replace(/[^\w\s]/gi, '');
                setBlock(filteredText)
              }}
              onEndEditing={event => {

              }}
            />
          </View>

          {/* state*/}
          <CustomBorderInputDropDown
            width={[styles['width_90%'], styles['margin_top_20'], styles['centerItems']]}
            defaultValue={state != undefined && state != translate('select') ? state : translate('select')}
            labelName={translate('state')}
            IsRequired={true}
            placeholder={translate('state')}
            onEndEditing={async event => {
              // calculateTotalOrderValue()
            }}
            onFocus={() => {
              changeDropDownData(filteredStateList.length > 0 ? filteredStateList : stateList, strings.state, state)
            }}
          />
          {/* <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={stateRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('state')}
              IsRequired={true}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('state')}
              value={state}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                const filteredText = text.replace(/[^\w\s]/gi, '');
                setState(filteredText)
              }}
              onEndEditing={event => {

              }}
            />
          </View> */}

          {/* district */}
          <CustomBorderInputDropDown
            width={[styles['width_90%'], styles['margin_top_20'], styles['centerItems']]}
            defaultValue={district != undefined && district != translate('select') ? district : translate('select')}
            labelName={translate('district')}
            IsRequired={true}
            placeholder={translate('district')}
            onEndEditing={async event => {
              // calculateTotalOrderValue()
            }}
            onFocus={() => {
              // console.log('99999999999999',filteredDistrictList.length);

              changeDropDownData(filteredDistrictList.length > 0 ? filteredDistrictList : districtList, strings.district, district)
              // changeDropDownData(districtList, strings.district, district)
            }}
          />
          {/* <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={districtRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('district')}
              IsRequired={true}
              keyboardType='default'
              placeholder={translate('enter') + " " + translate('district')}
              value={district}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                const filteredText = text.replace(/[^\w\s]/gi, '');
                setDistrict(filteredText)
              }}
              onEndEditing={event => {

              }}
            />
          </View> */}


          {/* <CustomBorderInputDropDown
              width={[styles['width_90%'], styles['margin_top_20'], styles['centerItems']]}
              defaultValue={tm != undefined && tm != translate('select') ? tm : translate('select')}
              labelName={translate('tm')}
              IsRequired={false}
              placeholder={translate('tm')}
              onEndEditing={async event => {
                // calculateTotalOrderValue()
              }}
              onFocus={() => {
                changeDropDownData(tmList, strings.tm, tm)
              }}
            />

           
            <CustomBorderInputDropDown
              width={[styles['width_90%'], styles['margin_top_20'], styles['centerItems']]}
              defaultValue={mdo != undefined && mdo != translate('select') ? mdo : translate('select')}
              labelName={translate('MDO')}
              IsRequired={false}
              placeholder={translate('MDO')}
              onEndEditing={async event => {
                // calculateTotalOrderValue()
              }}
              onFocus={() => {
                changeDropDownData(mdoList, strings.MDO, mdo)
              }}
            /> */}

          {/* pincode */}
          <View style={[styles['margin_top_20']]}>
            <CustomBorderTextInput
              ref={pincodeRef}
              style={[styles['margin_top_10'], styles['centerItems']]}
              labelName={translate('pincode')}
              IsRequired={true}
              maxLength={6}
              keyboardType='numeric'
              placeholder={translate('enter') + " " + translate('pincode')}
              value={pincode}
              editable={true}
              onFocus={() => {
              }}
              onChangeText={(text) => {
                if (validatePincode(text)) {
                  setPincode(text);
                }
                // setPincode(text)
              }}
              onEndEditing={event => {

              }}
            />

            {btnVisibility &&
              <View style={[styles['margin_top_40'], styles['align_self_center'], styles['width_100%'], styles['bottom_10']]}>
                <CustomButton title={translate('signUp')} onPress={signUPButtonPress} buttonBg={primaryColor} btnWidth={"90%"} titleTextColor={secondaryColor} />
              </View>}
          </View>
        </ScrollView>
      </View>

      {showWebView &&
        showWebViewSection()
      }
      {showCustomActionSheet && CustomActionSheet()}
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

      {showDropDowns &&
        <CustomListViewModal
          dropDownType={dropDownType}
          listItems={dropDownData}
          selectedItem={selectedDropDownItem}
          onSelectedRole={(item) => onSelectedRole(item)}
          onSelectedState={(item) => onSelectedState(item)}
          onSelectedDistrict={(item) => onSelectedDistrict(item)}
          onSelectedTM={(item) => onSelectedTM(item)}
          onSelectedMDO={(item) => onSelectedMDO(item)}
          onSelectedLocationName={(item) => { onSelectedLocationName(item) }}
          closeModal={() => setShowDropDowns(false)} />}

      {loading && <CustomLoaderDefault loading={loading} message={loadingMessage} uriSent={true}
        loaderImage={route?.params?.loaderPath ? route?.params?.loaderPath : loaderFile}
      />}
      {successLoading && <CustomSuccessLoaderDefault loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoaderDefault loading={errorLoading} message={errorLoadingMessage} />}
    </View>
  )
}

let styleSheetStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#000000d6"
  },
  modalView: {
    // height: responsiveHeight(60),
    width: responsiveWidth(85),
    backgroundColor: 'white',
    borderRadius: 20,
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

export default SignUp;