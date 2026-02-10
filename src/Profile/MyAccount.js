import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, Linking, Keyboard, TouchableOpacity, PermissionsAndroid, ScrollView, Alert } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import CustomTextInput from '../Components/CustomTextInput';
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { MOBILE_NUMBER, ROLENAME, USER_ID, USER_NAME, checkIfGpsEnabled, retrieveData, sortObjectsAlphabetically, storeData } from '../assets/Utils/Utils';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../Components/CustomAlert';
import CustomCircularImageView from '../Components/CustomCircularImageView';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { GetApiHeaders, GetRequest, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, MAP_MY_INDIA_URL, configs } from '../helpers/URLConstants';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomCalanderSelection from '../Components/CustomCalanderSelection';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import SimpleToast from 'react-native-simple-toast';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from "react-native-image-resizer";
import { selectUser, setUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import axios from 'axios';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomGalleryPopup from '../Components/CustomGalleryPopup';
import { translate } from '../Localisation/Localisation';
import { updateRetailerInfoData } from '../redux/store/slices/UpdatedReatilerInfoDataSlice';
import { createStyles } from '../assets/style/createStyles';
import DeviceInfo from 'react-native-device-info';

var styles = BuildStyleOverwrite(Styles);

function MyAccount({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  console.log(('mmmmm', JSON.stringify(route)));
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const networkStatus = useSelector(state => state.networkStatus.value)
  const navigation = useNavigation()
  const [primaryColor, setPrimaryColor] = useState(route?.params?.selectedCompany?.primaryColor != undefined ? route.params.selectedCompany?.primaryColor : Colors.purple)
  const [secondaryColor, setSecondaryColor] = useState(route?.params?.selectedCompany?.secondaryColor != undefined ? route.params.selectedCompany?.secondaryColor : Colors.white)
  const [textColor, setTextColor] = useState(route?.params?.selectedCompany?.textColor != undefined ? route.params.selectedCompany?.textColor : Colors.black)
  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)

  const [firmName, setFirmName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [dateofBirth, setDateofBirth] = useState('')
  const [sendDateofBirth, setSendDateofBirth] = useState('')
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const { latitude, longitude } = useSelector((state) => state.location);
  console.log("latitude and longitude in my account screen", latitude, longitude)
  const [address, setAddress] = useState('')
  const [latitude1, setLatitude1] = useState('')
  const [longitude1, setLongitude1] = useState('')
  const [taluk, setTaluk] = useState('')
  const [district, setDistrict] = useState('')
  const [districtID, setDistrictID] = useState('')
  const [landMark, setLandMark] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [stateID, setStateID] = useState('')
  const [pincode, setPincode] = useState('')

  const [alternateMobNumber, setAlternateMobNumber] = useState('')
  const [gstNumber, setGSTNumber] = useState('')
  const [panNumber, setPANNumber] = useState('')
  const [userProfileImg, setUserProfileImg] = useState()
  const [sectionGeneralOpen, setSectionGeneralOpen] = useState(true)
  const [sectionAddressOpen, setSectionAddressOpen] = useState(false)
  const [sectionFirmInfoOpen, setSectionFirmInfoOpen] = useState(false)
  const [userDetailsData, setUserDetailsData] = useState([]);
  const [stateList, setStateList] = useState()
  const [districtListOriginal, setDistrictListOriginal] = useState()
  const [districtList, setDistrictList] = useState()
  const [dropDownData, setdropDownData] = useState();
  const [showDropDowns, setShowDropDowns] = useState(false)
  const [dropDownType, setDropDownType] = useState("");
  const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
  const [role, setRole] = useState('')
  const [roleID, setRoleID] = useState('')
  const [roleList, setRoleList] = useState()
  const [proprietorName, setProprietorName] = useState('')
  let badgeIcon = route?.params?.badgeIcon
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setDatePicker] = useState(false);
  const [minimumDate, setMinDate] = useState();
  const [maximumDate, setMaxDate] = useState();
  const [documentName, setDocumentName] = useState(translate('upload_document'))
  const [documentUri, setDocumentUri] = useState("")
  const [base64Path, setBase64Path] = useState('')
  const [isItValidEmail, setIsItValidEmail] = useState(false)
  const [showSelectionModal, setShowSelectionModal] = useState(false)

  const [selectedProfile, setSelectedProfile] = useState(false)
  const [selectedPan, setSelectedPan] = useState(false)
  const [selectedGst, setSelectedGst] = useState(false)

  const [filteredStateList, setFilteredStateList] = useState([]);
  const [filteredDistrictList, setFilteredDistrictList] = useState([]);

  const [imageDataProfile, setImageDataProfile] = useState('')
  const [imageDataPan, setImageDataPan] = useState('')
  const [imageDataGst, setImageDataGst] = useState('')
  const [imageAdded, setImageAdded] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [loginRoleType, setLoginRoleType] = useState(null)
  const [employeeDetails, setEmployeeDetails] = useState(false)
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [mapZoomingLevel, setMapZoomingLevel] = useState(18)


  useEffect(() => {
    if (route?.params) {
      console.log('mjmj', route?.params);

      if (route?.params?.latitudes) {
        const { latitudes, longitudes, address, zoom, locationWHoleData } = route?.params;
        latitudes !== undefined && setLatitude1(latitudes);
        longitudes !== undefined && setLongitude1(longitudes);
        setMapZoomingLevel(zoom);
        setAddress(address);
        getDetailsFromLatlong(latitudes, longitudes);
        console.log(locationWHoleData, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        if (locationWHoleData) {
          setCity(locationWHoleData?.locality)
          setLandMark(locationWHoleData?.subLocality)
          setTaluk(locationWHoleData?.subDistrict)
        }
      }
      else {
        setLatitude1(latitude);
        setLongitude1(longitude);
      }

    }
  }, [route?.params]);

  const getDetailsFromLatlong = async (latitude, longitude) => {
    console.log('reachedhere');
    const url = MAP_MY_INDIA_URL
    console.log('uuuu', url);

    try {
      const response = await axios.get(url, {
        params: {
          lat: latitude,
          lng: longitude
        }
      });
      console.log('laaaaatiAndLoooooong', response);

      if (response.data && response.data.results) {
        const { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality } = response.data.results[0];
        const cleanedDistrict = district.replace(/District$/, "").trim();
        setState(state)
        setPincode(pincode)
        setDistrict(cleanedDistrict)
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
        console.log("filteredDistrictfilteredDistrict", filteredDistrict)
        const finalDistrictList = filteredDistrict.length > 0
          ? filteredDistrict
          : [{
            id: 0,
            name: cleanedDistrict,
            remarks: "",
            stateId: stateObject.id,
            status: true
          }];
        console.log("finalDistrictList", finalDistrictList)
        const districtObject = Object.assign({}, ...finalDistrictList);
        console.log("districtObject===", districtObject)
        setFilteredDistrictList(finalDistrictList);
        setDistrictID(districtObject.id)
        // onSelectedDistrict(districtObject);

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

  useEffect(() => {
    if (networkStatus) {
      GetMastersApiCall()
      GetUserDetailsApiCall();
    }
  }, [])

  const goBack = async () => {
    navigation.goBack();
  };
  gstDocumentPress = () => {
    setSelectedProfile(false)
    setSelectedPan(false)
    setSelectedGst(true)
    setShowSelectionModal(true)
  };

  panDocumentPress = () => {
    setSelectedProfile(false)
    setSelectedPan(true)
    setSelectedGst(false)
    setShowSelectionModal(true)
  };

  const saveButtonPress = async () => {

    const currentDate = new Date();
    const providedDate = new Date(dateofBirth);
    const ageDiffMs = currentDate - providedDate;
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (role == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('memberType'), false, true, translate('ok'), translate('cancel'))
    } else if (!role?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('memberType'), false, true, translate('ok'), translate('cancel'))
    } else if (proprietorName == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('proprietorName'), false, true, translate('ok'), translate('cancel'))
    } else if (!proprietorName?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('proprietorName'), false, true, translate('ok'), translate('cancel'))
    } else if (firmName == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('firmName'), false, true, translate('ok'), translate('cancel'))
    } else if (!firmName?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('firmName'), false, true, translate('ok'), translate('cancel'))
    } else if ((dateofBirth && !(moment(dateofBirth, "DD-MM-YYYY").isBefore(moment().subtract(18, 'years')) || moment(dateofBirth, "YYYY-MM-DD").isBefore(moment().subtract(18, 'years'))))) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('dateofBirth'), false, true, translate('ok'), translate('cancel'))
    } else if (mobileNumber == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('mobile_number'), false, true, translate('ok'), translate('cancel'))
    } else if (mobileNumber.length < 10) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('mobile_number'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (dateofBirth == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('dateofBirth'), false, true, translate('ok'), translate('cancel'))
    // } 
    else if (dateofBirth != "" && age < 18) {
      showAlertWithMessage(translate('alert'), true, true, translate('select') + "ed" + " " + translate('dateofBirth') + " must be above 18 years .", false, true, translate('ok'), translate('cancel'))
    }
    else if (storeName == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('storeName'), false, true, translate('ok'), translate('cancel'))
    } else if (!storeName?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('storeName'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (email == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('storeName'), false, true, translate('ok'), translate('cancel'))
    // }
    else if (email != undefined && email != "" && isItValidEmail == false) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('email'), false, true, translate('ok'), translate('cancel'))
    } else if (address == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('address'), false, true, translate('ok'), translate('cancel'))
    } else if (!address?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('address'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (taluk == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('taluk'), false, true, translate('ok'), translate('cancel'))
    // }
    else if (state == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('state'), false, true, translate('ok'), translate('cancel'))
    } else if (!state?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('state'), false, true, translate('ok'), translate('cancel'))
    } else if (district == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('district'), false, true, translate('ok'), translate('cancel'))
    } else if (!district?.match(/[a-zA-Z]/)) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('district'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (landMark == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('landMark'), false, true, translate('ok'), translate('cancel'))
    // } 
    // else if (!landMark?.match(/[a-zA-Z]/)) {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('landMark'), false, true, translate('ok'), translate('cancel'))
    // } 
    // else if (city == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('village'), false, true, translate('ok'), translate('cancel'))
    // } else if (!city?.match(/[a-zA-Z]/)) {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('village'), false, true, translate('ok'), translate('cancel'))
    // } 
    else if (pincode == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('pincode'), false, true, translate('ok'), translate('cancel'))
    } else if (pincode.length < 6) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('pincode'), false, true, translate('ok'), translate('cancel'))
    } else if (latitude1 == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('latLongError'), false, true, translate('ok'), translate('cancel'))
    } else if (longitude1 == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('latLongError'), false, true, translate('ok'), translate('cancel'))
    } else {
      updateApiCall()
    }
  }

  function profileImageButtonPress() {
    if (isEdit == true) {
      setSelectedProfile(true)
      setSelectedPan(false)
      setSelectedGst(false)
      setShowSelectionModal(true)
    }
    else {
      SimpleToast.show(translate('edit_feature_is_not_available'))
    }
  }
  const handleConfirm = (date) => {
    console.log('date issss', date)
    setSendDateofBirth(moment(date).format('YYYY-MM-DD'))
    var currentDate = moment(date).format('DD-MM-YYYY')
    console.log('data iss', currentDate)
    setDateofBirth(currentDate);
    setDatePicker(false)
  }

  const handleCancel = () => {
    setDatePicker(false)
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

  const generalButtonPress = () => {
    setSectionGeneralOpen(!sectionGeneralOpen)
    setSectionAddressOpen(false)
    setSectionFirmInfoOpen(false)
  }

  const addressButtonPress = () => {
    setSectionGeneralOpen(false)
    setSectionAddressOpen(!sectionAddressOpen)
    setSectionFirmInfoOpen(false)
  }

  const onSelectedRole = (item) => {
    setShowDropDowns(false);
    setRole(item.name)
    setRoleID(item.id);
    console.log('it is type01', item)
  }

  const GetMastersApiCall = async () => {
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
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse.response
            console.log('the master resp is', masterResp)
            setRoleList(masterResp.rolesList)
            setStateList(sortObjectsAlphabetically(masterResp?.statesList, 'name'))
            setDistrictListOriginal(masterResp.districtsList)
            // console.log('the 002 is', stateList)
            // console.log('the 003 is', districtListOriginal)
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
    if (networkStatus) {
      GetUserDetailsApiCall();
    }
  }

  const GetUserDetailsApiCall = async () => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getloginURL = configs.BASE_URL + configs.PROFILE.VIEW_PROFILE;
        var getHeaders = await GetApiHeaders();
        console.log('getloginURL is', getloginURL)
        console.log('getHeaders is', getHeaders)

        var APIResponse = await GetRequest(getloginURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 100);
          if (APIResponse.statusCode == HTTP_OK) {
            var userResp = APIResponse?.response?.retailerList
            console.log('the user Resp is', JSON.stringify(userResp))
            setUserDetailsData(userResp)
            if (userResp[0].latitude) {

              const lat = parseFloat(userResp[0]?.latitude);
              const lng = parseFloat(userResp[0]?.longitude);
              setLatitude1(lat)
              setLongitude1(lng)
            } else {
              setLatitude1(latitude)
              setLongitude1(longitude)
            }
            var profileData = userResp[0]
            setUserProfileImg((profileData != undefined && profileData.profilePic != undefined) ? profileData.profilePic : "")
            setRole((profileData != undefined && profileData.roleName != undefined) ? profileData.roleName : "")
            setRoleID((profileData != undefined && profileData.role.id != undefined) ? profileData.role.id : "")
            setFirmName((profileData != undefined && profileData.firmName != undefined) ? profileData.firmName : "")
            setProprietorName((profileData != undefined && profileData.proprietorName != undefined) ? profileData.proprietorName : "")
            setMobileNumber((profileData != undefined && profileData.mobileNumber != undefined) ? profileData.mobileNumber : "")
            setDateofBirth((profileData != undefined && profileData.dateofBirth != undefined) ? profileData?.dateofBirth : "")
            setStoreName((profileData != undefined && profileData.storeName != undefined) ? profileData.storeName : "")
            setEmail((profileData != undefined && profileData.email != undefined) ? profileData.email : "")
            setAddress((profileData != undefined && profileData.address != undefined) ? profileData.address : "")
            setTaluk((profileData != undefined && profileData?.block != undefined) ? profileData?.block : "")
            setState((profileData != undefined && profileData?.stateName != undefined) ? profileData?.stateName : "")
            setStateID((profileData != undefined && profileData?.state?.id != undefined) ? profileData?.state?.id : "")
            setDistrict((profileData != undefined && profileData?.districtName != undefined) ? profileData?.districtName : "")
            setDistrictID((profileData != undefined && profileData?.districtId?.id != undefined) ? profileData?.districtId?.id : "")
            setLandMark((profileData != undefined && profileData?.landMark != undefined) ? profileData?.landMark : "")
            setCity((profileData != undefined && profileData?.village != undefined) ? profileData?.village : "")
            setPincode((profileData != undefined && profileData?.pincode != undefined) ? profileData?.pincode : "")
            setAlternateMobNumber((profileData != undefined && profileData?.alternateMobNumber != undefined) ? profileData?.alternateMobNumber : "")
            setGSTNumber((profileData != undefined && profileData?.gstNumber != undefined) ? profileData?.gstNumber : "")
            setPANNumber((profileData != undefined && profileData?.panNumber != undefined) ? profileData?.panNumber : "")
            if (profileData.email != undefined) {
              const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailPattern.test(profileData.email)) {
                setIsItValidEmail(true)
              } else {
                setIsItValidEmail(false)
              }
            }
          }
          else {
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
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
    } else {
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  segregateData = () => {
    console.log('full resp here', userDetailsData)
    var profileData = userDetailsData[0]
    console.log('full resp here001', profileData.latitude, '>>>>>>>>>>>>>>>>', profileData.longitude, "<<<<<<<<<<<<<")
    setTimeout(() => {
      setUserProfileImg((profileData != undefined && profileData.profilePic != undefined) ? profileData.profilePic : "")
      console.log("user Image is:", userProfileImg);
      setRole((profileData != undefined && profileData.roleName != undefined) ? profileData.roleName : "")
      console.log("role is:", role);
      setRoleID((profileData != undefined && profileData.role.id != undefined) ? profileData.role.id : "")
      console.log("roleID is:", roleID);
      setFirmName((profileData != undefined && profileData.firmName != undefined) ? profileData.firmName : "")
      console.log("firmName is:", firmName);
      setProprietorName((profileData != undefined && profileData.proprietorName != undefined) ? profileData.proprietorName : "")
      console.log("proprietorName is:", proprietorName);
      setMobileNumber((profileData != undefined && profileData.mobileNumber != undefined) ? profileData.mobileNumber : "")
      console.log("mobileNumber is:", mobileNumber);
      setDateofBirth((profileData != undefined && profileData.dateofBirth != undefined) ? profileData?.dateofBirth : "")
      console.log("dateofBirth is:", dateofBirth);
      setStoreName((profileData != undefined && profileData.storeName != undefined) ? profileData.storeName : "")
      console.log("storeName is:", storeName);
      setEmail((profileData != undefined && profileData.email != undefined) ? profileData.email : "")
      console.log("email is:", email);
      if (profileData.email != undefined) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(profileData.email)) {
          setIsItValidEmail(true)
          console.log('cominggggg to trrue')
        } else {
          setIsItValidEmail(false)
          console.log('cominggggg to false')
        }
      }

      setAddress((profileData != undefined && profileData.address != undefined) ? profileData.address : "")
      console.log("address is:", address);
      // setLatitude((profileData != undefined && profileData.latitude != undefined) ? profileData.latitude : "")
      // console.log("latitude is:", profileData.latitude);
      // setLongitude((profileData != undefined && profileData.longitude != undefined) ? profileData.longitude : "")
      // console.log("longitude is:", profileData.longitude);
      setTaluk((profileData != undefined && profileData?.block != undefined) ? profileData?.block : "")
      console.log("taluk is:", taluk);
      setState((profileData != undefined && profileData?.stateName != undefined) ? profileData?.stateName : "")
      console.log("state is:", state);
      setStateID((profileData != undefined && profileData?.state?.id != undefined) ? profileData?.state?.id : "")
      console.log("state is:", stateID);
      setDistrict((profileData != undefined && profileData?.districtName != undefined) ? profileData?.districtName : "")
      console.log("district is:", district);
      setDistrictID((profileData != undefined && profileData?.districtId?.id != undefined) ? profileData?.districtId?.id : "")
      console.log("district is:", districtID);
      setLandMark((profileData != undefined && profileData?.landMark != undefined) ? profileData?.landMark : "")
      console.log("landmark is:", landMark);
      setCity((profileData != undefined && profileData?.village != undefined) ? profileData?.village : "")
      console.log("city is:", city);

      setPincode((profileData != undefined && profileData?.pincode != undefined) ? profileData?.pincode : "")
      console.log("pincode is:", pincode);


      setAlternateMobNumber((profileData != undefined && profileData?.alternateMobNumber != undefined) ? profileData?.alternateMobNumber : "")
      console.log("alternateMobNumber is:", alternateMobNumber);
      setGSTNumber((profileData != undefined && profileData?.gstNumber != undefined) ? profileData?.gstNumber : "")
      console.log("gstNumber is:", gstNumber);
      setPANNumber((profileData != undefined && profileData?.panNumber != undefined) ? profileData?.panNumber : "")
      console.log("panNumber is:", panNumber);
    }, 2000);
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


  const updateApiCall = async () => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('submitting_data'))

        var getloginURL = configs.BASE_URL + configs.PROFILE.UPDATE_PROFILE;
        var getHeaders = await GetApiHeaders();
        var getUserID = (await retrieveData(USER_ID))
        var jsonData = {
          "id": getUserID,
          "profilePic": "",
          "roleId": roleID,
          "roleName": role,
          "firmName": firmName,
          "proprietorName": proprietorName,
          "mobileNumber": mobileNumber,
          "dateofBirth": sendDateofBirth,
          "storeName": storeName,
          "email": email,

          "address": address,
          "landMark": landMark,
          "block": taluk,
          "stateId": stateID,
          "stateName": state,
          "districtId": districtID ? districtID : 0,
          "districtName": district,
          "village": city,
          "pincode": pincode,
          "latitude": latitude1,
          "longitude": longitude1,

          // "alternateMobNumber": alternateMobNumber,
          // "gstNumber": gstNumber,
          // "panNumber": panNumber,

          "maritalStatus": "",
          "marriageAnniversary": "",
          "spouseBirthDate": "",

          "status": true
        }
        const formData = new FormData();

        // Append JSON data
        formData.append('jsonData', JSON.stringify(jsonData));

        if (imageDataProfile != undefined && imageDataProfile != "") {
          console.log('what is 0111', imageDataProfile.uri)
          console.log('what is 0222', imageDataProfile.name)
          formData.append('profileImage', {
            uri: imageDataProfile.uri,
            type: 'image/jpeg',
            name: imageDataProfile.name
          });
        } else if (userProfileImg != undefined && userProfileImg != "") {
          if (userProfileImg.startsWith("http://") || userProfileImg.startsWith("https://")) {
            formData.append('profileImage', "");
          }
          else {
            formData.append('profileImage', {
              uri: userProfileImg,
              type: 'image/jpeg',
              name: 'profileImage'
            });
          }
        }
        else {
          formData.append('profileImage', "");
        }

        console.log('what is here01 url', getloginURL)
        console.log('what is here01 headers', getHeaders)
        console.log("FormData:", JSON.stringify(formData));
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
              setSuccessLoadingMessage(translate('profileUpdatedSuccessfully'))
            }, 1000);

            setTimeout(async () => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
              var retailerInfo = APIResponse?.response?.retailerInfo[0];
              console.log(JSON.stringify(retailerInfo), "<--------------- updated data check once", retailerInfo?.proprietorName)
              dispatch(updateRetailerInfoData(retailerInfo));
              storeData(USER_NAME, retailerInfo?.proprietorName);
              const roleTypeDetails = await retrieveData(ROLENAME)
              if (roleTypeDetails) {
                let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard' : 'Dashboard'
                navigation.navigate(navigateTo)
              }
              // navigation.goBack()
              // navigation.navigate('Dashboard')
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
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const openCalender = () => {
    if (isEdit == true) {
      const minDate = new Date(1901, 0, 1);
      setMinDate(new Date(minDate))
      setMaxDate(new Date())
      setDatePicker(true)
    }
  }


  const handleCancelAlert = () => {
    setShowAlert(false)
    //setUploadImageAlert(false)
  }
  const handleOkAlert = async () => {
    console.log('cooooooo')
    if (alertMessage == translate('submit')) {
      submitProfileUpdate(submitedJson);
      setShowAlert(false)
    }
    else if (alertMessage == translate('photo_permission_ios')) {
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
    else if (alertMessage == translate('camera_permission_ios')) {
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

    setShowAlert(false)
    // navigation.goBack()
  }

  onPressCancelBtn = () => {
    setShowSelectionModal(false)
  }

  const openCameraProfilePic = async () => {
    console.log('clciked on camera')

    var image = await ImagePicker.openCamera({
      cropping: false,
      includeBase64: false,
      compressImageQuality: 1.0,
      mediaType: 'photo'
    })
    var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
    console.log(response)

    if (selectedProfile == true) {
      setImageDataProfile(response)
      setImageAdded(true)
      setUserProfileImg({ uri: response.uri })
    }
    else if (selectedPan == true) {
      setImageDataPan(response)
    }
    else if (selectedGst == true) {
      setImageDataGst(response)
    }
    setShowSelectionModal(false)
  }

  let openImagePickerProfilePic = async () => {
    console.log('clciked on gallery')

    var image = await ImagePicker.openPicker({
      cropping: false,
      includeBase64: false,
      compressImageQuality: 1.0,
      mediaType: 'photo'
    })
    var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
    if (selectedProfile == true) {
      setImageDataProfile(response)
      setImageAdded(true)
      setUserProfileImg({ uri: response.uri })
    }
    else if (selectedPan == true) {
      setImageDataPan(response)

    }
    else if (selectedGst == true) {
      setImageDataGst(response)
    }

    setShowSelectionModal(false)
  }

  const editButtonPress = () => {
    setIsEdit(true)
  }

  async function showPopup() {
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
          handleLocation()
        } else {
          console.log("Location permission denied");
          showPermissionDeniedAlert();
        }
      } else {
        const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (permission === RESULTS.GRANTED) {
          console.log("iOS location permission granted");
          handleLocation()
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

  const handleLocation = async () => {
    const gpsEnabled = await checkIfGpsEnabled();
    if (gpsEnabled) {
      console.log('handle location called')
      console.log('latitude1 is', latitude1)
      console.log('longitude1 is', longitude1)
      navigation.navigate('Location', { primaryColor: primaryColor, secondaryColor: secondaryColor, textColor: textColor, screen: "MyAccount", address: address, latitude: latitude1, longitude: longitude1, zoom: 18 })
    }

  }

  return (
    <View style={[styles['full_screen'], { backgroundColor: dynamicStyles.primaryColor }]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

      <View style={[styles[''], styles[''], {
        padding: 20,
        borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20, 
      }]}>
        <TouchableOpacity style={[styles['flex_direction_row'], {alignItems:'center'}]} onPress={() => { goBack() }}>
          <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles['font_size_18_bold'], { color: dynamicStyles.secondaryColor, }]}>{translate('myaccount')}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles['width_100%'], styles['height_100%'], styles['flex_1']]}>

        <Image style={[styles['width_100%'], styles['height_40'], styles['bottom_minus_1'], styles['margin_top_30']]} resizeMode='stretch' source={require('../assets/images/pyramid.png')}></Image>
        <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true} style={[{ height: '100%', backgroundColor: Colors.white }]}>
          <View style={[styles['width_100%'], styles['bg_white'], { flex: 1, height: '100%', marginBottom: 75 }]}>
            <View style={[styles['bg_white'], styles['width_100%'], styles['height_100%']]}>
              <View style={[styles['top_5'], styles['align_self_center'], styles['margin_bottom_10']]}>
                {console.log("USER_IMAGE showing", userProfileImg)}
                <CustomCircularImageView
                  badgeIcon={isEdit == true ? '' : badgeIcon}
                  stylesOfBadge={isEdit == true ? {} : {
                    height: 60, width: 60, resizeMode: "contain", position: "absolute", bottom: -responsiveHeight(2.5), right: responsiveWidth(-2)
                  }}
                  source={userProfileImg != undefined ? (userProfileImg.toString().includes("https:") || userProfileImg.toString().includes("http:")) ? { uri: userProfileImg } : userProfileImg != "" ? { uri: imageDataProfile.uri } : require('../assets/images/profileIcon.png') : require('../assets/images/profileIcon.png')}
                  size={95} />
                {isEdit == true && <TouchableOpacity style={[styles['margin_top_minus_30'], styles['align_self_flex_end'], styles['flex_direction_row'], styles['width_height_30'], styles['alignItems_center'], styles['justify_content_center'], styles['margin_right_25'], { backgroundColor: dynamicStyles.primaryColor, borderRadius: 22 }]} onPress={() => { profileImageButtonPress() }}>
                  <Image style={[styles['width_height_15'], , { tintColor: dynamicStyles.secondaryColor }]} resizeMode='contain' source={require('../assets/images/camera_new.png')}></Image>
                </TouchableOpacity>}
              </View>
              <View style={[styles['margin_top_5'], styles['height_40']]}>
                <View style={[styles['centerItems'], styles['margin_bottom_15']]}>
                  <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.textColor }]}>{proprietorName}</Text>
                  <Text style={[styles['font_size_13_regular']]}>{'+91'} {mobileNumber}</Text>
                </View>
                {isEdit != true &&
                  <View style={[styles['absolute_position'], styles['align_self_flex_end'], styles['right_15'], styles['']]}>
                    <TouchableOpacity style={[styles['flex_direction_row'], styles['width_height_25'], styles['alignItems_center'], styles['justify_content_center'], styles['margin_right_20'], { backgroundColor: dynamicStyles.primaryColor, borderRadius: 22 }]} onPress={() => { editButtonPress() }}>
                      <Image style={[styles['width_height_15'], { tintColor: dynamicStyles.secondaryColor }]} resizeMode='' source={require('../assets/images/edit_new.png')}></Image>
                    </TouchableOpacity>
                  </View>
                }
              </View>

              <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>
              <View style={[styles['shadow_box'], styles['bg_white'], styles['align_self_center'], styles['border_radius_5'], styles['margin_top_10'], { width: '90%' }]}>
                <View style={[{ height: 40, width: '90%' }, styles['align_self_center']]}>
                  <TouchableOpacity style={[styles['height_100%'], styles['width_100%'], styles['border_radius_8'], styles['justify_content_center'], styles['align_self_center']]} onPress={generalButtonPress}>
                    <Text style={[styles['width_85%'], styles['text_align_left'], styles['font_size_16_semibold'], { color: dynamicStyles.textColor }]}>{translate('basic_information')}</Text>
                    <View style={[styles['width_height_20'], styles['right_10'], styles['alignItems_center'], styles['absolute_position'], styles['justify_content_center'], { backgroundColor: dynamicStyles.primaryColor, borderRadius: 5 }]} onPress={() => { generalButtonPress() }}>
                      <Image style={[styles['width_height_10'], { tintColor: dynamicStyles.secondaryColor }]} resizeMode='contain' source={sectionGeneralOpen ? require('../assets/images/up_arrow.png') : require('../assets/images/down_arow.png')}></Image>
                    </View>
                  </TouchableOpacity>
                </View>
                {sectionGeneralOpen == true && <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>}

                {/* General Section */}
                {sectionGeneralOpen == true &&
                  <View style={[styles['align_self_center'], styles['margin_top_5']]}>

                    <View>
                      <CustomInputDropDown
                        width={[styles['width_90%'], styles[''], styles['centerItems']]}
                        defaultValue={role != undefined && role != translate('select') ? role : translate('select')}
                        labelName={translate('memberType')}
                        IsRequired={true}
                        disabled={true}
                        placeholder={translate('memberType')}
                        onEndEditing={async event => {
                          // calculateTotalOrderValue()
                        }}
                        onFocus={() => {
                          if (isEdit == true) {
                            // changeDropDownData(roleList, strings.memberType, role)
                          }
                        }}
                      />

                      <View style={[styles['margin_top_10']]}>
                        <CustomTextInput
                          style={[styles['margin_top_20'], styles['centerItems']]}
                          labelName={translate('proprietorName')}
                          IsRequired={true}
                          maxLength={30}
                          keyboardType='default'
                          placeholder={translate('enter') + " " + translate('proprietorName')}
                          value={proprietorName}
                          editable={isEdit}
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

                      <View style={[styles['margin_top_10']]}>
                        <CustomTextInput
                          style={[styles['margin_top_20'], styles['centerItems']]}
                          labelName={translate('firmName')}
                          maxLength={30}
                          IsRequired={true}
                          keyboardType='default'
                          placeholder={translate('enter') + " " + translate('firmName')}
                          value={firmName}
                          editable={isEdit}
                          onFocus={() => {
                          }}
                          onChangeText={(text) => {
                            var enteredText = text.replace(/[^\w\s]/gi, '')
                            setFirmName(enteredText)
                          }}
                          onEndEditing={event => {

                          }}
                        />
                      </View>


                      <View style={[styles['margin_top_10']]}>
                        <CustomTextInput style={[styles['top_100'], styles['centerItems']]}
                          labelName={translate('mobile_number')}
                          IsRequired={true}
                          maxLength={10}
                          keyboardType='number-pad'
                          placeholder={translate('enter') + " " + translate('mobile_number')}
                          value={mobileNumber}
                          editable={false}
                          // editable={isEdit}
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

                      <View style={[styles['margin_top_10']]}>
                        <CustomCalanderSelection
                          width={[styles['width_90%']]}
                          defaultValue={dateofBirth != "" ? dateofBirth : translate('select') + " " + translate('dateofBirth')}
                          labelName={translate('dateofBirth')}
                          IsRequired={true}
                          onEndEditing={event => {
                          }}
                          onFocus={
                            openCalender
                          }
                        />
                      </View>

                      <View style={[styles['margin_top_10']]}>
                        <CustomTextInput
                          style={[styles['margin_top_20'], styles['centerItems']]}
                          labelName={translate('storeName')}
                          IsRequired={true}
                          maxLength={30}
                          keyboardType='default'
                          placeholder={translate('enter') + " " + translate('storeName')}
                          value={storeName}
                          editable={isEdit}
                          onFocus={() => {
                          }}
                          onChangeText={(text) => {
                            setStoreName(text)
                          }}
                          onEndEditing={event => {

                          }}
                        />
                      </View>

                      <View style={[styles['margin_top_20'], styles['margin_bottom_20']]}>
                        <CustomTextInput
                          style={[styles['margin_top_20'], styles['centerItems']]}
                          labelName={translate('email')}
                          IsRequired={false}
                          maxLength={50}
                          keyboardType='default'
                          placeholder={translate('enter') + " " + translate('email')}
                          value={email}
                          editable={isEdit}
                          onFocus={() => {
                          }}
                          onChangeText={(text) => {
                            console.log('this is on change text email', text)
                            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (emailPattern.test(text)) {
                              setIsItValidEmail(true)
                              console.log('Success', 'Valid email address.');
                            } else {
                              setIsItValidEmail(false)
                              console.log('Error', 'Please enter a valid email address.');
                            }
                            setEmail(text)
                          }}
                          onEndEditing={event => {

                          }}
                        />
                      </View>
                    </View>
                  </View>
                }
              </View>
              <View style={[styles['shadow_box'], styles['bg_white'], styles['align_self_center'], styles['border_radius_5'], styles['margin_top_10'], { width: '90%' }]}>
                <View style={[{ height: 40, width: '90%' }, styles['align_self_center']]}>
                  <TouchableOpacity style={[styles['height_100%'], styles['width_100%'], styles['border_radius_8'], styles['justify_content_center'], styles['align_self_center']]} onPress={addressButtonPress}>
                    <Text style={[styles['width_85%'], styles['text_align_left'], styles['font_size_16_semibold'], { color: dynamicStyles.textColor }]}>{translate('address')}</Text>
                    {/* <View style={[styles['right_10'], styles['align_items_flex_end'], styles['absolute_position'], styles['']]}>
                      <Image
                        style={[{ width: 16, height: (Platform.OS == 'android') ? 16 : (Platform.OS == 'android') ? 7 : 15 }]}
                        source={sectionAddressOpen ? require('../assets/images/sectionUpArrow.png') : require('../assets/images/sectionDownArrow.png')} />
                    </View> */}
                    <View style={[styles['width_height_20'], styles['right_10'], styles['alignItems_center'], styles['absolute_position'], styles['justify_content_center'], { backgroundColor: dynamicStyles.primaryColor, borderRadius: 5 }]}>
                      <Image style={[styles['width_height_10'], { tintColor: dynamicStyles.secondaryColor }]} resizeMode='contain' source={sectionAddressOpen ? require('../assets/images/up_arrow.png') : require('../assets/images/down_arow.png')}></Image>
                    </View>
                  </TouchableOpacity>
                </View>
                {sectionAddressOpen == true && <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>}
                {/* Address Section */}
                {sectionAddressOpen == true &&
                  <View style={[styles['margin_top_5']]}>
                    {/* <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View> */}
                    <View style={[styles['']]}>
                      <CustomTextInput
                        style={[styles['margin_top_10'], styles['centerItems']]}
                        labelName={translate('address')}
                        IsRequired={true}
                        maxLength={120}
                        keyboardType='default'
                        placeholder={translate('address')}
                        value={address}
                        editable={false}
                        // editable={isEdit}
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
                    {isEdit ?
                      <TouchableOpacity onPress={() => { showPopup() }} style={[styles['right_20'], styles['align_items_flex_end'], styles['absolute_position'], styles['margin_top_40']]}>
                        <Image style={{ width: 20, height: Platform.OS === 'android' ? 15 : address == "" ? 15 : 20, resizeMode: 'contain' }} source={require('../assets/images/locationMarker.png')} />
                      </TouchableOpacity> : ''}

                    <View style={[styles['margin_top_10']]}>
                      <CustomTextInput
                        style={[styles['margin_top_20'], styles['centerItems']]}
                        labelName={translate('landMark')}
                        maxLength={50}
                        IsRequired={false}
                        keyboardType='default'
                        placeholder={translate('enter') + " " + translate('landMark')}
                        value={landMark}
                        editable={isEdit}
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

                    <View style={[styles['margin_top_10']]}>
                      <CustomTextInput
                        style={[styles['margin_top_20'], styles['centerItems']]}
                        labelName={translate('villagecity')}
                        maxLength={50}
                        IsRequired={false}
                        keyboardType='default'
                        placeholder={translate('enter') + " " + translate('village')}
                        value={city}
                        editable={isEdit}
                        onFocus={() => {
                        }}
                        onChangeText={(text) => {
                          setCity(text)
                        }}
                        onEndEditing={event => {

                        }}
                      />
                    </View>

                    <View style={[styles['margin_top_10']]}>
                      <CustomTextInput
                        style={[styles['margin_top_20'], styles['centerItems']]}
                        labelName={translate('taluk')}
                        maxLength={50}
                        IsRequired={false}
                        keyboardType='default'
                        placeholder={translate('enter') + " " + translate('taluk')}
                        value={taluk}
                        editable={isEdit}
                        onFocus={() => {
                        }}
                        onChangeText={(text) => {
                          var enteredText = text.replace(/[^\w\s]/gi, '')
                          setTaluk(enteredText)
                        }}
                        onEndEditing={event => {

                        }}
                      />
                    </View>

                    {/* state*/}
                    <CustomInputDropDown
                      width={[styles['width_91%'], styles['margin_top_10'], styles['centerItems']]}
                      defaultValue={state != undefined && state != translate('select') ? state : translate('select')}
                      labelName={translate('state')}
                      IsRequired={true}
                      disabled={true}
                      placeholder={translate('state')}
                      onEndEditing={async event => {
                        // calculateTotalOrderValue()
                      }}
                      onFocus={() => {
                        if (isEdit == true) {
                          // changeDropDownData(filteredStateList.length > 0 ? filteredStateList : stateList, strings.state, state)
                        }
                      }}
                    />

                    {/* district */}
                    <CustomInputDropDown
                      width={[styles['width_91%'], styles['margin_top_10'], styles['centerItems']]}
                      defaultValue={district != undefined && district != translate('select') ? district : translate('select')}
                      labelName={translate('district')}
                      IsRequired={true}
                      disabled={true}
                      placeholder={translate('district')}
                      onEndEditing={async event => {
                        // calculateTotalOrderValue()
                      }}
                      onFocus={() => {
                        if (isEdit == true) {
                          // changeDropDownData(filteredDistrictList.length > 0 ? filteredDistrictList : districtList, strings.district, district)
                        }
                      }}
                    />

                    <View style={[styles['margin_top_10'], styles['margin_bottom_20']]}>
                      <CustomTextInput
                        style={[styles['margin_top_20'], styles['centerItems']]}
                        labelName={translate('pincode')}
                        IsRequired={true}
                        maxLength={6}
                        keyboardType='numeric'
                        placeholder={translate('enter') + " " + translate('pincode')}
                        value={pincode}
                        // editable={isEdit}
                        editable={false}
                        onFocus={() => {
                        }}
                        onChangeText={(text) => {
                          if (validatePincode(text)) {
                            setPincode(text);
                          }
                        }}
                        onEndEditing={event => {

                        }}
                      />
                    </View>
                  </View>
                }
              </View>

              {isEdit == true &&
                <View style={[styles['align_self_center'], styles['width_100%']]}>
                  <CustomButton title={translate('save')} onPress={saveButtonPress} buttonBg={dynamicStyles.primaryColor} btnWidth={"90%"} titleTextColor={dynamicStyles.secondaryColor} />
                </View>
              }

              <CustomGalleryPopup
                showOrNot={showSelectionModal}
                onPressingOut={() => setShowSelectionModal(false)}
                onPressingCamera={() => openCameraProfilePic()}
                onPressingGallery={() => openImagePickerProfilePic()}
              />
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

      {showDatePicker && (
        // <CustomCalendarModal
        //   labelName={translate('dateofBirth')}
        //   visible={true}
        //   mode="date"
        //   date={new Date(selectedDate)}
        //   onConfirm={(date) => { handleConfirm(date) }}
        //   onCancel={() => handleCancel()}
        //   minimumDate={new Date(minimumDate)}
        //   maximumDate={new Date(maximumDate)}
        // />
        <DateTimePickerModal
          isVisible={true}
          mode="date"
          is24Hour={false}
          date={new Date(selectedDate)}
          minimumDate={new Date(1901, 0, 1)}
          maximumDate={new Date()}
          onConfirm={(date) => { handleConfirm(date) }}
          onCancel={() => handleCancel()}
        />
      )}

      {showDropDowns &&
        <CustomListViewModal
          dropDownType={dropDownType}
          listItems={dropDownData}
          selectedItem={selectedDropDownItem}
          onSelectedRole={(item) => onSelectedRole(item)}
          onSelectedState={(item) => onSelectedState(item)}
          onSelectedDistrict={(item) => onSelectedDistrict(item)}
          closeModal={() => setShowDropDowns(false)} />}

      {/* {uploadImageAlert && (
        <CustomUploadDocumentAlert
          onPressClose={handleCancelAlert}
          documentTitle={"GST"}
          documentName={documentName}
          selectedImageUri={documentUri}
          onPressUploadButton={handleUploadButtonAction}
          documentButtonText={translate('upload')}
          documentObject={handleDocumentObj}
          moduleName='ds'
        />
      )} */}
      {!role && !loading && networkStatus && <CustomLoader loading={true} message={translate('please_wait_getting_data')} loaderImage={loaderImage} />}
      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
    </View>
  )


}

export default MyAccount;