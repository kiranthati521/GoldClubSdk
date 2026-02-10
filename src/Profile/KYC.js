import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, PermissionsAndroid, AppState, Linking, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import CustomBorderTextInput from '../Components/CustomBorderTextInput';
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { MOBILE_NUMBER, USER_ID, readFileToBase64, requestMultiplePermissions, retrieveData, ROLENAME } from '../assets/Utils/Utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import CustomAlert from '../Components/CustomAlert';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomLoader from '../Components/CustomLoader';
import { GetApiHeaders, PostRequest, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { PERMISSIONS, check } from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from "react-native-image-resizer";
import DeviceInfo from 'react-native-device-info';
import { HTTP_OK, HTTP_SWITCHING_PROTOCOLS, configs } from '../helpers/URLConstants';
import SimpleToast from 'react-native-simple-toast';
import CustomBorderDocumetUpload from '../Components/CustomBorderDocumetUpload';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import CustomGalleryPopup from '../Components/CustomGalleryPopup';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
// import { ScrollView } from "react-native";

var styles = BuildStyleOverwrite(Styles);


function KYC({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const [loading, setLoading] = useState(false)
  const ekycStatus = route.params.ekycStatus
  // alert(ekycStatus)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const networkStatus = useSelector(state => state.networkStatus.value)

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
  const [name, setName] = useState('')
  const [firmName, setFirmName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [villageCity, setVillageCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [addressLineOne, setAddressLineOne] = useState('')
  const [addressLineTwo, setAddressLineTwo] = useState('')
  const [categoryList, setCategoryList] = useState('')
  const [remarks, setRemarks] = useState("");
  const [seedLicenseNumber, setSeedLicenseNumber] = useState('')

  const [showSelectionModal, setShowSelectionModal] = useState(false)
  const [userProfileImg, setUserProfileImg] = useState()
  const [base64ImageData, setBase64ImageData] = useState("")
  const [imageData, setImageData] = useState(null)
  const [selectedPan, setSelectedPan] = useState(false)
  const [selectedGst, setSelectedGst] = useState(false)
  const [selectedKYC, setSelectedKYC] = useState(false)
  const [gstImageData, setgstImageData] = useState(null)
  const [panImageData, setPanImageData] = useState(null)
  const [dataEditable, setDataEditable] = useState(false);
  const [isEdit, setIsEdit] = useState(false)
  const [alternateMobileNumber, setAlternateMobileNumber] = useState("")
  const [gstNumber, setGSTNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [selectedPanImage, setSelectedPanImage] = useState(false)
  const [selectedGstImage, setSelectedGstImage] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [originalPanNumber, setOriginalPanNumber] = useState("");
  const [originalSeedLicenseNumber, setOriginalSeedLicenseNumber] = useState("");
  const [originalGstNumber, setOriginalGstNumber] = useState("");
  const [originalAlternateMobileNumber, setOriginalAlternateMobileNumber] = useState("");
  const [showImages, setShowImages] = useState(false)
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);

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
  const [panKeyboardType, setPanKeyboardType] = useState('default');
  const [gstKeyboardType, setGSTKeyboardType] = useState('numeric');
  const [seedKeyboardType, setSeedKeyboardType] = useState('default');
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const [isValid, setIsValid] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      handleFocus();
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [])
  );

  useEffect(() => {

  }, [panKeyboardType])

  const handleFocus = () => {
    console.log('Screen is focused!');
    getKycDetails()
    if (ekycStatus?.toLowerCase() == strings.pending.toLowerCase() || ekycStatus?.toLowerCase() == strings.approve.toLowerCase() || ekycStatus?.toLowerCase() == strings.reject.toLowerCase()) {
      setDataEditable(false)
      setIsEdit(true)
      setShowImages(true)
    } else {
      setDataEditable(true)
      setIsEdit(false)
      setShowImages(true)
    }
  };

  const editButtonPress = () => {
    setDataEditable(true)
  }

  const getKycDetails = async () => {
    if (!networkStatus) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var getKYCURL = configs.BASE_URL + configs.MASTERS.GET_KYC_DETAILS;
        var getHeaders = await GetApiHeaders();
        var inputobj = {
          "retailerId": getHeaders?.userId,
          "retailerMobileNumber": getHeaders?.mobileNumber
        }

        console.log(getHeaders);

        var APIResponse = await PostRequest(getKYCURL, getHeaders, inputobj);
        setTimeout(() => {
          setLoadingMessage()
          setLoading(false)
        }, 500);
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse?.statusCode == HTTP_OK) {
            var kycData = APIResponse?.response?.ekycList[0]

            console.log("SAINATh_KYC", JSON.stringify(kycData));
            setAlternateMobileNumber(kycData?.alternateMobNumber)
            setGSTNumber(kycData?.gstNumber)
            setPanNumber(kycData?.panNumber)
            setSeedLicenseNumber(kycData?.seedLicenseNumber)

            setOriginalPanNumber(kycData?.panNumber)
            setOriginalSeedLicenseNumber(kycData?.seedLicenseNumber)
            setOriginalGstNumber(kycData?.gstNumber)
            setOriginalAlternateMobileNumber(kycData?.alternateMobNumber)

            if (kycData?.panImage != undefined && kycData?.panImage != '') {
              console.log('006')
              setPanImageData({ uri: kycData?.panImage })
            }
            if (kycData?.gstImage != undefined && kycData?.gstImage != '') {
              console.log('008')
              setgstImageData({ uri: kycData?.gstImage })
            }
            if (kycData?.ekycFile != undefined && kycData?.ekycFile != '') {
              console.log('007')
              setImageData({ uri: kycData?.ekycFile })
            }
          } else if (APIResponse?.statusCode == HTTP_SWITCHING_PROTOCOLS) {
            setDataEditable(true)
            setIsEdit(false)
          }
        }
      } catch (error) {
        setLoadingMessage()
        setLoading(false)
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const getKeyboardType = (text) => {
    const isValidPAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(text);

    return isValidPAN ? 'default' : 'numeric';
  };

  const handleLoading = () => {
    setLoading(false);
  }

  useEffect(() => {
    handleLoading();
    console.log("PANNUMBER", panNumber);
  }, [])

  

  useEffect(() => {
  }, [selectedPanImage, selectedGstImage])

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
    navigation.goBack()
  };


  const handleCancelAlert = () => {
    setShowAlert(false)
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
    else if (alertMessage == translate('theRequestHas')) {
      navigation.pop(2)
    }

    setShowAlert(false)
    // navigation.goBack()
  }

  const _renderCamera = (item, index) => {
    return (
      <TouchableOpacity style={[styles['width_90%'], styles['bg_white'], styles['centerItems']]} onPress={() => { onPressItems(item) }}>
        <Text style={[styles['font_size_12_regular'], styles['text_color_black'], styles['text_align_center'], { padding: 15 }]}>{item.title}
        </Text>
        {(index + 1 != types.length) && <View style={[styles['width_95%'], styles['centerItems'], { borderBottomWidth: 1, borderBottomColor: Colors.very_light_grey }]} />}
      </TouchableOpacity >
    )
  }

  let openCameraProfilePic = async () => {
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
      if (selectedKYC) {
        setImageData(response)
        setUserProfileImg({ uri: response.uri })
      } else if (selectedGst) {
        setSelectedGstImage(true)
        setgstImageData(response)
      } else if (selectedPan) {
        setSelectedPanImage(true)
        setPanImageData(response)
      }
    }
    catch (err) {
      console.log(err)
    }
    setShowSelectionModal(false)
  }

  let openImagePickerProfilePic = async () => {
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

      if (selectedKYC) {
        setImageData(response)
        setUserProfileImg({ uri: response.uri })
      } else if (selectedGst) {
        setSelectedGstImage(true)
        setgstImageData(response)
      } else if (selectedPan) {
        setSelectedPanImage(true)
        setPanImageData(response)
      }
    }
    catch (err) {
      console.error(err)
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
            {((dataEditable && isEdit) || ekycStatus == "") && <Text style={[styles['font_size_12_regular'], { margin: 10, color: Colors.themeRed, textAlign: 'center' }]}>{translate('editInfo')}</Text>}
            <TouchableOpacity style={[styles['centerItems'], styles['margin_top_2'], styles['cellBgColor'], { padding: 15, margin: 10, elevation: 5, height: Dimensions.get('screen').height / 3.25, width: Dimensions.get('screen').width / 1.5 }]} onLongPress={() => { setShowDeleteButton(true) }}>
              <Image source={{ uri: selectedPan ? panImageData?.uri : selectedKYC ? imageData?.uri : gstImageData?.uri }} style={[styles['centerItems'], { height: '90%', width: '90%' }]} resizeMode="contain" />
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
    if (selectedPan) {
      setPanImageData(null)
    } else if (selectedGst) {
      setgstImageData(null)
    } else if (selectedKYC) {
      setImageData(null)
    }
    setIsModalVisible(false)
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


  const submitButtonPress = () => {
    // if (alternateMobileNumber == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('alternativeNumber'), false, true, translate('ok'), translate('cancel'))
    // } else if (alternateMobileNumber.length < 10) {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('alternativeNumber'), false, true, translate('ok'), translate('cancel'))
    // } else 


    if (panNumber == undefined || panNumber == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('panNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if (panNumber != "" && panNumber.length < 10) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('panNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if (panImageData == null) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('upload_pan_doc'), false, true, translate('ok'), translate('cancel'))
    }
    else if (gstImageData != null && (gstNumber == undefined || gstNumber == null || gstNumber == "")) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('gstNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if (imageData != null && (seedLicenseNumber == undefined || seedLicenseNumber == null || seedLicenseNumber == "")) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('seedLicenseNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if ((seedLicenseNumber == undefined || seedLicenseNumber == "") && (gstNumber == undefined || gstNumber == "")) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('seedLicenseNumber') + " or " + translate('gstNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if (seedLicenseNumber != undefined && seedLicenseNumber != "" && seedLicenseNumber.length < 4) {
      showAlertWithMessage(translate('alert'), true, true, translate('please_enter_min_four') + " " + translate('seedLicenseNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if (seedLicenseNumber != undefined && seedLicenseNumber != "" && imageData == null) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('upload_license_doc'), false, true, translate('ok'), translate('cancel'))
    }
    else if (gstNumber != undefined && gstNumber != "" && gstNumber.length < 4) {
      showAlertWithMessage(translate('alert'), true, true, translate('please_enter_min_four') + " " + translate('gstNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else if (gstNumber != undefined && gstNumber != "" && gstImageData == null) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('upload_gst_doc'), false, true, translate('ok'), translate('cancel'))
    }
    else if (alternateMobileNumber != undefined && alternateMobileNumber != "" && alternateMobileNumber.length < 10) {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('alternativeNumber'), false, true, translate('ok'), translate('cancel'))
    }
    else {
      // if (isEdit == true && (originalPanNumber != panNumber && (originalSeedLicenseNumber != seedLicenseNumber || originalGstNumber != gstNumber || originalAlternateMobileNumber != alternateMobileNumber))) {
      //   rasiseRequestAPICall(1);
      // } else if (isEdit == true && (originalPanNumber != panNumber && (originalSeedLicenseNumber == seedLicenseNumber || originalGstNumber == gstNumber || originalAlternateMobileNumber == alternateMobileNumber))) {
      //   rasiseRequestAPICall(0);
      // } else {
      uploadDataWithImage(0);
      // }
    }
  }

  const rasiseRequestAPICall = async (status) => {
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
          "panImage": (panImageData != undefined && panImageData != null && panImageData != "" && (panImageData.uri.includes("http") || panImageData.uri.includes("https"))) ? panImageData.uri : ""
        }

        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(dataList));

        if (panImageData != undefined && panImageData != null && panImageData != "" && !(panImageData.uri.includes("http") || panImageData.uri.includes("https"))) {
          formData.append('panImage', {
            uri: panImageData.uri,
            type: 'image/jpeg',
            name: panImageData.name
          });
        }

        console.log("FormData:", JSON.stringify(formData));

        const APIResponse = await uploadFormData(formData, getloginURL, getHeaders);
        console.log('APIResponse APIResponseis:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            if (status == 0) {
              setLoadingMessage()
              setLoading(false)
            } else {
              setLoadingMessage()
              setLoading(false)
            }
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              if (status == 0) {
                setLoading(false)
              } else {

              }
            }, 1000);

            var dashboardRespBYPASS = APIResponse.response
            console.log('the dash board Resp is BYPASS', dashboardRespBYPASS)
            if (status == 0) {
              showAlertWithMessage(translate('alert'), true, true, translate('theRequestHas'), true, false, translate('ok'), translate('cancel'))
            } else {
              uploadDataWithImage(status);
            }

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

  const uploadDataWithImage = async (panStatus) => {
    if (networkStatus) {
      try {
        setLoading(true);
        setLoadingMessage(translate('submitting_data'));

        var getURL = configs.BASE_URL + configs.PROFILE.EKYC;
        var getHeaders = await GetApiHeaders();
        var getUserID = (await retrieveData(USER_ID))
        var getUserNumber = (await retrieveData(MOBILE_NUMBER))

        const jsonData = {
          "retailerId": getUserID,
          "seedLicenseNumber": seedLicenseNumber != undefined ? seedLicenseNumber : "",
          "retailerMobileNumber": getUserNumber,
          "alternateMobNumber": alternateMobileNumber != undefined ? alternateMobileNumber : "",
          "gstNumber": gstNumber != undefined ? gstNumber : "",
          "panNumber": panNumber,
          "ekycFile": (imageData != undefined && imageData != null && imageData != "" && (imageData.uri.includes("http") || imageData.uri.includes("https"))) ? imageData.uri : "",
          "panImage": (panImageData != undefined && panImageData != null && panImageData != "" && (panImageData.uri.includes("http") || panImageData.uri.includes("https"))) ? panImageData.uri : "",
          "gstImage": (gstImageData != undefined && gstImageData != null && gstImageData != "" && (gstImageData.uri.includes("http") || gstImageData.uri.includes("https"))) ? gstImageData.uri : ""
        };

        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(jsonData));

        console.log('what is here url', getURL)
        console.log('what is here headers', getHeaders)
        console.log('what is here body', formData)


        if (imageData != undefined && imageData != null && imageData != "" && !(imageData.uri.includes("http") || imageData.uri.includes("https"))) {
          formData.append('ekycFile', {
            uri: imageData.uri,
            type: 'image/jpeg',
            name: imageData.name
          });
        }

        if (panImageData != undefined && panImageData != null && panImageData != "" && !(panImageData.uri.includes("http") || panImageData.uri.includes("https"))) {
          formData.append('panImage', {
            uri: panImageData.uri,
            type: 'image/jpeg',
            name: panImageData.name
          });
        }

        if (gstImageData != undefined && gstImageData != null && gstImageData != "" && !(gstImageData.uri.includes("http") || gstImageData.uri.includes("https"))) {
          formData.append('gstImage', {
            uri: gstImageData.uri,
            type: 'image/jpeg',
            name: gstImageData.name
          });
        }

        console.log("FormData:", JSON.stringify(formData));

        const APIResponse = await uploadFormData(formData, getURL, getHeaders);

        console.log('KYC response:', APIResponse);

        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse && APIResponse.statusCode === HTTP_OK) {
            setTimeout(() => {
              if (panStatus == 0) {
                setLoading(false)
                setSuccessLoading(true)
                setSuccessLoadingMessage(translate('kyc_data_submitted_successfully'))
              } else {
                showAlertWithMessage(translate('alert'), true, true, translate('theRequestHas'), true, false, translate('ok'), translate('cancel'))
              }
            }, 1000);

            setTimeout(async () => {
              if (panStatus == 0) {
                setSuccessLoading(false);
                setSuccessLoadingMessage();
                // navigation.pop(2)
                const roleTypeDetails = await retrieveData(ROLENAME)
                if (roleTypeDetails) {
                  let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard' : 'Dashboard'
                  navigation.navigate(navigateTo, { showRedeemPopup: true })
                }
                // navigation.navigate('Dashboard',{showRedeemPopup:true})
              }
            }, 3000);
          } else {
            const errorMessage = APIResponse ? APIResponse.message : 'Unknown error occurred';
            showAlertWithMessage(translate('alert'), true, true, errorMessage, false, true, translate('ok'), translate('cancel'));
          }
        }
        else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 500);
        }
      }
      catch (error) {
        console.error('Error submitting data:', error);
        setLoading(false);
        setSuccessLoadingMessage(error.message);
      }

    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const gstDocumentPress = (docType) => {
    if (docType == translate('upload_pan_doc')) {
      setSelectedPan(true)
      setSelectedKYC(false)
      setSelectedGst(false)
    }
    else if (docType == translate('upload_license_doc')) {
      setSelectedKYC(true)
      setSelectedGst(false)
      setSelectedPan(false)
    }
    else if (docType == translate('upload_gst_doc')) {
      setSelectedGst(true)
      setSelectedPan(false)
      setSelectedKYC(false)
    }
    setShowSelectionModal(true)
  }
  const handleViewClicked = (docType) => {
    if (docType == translate('upload_pan_doc')) {
      setSelectedPan(true)
      setSelectedKYC(false)
      setSelectedGst(false)
    } else if (docType == translate('upload_gst_doc')) {
      setSelectedGst(true)
      setSelectedPan(false)
      setSelectedKYC(false)
    } else {
      setSelectedGst(false)
      setSelectedPan(false)
      setSelectedKYC(true)
    }
    setIsModalVisible(true)
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

  const handleSeedTextChange = (input) => {
    const filteredText = input.replace(/[^\w\/]/gi, '');
    // if (filteredText.length <= 3) {
    //   setSeedKeyboardType('default')
    // } else if (filteredText.length >= 4 && filteredText.length < 10) {
    //   setSeedKeyboardType('numeric')
    // }
    setSeedLicenseNumber(filteredText)
  }

  const handleGSTOnChange = (input) => {
    let filteredText = input.replace(/[^a-zA-Z0-9]/g, '');

    if (filteredText.length < 2) {
      setGSTKeyboardType('numeric');
    } else if (filteredText.length >= 2 && filteredText.length <= 6) {
      setGSTKeyboardType('default');
    } else if (filteredText.length >= 7 && filteredText.length < 11) {
      setGSTKeyboardType('numeric');
    } else if (filteredText.length >= 11 && filteredText.length < 12) {
      setGSTKeyboardType('default');
    } else if (filteredText.length >= 12 && filteredText.length < 13) {
      setGSTKeyboardType('numeric');
    } else if (filteredText.length >= 13) {
      setGSTKeyboardType('default');
    } else {
      setGSTKeyboardType('default');
    }

    setGSTNumber(filteredText);
  };



  return (
    <View style={[styles['full_screen'], { backgroundColor: dynamicStyles.primaryColor }]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

      <View style={[{ paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[styles['flex_direction_row'], {alignItems : 'center'}]} onPress={() => { goBack() }}>
          <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles[''], { color: dynamicStyles.secondaryColor }, styles[''], styles['font_size_18_bold']]}>{translate('ekyc')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles['width_100%'], styles['flex_1']]}>

        {/* <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_20'], styles[''], styles['tint_color_white'], { height: 20, width: 25, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles[''], styles['text_color_white'], styles[''], styles['font_size_14_bold'], { marginTop: 5 }]}>{translate('ekyc')}</Text>
        </TouchableOpacity> */}

        <Image style={[styles['margin_top_20'], styles['width_100%'], styles['height_40'], styles['bottom_minus_1']]} resizeMode='stretch' source={require('../assets/images/pyramid.png')}></Image>
        <View style={[styles['bg_white'], styles['width_100%'], , styles['flex_1'], styles['']]}>


          <Text style={[styles['top_5'], styles['height_40'], { color: dynamicStyles.textColor }, styles['centerItems'], styles['font_size_24_bold']]}>{translate('ekyc').toUpperCase()}</Text>
          <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>

          <View style={[styles['margin_top_5'], styles['height_40']]}>
            {isEdit &&
              // <View style={[styles['absolute_position'], styles['align_self_flex_end'], styles['right_15'], styles['']]}>
              //   <TouchableOpacity onPress={() => { editButtonPress() }}>
              //     <Image style={[styles['width_height_30'], styles['align_self_flex_end'], styles['right_15'],{}]} source={require('../assets/images/editGreen.png')}></Image>
              //   </TouchableOpacity>
              // </View>
              <View style={[styles['absolute_position'], styles['align_self_flex_end'], styles['right_15'],]}>
                <TouchableOpacity style={[styles['flex_direction_row'], styles['width_height_25'], styles['alignItems_center'], styles['justify_content_center'], styles['margin_right_20'], { backgroundColor: dynamicStyles.primaryColor, borderRadius: 22 }]} onPress={() => { editButtonPress() }}>
                  <Image style={[styles['width_height_15'], { tintColor: dynamicStyles.secondaryColor }]} resizeMode='' source={require('../assets/images/edit_new.png')}></Image>
                </TouchableOpacity>
              </View>
            }
          </View>

          <View style={[styles['width_100%'], { flex: 1 }]}>

            <ScrollView style={[{ marginTop: 10, marginBottom: 80, }]}>

              <View style={[styles['margin_top_20']]}>


                <View style={[{ marginTop: 10 }]}>
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
                    imageData={panImageData != null ? true : false} //Before {panNumber != undefined && panNumber != "" && panImageData != null ? true : false}
                    onFocus={() => {
                    }}
                    onClickDocUp={() => {
                      showImages == true ? panNumber != undefined && panNumber != "" ? panImageData != null ? handleViewClicked(translate('upload_pan_doc')) : gstDocumentPress(translate('upload_pan_doc')) : SimpleToast.show(translate('Please_enter_PAN_number')) : undefined
                    }}
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
                {/* <View style={[styles['margin_top_10'], styles['flex_direction_row']]}>
                  <Text style={[styles['margin_top_10'], styles['height_40'], styles['text_color_grey'], styles['width_50%'], styles['margin_left_20']]}>{panImageData != null ? translate('fileAttached') : translate('upload_pan_doc')}</Text>
                  <TouchableOpacity style={[styles['flex_direction_row'], styles['absolute_position'], styles['right_20']]} onPress={() => { panNumber != "" ? panImageData != null ? handleViewClicked(translate('upload_pan_doc')) : gstDocumentPress(translate('upload_pan_doc')) : SimpleToast.show(translate('Please_enter_PAN_number')) }}>
                    <Image style={[styles['width_height_30'], styles['tint_color_blue']]} source={require('../assets/images/document.png')}></Image>
                  </TouchableOpacity>
                </View> */}

                <View style={[{ marginTop: 20 }]}>
                  <CustomBorderDocumetUpload
                    style={[styles['centerItems'], styles['margin_top_20']]}
                    labelName={translate('seedLicenseNumber')}
                    IsRequired={false}
                    maxLength={16}
                    keyboardType={seedKeyboardType}
                    placeholder={translate('enter') + " " + translate('seedLicenseNumber')}
                    value={seedLicenseNumber}
                    autoCapitalize="characters"
                    editable={dataEditable}
                    imageData={imageData != null ? true : false}//Before {seedLicenseNumber != undefined && seedLicenseNumber != "" && imageData != null ? true : false}
                    onClickDocUp={() => {
                      showImages == true ? seedLicenseNumber != undefined && seedLicenseNumber != "" ? imageData != null ? handleViewClicked(translate('upload_seed_license_doc')) : gstDocumentPress(translate('upload_license_doc')) : SimpleToast.show(translate('please') + " " + translate('enter') + " " + translate('seedLicenseNumber') + ' ' + translate('Document')) : undefined
                    }}
                    onFocus={() => {
                    }}
                    onChangeText={(text) => {
                      handleSeedTextChange(text)
                      // var enteredText = text.replace(/[`.'₹!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '')
                      // setSeedLicenseNumber(enteredText)
                    }}
                    onEndEditing={event => {
                      const upperCaseText = seedLicenseNumber != undefined && seedLicenseNumber != null && seedLicenseNumber != "" ? seedLicenseNumber.toUpperCase() : "";
                      setSeedLicenseNumber(upperCaseText != undefined && upperCaseText != null && upperCaseText != "" ? upperCaseText : "");
                    }}
                  />
                </View>

                {/* <View style={[styles['margin_top_10'], styles['flex_direction_row']]}>
                  <Text style={[styles['margin_top_10'], styles['height_40'], styles['text_color_grey'], styles['margin_left_20'], { width: '75%' }]}>{imageData != null ? translate('fileAttached') : translate('upload_seed_license_doc')}</Text>
                  <TouchableOpacity style={[styles['flex_direction_row'], styles['absolute_position'], styles['right_20']]} onPress={() => { seedLicenseNumber != "" ? imageData != null ? handleViewClicked(translate('upload_seed_license_doc')) : imageUploadBtn() : SimpleToast.show("Please enter " + translate('seedLicenseNumber') + " Document") }}>
                    <Image style={[styles['width_height_30'], styles['tint_color_blue']]} source={require('../assets/images/document.png')}></Image>
                  </TouchableOpacity>
                </View> */}

                <View style={[{ marginTop: 20 }]}>
                  <CustomBorderDocumetUpload
                    style={[styles['centerItems']]}
                    labelName={translate('gstNumber')}
                    IsRequired={false}
                    maxLength={15}
                    keyboardType={gstKeyboardType}
                    autoCapitalize="characters"
                    placeholder={translate('enter') + " " + translate('gstNumber')}
                    value={gstNumber}
                    editable={dataEditable}
                    imageData={gstImageData != null ? true : false}
                    onFocus={() => {
                    }}
                    onClickDocUp={() => {
                      showImages == true ? gstNumber != undefined && gstNumber != "" ? gstImageData != null ? handleViewClicked(translate('upload_gst_doc')) : gstDocumentPress(translate('upload_gst_doc')) : SimpleToast.show(translate('Please_enter_GST_number')) : undefined
                    }}
                    onChangeText={(text) => {
                      handleGSTOnChange(text)
                      // const filteredText = text.replace(/[^\w\s]/gi, '');
                      // setGSTNumber(filteredText)
                    }}
                    onEndEditing={event => {
                      const upperCaseText = gstNumber != undefined && gstNumber != "" && gstNumber != null ? gstNumber.toUpperCase() : "";
                      setGSTNumber(upperCaseText != undefined && upperCaseText != null && upperCaseText != "" ? upperCaseText : "");
                    }}
                  />
                </View>
                {/* <View style={[styles['margin_top_10'], styles['flex_direction_row']]}>
                  <Text style={[styles['margin_top_10'], styles['height_40'], styles['text_color_grey'], styles['width_50%'], styles['margin_left_20']]}>{gstImageData != null ? translate('fileAttached') : translate('upload_gst_doc')}</Text>
                  <TouchableOpacity style={[styles['flex_direction_row'], styles['absolute_position'], styles['right_20']]} onPress={() => { gstNumber != "" ? gstImageData != null ? handleViewClicked(translate('upload_gst_doc')) : gstDocumentPress(translate('upload_gst_doc')) : SimpleToast.show(translate('Please_enter_GST_number')) }}>
                    <Image style={[styles['width_height_30'], styles['tint_color_blue']]} source={require('../assets/images/document.png')}></Image>
                  </TouchableOpacity>
                </View> */}

                <View style={[{ marginTop: 20, marginBottom: 10 }]}>
                  <CustomBorderTextInput
                    style={[styles['centerItems']]}
                    labelName={translate('alternativeNumber')}
                    IsRequired={false}
                    maxLength={10}
                    keyboardType='number-pad'
                    placeholder={translate('enter') + " " + translate('alternativeNumber')}
                    value={alternateMobileNumber}
                    editable={dataEditable}
                    onFocus={() => {
                    }}
                    onChangeText={(text) => {
                      var enteredText = text.replace(/^[0-5][0-9]*$/gi, "");
                      enteredText = enteredText.replace(/[`a-z!@#$%^&*()_|+\-=?;:'",.₹€£¥•’<>\{\}\[\]\\\/]/gi, "");
                      setAlternateMobileNumber(enteredText)
                    }}
                    onEndEditing={event => {

                    }}
                  />
                </View>

                {console.log(ekycStatus, "Reddy")}
                {(!dataEditable && ekycStatus?.toLowerCase() == strings.pending.toLowerCase()) &&
                  <View style={[{ width: '90%', marginTop: 30, alignSelf: 'center' }]}>
                    <Text style={[{}, styles['font_size_14_bold'], styles['text_color_black']]}>{"Note : "} {<Text style={[styles['text_color_red']]}>{translate('eky_pending')}</Text>}</Text>
                  </View>}

                {(!dataEditable && ekycStatus?.toLowerCase() == strings.approve.toLowerCase()) &&
                  <View style={[{ width: '90%', marginTop: 30, alignSelf: 'center' }]}>
                    <Text style={[{}, styles['font_size_14_bold'], styles['text_color_black']]}>{"Note : "} {<Text style={[styles['text_color_green']]}>{translate('ekyc_approved')}</Text>}</Text>
                  </View>}

                {(!dataEditable && ekycStatus?.toLowerCase() == strings.reject.toLowerCase()) &&
                  <View style={[{ width: '90%', marginTop: 30, alignSelf: 'center' }]}>
                    <Text style={[{}, styles['font_size_14_bold'], styles['text_color_black']]}>{"Note : "} {<Text style={[styles['text_color_red']]}>{translate('ekyc_rejected')}</Text>}</Text>
                  </View>}

                {/* <View style={[styles['centerItems'], styles['margin_top_30'], styles['width_90%']]}>
                  <View style={[styles['margin_bottom_5']]}>
                    <Text style={[styles['text_color_grey'], styles['absolute_position'], styles['margin_top_minus_7'], styles['margin_left_15'], styles['zindex_9999'], styles['bg_white'], styles['padding_5']]}>{translate('imageUpload')}</Text>
                    <View style={[styles['flex_direction_row'], styles['width_99%']]}>
                      <TouchableOpacity
                        style={[styles['width_100%'], styles['flex_direction_row'], styles['height_150'], styles["bg_white"], styles['centerItems'],
                        styles['top_5'], styles['border_width_1'], styles['border_radius_6'], styles['border_color_light_grey']]} onPress={() => { dataEditable ? imageUploadBtn() : "" }}>
                        <View style={[styles['flex_direction_column'], styles['width_90%'], styles['height_120'], styles['bg_grey_light'], styles['centerItems']]}>
                          {imageData == '' &&
                            <Image style={[styles['align_self_center'], styles['width_height_50']]} source={require('../assets/images/imageUploadAdd.png')} resizeMode='contain' ></Image>
                          }
                          {imageData != '' &&
                            <Image style={[styles['align_self_center'], styles['width_height_80']]} source={imageData != '' ? { uri: imageData.uri } : require('../assets/images/imageUploadAdd.png')} resizeMode='contain' ></Image>
                          }
                          {imageData == '' &&
                            <Text style={[styles['align_self_center'], styles['font_size_12_regular'], styles['height_30'], styles['text_color_black'], styles['padding_top_8']]}>{translate('imageUpload')}</Text>
                          }
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View> */}

              </View>
              {isModalVisible && showUploadedImage()}
              {/* {showSelectionModal == true &&
                showCameraGallery()
              } */}
              <CustomGalleryPopup
                showOrNot={showSelectionModal}
                onPressingOut={() => setShowSelectionModal(false)}
                onPressingCamera={() => openCameraProfilePic()}
                onPressingGallery={() => openImagePickerProfilePic()}
              />
            </ScrollView>
          </View>
        </View>
      </View>

      {(dataEditable) &&
        <View style={[styles['align_self_center'], styles['width_100%'], { position: 'absolute', bottom: 15 }]}>
          <CustomButton title={isEdit == true ? translate('update') : translate('verify')} onPress={submitButtonPress} buttonBg={dynamicStyles.primaryColor} btnWidth={"90%"} titleTextColor={dynamicStyles.secondaryColor} />
        </View>
      }


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

export default KYC;