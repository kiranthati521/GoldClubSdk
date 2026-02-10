import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Platform, KeyboardAvoidingView, Text, Image, PermissionsAndroid, AppState, Linking, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { USER_ID, filterObjects, getFormattedDateTime, readFileToBase64, requestMultiplePermissions, retrieveData } from '../assets/Utils/Utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import CustomRemarksInput from '../Components/CustomRemarksInput';
import CustomAlert from '../Components/CustomAlert';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomLoader from '../Components/CustomLoader';
import { GetApiHeaders, getNetworkStatus, GetRequest, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomListViewModal from '../Modals/CustomListViewModal';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from "react-native-image-resizer";
import DeviceInfo from 'react-native-device-info';
import CustomTextInput from '../Components/CustomTextInput';
import SimpleToast from 'react-native-simple-toast';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import CustomGalleryPopup from '../Components/CustomGalleryPopup';
import { translate } from '../Localisation/Localisation';
// import { ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import store from '../redux/store/store';
import { getLangaugeDetails } from '../redux/store/slices/LanguageSlice';
import { updateOfflineCount } from '../Dashboard/synchCountUtils';
import moment from 'moment';
import { createStyles } from '../assets/style/createStyles';
var styles = BuildStyleOverwrite(Styles);

const fs = require('fs');

export const GetMastersComplaint = async () => {
  let realm = new Realm({ path: 'User.realm' });
  const state = store.getState();
  const lang = getLangaugeDetails(state);
  var networkStatus = await getNetworkStatus()
  if (networkStatus) {
    try {
      var getloginURL = configs.BASE_URL + configs.HELPCENTER.CUSTOMER_SUPPORT;
      var getHeaders = await GetApiHeaders();
      var APIResponse = await GetRequest(getloginURL, getHeaders);
      if (APIResponse != undefined && APIResponse != null) {
        if (APIResponse.statusCode == HTTP_OK) {
          try {
            realm.write(() => {
              realm.delete(realm.objects('complaintCategoriesList'));
            });
            console.log('All data cleared from Realm in complaints page');
          } catch (error) {
            console.error('Error clearing data from Realm in complaints page:', error);
          }
          var masterResp = APIResponse.response
          try {
            const res = JSON.stringify(masterResp);
            realm.write(() => {
              realm.delete(realm.objects('complaintCategoriesList'));
              realm.create('complaintCategoriesList', {
                categoriesData: res
              });
            });
            console.log("complaints page Data inserted successfully into Realm");
          } catch (error) {
            console.error("Error inserting data into Realm: complaints page", error);
          }
        }
        else { }

      } else { }
    }
    catch (error) { }
  } else { }
}

function Complaint() {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  var realm = new Realm({ path: 'User.realm' });
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const [remarks, setRemarks] = useState("");
  const [categoryList, setCategoryList] = useState()
  const [subCategoryListOriginal, setSubCategoryListOriginal] = useState()
  const [subCategoryList, setSubCategoryList] = useState()
  const [category, setCategory] = useState('')
  const [categoryID, setCategoryID] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [subCategoryID, setSubCategoryID] = useState('')
  const [dropDownData, setdropDownData] = useState();
  const [showDropDowns, setShowDropDowns] = useState(false)
  const [dropDownType, setDropDownType] = useState("");
  const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
  const [selectedParentIndexIS, setSelectedParentIndexIS] = useState('')

  const [showSelectionModal, setShowSelectionModal] = useState(false)
  const [userProfileImg, setUserProfileImg] = useState()
  const [base64ImageData, setBase64ImageData] = useState("")
  const [imageData, setImageData] = useState('')
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
  const [addCouponsList, setAddCouponsList] = useState([{ couponName: "" }])
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
  }, [addCouponsList])

  useFocusEffect(
    React.useCallback(() => {
      console.log('screen focused')
      if (networkStatus) {
        GetMastersApiCall();
      } else {
        checkRealmData()
      }
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [networkStatus])
  );


  const storeOfflineComplaint = (jsonData, imageData) => {
    try {
      const entry = {
        jsonData,
        image: imageData || '',
      };

      realm.write(() => {
        realm.create('ComplaintData', {
          localId: 'complaint-' + Date.now(),
          data: JSON.stringify(entry),
        });
      });

      console.log('✅ Complaint stored in Realm');
    } catch (error) {
      console.error('❌ Failed to store complaint in Realm:', error);
    }
  };

  let clearPreviousRealm = () => {
    try {
      realm.write(() => {
        realm.delete(realm.objects('complaintCategoriesList'));
        // realm.refresh();
      });
      console.log('All data cleared from Realm in complaints page');
    } catch (error) {
      console.error('Error clearing data from Realm in complaints page:', error);
    }
  }

  let checkRealmData = async () => {
    const offlineCategoriesData = realm.objects('complaintCategoriesList');
    if (offlineCategoriesData.length !== 0) {
      let dataFromOff = JSON.parse(offlineCategoriesData[0].categoriesData)
      console.log(dataFromOff, "<============================= data which is parsed in complaints")
      setCategoryList(dataFromOff.categoryList)
      setSubCategoryListOriginal(dataFromOff.subCategoryList)
    }
    else {
      showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
    }
  }

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
    navigation.navigate('HelpDesk')
  };

  const changeDropDownData = (dropDownData, type, selectedItem) => {
    if (type == strings.selectSubCategory && (category == undefined || category == '')) {
      SimpleToast.show(translate('please') + " " + translate('selectCategory'))
      return;
    }
    setShowDropDowns(true);
    setdropDownData(dropDownData);
    setDropDownType(type);
    setSelectedDropDownItem(selectedItem);
  }

  let onSelectedCategory = async (item) => {
    setShowDropDowns(false);
    setCategory(item.name)
    setCategoryID(item.id);
    setSubCategory('')
    setSubCategoryID('');
    var filterSubCatList = await filterObjects(subCategoryListOriginal, "categoryId", item.id)
    setSubCategoryList(filterSubCatList)
  }

  let onSelectedSubCategory = async (item) => {
    setShowDropDowns(false);
    setSubCategory(item.name)
    setSubCategoryID(item.id);
  }

  let insertDataIntoRealm = (response) => {
    if (!response) {
      console.log("Invalid response");
      return;
    }
    console.log("SAINATH_ONLINE_PROGRAMDETAILS_RESPONSE", response);
    try {
      const res = JSON.stringify(response);
      realm.write(() => {
        realm.delete(realm.objects('complaintCategoriesList'));
        realm.create('complaintCategoriesList', {
          categoriesData: res
        });
      });

      console.log("complaints page Data inserted successfully into Realm");
    } catch (error) {
      console.error("Error inserting data into Realm: complaints page", error);
    }
  }

  const GetMastersApiCall = async () => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getloginURL = configs.BASE_URL + configs.HELPCENTER.CUSTOMER_SUPPORT;
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
            clearPreviousRealm()
            var masterResp = APIResponse.response
            console.log('the 00333 is', masterResp.categoryList)
            console.log('the 00666 is', masterResp.subCategoryList)
            setCategoryList(masterResp.categoryList)
            setSubCategoryListOriginal(masterResp.subCategoryList)
            insertDataIntoRealm(masterResp)
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

  const submitButtonPress = async () => {
    if (category == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('selectCategory'), false, true, translate('ok'), translate('cancel'))
    }
    else if (subCategory == "") {
      showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('selectSubCategory'), false, true, translate('ok'), translate('cancel'))
    }
    // else if (subCategory == translate('damagedCoupons') || subCategory == translate('invalid_coupons')) {
    //   var array = [...addCouponsList]
    //   for (i = 0; i < array.length; i++) {
    //     if (array[i].couponName == "") {
    //       showAlertWithMessage(translate('alert'), true, true, translate('pleaseEnterScanCoupon'), false, true, translate('ok'), translate('cancel'))
    //       return
    //     }
    //   }
    //   //  if (remarks == "") {
    //   //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('remarks'), false, true, translate('ok'), translate('cancel'))
    //   //  }
    //   //  else {
    //   uploadDataWithImage();
    //   // }
    // }
    // else if (remarks == "") {
    //   showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('remarks'), false, true, translate('ok'), translate('cancel'))
    // }
    else {
      uploadDataWithImage();
    }
  }

  const uploadDataWithImage = async () => {
    if (networkStatus) {
      try {
        setLoading(true);
        setLoadingMessage(translate('submitting_data'));
        setIsSubmitting(true)

        var getloginURL = configs.BASE_URL + configs.HELPCENTER.RAISECOMPLAINTS;
        var getHeaders = await GetApiHeaders();
        var getUserID = (await retrieveData(USER_ID))

        const jsonData = {
          "id": 0,
          "userId": getUserID,
          "categoryId": categoryID,
          "subCategoryId": subCategoryID,
          "categoryName": category,
          "subcategoryName": subCategory,
          "status": true,
          "remarks": remarks,
          "scanCouponLabel": subCategory == strings.damagedCoupons || subCategory == strings.invalid_coupons ? addCouponsList : [],
          // "scanCouponLabel": subCategory == translate('damagedCoupons') || subCategory == translate('invalid_coupons') ? addCouponsList : [],
        };

        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(jsonData));

        if (imageData != undefined && imageData != "") {
          formData.append('complaintImage', {
            uri: imageData.uri,
            type: 'image/jpeg',
            name: imageData.name
          });
        } else {
          formData.append('complaintImage', "");
        }

        const APIResponse = await uploadFormData(formData, getloginURL, getHeaders);

        console.log('Complaint response:', APIResponse);

        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse && APIResponse.statusCode === HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('complaint_raised_successfuly'))
            }, 1000);

            setTimeout(() => {
              setSuccessLoading(false);
              setSuccessLoadingMessage();
              setIsSubmitting(false)
              navigation.navigate('HelpDesk');
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
            setIsSubmitting(false)
          }, 500);
        }
      }
      catch (error) {
        console.error('Error submitting data:', error);
        setLoading(false);
        setSuccessLoadingMessage(error.message);
        setIsSubmitting(false)
      }

    } else {
      setIsSubmitting(true)
      let getUserIDData = (await retrieveData(USER_ID))
      const submissionTime = await getFormattedDateTime();
      const jsonData = {
        "id": 0,
        "userId": getUserIDData,
        "categoryId": categoryID,
        "subCategoryId": subCategoryID,
        "categoryName": category,
        "subcategoryName": subCategory,
        "createdOn": moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        "mobileUniqueId": getUserIDData + "_" + submissionTime,
        "mobileSubmitionDateTime": submissionTime,
        "status": true,
        "remarks": remarks,
        "scanCouponLabel": subCategory == strings.damagedCoupons || subCategory == strings.invalid_coupons ? addCouponsList : [],
        // "scanCouponLabel": subCategory == translate('damagedCoupons') || subCategory == translate('invalid_coupons') ? addCouponsList : [],
      };
      const ext = imageData?.uri?.split('.')?.pop()?.toLowerCase();
      let imgData = {
        // uri: imageData.uri,
        // type: 'image/jpeg',
        // name: 'image.jpg'
        uri: imageData.uri,
        name: `image.${ext}`,
        type: imageData.type || 'image/jpeg',
      }

      const formData = new FormData();
      formData.append('jsonData', JSON.stringify(jsonData));
      if (imageData != undefined && imageData != "") {
        formData.append('complaintImage', imgData);
      } else {
        formData.append('complaintImage', "");
      }
      storeOfflineComplaint(jsonData, imgData)

      console.log("FormData:", JSON.stringify(formData));
      updateOfflineCount(dispatch)
      navigation.navigate('HelpDesk', { complaintData: formData });
      setIsSubmitting(false)
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

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

    setShowAlert(false)
    // navigation.goBack()
  }

  const imageUploadBtn = () => {
    setShowSelectionModal(true)
  }
  let onPressCancelBtn = () => {
    setShowSelectionModal(false)
  }

  // const requestGalleryPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     const permissions = [
  //       PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
  //     ];

  //     try {
  //       const result = await PermissionsAndroid.requestMultiple(permissions);
  //       console.log(result,"check result for gallery")
  //       const readGranted = result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED;

  //       if (readGranted) {
  //         openImagePickerProfilePic();
  //       } else if (
  //         result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
  //       ) {
  //         showPermissionAlert(); 
  //       } else {
  //         showPermissionAlert();
  //       }
  //     } catch (error) {
  //       console.warn(error);
  //     }
  //   } else if (Platform.OS === 'ios') {
  //     const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
  //     if (status === RESULTS.GRANTED) {
  //       openImagePickerProfilePic();
  //     } else if (status === RESULTS.BLOCKED) {
  //       showPermissionAlert();
  //     } else {
  //       showPermissionAlert();
  //     }
  //   }
  // };

  const openImagePickerProfilePic = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo',
      });
      const response = await ImageResizer.createResizedImage(
        image.path,
        900,
        900,
        "JPEG",
        80,
        0,
        null
      );
      setImageData(response);
      const data = await readFileToBase64(response.uri);
      setBase64ImageData(data);
      setUserProfileImg({ uri: response.uri });
    } catch (error) {
      console.error('Error opening image picker:', error);
    }
    setShowSelectionModal(false);
  };

  // const requestCameraPermission = async () => {
  //   if (Platform.OS == 'android') {
  //     const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
  //       var result = await PermissionsAndroid.request(permission);
  //       console.log(result,"check result for camera")
  //       if (result === PermissionsAndroid.RESULTS.GRANTED) {
  //         openCameraProfilePic()
  //       } 
  //       else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
  //         showPermissionAlert('camera'); 
  //       } 
  //       else {
  //         showPermissionAlert('camera');
  //       }
  //   }
  //   else if (Platform.OS == 'ios') {
  //       let status = await request(PERMISSIONS.IOS.CAMERA)
  //       if (status === RESULTS.GRANTED) {
  //         openCameraProfilePic();
  //       } else if (status === RESULTS.BLOCKED) {
  //         showPermissionAlert('camera');
  //       } else {
  //         showPermissionAlert('camera');
  //       }
  //     }
  //   }


  const showPermissionAlert = (type) => {
    Alert.alert(
      translate('permission_required'),
      type === 'camera' ? translate('cameraDesc') : translate('galleryDesc'),
      [
        { text: translate('cancel'), style: 'cancel' },
        { text: translate('open_settings'), onPress: () => Linking.openSettings() }
      ],
      { cancelable: true }
    );
  };

  const openCameraProfilePic = async () => {
    try {
      const image = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo'
      });
      const response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null);
      setImageData(response);
      const base64Img = await readFileToBase64(response.uri);
      setBase64ImageData(base64Img);
      setUserProfileImg({ uri: response.uri });
    } catch (error) {
      console.error('Error opening camera:', error);
    }
    setShowSelectionModal(false);
  };

  const _renderProductCategory = (item, parentIndex) => {
    return (
      <View style={[{ left: 0, width: '99%', top: 0, bottom: 10, padding: 10 }]}>
        <CustomTextInput
          style={[styles['margin_top_20'], styles['centerItems']]}
          textFiledWidth={'98%'}
          leftSpace={-5}
          labelName={translate('addCouponLabel') + " " + (parentIndex + 1).toString()}
          IsRequired={false}
          marginLeft={0}
          paddingLeft={0}
          maxLength={32}
          autoCapitalize="characters"
          keyboardType='default'
          placeholder={translate('enter') + " " + translate('addCouponLabel')}
          value={addCouponsList[parentIndex].couponName != undefined ? addCouponsList[parentIndex].couponName.toString() : ""}
          editable={true}
          onFocus={() => {
          }}
          onChangeText={(text) => {
            const updatedAddCouponsList = [...addCouponsList];
            var enteredText = text.replace(/[^\w\s]/gi, '')
            updatedAddCouponsList[parentIndex].couponName = enteredText;
            setAddCouponsList(updatedAddCouponsList);
          }}
          onEndEditing={event => {
            setSelectedParentIndexIS(parentIndex)
            console.log('what is in cate list', addCouponsList)
          }}
        />
      </View>
    )
  }
  const handleAddProcuts = (index) => {
    var array = [...addCouponsList]
    for (i = 0; i < array.length; i++) {
      if (array[i].couponName == "") {
        SimpleToast.show(translate('pleaseEnterScanCoupon'))
        return
      }
    }
    array.push({
      couponName: "",
    })
    setTimeout(() => {
      setAddCouponsList(array)
    }, 50);
  }

  const removeProductCategory = (item, parentIndex) => {
    var couponArray = [...addCouponsList]
    if (couponArray.length == 1) {
      var couponArray = [...addCouponsList]
      couponArray.splice(0, 1)
      couponArray.length = 0
      couponArray.push({
        couponName: "",
      })
    }
    else {
      if (selectedParentIndexIS != '') {
        couponArray.splice(selectedParentIndexIS, 1);
        setSelectedParentIndexIS('')
      }
      else if (selectedParentIndexIS == 0) {
        couponArray.splice(0, 1);
        setSelectedParentIndexIS('')
      }
      else {
        couponArray.splice(couponArray.length - 1, 1);
      }
    }
    setAddCouponsList(couponArray)
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      <View style={[{ position: "relative", flex: 1, backgroundColor: 'white' }]}>
        {/* {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />} */}
        <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: 20 }]}>
          <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => navigation.goBack()}>
            <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
            <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('complaint')}</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={[styles['height_100%'], styles['width_100%']]}> */}

        {/* <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_20'], styles[''], styles['tint_color_black'], { height: 20, width: 25, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles[''], styles['text_color_black'], styles[''], styles['font_size_14_bold'], { marginTop: 5 }]}>{translate('complaint')}</Text>
        </TouchableOpacity> */}
        <View style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // For iOS use padding, for Android use height
          >
            <ScrollView
              keyboardShouldPersistTaps={'handled'}
              automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              style={{
                flex: 1,
                // marginBottom: subCategory == translate('damagedCoupons') || subCategory == translate('invalid_coupons') ? responsiveHeight(2) : 0
              }} >

              <View style={[styles['padding_top_10'], styles['width_100%']]}>

                <Text style={[styles['top_5'], styles['height_40'], { color: dynamicStyles.textColor }, styles['centerItems'], styles['font_size_24_bold']]}>{translate('customersupport')}</Text>
                <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems'], { marginVertical: 10 }]} ></View>

                {/* DropDown  */}

                <CustomInputDropDown
                  width={[styles['width_90%'], styles['margin_top_20']]}
                  defaultValue={category != undefined && category != translate('select') ? category : translate('select')}
                  labelName={translate('selectCategory')}
                  IsRequired={true}
                  placeholder={translate('selectCategory')}
                  onEndEditing={async event => {
                    // calculateTotalOrderValue()
                  }}
                  onFocus={() => {
                    changeDropDownData(categoryList, strings.selectCategory, category)
                  }}
                />

                <CustomInputDropDown
                  width={[styles['width_90%'], styles['margin_top_10']]}
                  defaultValue={subCategory != undefined && subCategory != translate('select') ? subCategory : translate('select')}
                  labelName={translate('selectSubCategory')}
                  placeholder={translate('selectSubCategory')}
                  IsRequired={true}
                  onEndEditing={async event => {
                    // calculateTotalOrderValue()
                  }}
                  onFocus={() => {
                    changeDropDownData(subCategoryList, strings.selectSubCategory, subCategory)
                  }}
                />

                {(subCategory == strings.damagedCoupons || subCategory == strings.invalid_coupons) &&

                  <View style={[styles['width_90%'], styles['top_10'], styles['align_self_center']]}>
                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['margin_left_5'], styles['top_5']]}>{translate('scanCouponLabel')}</Text>
                    <View style={[styles['width_100%'], styles['border_radius_normal'], styles['border_color_grey'], styles['padding_5'], styles['top_10'], styles['border_width_1']]}>

                      {/* remove Button */}
                      < View style={[styles['align_self_flex_end'], styles['top_10'], styles['right_10']]}>
                        <TouchableOpacity onPress={(item, index) => { removeProductCategory(item, index) }}>
                          <Image source={require('../assets/images/close.png')} style={[styles['width_height_25'], { tintColor: 'red' }]} />
                        </TouchableOpacity>
                      </View>
                      <View style={[styles['bottom_10']]}>
                        <FlatList
                          data={addCouponsList}
                          keyExtractor={(index) => index.toString()}
                          renderItem={({ item, index }) => _renderProductCategory(item, index)}
                        >
                        </FlatList>
                      </View>

                      {/* Add More Button */}
                      {addCouponsList.length < 10 &&
                        < View style={[styles['align_self_flex_end'], styles['top_10'], styles['bottom_10'], styles['right_10']]}>
                          <TouchableOpacity onPress={async (item, index) => { handleAddProcuts(index) }}>
                            <Image source={require('../assets/images/addGreen.png')} style={[styles['width_height_20'], { tintColor: 'green' }]} />
                          </TouchableOpacity>
                        </View>
                      }
                    </View>
                  </View>
                }
                <View style={[styles['centerItems'], styles['margin_top_20'], styles['width_90%']]}>
                  <View style={[styles['margin_bottom_5']]}>
                    <Text style={[styles['text_color_grey'], styles['absolute_position'], styles['margin_top_minus_7'], styles['margin_left_15'], styles['zindex_9999'], styles['bg_lightwhiteGray'], styles['padding_5'], styles['font_size_12_bold']]}>{translate('imageUpload')}</Text>
                    <View style={[styles['flex_direction_row'], styles['width_99%']]}>
                      <TouchableOpacity
                        style={[styles['width_100%'], styles['flex_direction_row'], styles['height_150'], styles["bg_lightwhiteGray"], styles['centerItems'],
                        styles['top_5'], styles['border_width_1'], styles['border_radius_6'], styles['border_color_light_grey']]} onPress={() => { imageUploadBtn() }}>
                        <View style={[styles['flex_direction_column'], styles['width_90%'], styles['height_120'], styles['bg_grey_light'], styles['centerItems']]}>
                          {imageData == '' &&
                            // <Image style={[styles['align_self_center'], styles['width_height_50'],]} source={require('../assets/images/imageUploadAdd.png')} resizeMode='contain' ></Image>
                            <View>
                              <View style={[styles['align_self_center'], styles['width_height_50'], styles['bg_white'], styles['border_radius_30'], styles['alignItems_center'], styles['justify_content_center']]}>
                                <Image style={[styles['align_self_center'], styles['width_height_20'], { tintColor: dynamicStyles.primaryColor }]} source={require('../assets/images/gallery_new.png')} resizeMode='contain' ></Image>
                              </View>
                              <View style={[styles['align_self_center'], styles['width_height_20'], styles['border_radius_30'], styles['alignItems_center'], styles['justify_content_center'], styles['absolute_position'], styles['top_30'], { left: 36 }, { backgroundColor: dynamicStyles.primaryColor }]}>
                                <Image style={[styles['align_self_center'], styles['width_height_10']]} source={require('../assets/images/add_icon_new.png')} resizeMode='contain' ></Image>
                              </View>
                            </View>
                          }
                          {/* {imageData != '' &&
                        <Image style={[styles['align_self_center'], styles['width_height_100']]} source={imageData != '' ? { uri: imageData.uri } : require('../assets/images/imageUploadAdd.png')} resizeMode='contain' ></Image>
                      } */}
                          {imageData !== '' &&
                            <Image style={[styles['align_self_center'], styles['width_height_80']]} source={{ uri: imageData.uri }} resizeMode="contain" />
                          }
                          {/* {imageData == '' &&
                       <View>
                         <View style={[styles['align_self_center'], styles['width_height_50'], styles['bg_white'], styles['border_radius_30'], styles['alignItems_center'], styles['justify_content_center']]}>
                           <Image style={[styles['align_self_center'], styles['width_height_20'], { tintColor: dynamicStyles.primaryColor }]} source={require('../assets/images/gallery_new.png')} resizeMode='contain' ></Image>
                         </View>
                         <View style={[styles['align_self_center'], styles['width_height_20'], styles['border_radius_30'], styles['alignItems_center'], styles['justify_content_center'], styles['absolute_position'], styles['top_30'], { left: 36 }, { backgroundColor: dynamicStyles.primaryColor }]}>
                           <Image style={[styles['align_self_center'], styles['width_height_10']]} source={require('../assets/images/add_icon_new.png')} resizeMode='contain' ></Image>
                         </View>
                       </View>
                     } */}
                          {imageData == '' &&
                            <Text style={[styles['align_self_center'], styles['font_size_12_regular'], styles['height_30'], { color: dynamicStyles.textColor }, styles['padding_top_8']]}>{translate('imageUpload')}</Text>
                          }
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={[styles['margin_top_10'], styles['width_90%'], styles['centerItems']]}>
                  <CustomRemarksInput
                    style={[styles['top_10'], styles['width_95%'], { marginLeft: 8 }]}
                    labelName={translate('remarks')}
                    IsRequired={false}
                    marginLeft={3}
                    paddingLeft={5}
                    multiline={true}
                    maxLength={320}
                    paddingLeftlBL={5}
                    keyboardType='default'
                    placeholder={translate('enter') + " " + translate('remarks')}
                    value={remarks}
                    editable={true}
                    onFocus={() => {
                    }}
                    onChangeText={(text) => {
                      var enteredText = text.replace(/[^\w\s]/gi, '');
                      setRemarks(enteredText)
                    }}
                    onEndEditing={event => {

                    }}
                  />
                </View>


              </View>

              <View style={{ height: responsiveHeight(14) }} />
            </ScrollView>
          </KeyboardAvoidingView>
          {!isSubmitting && <View style={[styles['align_self_center'], styles['width_100%'], styles['bottom_10']]}>
            <CustomButton title={translate('submit')} onPress={submitButtonPress} buttonBg={dynamicStyles.primaryColor} btnWidth={"90%"} titleTextColor={dynamicStyles.secondaryColor} />
          </View>}
        </View>
        {/* </View> */}

        <CustomGalleryPopup
          showOrNot={showSelectionModal}
          onPressingOut={() => setShowSelectionModal(false)}
          onPressingCamera={openCameraProfilePic}
          onPressingGallery={openImagePickerProfilePic}
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

        {showDropDowns &&
          <CustomListViewModal
            dropDownType={dropDownType}
            listItems={dropDownData}
            selectedItem={selectedDropDownItem}
            onSelectedCategory={(item) => onSelectedCategory(item)}
            onSelectedSubCategory={(item) => onSelectedSubCategory(item)}
            closeModal={() => setShowDropDowns(false)} />}

        {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
        {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
        {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
      </View>
    </SafeAreaView>
  )


}

export default Complaint;