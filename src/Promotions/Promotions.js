import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Platform, StatusBar, Text, Image, AppState,
  Dimensions, TouchableOpacity, FlatList, ScrollView,
  Modal,
  Linking,
  ActivityIndicator
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { capitalizeFirstLetter, isNullOrEmpty ,ROLENAME,retrieveData} from '../assets/Utils/Utils';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { GetApiHeaders, GetRequest, PostRequest } from '../NetworkUtils/NetworkUtils';
import SimpleToast from 'react-native-simple-toast';
import Video from 'react-native-video';
import WebView from 'react-native-webview';
import ImageViewer from 'react-native-image-zoom-viewer';
import Orientation from 'react-native-orientation-locker';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { selectUser } from '../redux/store/slices/UserSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);


function Promotions() {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const dispatch = useDispatch();
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [loading, setLoading] = useState(false)
  const [loadingP, setLoadingP] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const networkStatus = useSelector(state => state.networkStatus.value)

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
  const [faqSectionData, setFaqSectionData] = useState([]);
  const [faqFilterSectionData, setFaqFilterSectionData] = useState([]);
  const [showWebView, setShowWebView] = useState(false);
  const [pdfURLIS, setPdfURLIS] = useState("");
  const [currentIndexImage, setCurrentIndexImage] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState()
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  // const [promotionsData, setPromotionsData] = useState([
  //     { name: 'Scheme Name', sector: 'Indian seed Fund', date: '20-Feb-2024 to 20-mar-2024', details: 'Product wise product details', img: require("../assets/images/promotionBanner.png"), description:'Startup India Seed Fund Scheme (SISFS) aims to provide financial assistance to startups for proof of concept, prototype development,\nproduct trials, market entry and commercialization.\n \nThis would enable these startups to graduate to a level where\nthey will be able to raise investments from angel investors or venture\ncapitalists or seek loans from commercial banks or financial institutions.'},
  //     { name: 'Scheme Name', sector: 'Boosting Seed ', date: '12-Apr-2024 to 27-Apr-2024', details: 'Wise product details', img: require("../assets/images/promotionBannerDummy.png"),  description:''},
  //     { name: 'Scheme Name', sector: 'Seed ', date: '03-Mar-2024 to 27-Apr-2024', details: 'Product details', img: require("../assets/images/promotionBanner.png"),  description:''},
  // ]);
  const [promotionsData, setPromotionsData] = useState([]);

  const flatListRef = useRef(null);
  const [seasonMaster, setSeasonMaster] = useState([]);
  const [seasonName, setSeasonName] = useState(translate('select'))
  const [seasonId, setSeasonId] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isYellowViewVisible, setIsYellowViewVisible] = useState(true);
  const [orientation, setOrientation] = useState('PORTRAIT');

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

  useEffect(() => {
    const handleOrientationChange = (orientation) => {
      setOrientation(orientation);
    };

    Orientation.addOrientationListener(handleOrientationChange);

    return () => {
      Orientation.removeOrientationListener(handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    if (showVideoModal) {
      Orientation.unlockAllOrientations();
    } else {
      Orientation.lockToPortrait();
    }
  }, [showVideoModal]);

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
      let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard': 'Dashboard'
      navigation.navigate(navigateTo)
    }
    // navigation.navigate('Dashboard')
  };

  const handleCancelAlert = () => {
    setShowAlert(false)
  }

  // useEffect(() => {
  //     GetPromotionsDetailsApiCall(seasonId)
  //     console.log('what is in promotion Details', promotionsData)
  // }, { promotionsData })

  useEffect(() => {
    setTimeout(() => {
      if (showWebView) {
        setShowWebView(false)
      }
    }, 1500);
  }, [showWebView])

  useEffect(() => {
    if (networkStatus) {
      getSeasonMaster();
    }
    console.log('what is in season Details', seasonMaster)
  }, { seasonMaster, seasonName, seasonId })

  const GetPromotionsDetailsApiCall = async (id) => {
    if (networkStatus) {
      try {
        setTimeout(() => {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))
        }, 50);
        var getURL = configs.BASE_URL + configs.PROMOTIONS.PROMOTIONS_MASTERS;
        var getHeaders = await GetApiHeaders();
        var dataList = {
          seasonId: id,
          companyCode:getUserData[0]?.companyCode ?? ""
        }
        console.log('url is', getURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getURL, getHeaders, dataList);
        console.log('promotions response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
            }, 300);
            var promotionsResp = APIResponse.response.promotionsList
            console.log('the promotions Resp is', promotionsResp)
            setPromotionsData(promotionsResp)
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

  const getSeasonMaster = async () => {
    if (networkStatus) {
      try {
        setTimeout(() => {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))
        }, 50);
        var seasonMasterUrl = configs.BASE_URL + configs.MASTERS.FILTER_SEASON;
        var getHeaders = await GetApiHeaders();
        var APIResponse = await GetRequest(seasonMasterUrl, getHeaders);

        if (APIResponse != undefined && APIResponse != null) {
          // setTimeout(() => {
          //   setLoadingMessage()
          //   setLoading(false)
          // }, 200);
          if (APIResponse.statusCode == HTTP_OK) {
            var response = APIResponse.response.seasonList
            const sortedSeasonList = APIResponse.response.seasonList.sort((a, b) => a.id - b.id);
            setSeasonMaster(sortedSeasonList)
            console.log('seasondata is', sortedSeasonList)

            setTimeout(() => {
              setLoadingMessage()
              setLoading(false)
            }, 500);

            setTimeout(() => {
              GetPromotionsDetailsApiCall(response[0].id)
            }, 800);
          }
          else {
            SimpleToast.show(APIResponse.message)
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 500);
        }
      } catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const showVideoPlayer = () => {
    return (
      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>
          <View style={[styles['bg_white'], styles['width_90%'], styles['align_self_center'], styles['border_radius_6']]}>
            <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]} onPress={() => { setShowVideoModal(false) }} >
              <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
            </TouchableOpacity>

            <View style={[styles['centerItems'], styles['margin_top_2'], styles['cellBgColor'], { padding: 10, margin: 10, elevation: 5, width: Dimensions.get('screen').width / 1.5, height: 200, backgroundColor: Colors.very_light_grey }]}>
              {loadingP && (
                <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                  <ActivityIndicator size="large" color={Colors.themeRed} />
                </View>
              )}
              <Video
                source={{ uri: videoLink }}
                style={{ flex: 1, height: '100%', width: '100%' }}
                resizeMode="cover"
                controls={true}
                paused={!showVideoModal}
                onLoadStart={handleLoadStart}
                onReadyForDisplay={handleOnReadyForDisplay}
                onError={handleError}
                fullscreen={orientation === 'LANDSCAPE'}
              />
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  const showUploadedImage = () => {
    const imageUrls = [{ url: selectedPromotion }];
    return (
      // <Modal
      //   transparent={true}
      //   animationType='fade'
      //   visible={true}
      //   onRequestClose={() => { console.log('close modal') }}>
      //   <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>
      //     <View style={[styles['bg_white'], styles['width_90%'], styles['align_self_center'], styles['border_radius_6'], { height: "75%" }]}>
      //       <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]} onPress={() => { setIsModalVisible(false) }} >
      //         <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
      //       </TouchableOpacity>

      //       <View style={[styles['centerItems'], styles['margin_top_2'], styles['cellBgColor'], { padding: 15, margin: 10, elevation: 5, height: Dimensions.get('screen').height / 1.60, width: Dimensions.get('screen').width / 1.5 }]}>
      //         <Image source={{ uri: selectedPromotion }} style={[styles['centerItems'], { height: '100%', width: '100%', padding: 10 }]} resizeMode="contain" />
      //       </View>
      //     </View>
      //   </View>
      // </Modal>

      <Modal
        transparent={true}
        animationType='fade'
        visible={true}
        onRequestClose={() => { console.log('close modal') }}>
        <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>
          <View style={[styles['bg_white'], styles['width_90%'], styles['align_self_center'], styles['border_radius_6'], { height: "75%" }]}>
            <TouchableOpacity style={[styles['flex_direction_row'], styles['align_self_flex_end'], styles['right_10'], styles['margin_top_10']]} onPress={() => { setIsModalVisible(false) }} >
              <Image style={[styles['margin_left_20'], styles['width_height_20']]} source={require('../assets/images/closeWindow.png')}></Image>
            </TouchableOpacity>

            {/* <View style={[styles['centerItems'], styles['margin_top_2'], styles['cellBgColor'], { padding: 15, margin: 10, elevation: 5, height: Dimensions.get('screen').height / 1.60, width: Dimensions.get('screen').width / 1.5 }]}> */}
            {/* <Image source={{ uri: selectedPromotion }} style={[styles['centerItems'], { height: '100%', width: '100%', padding: 10 }]} resizeMode="contain" /> */}
            <ImageViewer
              imageUrls={imageUrls}
              enableSwipeDown={true}
              onSwipeDown={() => setIsModalVisible(false)}
              renderIndicator={() => null}
              backgroundColor={Colors.white}
              style={{ width: '100%', height: '100%', marginBottom: 15 }}
            />
            {/* </View> */}
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

  const handleScrollImage = (event) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const currentIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
    setCurrentIndexImage(currentIndex);
  };

  const listImages = (item, index) => {
    console.log(item, "Bother");
    return (
      <View style={{ width: Dimensions.get('window').width / 1 }} key={() => { index.toString() }}>
        <TouchableOpacity onPress={() => {
          setIsModalVisible(true)
          setSelectedPromotion(item?.imageUrl)
        }}>
          <Image
            source={{ uri: item?.imageUrl }}
            style={{ width: Dimensions.get('window').width / 1.20, aspectRatio: 18 / 11, }}
            resizeMode="stretch"
          />
        </TouchableOpacity>
      </View>
    );
  }

  const renderIndicator = (index, item) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 10, alignSelf: 'center' }}>
        {item?.fileName.map((_, i) => (
          <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === index ? 'green' : 'gray', marginHorizontal: 4 }} />
        ))}
      </View>
    );
  };

  const setVideoData = (link) => {
    console.log(link);
    setShowVideoModal(true)
    setOrientation("LANDSCAPE")
    setVideoLink(link)
  }
  const ListItem = (item, index) => {
    const fileName = item.pdfUrl.split('/').pop();
    return (
      <View style={[styles['bg_white'], styles['margin_top_10'], styles['padding_10'], styles['width_100%'], styles['border_radius_10'], styles['CenterItems'], styles['border_color_light_grey'], styles['border_1'], { elevation: 3 }]} key={index.toString()}>
        <View onPress={() => { }}>
          {isNullOrEmpty(item.fileName) &&
            <View>
              <FlatList
                ref={flatListRef}
                data={item.fileName}
                renderItem={({ item, index }) => listImages(item, index)}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                pagingEnabled={true}
                snapToInterval={Dimensions.get('window').width}
                decelerationRate={'normal'}
                onScroll={handleScrollImage}
              />
              {item?.fileName.length > 1 && renderIndicator(currentIndexImage, item)}
            </View>}
          {/* {isNullOrEmpty(getImage) &&
            <Image style={[styles['width_98%'], styles['border_radius_8'], { aspectRatio: 18 / 11 }]} source={{ uri: getImage.imageUrl }} resizeMode="contain" />
          } */}

          {isNullOrEmpty(item.name) &&
            <Text style={[{color:dynamicStyles.textColor}, styles['font_size_16_semibold'], styles['margin_top_10']]}>{capitalizeFirstLetter(item?.name)}</Text>
          }
          {isNullOrEmpty(item.promotionType) &&
            <Text style={[{color:dynamicStyles.textColor}, styles['font_size_16_regular'], styles['margin_top_5']]}>{item.promotionType}</Text>
          }
          <View style={[styles['bg_lightish_grey'], styles['width_100%'], styles['margin_top_5'], styles['height_0.5'], styles['centerItems']]} ></View>

          {isNullOrEmpty(item.enDate) &&
            <View style={[styles['flex_direction_row'], styles['margin_top_10']]}>
              <Image style={[styles['width_height_15'],{tintColor:dynamicStyles.primaryColor}]} source={require('../assets/images/smallCalendar.png')}></Image>
              <Text style={[styles['left_10'], styles['text_color_black'], styles['font_size_14_regular']]}>{item.stDate} to {item.enDate}</Text>
            </View>
          }
          {isNullOrEmpty(item.videoLink) &&
            <View style={[styles['flex_direction_row'], styles['margin_top_10']]}>
              <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => {
                isYouTubeLink(item?.videoLink) ? Linking.openURL(item?.videoLink).catch(err => console.error("Couldn't load page", err)) : setVideoData(item?.videoLink)
              }}>
                <Image style={[styles['width_height_15'],{tintColor:dynamicStyles.primaryColor}]} source={isYouTubeLink(item?.videoLink) ? require('../assets/images/ic_youtube.png') : require('../assets/images/ic_video.png')}></Image>
                <Text style={[styles['left_10'], styles['text_color_blue'], styles['font_size_14_regular']]}>{capitalizeFirstLetter(item?.name)} Video</Text>
              </TouchableOpacity>
            </View>
          }

          {isNullOrEmpty(item.pdfUrl) &&
            <View style={[styles['flex_direction_row'], styles['margin_top_10']]}>
              <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { selectedPDFButton(item, index) }}>
                <Image style={[styles['width_height_15'],{tintColor:dynamicStyles.primaryColor}]} source={require('../assets/images/smallProductDetail.png')}></Image>
                <Text style={[styles['left_10'], styles['text_color_blue'], styles['font_size_14_regular']]}>{capitalizeFirstLetter(fileName)}</Text>
              </TouchableOpacity>
            </View>
          }
        </View>

        {/* } */}
        {/* {isNullOrEmpty(item.description) && */}
        {/* <Text style={[styles['margin_top_10'],styles['text_color_black'],styles['font_size_16_regular']]}>{item.description}</Text> */}
        {/* } */}
      </View>
    );
  }

  const isYouTubeLink = (url) => {
    return youtubeRegex.test(url);
  };

  const selectedSeasonButton = (item, index) => {
    setSelectedIndex(index)
    setSeasonName(item.name)
    setSeasonId(item.id)
    setTimeout(() => {
      GetPromotionsDetailsApiCall(item.id)
    }, 200);
  };

  const selectedPDFButton = (item, index) => {
    console.log('the item & index is:', item.pdfUrl, index)
    // let url = item.pdfUrl;
    // let fileName = 'my_pdf';
    // downloadPDF(url, fileName);
    setPdfURLIS(item.pdfUrl)
    setShowWebView(true)
  };

