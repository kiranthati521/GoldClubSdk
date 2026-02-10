import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Text,
  StatusBar,
  View,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  Appearance
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { translate } from '../Localisation/Localisation';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import ReactNativePdf from 'react-native-pdf';
import Sound from 'react-native-sound';
import FileViewer from 'react-native-file-viewer';
import SimpleToast from 'react-native-simple-toast';
import RNFS from 'react-native-fs';


const KnowledgeCenterPDFView = ({ route }) => {
  console.log("props", JSON.stringify(route))
  const isComingFrom = route?.params?.isComingFrom; // gridItem or bottom Nsl button
  const selectedItem = route?.params?.selectedItem;
  const navigation = useNavigation();
  const networkStatus = useSelector(state => state.networkStatus.value);
  const companyStyle = useSelector(getCompanyStyles);
  const dynamicStyles = companyStyle.value;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfPath, setPdfPath] = useState(selectedItem?.handBookPath ? selectedItem?.handBookPath : null)
  let pdfRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isDarkOff, setIsDarkOff] = useState(true)
  let isDarkMode = Appearance.getColorScheme() === 'dark';
  console.log(isDarkMode, "isDarkMode")

  const isUnmounted = useRef(false);


  useEffect(() => {
    return () => {
      isUnmounted.current = true;

      // Stop active rendering
      try { pdfRef.current?.pauseRendering?.(); } catch (e) { }
      try { pdfRef.current?.stopRendering?.(); } catch (e) { }
      try { pdfRef.current?.cancel?.(); } catch (e) { }

      // VERY IMPORTANT — WAIT before touching PDF instance
      setTimeout(() => {
        try { pdfRef.current?.stopRendering?.(); } catch (e) { }
        try { pdfRef.current?.cancel?.(); } catch (e) { }
        // DO NOT CALL destroy()
        // destroy() closes PdfDocument while worker thread is active → CRASH
      }, 150);
    };
  }, []);



  const downloadPDF = async () => {
    try {
      setIsDownloading(isDownloading ? true : false); // ⬅️ Start loading

      if (!networkStatus && pdfPath) {
        SimpleToast.show(translate('openingPdf'), SimpleToast.LONG);
        setTimeout(async () => {
          try { pdfRef.current?.stopRendering?.(); } catch (e) { }
          await FileViewer.open(pdfPath);
          setIsDownloading(false);
        }, 3000);
        return;
      }

      // Permission for Android < 30
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
          setIsDownloading(false); // ⬅️ Stop loading
          return;
        }
      }


      const fileName = pdfPath.split('/').pop();
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
          console.log('abxy', downloadDest)
          await FileViewer.open(downloadDest);
          SimpleToast.show(translate('openingPdf'));
          setIsDownloading(false); // ⬅️ Stop loading
        }, 4000);
        return;
      }

      setIsDownloading(true); // ⬅️ Start loading

      const options = {
        fromUrl: pdfPath,
        toFile: downloadDest,
      };

      const result = await RNFS.downloadFile(options).promise;
      SimpleToast.show(`${translate('fileDownloaded')}`, SimpleToast.LONG);
      setTimeout(async () => {
        await FileViewer.open(downloadDest);
        SimpleToast.show(translate('openingPdf'));
        setIsDownloading(false); // ⬅️ Stop loading
      }, 4000);

    } catch (err) {
      console.error('Download failed:', err);
      SimpleToast.show(translate('downloadFailed'));
      setIsDownloading(false); // ⬅️ Stop loading on error
    }
  };

  const goToPage = (offset) => {
    if (!pdfRef.current) return;
    if (totalPages <= 0) return;          // ❗ PDF not ready yet

    let newPage = currentPage + offset;

    // Block page change while rendering
    if (isDarkOff) return;                // ❗ Wait for PDF loader to finish

    if (newPage >= 1 && newPage <= totalPages) {
      requestAnimationFrame(() => {       // ❗ avoids calling during active render
        try {
          pdfRef.current.setPage(newPage);
          setCurrentPage(newPage);
        } catch (e) {
          console.log("setPage crashed:", e);
        }
      });
    }
  };


  let isSoundPlaying = false;
  const playSound = (type) => {
    if (isSoundPlaying) {
      console.log('Sound is still playing, please wait...');
      return;
    }
    const soundFile = type === 'success' ? 'paper_turning.mp3' : 'tear_paper.mp3';
    const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      isSoundPlaying = true;
      sound.play((success) => {
        if (!success) {
          console.log('Failed to play sound');
        }
        sound.release();
        isSoundPlaying = false;
      });
    });
  };
  const playSoundIOS = (type) => {
    if (isSoundPlaying) {
      console.log('Sound is still playing, skipping...');
      return;
    }

    isSoundPlaying = true;

    const soundFile = type === 'success' ? 'paper_turning.mp3' : 'tear_paper.mp3';
    const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        isSoundPlaying = false;
        return;
      }

      const duration = sound.getDuration();

      console.log(`Playing sound: ${soundFile}, duration: ${duration}s`);

      let hasCallbackFired = false;

      sound.play((success) => {
        hasCallbackFired = true;
        if (!success) {
          console.log('Failed to play sound');
        }
        sound.release();
        isSoundPlaying = false;
      });

      setTimeout(() => {
        if (!hasCallbackFired) {
          console.log("Play callback didn't fire — manually releasing lock.");
          sound.release();
          isSoundPlaying = false;
        }
      }, (duration * 1000) + 100);
    });
  };


  let pageChangeTimeout = null;
  const handlePageChangedIOS = (currentPage, numberOfPages) => {
    if (pageChangeTimeout) clearTimeout(pageChangeTimeout);

    pageChangeTimeout = setTimeout(() => {
      setCurrentPage(currentPage);
      const pageDiff = Math.abs(currentPage - lastPage);
      if (currentPage == lastPage) {
        return
      }
      if (pageDiff > 1) {
        playSoundIOS('scroll_jump');
      } else {
        playSoundIOS('success');
      }

      setLastPage(currentPage);
    }, 200);
  };

  const handlePageChanged = (currentPage, numberOfPages) => {
    setCurrentPage(currentPage);
    const pageDiff = Math.abs(currentPage - lastPage);
    // playSound('success');
    if (currentPage == lastPage) {
      return
    }
    if (pageDiff > 1) {
      playSound('scroll_jump');
    } else {
      playSound('success');
      setLastPage(currentPage);
    };
  }

  const safeRender = (fn) => {
    if (isUnmounted.current) return;
    fn();
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {Platform.OS === 'android' && (
        <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle="dark-content" />
      )}
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: dynamicStyles?.primaryColor || '#fff' }}
      />


      <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>

        {/* Header */}
        <View style={{
          backgroundColor: dynamicStyles.primaryColor,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomStartRadius: 10,
          borderBottomEndRadius: 10,
          paddingTop: 20
        }}>
          <TouchableOpacity style={{ flexDirection: 'row', width: "100%" }} onPress={() => navigation.goBack()}>
            <Image
              style={{ tintColor: dynamicStyles.secondaryColor, height: 15, width: 20, top: 5 }}
              source={require('../assets/images/previous.png')}
            />
            <Text style={{
              color: dynamicStyles.secondaryColor, marginLeft: 10, fontSize: 18, fontWeight: 'bold',
              flexShrink: 1,
              flexWrap: 'wrap',
              lineHeight: Platform.OS == 'android' ? 30 : 25,
              minWidth: 200
            }}>
              {isComingFrom ? translate('KnowledgeCenter') : translate('nsl_broucher')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={isComingFrom ? { height: '80%', width: "80%", alignSelf: "center", margin: 10 } :
          { height: '90%', width: "100%", alignSelf: "center", margin: 10 }}>
          <ReactNativePdf
            trustAllCerts={false}
            ref={(ref) => { pdfRef.current = ref; }}
            source={{
              uri: isComingFrom ? selectedItem?.handBookPath : selectedItem?.brouchurPath,
              cache: true,           // 🔥 Force MIUI to stream PDF → Progress will work

            }}
            // source={{ uri: isComingFrom ? selectedItem?.handBookPath : selectedItem?.brouchurPath, cache: true, }}
            horizontal={isComingFrom ? true : false}
            fitPolicy={0}
            scale={1.0}
            minScale={1.0}
            maxScale={3.0}
            spacing={0}
            enablePaging={true}
            enableAntialiasing={true}
            onLoadProgress={(percent) =>
              
              safeRender(() => {
                const value = (percent * 100).toFixed(2);
                setProgress(value);
                if (percent >= 0.99) setIsDarkOff(false);
              })
            }
            onLoadComplete={(numberOfPages, filePath) => {
              safeRender(() => {
                console.log(`PDF loaded successfully with ${numberOfPages} pages.`);
                setTotalPages(numberOfPages);
                setIsDarkOff(false);
              })
            }}
            onPageChanged={(page, numberOfPages) => {
              safeRender(() => {
                Platform.OS === 'ios' ? handlePageChangedIOS(page, numberOfPages) : handlePageChanged(page, numberOfPages)
              })
            }}
            onPageSingleTap={() => { }}
            onError={(error) => {
              safeRender(() => {
                console.error('Error loading PDF:', error);
              })

            }}
            style={{ borderRadius: 10, flexGrow: 1 }}
          />
          {isComingFrom &&
            <View style={{
              position: 'absolute',
              bottom: '50%',
              left: -60,
              right: -60,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 30,
            }}>
              {currentPage > 1 ? (
                <TouchableOpacity onPress={() => goToPage(-1)}
                  style={{
                    width: 25, height: 25, alignSelf: 'flex-end', borderRadius: 12.5, alignItems: 'center',
                    justifyContent: 'center', backgroundColor: dynamicStyles.primaryColor, top: -10,
                  }}>
                  <Image style={[{ width: 12.5, height: 12.5, tintColor: dynamicStyles.secondaryColor, resizeMode: 'contain', }, { transform: [{ rotate: '180deg' }] }]} source={require('../assets/images/rightArrow.png')}></Image>
                </TouchableOpacity>
              ) : (
                <View onPress={() => goToPage(-1)} style={[{
                  width: 20, height: 20, alignSelf: 'flex-end', borderRadius: 12.5,
                  alignItems: 'center', justifyContent: 'center', top: -10
                }]}>

                </View>
              )}
              {currentPage < totalPages && (
                <TouchableOpacity onPress={() => goToPage(1)} style={[{
                  width: 25, height: 25, alignSelf: 'flex-end', borderRadius: 12.5, alignItems: 'center',
                  justifyContent: 'center', backgroundColor: dynamicStyles.primaryColor, top: -10
                }]}>
                  <Image style={[{ width: 12.5, height: 12.5, tintColor: dynamicStyles.secondaryColor, resizeMode: 'contain' }]} source={require('../assets/images/rightArrow.png')}></Image>
                </TouchableOpacity>
              )}
            </View>}
        </View>



        {isComingFrom &&
          <TouchableOpacity
            onPress={() => { downloadPDF() }}
            style={{
              height: 50,
              width: '95%',
              backgroundColor: dynamicStyles.primaryColor,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: 15,
              alignSelf: "center"
            }}
          >
            <Text style={{ color: dynamicStyles.secondaryColor, fontSize: 14, fontWeight: 'bold' }}>
              {translate("Download")}
            </Text>
          </TouchableOpacity>}


        {isDarkMode && isDarkOff && Platform.OS === 'android' &&
        (
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

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#fff' }} />
    </View>

  );
};

export default KnowledgeCenterPDFView;
