import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Platform, StatusBar, Text, Image, AppState,
  Dimensions, Keyboard, TouchableOpacity, FlatList, ScrollView, TextInput, Modal,
  Linking,
  ActivityIndicator
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { getUniqueItems, isNullOrEmpty, isValidImageUrl, ROLENAME, retrieveData } from '../assets/Utils/Utils';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import SimpleToast from 'react-native-simple-toast';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import CustomListViewModal from '../Modals/CustomListViewModal';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { selectUser } from '../redux/store/slices/UserSlice';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';
import WebView from 'react-native-webview';
import { translate } from '../Localisation/Localisation';
import Share from 'react-native-share';
import FastImage from 'react-native-fast-image';
import RNFetchBlob from "react-native-blob-util";
import store from '../redux/store/store';
import { traverseAndReplaceUrlsGlobal } from '../Dashboard/ProgramDetails';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

export const getOfflineProductsData = async () => {
  let realm = new Realm({ path: 'User.realm' });
  var networkStatus = await getNetworkStatus()
  const state = store.getState();
  const getUserData = selectUser(state);
  if (networkStatus) {
    try {
      var getURL = configs.BASE_URL + configs.PRODUCTS.PRODUCTS_MASTERSV1;
      var getHeaders = await GetApiHeaders();
      var APIResponse = await GetRequest(getURL, getHeaders);
      console.log('products response is:', APIResponse)
      if (APIResponse != undefined && APIResponse != null) {
        if (APIResponse.statusCode == HTTP_OK) {
          var productsResp = APIResponse.response.productList
          let convertedData = await traverseAndReplaceUrlsGlobal(productsResp)
          try {
            realm.write(() => {
              realm.delete(realm.objects('productsMasterOffline'));
              realm.create('productsMasterOffline', {
                _id: new Date(),
                data: JSON.stringify(convertedData),
                timestamp: new Date(),
              });
              console.log('added successfully into prducts offline')
            });
          } catch (err) {
            console.log(err)
          }
        }
        else { }
      } else { }
    }
    catch (error) { }
  } else { }
}

export let getCropsListMasterProducts = async (companyCOde = '') => {
  let realm = new Realm({ path: 'User.realm' });
  var networkStatus = await getNetworkStatus()
  const state = store.getState();
  const getUserData = selectUser(state);
  if (networkStatus) {
    try {
      var getURL = configs.BASE_URL + configs.PRODUCTS.getCropMasterByCompanayCode;
      var getHeaders = await GetApiHeaders();
      var dataList = {
        "companyCode": companyCOde ? companyCOde : getUserData[0]?.companyCode
      }
      var APIResponse = await PostRequest(getURL, getHeaders, dataList);
      console.log('crops list response is:', JSON.stringify(APIResponse))
      if (APIResponse != undefined && APIResponse != null) {
        if (APIResponse.statusCode == HTTP_OK) {
          var masterResp = APIResponse.response
          if (masterResp != undefined && masterResp != null) {
            try {
              realm.write(() => {
                realm.delete(realm.objects('cropsListProducts'));
                realm.create('cropsListProducts', {
                  _id: new Date(),
                  data: JSON.stringify(masterResp),
                  timestamp: new Date(),
                });
                console.log('added successfully into crops list prducts offline')
              });
            } catch (err) {
              console.log(err)
            }
          }
        }
        else { }

      } else { }
    }
    catch (error) { }
  } else { }
}

