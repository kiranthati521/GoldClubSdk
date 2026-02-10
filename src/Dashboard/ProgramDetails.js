import { Platform, Text, StatusBar, View, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator, Linking, Modal, ImageBackground, PermissionsAndroid, Alert, Appearance } from 'react-native';
import RNFS from 'react-native-fs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomLoader from '../Components/CustomLoader';
import FileViewer from 'react-native-file-viewer';
import SimpleToast from 'react-native-simple-toast';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomButton from '../Components/CustomButton'
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import Video from 'react-native-video';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Orientation from 'react-native-orientation-locker';
import ReactNativePdf from 'react-native-pdf';
import RNFetchBlob from 'react-native-blob-util';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../Components/CustomAlert';
import { downloadFileToLocal } from '../assets/Utils/Utils';
import { createStyles } from '../assets/style/createStyles';
import { getRealm } from '../../App';
var realm;

export const traverseAndReplaceUrlsGlobal = async (data) => {
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

export const getMasterForProgramDetails = async () => {
  let realm = new Realm({ path: 'User.realm' });
  var networkStatus = await getNetworkStatus()
  if (networkStatus) {
    try {
      var getYeildCalcURL = configs.BASE_URL + configs.MASTERS.PROGRAMDETAILSBROCHURE;
      var getHeaders = await GetApiHeaders()
      var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
      if (APIResponse != undefined && APIResponse != null) {
        if (APIResponse.statusCode == HTTP_OK) {
          var masterResp = APIResponse.response
          if (masterResp != undefined && masterResp != null) {
            let data = await traverseAndReplaceUrlsGlobal(masterResp)
            try {
              const res = JSON.stringify(data);
              realm.write(() => {
                realm.delete(realm.objects('programDetailsOff'));
                realm.create('programDetailsOff', {
                  programDetailsInfo: res
                });
              });

              console.log("program details Data inserted successfully into Realm");
            } catch (error) {
              console.error("Error inserting data into Realm: carousel", error);
            }
          }
        }
        else { }

      } else { }
    }
    catch (error) { }
  } else { }
}

var styles = BuildStyleOverwrite(Styles);
const ProgramDetails = ({ route }) => {
  const networkStatus = useSelector(state => state.networkStatus.value)
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const navigation = useNavigation()
  const [loadingP, setLoadingP] = useState(false)
  const [pdfPath, setPdfPath] = useState(null);
  const [pdfLink, setPdfLink] = useState(null);
  const companyStyle = useSelector(getCompanyStyles);
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [loading, setLoading] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false);
  let [renderVideo, setRenderVideo] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [imageLink, setImageLink] = useState('') //thumbnailLink
  const [thumbnailLink, setThumbnailLink] = useState('') //thumbnailLink
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  let [pdfLoader, setPdfLoader] = useState(networkStatus ? true : false)
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isDarkOff, setIsDarkOff] = useState(true)
  const isDarkMode = Appearance.getColorScheme() === 'dark';
  console.log(isDarkMode, "isDarkMode")
  useEffect(() => {
    if (!networkStatus) {
      checkRealmData()
    }
  }, [])

  let checkRealmData = async () => {
    realm = new Realm({ path: 'User.realm' });
    const programDetailsData = realm.objects('programDetailsOff');
    if (programDetailsData.length !== 0) {
      let dataFromOff = JSON.parse(programDetailsData[0].programDetailsInfo)
      setImageLink(dataFromOff?.imagePath)
      setPdfPath(dataFromOff?.pdfLink);
      setThumbnailLink(dataFromOff?.thumbNailImage)
      setVideoLink(dataFromOff?.videoLink)
      console.log(dataFromOff?.pdfLink, 'dataFromOff?.pdfLink')
    }
    else {
      setPdfLoader(false)
      showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      if (networkStatus) {
        clearPreviousRealm();
        getBrochureDetails();
      }
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [networkStatus])
  );

  const fetchPDF = async (link) => {
    try {
      const res = await RNFetchBlob.config({ fileCache: true })
        .fetch('GET', link);
      console.log('PDF downloaded to:', res.path());
      const fileExists = await RNFetchBlob.fs.exists(res.path());
      if (fileExists) {
        setPdfPath(res.path());
      } else {
        console.error('File not found after download');
      }
    } catch (error) {
      console.error('Error fetching the PDF:', error);
    }
  };


  const handleCancelAlert = () => {
    setShowAlert(false)
  }

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
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToPortrait();
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
                source={{ uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
                style={{ flex: 1, height: '100%', width: '100%' }}
                resizeMode="cover"
                controls={true}
                endWithThumbnail
                thumbnail={{
                  uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
                }}
                paused={!showVideoModal}
                onLoadStart={handleLoadStart}
                showDuration={true}
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

  const setVideoData = () => {
    // console.log(link);
    setShowVideoModal(true)
    console.log(showVideoModal, "?????????????")
    setOrientation("LANDSCAPE")
    // setVideoLink(link)
  }

  let clearPreviousRealm = async () => {
    try {
      realm.write(async () => {
        await realm.delete(realm.objects('programDetailsOff'));
        await realm.refresh();
      });
      console.log('All data cleared from Realm in Program details');
    } catch (error) {
      console.error('Error clearing data from Realm in program details:', error);
    }
  }


  const insertDataIntoRealm = async (response) => {
    if (!response) return;

    try {
      const realm = getRealm(); // ✅ safely get initialized instance
      const res = JSON.stringify(response);

      realm.write(() => {
        realm.delete(realm.objects("programDetailsOff"));
        realm.create("programDetailsOff", { programDetailsInfo: res });
      });

      console.log("✅ Data inserted successfully into Realm");
    } catch (error) {
      console.error("❌ Error inserting data into Realm:", error);
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


  let getBrochureDetails = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var getYeildCalcURL = configs.BASE_URL + configs.MASTERS.PROGRAMDETAILSBROCHURE;
        var getHeaders = await GetApiHeaders()
        var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse.response
            if (masterResp != undefined && masterResp != null) {
              let data = await traverseAndReplaceUrls(masterResp)
              setImageLink(masterResp?.imagePath)
              console.log(masterResp?.pdfLink, 'masterResp?.pdfLink')
              setPdfLink(masterResp?.pdfLink);
              if (masterResp?.pdfLink) {
                fetchPDF(masterResp?.pdfLink)
              }
              setThumbnailLink(masterResp?.thumbNailImage)
              setVideoLink(masterResp?.videoLink)
              insertDataIntoRealm(data)
            }
          }
          else {
            Alert.alert(APIResponse?.message)
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
        SimpleToast.show(error.message)
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
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

  const isYouTubeLink = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
  };

  let goBack = () => {
    if (renderVideo) {
      setRenderVideo(!renderVideo)
    } else { navigation.goBack() }
  }

  const downloadPDF = async () => {
    try {
      setIsDownloading(isDownloading ? true : false);
      if (!networkStatus && pdfPath) {
        SimpleToast.show(translate('no_internet_conneccted'))
        console.log("pdfPath", await RNFS.stat(pdfPath));
        try {
          await FileViewer.open(pdfPath);
        } catch (e) {
          SimpleToast.show("No app found to open PDF.\nPlease install Adobe or Google PDF Viewer.");
        }
        return;
      }

      if (Platform.OS === 'android' && Platform.Version < 30) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: translate('storagePermissionTitle'),
            message: translate('storagePermissionMessage'),
            buttonNeutral: translate('storagePermissionNeutral'),
            buttonNegative: translate('storagePermissionNegative'),
            buttonPositive: translate('storagePermissionPositive'),
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          SimpleToast.show(translate('permissionDenied'));
          setIsDownloading(false);
          return;
        }
      }

      const downloadUrl = pdfLink;
      const fileName = pdfLink.split('/').pop();
      const isAndroid10OrBelow = Platform.OS === 'android' && Platform.Version < 30;
      let downloadDest;
      if (Platform.OS === 'ios') {
        downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      } else {
        downloadDest = isAndroid10OrBelow ? `${RNFS.DocumentDirectoryPath}/${fileName}` : `${RNFS.DownloadDirectoryPath}/${fileName}`;
      }

      const fileExists = await RNFS.exists(downloadDest);
      if (fileExists) {
        SimpleToast.show(translate('fileAlreadyDownloaded'), SimpleToast.LONG);
        setTimeout(async () => {
          console.log("downloadDest", await RNFS.stat(downloadDest));
          try {
            await FileViewer.open(downloadDest);
          } catch (e) {
            SimpleToast.show("No app found to open PDF.\nPlease install Adobe or Google PDF Viewer.");
          }
          SimpleToast.show(translate('openingPdf'));
          setIsDownloading(false);
        }, 4000);
        return;
      }
      setIsDownloading(true);
      const options = {
        fromUrl: downloadUrl,
        toFile: downloadDest,
      };

      const result = await RNFS.downloadFile(options).promise;
      SimpleToast.show(translate('fileDownloaded'), SimpleToast.SHORT);
      setTimeout(async () => {
        console.log("downloadDest", await RNFS.stat(downloadDest));
        try {
          await FileViewer.open(downloadDest);
        } catch (e) {
          SimpleToast.show("No app found to open PDF.\nPlease install Adobe or Google PDF Viewer.");
        }
        SimpleToast.show(translate('openingPdf'));
        setIsDownloading(false);
      }, 4000);
    } catch (err) {
      console.error('Download failed:', err);
      SimpleToast.show(translate('downloadFailed'));
      setIsDownloading(false);
    }
  };




  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      <View style={[styles['flex_1'], { backgroundColor: 'rgba(249, 249, 249, 1)' }]}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
        <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { width: "100%", paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: 20 }]}>
          <TouchableOpacity style={[{ flexDirection: "row", alignItems: "center", maxWidth: "55%" }]} onPress={() => navigation.goBack()}>
            <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, marginRight: 10 }]} source={require('../assets/images/previous.png')}></Image>
            <Text style={[{ color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('ProgramDetails')}</Text>
          </TouchableOpacity>
        </View>
        {renderVideo ?
          videoLink ? <>
            <View style={{ height: "30%", width: "90%", alignSelf: "center", borderRadius: 20, overflow: "hidden", marginTop: 20, position: "relative", zIndex: 0 }}>
              <Image source={{ uri: thumbnailLink }} resizeMode='contain' style={{ height: '100%', width: "100%" }} />
              <TouchableOpacity
                style={[styles['flex_direction_row'], { position: "absolute", zIndex: 1, top: '40%', left: '45%', alignItems: "center", justifyContent: "center", }]}
                onPress={() => {
                  if (networkStatus) {
                    isYouTubeLink(videoLink) ? Linking.openURL(videoLink).catch(err => console.error("Couldn't load page", err)) : setVideoData()
                  } else {
                    SimpleToast.show(translate('no_internet_conneccted'))
                  }
                }}>
                <Image style={[styles['width_height_50'],
                  //  !isYouTubeLink(videoLink) && { tintColor: dynamicStyles.primaryColor }
                  //  ]} source={isYouTubeLink(videoLink) ? require('../assets/images/iconPlay.png') : require('../assets/images/ic_video.png')}></Image>
                ]} resizeMode='contain' source={require('../assets/images/iconPlay.png')}></Image>
              </TouchableOpacity>
            </View>
            {showVideoModal && showVideoPlayer()}
          </> : (<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={[{ color: "rgba(0, 0, 0, 0.5)", }, styles['font_size_30_semibold']]}>{translate("Comingsoon")}</Text>
          </View>)
          :
          <View style={{ backgroundColor: 'rgba(255, 255, 255, 1)', height: '90%', elevation: 10, borderRadius: 10, width: responsiveWidth(95), alignSelf: 'center', marginTop: responsiveHeight(1) }}>
            <View style={{ height: '90%', width: responsiveWidth(95), alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
              {(networkStatus ? pdfLink : pdfPath) ? (
                <View style={{ height: '100%', width: "100%" }}>
                  <TouchableOpacity onPress={downloadPDF} style={{ height: 60, width: 60, backgroundColor: dynamicStyles?.highLightedColor?.replace(/(\d(\.\d+)?)(\))$/, '0.8)') || dynamicStyles.primaryColor, borderRadius: 60, position: "absolute", zIndex: 100, right: 10, bottom: 10, alignItems: "center", justifyContent: "center" }}>
                    <Image tintColor={dynamicStyles.secondaryColor} source={require('../assets/images/pdfDownload.png')} style={{ height: 30, width: 30, resizeMode: "contain" }} />
                  </TouchableOpacity>


                  <ReactNativePdf
                    ref={pdfRef}
                    source={
                      networkStatus
                        ? { uri: pdfLink, cache: true }
                        : { uri: `file://${pdfPath}` }
                    }
                    trustAllCerts={false}
                    scale={1.0}
                    minScale={1.0}
                    maxScale={3.0}
                    fitPolicy={2}
                    spacing={4}
                    enablePaging={false}
                    style={{ flex: 1, width: '100%', height: '100%' }}
                    onLoadProgress={(percent) => {
                      const value = (percent * 100).toFixed(2);   // two decimal places
                      setProgress(value);
                      if (percent >= 99) {
                        setIsDarkOff(false);    // stop showing percentage
                      }
                    }}
                    onLoadComplete={(pages) => {
                      console.log(`PDF Loaded: ${pages} pages`);
                      setPdfLoader(false);
                      setIsDarkOff(false);
                    }}
                    onError={(error) => {
                      setPdfLoader(false);
                      console.log('Failed to load PDF:', error);
                      SimpleToast.show(translate('downloadFailed'));
                    }}
                  />



                </View>
              ) : (
                <View style={{ height: '100%', width: "100%", alignItems: "center", justifyContent: "center" }}>
                  {/* <ActivityIndicator size="large" color={dynamicStyles.primaryColor} /> */}
                  <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                  {/* {!loading && networkStatus && <CustomLoader loading={true} message={translate('loadingPdf')} loaderImage={loaderImage} />} */}
                </View>
              )}
            </View>
            {videoLink && <View style={{ marginTop: 'auto', bottom: responsiveHeight(1) }}>
              <CustomButton
                onPress={() => {
                  if (networkStatus) {
                    isYouTubeLink(videoLink) ? Linking.openURL(videoLink).catch(err => console.error("Couldn't load page", err)) : setRenderVideo(true)
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
        }

        {
          showAlert &&
          <CustomAlert
            onPressClose={() => { handleCancelAlert() }}
            title={alertTitle}
            showHeader={showAlertHeader}
            showHeaderText={showAlertHeaderText}
            message={alertMessage}
            onPressOkButton={() => { handleCancelAlert() }}
            onPressNoButton={() => { handleCancelAlert() }}
            showYesButton={showAlertYesButton}
            showNoButton={showAlertNoButton}
            yesButtonText={showAlertyesButtonText}
            noButtonText={showAlertNoButtonText} />

        }

        {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
        {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
        {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
        {isDownloading && (SimpleToast.show(translate('file_downloading')))}

        {isDarkMode && isDarkOff && (
          <View style={{
            position: 'absolute',
            top: '45%',
            alignSelf: 'center',

          }}>
            <Text style={{
              color: 'grey', // works in dark mode
              fontSize: 14,
              fontWeight: "600"
            }}>
              {progress} %
            </Text>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

export default ProgramDetails;