const _renderFilterItems = (item, index) => {
  const isSelected = selectedIndex === index;
  const isFirst = index === 0;
  const isLast = index === seasonMaster.length - 1;

  const buttonWidth = Dimensions.get('screen').width / seasonMaster.length -10.5;

  return (
    <View
      style={[
        styles['centerItems'],
        {
          width: buttonWidth,
          zIndex: isSelected ? 1 : 0,
        },
      ]}
      key={index.toString()}
    >
      <TouchableOpacity
        style={[
          {
            width: buttonWidth,
            height: 45,
            marginLeft: 0,
            position: 'relative',
            borderTopLeftRadius: isFirst && !isSelected ? 10 : isSelected ? 10 : 0,
            borderBottomLeftRadius: isFirst && !isSelected ? 10 : isSelected ? 10 : 0,
            borderTopRightRadius: isLast && !isSelected ? 10 : isSelected ? 10 : 0,
            borderBottomRightRadius: isLast && !isSelected ? 10 : isSelected ? 10 : 0,
            backgroundColor: isSelected ? dynamicStyles.primaryColor : dynamicStyles.disableColor,
            zIndex: isSelected ? 100 : -100,
            overflow: 'hidden', 
          },
          styles['centerItems'],
          styles['button_height_45'],
        ]}
        onPress={() => selectedSeasonButton(item, index)}
      >
        <Text
          style={[
            styles['font_size_14_semibold'],
            {
              color: isSelected
                ? dynamicStyles.secondaryColor
                : dynamicStyles.textColor,
            },
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

  const handleWebViewScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const scrollPosition = contentOffset.y;
    if (scrollPosition <= 0) {
      setIsYellowViewVisible(true);
    } else {
      setIsYellowViewVisible(false);
    }
  };

  const showWebViewSection = () => {
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>

        <View style={[styles['width_90%'], styles['height_80%']]}>

          <WebView
            onLoadStart={() => {
              // setLoading(true)
              // setLoadingMessage(translate('please_wait_getting_data'))
            }}
            onLoad={() => {
              // setLoading(false)
              // setLoadingMessage()
            }}
            source={{ uri: pdfURLIS }} // Replace with your desired URL
            style={[styles['centerItems'], styles['border_radius_6'], { height: '70%', width: '90%' }]}
            containerStyle={[styles['centerItems'], { flex: 1, width: '100%', height: '80%' }]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onScroll={handleWebViewScroll}
            onMessage={(event) => {
              console.log("event", event.nativeEvent.data)
              if (event.nativeEvent.data == "Accepted") {
                approveTermsButtonClick()
              }
            }}
          />

          {isYellowViewVisible &&
            <TouchableOpacity style={[{ position: 'absolute', top: 5, end: 20, height: 20, width: 20, borderRadius: 15, alignSelf: 'flex-end', backgroundColor: Colors.red }]} onPress={() => { setShowWebView(false) }}>
              <Image style={[{ height: '100%', width: "100%", }]} source={require('../assets/images/close.png')} />
            </TouchableOpacity>}
        </View>
      </View>
    )
  }

  return (
    <View style={[styles['full_screen'], styles['bg_grey_light']]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

      <View style={[{backgroundColor:dynamicStyles.primaryColor}, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[{tintColor:dynamicStyles.secondaryColor}, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'],{color:dynamicStyles.secondaryColor},styles['font_size_18_bold']]}>{translate('promotions')}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles['height_100%'], styles['width_100%']]}>

        {/* <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_10'], styles[''], styles['tint_color_black'], { height: 20, width: 25, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles[''], styles['text_color_black'], styles[''], styles['font_size_14_bold'], { marginTop: 5 }]}>{translate('promotions')}</Text>
        </TouchableOpacity> */}

        <View style={[styles['width_95%'], styles['align_self_center'], styles['margin_top_20'], {
           backgroundColor:dynamicStyles.disableColor,
           borderRadius:10,
          //  paddingHorizontal: 5,
        }]}>
          <FlatList
            data={seasonMaster}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => _renderFilterItems(item, index)}
            horizontal={true}
            scrollEnabled={false}
            style={[styles['width_100%']]}>
          </FlatList>
        </View>


        <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true} style={[{ marginBottom: 100 }]}>

          <View style={[styles['flex_1'], styles['height_100%']]}>

            <View style={[styles['width_95%'], styles['align_self_center'], styles['centerItems']]}>
              {promotionsData.length > 0 && (
                <FlatList
                  data={promotionsData}
                  renderItem={({ item, index }) => ListItem(item, index)}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                  style={[styles['align_self_center'], styles['width_100%'], styles['padding_10']]}>
                </FlatList>
              )}
              {promotionsData.length == 0 &&
                <Text style={[{color:dynamicStyles.textColor}, styles['font_size_16_semibold'], styles['margin_top_10'], styles['centerItems'], styles['margin_top_100']]}>{translate('no_data_available')}</Text>
              }
            </View>
          </View>
        </ScrollView>
      </View>
      {showVideoModal && showVideoPlayer()}
      {isModalVisible && showUploadedImage()}
      {showWebView &&
        showWebViewSection()
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

export default Promotions;