function Products({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  var realm = new Realm({ path: 'User.realm' });
  const dispatch = useDispatch();
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const networkStatus = useSelector(state => state.networkStatus.value)
  console.log(route?.params, 'kjsadbjkasbjkdbjkasdbjkjbask')
  let dataFromCarousel = route?.params?.data;
  let productDataFromCarousel = dataFromCarousel?.productInfo;
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
  const [showDetailViewModal, setShowDetailViewModal] = useState(false)
  const [selectedItemData, setSelectedItemData] = useState([]);
  const [videoLink, setVideoLink] = useState('')
  const [imageLink, setImageLink] = useState('')
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [loadingP, setLoadingP] = useState(false)
  const [productsData, setProductsData] = useState([]);
  const [filterProductsData, setFilterProductsData] = useState([]);
  const [seasonMaster, setSeasonMaster] = useState([]);
  const [seasonName, setSeasonName] = useState(translate('select'))
  const [seasonId, setSeasonId] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState('')
  const [cropMasters, setCropMasters] = useState([]);
  const [cropMastersFilter, setCropMastersFilter] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(translate('select'))
  const [selectedCompany, setSelectedCompany] = useState(translate('select'))
  const [selectedCropId, setSelectedCropId] = useState(0)
  const [selectedCompanyId, setSelectedCompanyId] = useState(getUserData[0]?.companyCode)
  const [dropDownData, setdropDownData] = useState();
  const [showDropDowns, setShowDropDowns] = useState(false)
  const [dropDownType, setDropDownType] = useState("");
  const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
  const [numColoum, setNumColoum] = useState(1);
  const [wholeData, setWholeData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false);
  const [typeOfView, setTypeOfView] = useState([
    {
      name: 'List',
      id: 1,
      isSelected: true,
      icon: require('../assets/images/iv_list.png')
    },
    {
      name: 'Grid',
      id: 2,
      isSelected: false,
      icon: require('../assets/images/iv_grid.png')
    },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      GetProductsDetailsApiCall();
      checkOfflineData();
      if (networkStatus) {
        getOfflineProductsData();
      }
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [networkStatus])
  );

  const goBack = async () => {
    const roleTypeDetails = await retrieveData(ROLENAME)
    if (roleTypeDetails) {
      let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard' : 'Dashboard'
      navigation.navigate(navigateTo)
    }
  };

  const viewCicked = async (item) => {
    setSelectedItemData(item)
    setShowDetailViewModal(true)
  };

  const cancelBtnPress = () => {
    if (productDataFromCarousel !== undefined) {
      goBack()
    }
    else {
      setShowDetailViewModal(false)
    }
  }

  const handleCancelAlert = () => {
    setShowAlert(false)
  }

  const selectedSeasonButton = (item, index) => {
    if (item.currentSeason == item.name) {
      setSelectedCrop(translate('select'))
      setSelectedCropId(0)
      setSelectedIndex(index)
      setSeasonName(item.name)
      setSeasonId(item.id)
    }
    else {
      SimpleToast.show(translate('no_data_available'))
    }
  }

  const selectedListView = (item, index) => {
    const typeArray = [...typeOfView];
    if (index == 0) {
      setNumColoum(1)
    }
    else {
      setNumColoum(2)
    }
    for (let i = 0; i < typeArray.length; i++) {
      if (i == index) {
        typeArray[i].isSelected = true
      }
      else {
        typeArray[i].isSelected = false
      }
    }
    setTypeOfView(typeArray)

  }

  const filterSearch = (searchedText) => {
    var listItems = filterProductsData
    var array = listItems.filter(data => data.brandName.toString().toLowerCase().includes(searchedText.toLowerCase()));
    setFilterProductsData(array.length > 0 ? array : [])
  }

  const GetFilteredProdcs = async (cropID, companyID) => {
    const productsOfflineData = realm.objects('productsMasterOffline');
    if (productsOfflineData.length === 0) {
      let masterResp;
      masterResp = wholeData
      let productsResp;
      if (cropID !== 0) {
        productsResp = masterResp?.filter((item, index) => {
          return item.companyCode === companyID && item?.cropId === cropID
        })
      } else {
        productsResp = masterResp?.filter((item, index) => {
          return item.companyCode === companyID
        })
      }
      setProductsData(productsResp)
      setFilterProductsData(productsResp)
      filterCropData(productsResp)
    }
    if (productsOfflineData.length !== 0) {
      let data = productsOfflineData[0];
      let masterResp;
      masterResp = JSON.parse(data?.data)
      let productsResp;
      if (cropID !== 0) {
        productsResp = masterResp?.filter((item, index) => {
          return item.companyCode === companyID && item?.cropId === cropID
        })
      } else {
        productsResp = masterResp?.filter((item, index) => {
          return item.companyCode === companyID
        })
      }
      setProductsData(productsResp)
      setFilterProductsData(productsResp)
      filterCropData(productsResp)
    } else { }
  }

  let checkOfflineData = async () => {
    let cropsListProductsData = realm.objects('cropsListProducts');
    const cropMasterPlanningToolData = realm.objects('cropMasterPlanningTool');
    let companyCodeMasters = realm.objects('companyCodeMasterPlanningTool')
    if (cropsListProductsData !== 0) {
      let data = cropsListProductsData[0];
      const masterResp = JSON.parse(data?.data);
    }
    if (cropMasterPlanningToolData.length !== 0) {
      let dataOfCrops = JSON.parse(cropMasterPlanningToolData[0].cropMasterPlanningToolData)
      setCropMastersFilter(dataOfCrops)
    }
    if (companyCodeMasters.length !== 0) {
      let dataOfCompanyCodes = JSON.parse(companyCodeMasters[0].companyCodeMasterPlanningToolData)
      setCompanyList(dataOfCompanyCodes)
      let currentCompanyCode = getUserData[0]?.companyCode;
      let currentCompanyName = dataOfCompanyCodes?.find((item) => item.companyCode === currentCompanyCode).name
      setSelectedCompany(currentCompanyName)
      setSelectedCompanyId(currentCompanyCode);
    }
    if (companyCodeMasters.length === 0 && cropsListProductsData.length === 0) {
      showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
    }
  }
  const downloadFileToLocal = async (url, fileName) => {
    const { fs, config } = RNFetchBlob;
    const dirs = fs.dirs;
    const path = `${dirs.DocumentDir}/${fileName}`;

    try {
      if (!url || !/^https?:\/\//.test(url)) {
        throw new Error('Invalid URL: must begin with http:// or https://');
      }

      // 🔁 Always remove existing file
      const fileExists = await fs.exists(path);
      if (fileExists) {
        await fs.unlink(path);
        console.log('Existing file removed.');
      }

      console.log('Downloading file...');
      const response = await config({
        fileCache: true,
        path: path,
      })
        .fetch('GET', url)
        .progress({ count: 10 }, (received, total) => {
          console.log(`Download progress: ${received} / ${total}`);
        });

      console.log('File downloaded to:', response.path());
      return response.path();
    } catch (error) {
      console.warn('Error downloading file:', error.message || error);
      throw error;
    }
  };


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

  let getOfflineProductsData = async () => {
    // const productsOfflineData = realm.objects('productsMasterOffline');
    // if (productsOfflineData.length === 0) {
    if (networkStatus) {
      try {
        const productsOfflineData = realm.objects('productsMasterOffline');
        if (productsOfflineData.length === 0) {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))
        }
        else {

        }
        var getURL = configs.BASE_URL + configs.PRODUCTS.PRODUCTS_MASTERSV1;
        var getHeaders = await GetApiHeaders();
        var APIResponse = await GetRequest(getURL, getHeaders);
        console.log('products response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            setWholeData(APIResponse.response.productList)
            if (productsOfflineData.length === 0) {
              let productsResp = APIResponse?.response?.productList?.filter((item, index) => {
                return item.companyCode === getUserData[0]?.companyCode
              })
              setProductsData(productsResp)
              setFilterProductsData(productsResp)
              filterCropData(productsResp)
              setTimeout(() => {
                setLoadingMessage()
                setLoading(false)
              }, 500);
            } else { }
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
    } else { }
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

  const GetProductsDetailsApiCall = async () => {
    const productsOfflineData = realm.objects('productsMasterOffline');
    if (productsOfflineData.length === 0) {
      let masterResp;
      masterResp = wholeData
      let productsResp = masterResp?.filter((item, index) => {
        return item.companyCode === getUserData[0]?.companyCode
      })
      setProductsData(productsResp)
      setFilterProductsData(productsResp)
      filterCropData(productsResp)
    }
    if (productsOfflineData.length !== 0) {
      let data = productsOfflineData[0];
      let masterResp;
      masterResp = JSON.parse(data?.data)

      let productsResp = masterResp?.filter((item, index) => {
        return item.companyCode === getUserData[0]?.companyCode
      })
      console.log(productsResp, "productsRespproductsRespproductsRespproductsRespproductsResp")
      setProductsData(productsResp)
      setFilterProductsData(productsResp)
      filterCropData(productsResp)
    } else { }
  }

  const filterCropData = (data) => {
    var uniqueIds = []
    uniqueIds = getUniqueItems(data, 'cropName')
    setCropMasters(uniqueIds)

    setTimeout(() => {
      var newArray = []
      for (var i = 0; i < uniqueIds.length; i++) {
        let newObj = {
          name: uniqueIds[i].cropName,
          id: uniqueIds[i].cropId
        };
        newArray.push(newObj);
      }
      newArray.unshift({ name: "All", id: 0 });
      // setCropMastersFilter(newArray)
    }, 300);

  }

  const gridItem = (item, index) => {
    let pathh = isValidImageUrl(item.productImage) ? `file://${encodeURI(item?.productImage)}` : require('../assets/images/NoCropImage.png')
    const productsOfflineData = realm.objects('productsMasterOffline');
    return (
      <TouchableOpacity onPress={() => { viewCicked(item) }} key={index.toString()}>
        <View style={[styles['margin_10'], styles['bg_white'], { width: Dimensions.get('window').width / 2.5, opacity: 1.0, borderRadius: 5, borderWidth: 0.5, borderColor: Colors.white, elevation: 0.5, bottom: 10 }]}>
          <View style={[styles['centerItems'], styles['margin_top_10'], styles['width_98%']]}>
            {/* {networkStatus ? <Image source={(isNullOrEmpty(item.productImage) && isValidImageUrl(item.productImage)) ? { uri: item.productImage } : require('../assets/images/NoCropImage.png')} style={[styles['width_height_120'], styles['centerItems']]} resizeMode="contain" /> : */}
            {productsOfflineData.length === 0 ?
              <Image source={(isNullOrEmpty(item.productImage) && isValidImageUrl(item.productImage)) ? { uri: item.productImage } : require('../assets/images/NoCropImage.png')} style={[styles['width_height_120'], styles['centerItems']]} resizeMode="contain" />
              : <FastImage
                style={[styles['width_height_120'], styles['centerItems']]}
                source={{
                  // uri:'file://' + item?.productImage  ,
                  uri: pathh,
                  headers: { Authorization: 'someAuthToken' },
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />}
            {/* } */}
          </View>
          <View style={[{ height: 1, backgroundColor: Colors.lightGray, top: 10, width: '90%', alignSelf: 'center' }]}></View>
          <Text allowFontScaling={false} style={[styles['top_10'], styles['left_10'], styles['font_size_14_bold'], { color: dynamicStyles.textColor }, styles['text_align_left'], { width: '90%' }]} numberOfLines={1}>
            {item.brandName}
          </Text>
          <Text allowFontScaling={false} style={[styles['font_size_10_regular'], styles['left_10'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['top_5']]}>
            {item.couponPoints} {translate('points')}
          </Text>
          {/* <TouchableOpacity style={[styles['align_self_flex_end'], styles['justify_content_center'], styles['alignItems_center'], { bottom: 10, position: 'absolute', right: 10, }]} onPress={() => { viewCicked(item) }}> */}
          <View style={[styles['width_height_25'], styles['align_self_flex_end'], styles['top_10'], styles['right_5'], styles['bottom_10'], styles['border_radius_12.5'], styles['alignItems_center'], styles['justify_content_center'], { backgroundColor: dynamicStyles.primaryColor }]}>
            <Image style={[styles['width_height_10'], { tintColor: dynamicStyles.secondaryColor }]} source={require('../assets/images/rightArrow.png')}></Image>
          </View>
          {/* </TouchableOpacity> */}
        </View>
      </TouchableOpacity>
    );
  }


  const takeScreenshot = async (link) => {
    if (isProcessing) return; // prevent multiple clicks
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const shareOptions = {
          title: 'Share via',
          message: link,
        };
        Share.open(shareOptions);
      } catch (error) {
        console.error('Failed to capture screenshot:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 200);


  };

  const isYouTubeLink = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (productDataFromCarousel !== undefined) {
        viewCicked(productDataFromCarousel)
      }
    }, [productDataFromCarousel])
  );

  useEffect(() => {
    // Lock to portrait when modal is closed, unlock all orientations when modal is open
    if (showVideoModal) {
      Orientation.lockToPortrait(); // Allow all orientations when modal is open
    } else {
      Orientation.lockToPortrait(); // Lock to portrait when modal is closed
    }
  }, [showVideoModal]);

  const showVideoPlayer = () => {
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>
          <View style={[styles['bg_white'], styles['width_90%'], styles['align_self_center'], styles['border_radius_6']]}>
            <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]}
              onPress={() => {
                {
                  Platform.OS == 'android' ? setShowVideoModal(false) : setShowVideoModal(false)
                  setTimeout(() => {
                    setShowDetailViewModal(true)
                  }, 100);
                }
              }}
            >
              <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
            </TouchableOpacity>

            {!isProcessing && <TouchableOpacity
              onPress={() => takeScreenshot(imageLink)}
              style={{ position: 'absolute', bottom: -2, right: 2, zIndex: 999, borderRadius: 30, padding: 10, }}>
              <Image
                style={{ width: 45, height: 45 }}
                source={require('../assets/images/whatsappicon_2x.png')}
              />
            </TouchableOpacity>}

            {isNullOrEmpty(videoLink) &&
              <View style={[styles['centerItems'], styles['margin_top_2'], styles['cellBgColor'], { padding: 10, margin: 10, elevation: 5, width: Dimensions.get('screen').width / 1.5, height: 200, backgroundColor: Colors.very_light_grey }]}>
                {loadingP && (
                  <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                    <ActivityIndicator size="large" color={Colors.themeRed} />
                  </View>
                )}

                <Video
                  source={{ uri: isNullOrEmpty(videoLink) ? videoLink : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
                  style={{ flex: 1, height: '100%', width: '100%' }}
                  resizeMode="cover"
                  controls={true}
                  endWithThumbnail
                  thumbnail={{
                    uri: isNullOrEmpty(videoLink) ? videoLink : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
                  }}
                  paused={!showVideoModal}
                  onLoadStart={handleLoadStart}
                  showDuration={true}
                  onReadyForDisplay={handleOnReadyForDisplay}
                  onError={handleError}
                  fullscreen={orientation === 'LANDSCAPE'}
                />
              </View>
            }

            {isNullOrEmpty(imageLink) &&
              <View style={{ height: responsiveHeight(80), width: responsiveWidth(90), padding: 10, alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
                {/* <Image source={isValidImageUrl(imageLink) ? { uri: imageLink } : require('../assets/images/NoCropImage.png')} resizeMode='stretch' style={{ height: '100%', width: '100%' }} /> */}
                <WebView
                  source={{ uri: imageLink }} // Replace with your desired URL
                  style={[styles['centerItems'], styles['border_radius_6'], { height: '80%', width: '90%' }]}
                  containerStyle={[styles['centerItems'], { flex: 1, width: '100%', height: '90%' }]}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  onMessage={(event) => {
                    console.log("event", event.nativeEvent.data)
                    if (event.nativeEvent.data == "Accepted") {
                      approveTermsButtonClick()
                    }
                  }}
                />
              </View>
            }
          </View>
        </View>
      </Modal>
    )
  }

  const handleOnReadyForDisplay = () => {
    setLoadingP(false)
  };
  const handleLoadStart = () => {
    setLoadingP(true);
  };
  const handleError = (error) => {
    setLoadingP(false);
    console.error('Video error:', error);
  };

  const setVideoData = (item) => {
    setShowVideoModal(true)
    setOrientation("LANDSCAPE")
    setVideoLink(item.testimonial)
    setImageLink("");
  }

  const showDetailViewSection = (item) => {
    let pathh;
    const productsOfflineData = realm.objects('productsMasterOffline');
    // if (productDataFromCarousel !== undefined) {
    // if (productDataFromCarousel !== undefined && networkStatus) {
    //   pathh = isValidImageUrl(item.productImage) ? item?.productImage : require('../assets/images/NoCropImage.png')
    // } else {
    pathh = isValidImageUrl(item.productImage) ? `file://${encodeURI(item?.productImage)}` : require('../assets/images/NoCropImage.png')
    // }
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>

          <View style={[styles['bg_white'], styles['width_90%'], styles['align_self_center'], styles['border_radius_8'], { paddingBottom: 10 }]}>
            <View style={[item.brandName.trim() ? styles['space_between'] : styles['justify_content_flex_end'], styles['flex_direction_row'], { backgroundColor: dynamicStyles.primaryColor, paddingVertical: 8 }, { borderTopLeftRadius: 8, borderTopRightRadius: 8 }]}>
              {isNullOrEmpty(item.brandName) &&
                <Text allowFontScaling={false} style={[styles['margin_left_20'], styles['font_size_18_bold'], { color: dynamicStyles.secondaryColor, width: "80%" }, styles['text_align_left']]}>
                  {item.brandName}
                </Text>
              }
              <TouchableOpacity style={[styles['flex_direction_row'], styles['width_height_30'], styles['align_self_flex_end'], styles['right_10'], styles['centerItems']]} onPress={() => { cancelBtnPress() }}>
                <Image style={[styles['width_height_30']]} source={require('../assets/images/closeWindow.png')}></Image>
              </TouchableOpacity>
            </View>

            <View style={[styles['align_self_center'], styles['flex_direction_row'], styles['top_10'], styles['width_95%']]}>
              {/* {networkStatus ? <Image source={(isNullOrEmpty(item.productImage) && isValidImageUrl(item.productImage)) ? { uri: item.productImage } : require('../assets/images/NoCropImage.png')} style={[{ height: Dimensions.get('window').height / 4, width: Dimensions.get('window').width / 2.8 }]} resizeMode="contain" />
                : */}
              {productsOfflineData.length === 0 ?
                <Image source={(isNullOrEmpty(item.productImage) && isValidImageUrl(item.productImage)) ? { uri: item.productImage } : require('../assets/images/NoCropImage.png')} style={[{ height: Dimensions.get('window').height / 4, width: Dimensions.get('window').width / 2.8 }]} resizeMode="contain" />
                :
                <FastImage
                  style={[{ height: Dimensions.get('window').height / 4, width: Dimensions.get('window').width / 2.8 }]}
                  source={{
                    // uri: 'file://' + item?.productImage,
                    uri: pathh,
                    headers: { Authorization: 'someAuthToken' },
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />}
              {/* } */}
              <View style={[styles['margin_left_5'], { width: '50%', alignItems: "center", justifyContent: "center" }]}>

                {isNullOrEmpty(item.couponPoints) &&
                  <View style={[{ backgroundColor: dynamicStyles.primaryColor, flexDirection: 'row', padding: 5, borderRadius: 5, width: '100%' }]}>
                    <Text allowFontScaling={false} style={[styles['font_size_11_semibold'], { color: dynamicStyles.secondaryColor }, { width: '70%', lineHeight: 25 }]}>{translate('pointsORBags')}</Text>
                    <Text allowFontScaling={false} style={[styles['font_size_11_semibold'], { color: dynamicStyles.secondaryColor }, { textAlign: 'center', lineHeight: 25 }]}>{" : "}</Text>
                    <Text allowFontScaling={false} style={[styles['font_size_11_semibold'], { color: dynamicStyles.secondaryColor }, { width: '30%', marginLeft: 3, lineHeight: 25 }]}>{item?.couponPoints}</Text>
                  </View>
                }
              </View>
            </View>
            {(item?.testimonial && item?.productLeaflet) && <View style={[styles['bg_lightish_grey'], styles['top_10'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>}

            <View style={[(item.testimonial && item.productLeaflet) ? { justifyContent: "space-between" } : { justifyContent: "center" }, { flexDirection: "row", alignItems: "center", marginTop: responsiveHeight(1.5), paddingHorizontal: 15, marginBottom: responsiveHeight(0.5) }]}>
              {isNullOrEmpty(item.testimonial) &&
                <TouchableOpacity activeOpacity={0.5}
                  onPress={() => {
                    if (networkStatus) {
                      setImageLink("");
                      isYouTubeLink(item.testimonial) ? Linking.openURL(item.testimonial).catch(err => console.error("Couldn't load page", err)) : setVideoData(item)
                    } else {
                      SimpleToast.show(translate('no_internet_conneccted'))
                    }
                  }}
                  style={{ backgroundColor: dynamicStyles.primaryColor, alignItems: "center", justifyContent: "center", width: "45%", height: responsiveHeight(5), borderRadius: 8 }}>
                  <Text allowFontScaling={false} style={[{ color: dynamicStyles.secondaryColor, }, styles['font_size_11_semibold'], { lineHeight: 25 }]}>{translate("Testimonials")}</Text>
                </TouchableOpacity>}
              {isNullOrEmpty(item.productLeaflet) &&
                <TouchableOpacity activeOpacity={0.5}
                  onPress={() => {
                    if (networkStatus) {
                      Platform.OS == 'android' ? (setShowVideoModal(true), setVideoLink(""), setImageLink(item.productLeaflet))
                        :
                        setShowDetailViewModal(false)
                      setTimeout(() => {
                        setShowVideoModal(true)
                        setVideoLink("")
                        setImageLink(item.productLeaflet)
                      }, 100);
                    } else {
                      SimpleToast.show(translate('no_internet_conneccted'))
                    }
                  }}
                  style={{ backgroundColor: dynamicStyles.primaryColor, alignItems: "center", justifyContent: "center", width: "45%", height: responsiveHeight(5), borderRadius: 8 }}>
                  <Text allowFontScaling={false} style={[{ color: dynamicStyles.secondaryColor }, styles['font_size_11_semibold']]}>{translate('productInfo')}</Text>
                </TouchableOpacity>
              }
            </View>

          </View>
        </View>
      </Modal>
    )
  }
  const onSelectedCrop = async (item) => {
    setSelectedCrop(item.name)
    setSelectedCropId(item?.id);
    setShowDropDowns(false);
    GetFilteredProdcs(item?.id, selectedCompanyId)
  }
  const onSelectedCompany = async (item) => {
    setSelectedCompany(item?.name)
    setSelectedCompanyId(item?.companyCode);
    console.log(item.name, item.companyCode, "::::::::::::::::::::::::::::::::::::::::::::::::::::")
    setShowDropDowns(false);
    setSelectedCrop('')
    setSelectedCropId(0)
    GetFilteredProdcs(0, item?.companyCode)
  }

  const changeDropDownData = (dropDownData, type, selectedItem) => {
    if (dropDownData.length == 0) {
      SimpleToast.show(translate('no_data_available'))
    }
    else {
      //setShowFilterSelectionModal(false);
      setShowDropDowns(true);
      setdropDownData(dropDownData);
      setDropDownType(type);
      setSelectedDropDownItem(selectedItem);
    }

  }

  return (
    <View style={[styles['full_screen'], styles['flex_1'], { backgroundColor: Colors.lightwhiteGray }]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
      <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { width: "100%", paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[{ flexDirection: "row", alignItems: "center", maxWidth: "55%" }]} onPress={() => navigation.goBack()}>
          <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, marginRight: 10 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[{ color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('products')}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles['height_100%'], styles['width_100%'], styles['padding_horizontal_10']]}>
        <View>
          <View style={[styles['flex_direction_row'], styles['bg_white'], styles['border_radius_normal'], styles['height_40'], styles['border_width_1'], { borderColor: Colors.very_light_grey, right: 0, top: 20, width: '95%' }, styles['centerItems']]}>
            <TouchableOpacity
              onPress={() => {
                if (searchText != "") {
                  Keyboard.dismiss();
                }
                setSearchText('')
                setFilterProductsData(productsData)
                setSelectedCrop(translate('select'))
                setSelectedCropId(0)
              }}>
              <Image style={[styles['width_height_15']]}
                source={(searchText == '') ? require('../assets/images/searchGray.png') : require('../assets/images/close.png')} />
            </TouchableOpacity>

            <TextInput
              value={searchText}
              onChangeText={(search) => {
                setSearchText(search)
                setTimeout(() => {
                  if (search == "") {
                    setSearchText('')
                    setFilterProductsData(productsData)
                    setSelectedCrop(translate('select'))
                    setSelectedCropId(0)
                  } else {
                    filterSearch(search)
                  }
                }, 200);
              }}
              placeholder={translate('search_product')}
              placeholderTextColor={Colors.darkgrey}
              style={[styles['width_90%'], styles['font_size_14_regular'], { color: dynamicStyles.textColor }, styles['height_45'], { paddingLeft: 10 }]} />
          </View>

          <CustomInputDropDown
            width={[styles['width_95%'], styles['margin_top_30'], styles['centerItems']]}
            defaultValue={selectedCompany != undefined && selectedCompany != translate('select') ? selectedCompany : translate('select')}
            labelName={translate('selectCompany')}
            IsRequired={false}
            placeholder={translate('select')}
            onEndEditing={async event => { }}
            onFocus={() => {
              changeDropDownData(companyList, strings.company, selectedCompany)
            }}
          />

          <CustomInputDropDown
            width={[styles['width_95%'], styles['margin_top_10'], styles['centerItems']]}
            defaultValue={selectedCrop != undefined && selectedCrop != translate('select') ? selectedCrop : translate('select')}
            labelName={translate('selectCrop')}
            IsRequired={false}
            placeholder={translate('select')}
            onEndEditing={async event => {

            }}
            onFocus={() => {
              console.log("cropMastersFilter", JSON.stringify(cropMastersFilter) + " " + selectedCompanyId)
              let filterItemsThroughCompanyCode = cropMastersFilter?.filter((dataa) => {
                return dataa?.companyCode == selectedCompanyId
              })
              changeDropDownData(filterItemsThroughCompanyCode, strings.crop, selectedCrop)

            }}
          />
        </View>
        <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true} style={[{ marginBottom: 35 }]}>
          <View style={[styles['width_100%'], styles['height_100%'], { paddingBottom: 15 }]}>
            <View style={[styles['width_95%'], styles['margin_top_30'], styles['border_radius_6'], styles['align_self_center'], styles['padding_bottom_20']]}>
              {filterProductsData?.length > 0 ?
                (
                  <FlatList
                    initialNumToRender={3}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    key={numColoum}
                    data={filterProductsData}
                    renderItem={({ item, index }) => gridItem(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                  >
                  </FlatList>
                )
                :
                (
                  <View>
                    <Text style={[{ color: dynamicStyles.textColor }, styles['centerItems'], styles['margin_top_100'], styles['font_size_16_regular']]}>{translate('no_data_available')}</Text>
                  </View>
                )
              }
            </View>
            {showDetailViewModal == true &&
              showDetailViewSection(selectedItemData)
            }
            {showVideoModal && showVideoPlayer()}
          </View>
        </ScrollView>
      </View>
      {
        showAlert && (
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
        )
      }
      {
        showDropDowns &&
        <CustomListViewModal
          dropDownType={dropDownType}
          listItems={dropDownData}
          selectedItem={selectedDropDownItem}
          onSelectedCrop={(item) => onSelectedCrop(item)}
          onSelectedCompanyName={(item) => onSelectedCompany(item)}
          closeModal={() => setShowDropDowns(false)} />
      }

      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
    </View >
  )
}

export default Products;