import React, { useEffect, useMemo, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, AppState, Linking, Keyboard, TouchableOpacity, FlatList, Modal, Dimensions, StyleSheet, Alert } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import CustomButton from '../Components/CustomButton';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { GetApiHeaders, getNetworkStatus, PostRequest, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { USER_ID, isNullOrEmpty, retrieveData, ROLENAME, downloadFileToLocal, USER_NAME } from '../assets/Utils/Utils';
import SimpleToast from 'react-native-simple-toast';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import store from '../redux/store/store';
import { traverseAndReplaceUrlsGlobal } from '../Dashboard/ProgramDetails';
import { getLangaugeDetails } from '../redux/store/slices/LanguageSlice';
import { updateOfflineCount } from '../Dashboard/synchCountUtils';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);
// var localSyncced = false;
let isComplaintUploadInProgress = false;
export const GetComplaintsApiCallGlobal = async (refreshBtn = false, fromSync = false) => {
  let realm = new Realm({ path: 'User.realm' });
  // alert('reached hereee')
  var networkStatus = await getNetworkStatus()
  const state = store.getState();
  const getUserData = selectUser(state);
  const lang = getLangaugeDetails(state);
  if (networkStatus) {
    try {
      var getloginURL = configs.BASE_URL + configs.HELPCENTER.VIEW_RAISEDCOMPLAINTS;
      var getHeaders = await GetApiHeaders();
      console.log(getUserData[0]?.companyCode, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<getUserData[0]?.companyCode")
      var dataList = {
        "retailerId": await retrieveData(USER_ID),
        'companyCode': getUserData[0]?.companyCode
      }
      var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
      console.log('compltains response is:', JSON.stringify(APIResponse))
      if (APIResponse != undefined && APIResponse != null) {
        if (APIResponse.statusCode == HTTP_OK) {
          let data = await traverseAndReplaceUrlsGlobal(APIResponse)
          try {
            const res = JSON.stringify(data);
            let samadhanRes = {
              langCode: lang.languageCode,
              langId: lang.languageId,
              langName: lang.languageName,
              data: res
            }
            realm.write(() => {
              realm.delete(realm.objects('helpDeskPageOff'));
              realm.create('helpDeskPageOff', samadhanRes);
            });
            console.log("help desk Data inserted successfully into Realm", samadhanRes);
          } catch (error) {
            console.error("Error inserting data into Realm: help desk", error);
          }
        }
        else { }

      } else { }
    }
    catch (error) { }
  } else { }
}

export const syncOfflineComplaintsGlobal = async () => {
  const complaints = realm.objects('ComplaintData');
  console.log(complaints, "offline complaints list")
  if (complaints?.length > 0) {
    uploadAllComplaintsGlobal(complaints)
  };
};


export const uploadAllComplaintsGlobal = async (complaintsArray, dispatch) => {

  if (isComplaintUploadInProgress) {
    console.log("Upload already in progress. Skipping duplicate call.");
    return false;
  }

  isComplaintUploadInProgress = true;

  let realm = new Realm({ path: 'User.realm' });

  const networkStatus = await getNetworkStatus();
  if (!networkStatus) {
    console.warn('No network connection.');
    isComplaintUploadInProgress = false;
    return false;
  }

  const state = store.getState();
  const getLoginURL = configs.BASE_URL + configs.HELPCENTER.RAISECOMPLAINTS;
  const headers = await GetApiHeaders();
  const successfulIds = [];

  const requests = complaintsArray.map(async (item) => {
    try {
      const parsedData = JSON.parse(item.data);
      const jsonData = parsedData.jsonData;
      const imageData = parsedData.image;

      const formData = new FormData();
      formData.append('jsonData', JSON.stringify(jsonData));
      console.log("formData", JSON.stringify(jsonData))
      if (imageData && imageData.uri) {
        formData.append('complaintImage', {
          uri: imageData.uri,
          type: 'image/jpeg',
          name: imageData.name
        });
      } else {
        formData.append('complaintImage', '');
      }

      const response = await uploadFormData(formData, getLoginURL, headers);

      console.log('Upload response for=====================> Global', item.localId, JSON.stringify(response));

      if (response?.statusCode === 200) {
        successfulIds.push(item.localId);
      } else {
        console.warn(`Upload failed for ${item.localId}:`, response);
      }

      return response;
    } catch (err) {
      console.error('Error uploading complaint with localId:', item.localId, err);
      return null;
    }
  });

  try {
    await Promise.all(requests);

    if (successfulIds.length > 0) {
      // Delete only successfully uploaded complaints
      realm.write(() => {
        successfulIds.forEach((id) => {
          const complaintToDelete = realm.objects('ComplaintData').filtered('localId == $0', id);
          if (complaintToDelete.length > 0) {
            realm.delete(complaintToDelete);
          }
        });
      });

      await updateOfflineCount(dispatch);
      await GetComplaintsApiCallGlobal(true, true);

      console.log(`Successfully synced and deleted ${successfulIds.length} complaints.`);
      isComplaintUploadInProgress = false;
      return true;
    } else {
      console.warn('No complaints were successfully uploaded.');
      isComplaintUploadInProgress = false;
      return false;
    }
  } catch (e) {
    console.error('Unexpected error during complaint upload sync:', e);
    isComplaintUploadInProgress = false;
    return false;
  }
};

function HelpDesk({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  var realm = new Realm({ path: 'User.realm' });
  const localDispatch = useDispatch();
  const { languageCode, languageName, languageId } = useSelector((state) => state.language);
  const [loading, setLoading] = useState(false)
  const getUserData = useSelector(selectUser);
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const networkStatus = useSelector(state => state.networkStatus.value)
  const navigation = useNavigation()
  const [renderModal, setRenderModal] = useState(false)
  const [selectedComplaint, setselectedComplaint] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
  const [dataSyncAnimation, setDataSyncAnimation] = useState(false);
  const [complantData, setComplantData] = useState([]);
  const [desc, setDesc] = useState('')
  const [num, setNum] = useState('')
  const [logo, setLogo] = useState('')
  const [showDetailViewModal, setShowDetailViewModal] = useState(false)
  const [selectedItemData, setSelectedItemData] = useState([]);
  const [offlineComplaintsCount, setOfflineCommplaintsCount] = useState(null)
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

  useFocusEffect(
    React.useCallback(() => {
      handleFocus();
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [networkStatus])
  );

  const handleFocus = () => {
    console.log('Screen is focused!');
    if (networkStatus) {
      const complaints = realm.objects('ComplaintData');
      if (complaints?.length === 0) {
        clearPreviousRealm()
      }
      GetComplaintsApiCall()
      if (Platform.OS == "android") {
        syncOfflineComplaints(localDispatch)
      }
    } else {
      checkRealmData()
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let setData = async () => {
        if (route?.params?.complaintData) {
          showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('offlineBut'), false, true, translate('ok'), translate('ok'))
          const updatedData = await mergeComplaint(complantData, route?.params?.complaintData);
          // alert(updatedData)
          setComplantData(updatedData)
          const finalResponse = {
            samadhanAvailableInfo: desc,
            samadhanContactNum: num,
            complaintList: updatedData,
            samadhanLogoPath: logo,
            message: "Success",
            statusCode: "200",
            status: "Success"
          };

          try {
            const res = JSON.stringify(finalResponse);
            let samadhanRes = {
              langCode: languageCode,
              langId: languageId,
              langName: languageName,
              data: res
            }
            realm.write(() => {
              realm.delete(realm.objects('helpDeskPageOff'));
              realm.create('helpDeskPageOff', samadhanRes);
            });
            console.log("help desk Data inserted successfully into Realm from complaints");
          } catch (error) {
            console.error("Error inserting data into Realm: help desk", error);
          }
        }
      }
      setData()
    }, [route?.params?.complaintData])
  );

  // ✅ CORRECTED SECOND HOOK
  useFocusEffect(
    React.useCallback(() => {
      let ch = realm.objects('ComplaintData')?.length
      if (ch) {
        setOfflineCommplaintsCount(ch)
      }
      // Returns nothing (undefined) or a cleanup function
    }, [])
  );

  const uploadAllComplaints = async (complaintsArray, dispatch) => {
    // Safety check
    if (!Array.isArray(complaintsArray) || complaintsArray.length === 0) {
      console.warn('No complaints to upload.');
      return false;
    }

    console.log(`🔁 Starting upload of ${complaintsArray.length} complaints...`);

    const realm = new Realm({ path: 'User.realm' });

    const successfulIds = [];
    const getLoginURL = configs.BASE_URL + configs.HELPCENTER.RAISECOMPLAINTS;
    const headers = await GetApiHeaders();

    const requests = complaintsArray.map(async (item) => {
      try {
        console.log('📦 Processing complaint:', item.localId);

        const parsedData = JSON.parse(item.data);
        const jsonData = parsedData.jsonData;
        const imageData = parsedData.image;

        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(jsonData));

        if (imageData?.uri) {
          formData.append('complaintImage', {
            uri: imageData.uri,
            type: 'image/jpeg',
            name: imageData.name || 'image.jpg',
          });
        } else {
          formData.append('complaintImage', '');
        }

        const response = await uploadFormData(formData, getLoginURL, headers);

        console.log('✅ Upload response for Local ID:', item.localId, JSON.stringify(response));

        if (response?.statusCode === 200) {
          successfulIds.push(item.localId);
        } else {
          console.warn(`⚠️ Upload failed for ${item.localId}:`, response);
        }

        return response;
      } catch (err) {
        console.error(`❌ Error uploading complaint ${item.localId}:`, err);
        return null;
      }
    });

    try {
      await Promise.all(requests);

      if (successfulIds.length > 0) {
        realm.write(() => {
          successfulIds.forEach((id) => {
            const toDelete = realm.objects('ComplaintData').filtered('localId == $0', id);
            if (toDelete.length > 0) {
              realm.delete(toDelete);
            }
          });
        });

        await updateOfflineCount(dispatch);
        await GetComplaintsApiCall(true, true);

        console.log(`✅ Successfully synced and deleted ${successfulIds.length} complaints.`);
        return true;
      } else {
        console.warn('⚠️ No complaints were successfully uploaded.');
        return false;
      }
    } catch (e) {
      console.error('❌ Unexpected error during bulk upload:', e);
      return false;
    }
  };


  const syncOfflineComplaints = async (dispatch) => {
    // const complaints = realm.objects('ComplaintData');
    const complaintsResults = realm.objects('ComplaintData');
    const complaintsArray = Array.from(complaintsResults); // Convert to real array
    console.log(complaintsArray, "offline complaints list")
    if (complaintsArray?.length === 0) return;
    uploadAllComplaints(complaintsArray, dispatch)
  };

  const checkData = async (data) => {
    let checkDataaa = data
    if (languageCode === checkDataaa.langCode) {
      return checkDataaa?.data
    } else {
      return null;
    }
  }

  const checkRealmData = async () => {
    const helpDeskMainPageData = realm.objects('helpDeskPageOff');
    console.log(JSON.stringify(helpDeskMainPageData), 'offline stored check<<<<<<<<<<<<<<<<<<<<<<<', helpDeskMainPageData.length !== 0)
    if (helpDeskMainPageData.length !== 0) {
      let data = helpDeskMainPageData[0]
      let check = await checkData(data)
      if (check) {
        let parsedVal = JSON.parse(check)
        var compResp = parsedVal?.complaintList
        setComplantData(compResp)
        setDesc(parsedVal?.samadhanAvailableInfo)
        setNum(parsedVal?.samadhanContactNum)
        setLogo(Platform.OS == 'android' ? 'file://'+parsedVal?.samadhanLogoPath : parsedVal?.samadhanLogoPath)
      }
      else {
        showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
      }
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


  const complaintButtonPress = () => {
    navigation.navigate('Complaint')
  }

  msgBtnClicked = () => {
    // const messageUri = `sms:${translate('callNumber')}`;
    // Linking.openURL(messageUri);
    SimpleToast.show(translate('comingSoon'))

  }

  const callBtnClicked = () => {
    console.log('call button clicked', num)
    if (isNullOrEmpty(num)) {
      const cleanNumber = num?.replace(/[^\d+]/g, ""); // keeps only digits and +
      const phoneUrl = `tel:${cleanNumber}`;

      Linking.openURL(phoneUrl).catch(() => {
        SimpleToast.show(translate("Failed_to_open_dialer"));
      });
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

  const clearPreviousRealm = () => {
    try {
      if (!realm) {
        console.error("Realm not initialized yet!");
        return;
      }
      realm.write(() => {
        realm.delete(realm.objects('helpDeskPageOff'));
      });
      console.log('All data cleared from Realm in help desk main page');
    } catch (error) {
      console.error('Error clearing data from Realm in help desk main page:', error);
    }
  };

  const insertDataIntoRealm = (response) => {
    if (!realm) {
      console.error("Realm not initialized yet!");
      return;
    }
    if (!response) {
      console.log("Invalid response");
      return;
    }
    // console.log("SAINATH_ONLINE_PROGRAMDETAILS_RESPONSE", response);
    try {
      const res = JSON.stringify(response);
      // console.log(res,"<----------------- res")
      let samadhanRes = {
        langCode: languageCode,
        langId: languageId,
        langName: languageName,
        data: res
      }
      realm.write(() => {
        realm.delete(realm.objects('helpDeskPageOff'));
        realm.create('helpDeskPageOff', samadhanRes);
      });
      console.log("help desk Data inserted successfully into Realm");
    } catch (error) {
      console.error("Error inserting data into Realm: help desk", error);
    }
  };



  async function mergeComplaint(existedData, newData, languageId = 1) {
    const jsonDataRaw = newData._parts.find(([key]) => key === "jsonData")?.[1];
    const imagePart = newData._parts.find(([key]) => key === "complaintImage")?.[1];

    if (!jsonDataRaw) return existedData;

    const complaint = JSON.parse(jsonDataRaw);
    const imageUrl = imagePart?.uri || "";

    const groupKey = `${complaint.categoryName}|${complaint.subcategoryName}|${complaint.coupon || "NO_COUPON"}`;
    const relativeTime = translate('few_mins_ago');
    const localizedStatus = translate('pending');
    const userName = await retrieveData(USER_NAME);

    const newComplaint = {
      dupicateCount: 0,
      subcategoryName: complaint.subcategoryName,
      complaintImage: imageUrl,
      scanCouponLabel: complaint.scanCouponLabel || [],
      complaintStatus: localizedStatus,
      raisedBy: `${userName} ${relativeTime}`,
      createdOn: new Date().toISOString(),
      categoryName: complaint.categoryName,
      remarks: complaint.remarks || "",
      status: complaint.status,
    };

    const groupIndex = existedData.findIndex(
      (group) =>
        group.categoryName === complaint.categoryName &&
        group.subcategoryName === complaint.subcategoryName &&
        (group.coupon || "NO_COUPON") === (complaint.coupon || "NO_COUPON")
    );

    if (groupIndex >= 0) {
      const group = existedData[groupIndex];
      group.relatedDuplicates.push({ ...newComplaint });
      group.dupicateCount = group.relatedDuplicates.length;
    } else {
      existedData.push({
        dupicateCount: 0,
        relatedDuplicates: [{ ...newComplaint }],
        ...newComplaint,
        coupon: complaint.coupon || "",
      });
    }

    return existedData;
  }

  const GetComplaintsApiCall = async (refreshBtn = false, fromSync = false) => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getloginURL = configs.BASE_URL + configs.HELPCENTER.VIEW_RAISEDCOMPLAINTS;
        var getHeaders = await GetApiHeaders();

        var dataList = {
          "retailerId": await retrieveData(USER_ID),
          'companyCode': getUserData[0]?.companyCode
        }


        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        // console.log('compltains response is:', JSON.stringify(APIResponse))
        if (APIResponse != undefined && APIResponse != null) {
          // console.log('dataList is1111')
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 1000);
          if (APIResponse.statusCode == HTTP_OK) {
            if (refreshBtn) {
              setDataSyncAnimation(true)
            }
            var compResp = APIResponse.complaintList
            let data = await traverseAndReplaceUrls(APIResponse)
            setComplantData(compResp)
            setDesc(APIResponse.samadhanAvailableInfo)
            setNum(APIResponse.samadhanContactNum)
            setLogo(APIResponse.samadhanLogoPath)
            insertDataIntoRealm(data)
            setTimeout(() => {
              setDataSyncAnimation(false)
            }, 3000);
            if (fromSync) {
              setOfflineCommplaintsCount(null)
              clearPreviousRealm()
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
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const viewCicked = async (item) => {
    setSelectedItemData(item)
    setShowDetailViewModal(true)
  };


  const renderItems = (item, index, lastItem) => {
    // console.log(item, "Hello Brother!!=====================================================",item);
    const showText = item.scanCouponLabel.length > 0 && item.scanCouponLabel[0].couponName !== '';
    const couponNames = item.scanCouponLabel.map(label => label.couponName);
    const joinedCouponNames = couponNames.filter(name => name).join(',');
    return (
      <TouchableOpacity disabled={item?.dupicateCount === 1} style={[styles['flex_direction_row'], styles['width_90%'], styles['margin_top_20'], styles['align_self_center'], styles['border_radius_6'], styles['bg_white'], { elevation: 2 }
        , index === lastItem && { marginBottom: 20 }]}
        onPress={() => {
          setRenderModal(!renderModal)
          setselectedComplaint(item)
        }}>
        <View style={[styles['flex_direction_column'], styles['centerItems'], styles['top_10'], styles['bottom_10'], { width: '90%', marginLeft: 10 }]}>
          <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_10']]}>{item?.categoryName} - {item?.subcategoryName}</Text>
          {isNullOrEmpty(item?.remarks) && <Text style={[styles['font_size_12_regular'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_10']]}>{translate('remarks')} : {item.remarks}</Text>}
          {showText &&
            <Text style={[styles['font_size_12_regular'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_10']]}>{joinedCouponNames}  -  {translate('gotCouponsWhichareinvalid')}</Text>
          }
          {/* <Text style={[styles['font_size_12_regular'], styles['text_color_black'], styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_10']]}>{item.remarks} - {translate('gotCouponsWhichareinvalid')}</Text> */}
          <Text style={[styles['font_size_12_regular'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_10']]}>{item.raisedBy}</Text>
          <Text style={[styles['font_size_12_semibold'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_10']]}>{translate('status')} - <Text style={[styles['text_color_orange']]}>{item?.complaintStatus}</Text></Text>

        </View>
        {item?.dupicateCount > 1 && <View style={{ backgroundColor: "rgba(219, 113, 14, 1)", alignItems: "center", justifyContent: "center", borderRadius: 50, height: 20, width: 20, top: 15, right: 15 }}>
          {/* <Text style={[styles['font_size_12_regular'], {color:dynamicStyles.secondaryColor},]}>{item?.dupicateCount}</Text> */}
          <Text style={[styles['font_size_12_regular'], styles['tint_color_white'],]}>{item?.dupicateCount}</Text>
        </View>}
        {item?.complaintImage &&
          <TouchableOpacity style={[styles['absolute_position'], styles['width_height_60'], { right: 5, bottom: 10, justifyContent: 'center' }]} onPress={() => { viewCicked(item) }}>
            <Image style={[styles['margin_left_10'], styles['width_height_40'], styles['align_self_center'], styles['absolute_position'], styles['right_10']]} source={{ uri: networkStatus ? item?.complaintImage : 'file://' + item?.complaintImage }}></Image>
          </TouchableOpacity>}
      </TouchableOpacity>

    )
  }

  const cancelBtnPress = () => {
    setShowDetailViewModal(false)
  }
  let renderPopup = () => {
    // console.log('what is coming in selecte ', )
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={renderModal}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>

          <View style={[styles['bg_white'], styles['width_90%'], styles['height_60%'], styles['align_self_center'], styles['border_radius_6']]}>
            <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]} onPress={() => {
              setRenderModal(!renderModal)
              setselectedComplaint(null)
            }}>
              <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
            </TouchableOpacity>
            <FlatList
              data={selectedComplaint.relatedDuplicates}
              initialNumToRender={3}
              nestedScrollEnable={true}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={5}
              keyExtractor={(_, index) => index}
              renderItem={({ item, index }) => renderItems(item, index, complantData.length - 1)}
              scrollEnabled={true}
              ListFooterComponent={<View style={{ paddingBottom: 20 }}></View>}
              style={[{ flex: 1 }, styles['width_100%']]}>
            </FlatList>
          </View>
        </View>
      </Modal>
    )
  }

  const showDetailViewSection = (item) => {
    // console.log('what is coming in selecte item', item)
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>

          <View style={[styles['bg_white'], styles['width_90%'], styles['height_40%'], styles['align_self_center'], styles['border_radius_6']]}>
            <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]} onPress={() => { cancelBtnPress() }}>
              <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
            </TouchableOpacity>

            <TouchableOpacity style={[styles['centerItems'], styles['margin_top_2'], styles['cellBgColor'], { padding: 15, margin: 10, elevation: 5, height: Dimensions.get('screen').height / 3.25, width: Dimensions.get('screen').width / 1.5 }]}
            //  onLongPress={() => { setShowDeleteButton(true) }}
            >
              <Image source={{ uri: networkStatus ? item?.complaintImage : 'file://' + item?.complaintImage }} style={[styles['centerItems'], { height: '80%', width: '90%' }]} resizeMode="contain" />
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    )
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      <View style={[styles['full_screen'], { backgroundColor: "rgba(249, 249, 249, 1)" }]}>
        {Platform.OS === 'android' && <StatusBar translucent={true} backgroundColor={{ backgroundColor: 'rgba(249, 249, 249, 1)' }} barStyle='dark-content' />}
        <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 20 : 20 }, stylesheetStyles.addFlex]}>
          <TouchableOpacity style={[styles['flex_direction_row'], { alignItems: "center", marginRight: 5 }]} onPress={() => { goBack() }}>
            <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 22, width: 22, resizeMode: "contain" }]} source={require('../assets/images/previous.png')}></Image>
            <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold']]}>{translate('Samadhan')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            GetComplaintsApiCall(true)
          }}>
            <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 30, width: 30, resizeMode: "contain" }]} source={require('../assets/images/dataRefresh.png')}></Image>
          </TouchableOpacity>
        </View>
        <View style={[styles['height_100%'], styles['width_100%']]}>


          <View style={[styles['padding_top_10'], styles['width_100%'], styles['height_100%']]}>

            <Text style={[{ color: dynamicStyles.textColor, margin: 8 }, styles['centerItems'], styles['font_size_20_bold']]}>{translate('howcanwehelp')}</Text>
            <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems'], { marginVertical: 10 }]} ></View>
            <Text style={[styles['font_size_14_regular'], { color: dynamicStyles.textColor }, styles['text_align_center'], styles['width_75%'], styles['centerItems'], { marginVertical: 10 }]}>{translate('didntfindtheanswer')}</Text>


            <View style={[
              {
                alignItems: "center",
                flexDirection: "row",
                width: "90%",
                // height:90,
                paddingVertical: 10,
                alignSelf: "center",
                borderRadius: 6,
                backgroundColor: "white",
                borderWidth: 0.5,
                borderColor: "rgba(0, 0, 0, 0.1)",
              }]}>
              <View style={[{ backgroundColor: "rgba(246, 246, 246, 1)", height: 80, width: 65, alignItems: "center", justifyContent: "center", borderRadius: 8, marginLeft: 10 }]}>
                <Image style={{ height: 50, width: 50, resizeMode: "contain" }} source={{ uri: logo }}></Image>
              </View>
              <View style={[{ left: 10, width: "59%" }]}>
                <Text style={[{ color: dynamicStyles.textColor, textAlign: "left" }, styles['font_size_12_semibold']]}>{translate('Samadhan')}</Text>
                <Text style={[{ color: dynamicStyles.textColor, marginVertical: -0.5 }, styles['font_size_9.5_regular']]}>{num}</Text>
                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_9.5_regular']]}>{desc}</Text>
              </View>
              {num != "" &&
                <View style={[styles['flex_direction_row'], styles['align_self_center'], styles['absolute_position'], styles['right_15']]}>
                  <TouchableOpacity style={[styles['flex_direction_row'], styles['width_height_35'], styles['alignItems_center'], styles['justify_content_center'], { backgroundColor: dynamicStyles.primaryColor, borderRadius: 22 }]} onPress={() => { callBtnClicked() }}>
                    <Image style={[styles[''], { width: '40%', height: '40%', tintColor: dynamicStyles.secondaryColor }]} resizeMode='contain' source={require('../assets/images/helpCallGreenNew.png')}></Image>
                  </TouchableOpacity>
                </View>}
            </View>

            <View style={[styles['flex_direction_row'], styles['width_90%'], styles['margin_top_20'], styles['height_50'], styles['centerItems'], styles['align_self_center'], styles['border_radius_10'], styles['border_width_0.5'], styles['border_color_light_grey'], {
              backgroundColor: dynamicStyles.primaryColor
            }]}>
              <Image style={[styles['width_height_25']]} resizeMode='contain' source={require('../assets/images/supportTicket.png')}></Image>
              <Text style={[styles['align_self_center'], styles['margin_left_10'], styles['text_align_center'], { color: dynamicStyles.secondaryColor }, styles['font_size_14_regular']]}>{translate('addconcernsbyyou')}</Text>
            </View>

            {/* <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems'], styles['margin_top_10']]} ></View> */}


            {/* <View style={[{ width: '95%' }]}> */}
            <FlatList
              data={complantData}
              initialNumToRender={3}
              nestedScrollEnable={true}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={5}
              keyExtractor={(_, index) => index}
              renderItem={({ item, index }) => renderItems(item, index, complantData.length - 1)}
              scrollEnabled={true}
              ListFooterComponent={<View style={{ height: 25 }} />}
              showsVerticalScrollIndicator={false}
              style={[{ flex: 1, marginBottom: responsiveHeight(16) }, styles['width_100%']]}>
            </FlatList>
          </View>




        </View>
        <View style={[styles['margin_top_100'], styles['align_self_center'], styles['flex_1'], styles['width_100%'], styles['bottom_10'], styles['absolute_position'], { bottom: Platform.OS === 'ios' ? 10 : 0 }]}>
          <CustomButton title={translate('pluseComplaint')} onPress={complaintButtonPress} buttonBg={dynamicStyles.primaryColor} btnWidth={"90%"} titleTextColor={dynamicStyles.secondaryColor} />
        </View>

        {showDetailViewModal == true &&
          showDetailViewSection(selectedItemData)
        }
        {renderModal && renderPopup()}
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
    </SafeAreaView>
  )


}

let stylesheetStyles = StyleSheet.create({
  addFlex: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
})

export default HelpDesk;