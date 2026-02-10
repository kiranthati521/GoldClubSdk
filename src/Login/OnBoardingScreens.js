import { Dimensions, FlatList, Image, ImageBackground, Platform, StatusBar, Text, TouchableOpacity, View,StyleSheet } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { GetApiHeaders, GetRequest } from '../NetworkUtils/NetworkUtils';
import SimpleToast from 'react-native-simple-toast';
import { strings } from '../strings/strings';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomAlert from '../Components/CustomAlert';
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { GETSTARTED, storeData } from '../assets/Utils/Utils';
import messaging from '@react-native-firebase/messaging';
import { useSelector } from 'react-redux';
import { translate } from '../Localisation/Localisation';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);


function OnBoardingScreens() {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const networkStatus = useSelector(state => state.networkStatus.value)
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))

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
  const flatListRef = useRef(null);
  const [onboardingData, setOnboardingData] = useState([])
  const [currentIndexImage, setCurrentIndexImage] = useState(0);
  const [showGetStarted, setShowGetStarted] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      handleFocus();
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [])
  );


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
    getFCMtoken()
    if (networkStatus) {
      getOnboardingdata()
    }
  };

  const getFCMtoken = async () => {
    console.log("SAINATH")
    const fcmToken = await messaging().getToken();
    console.log("SAINATH", fcmToken)
  }

  useEffect(() => {
    autoScrollPages()
  }, [currentIndexImage, onboardingData])

  const getOnboardingdata = async () => {
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var getloginURL = configs.BASE_URL + configs.MASTERS.FLASH_MASTERS;
        var getHeaders = await GetApiHeaders();

        var APIResponse = await GetRequest(getloginURL, getHeaders);
        setTimeout(() => {
          setLoadingMessage()
          setLoading(false)
        }, 500);

        if (APIResponse.statusCode == HTTP_OK) {
          var masterResp = APIResponse.response
          console.log('the flash resp is', masterResp)

          if (masterResp?.flashscreenList != undefined && masterResp?.flashscreenList.length > 0) {
            setOnboardingData(masterResp.flashscreenList)
          } else {
            storeData(GETSTARTED, true);
            navigation.navigate('LoginNew')
          }
          console.log('the 001 is', onboardingData)
        }
        else {
          showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
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

  const autoScrollPages = (async) => {
    if (onboardingData.length > currentIndexImage) {
      setTimeout(() => {
        if (currentIndexImage + 1 < onboardingData.length) {
          const nextIndex = currentIndexImage + 1;
          setCurrentIndexImage(nextIndex);
        }
      }, 2500);
      setShowGetStarted(false)
      scrollToIndex(currentIndexImage);
    }

    if (onboardingData.length == currentIndexImage + 1) {
      setShowGetStarted(true)
      setTimeout(() => {
        // scrollToIndex(0);
        // setCurrentIndexImage(0);
      }, 2500);
    }
  };

  const scrollToIndex = (index) => {
    flatListRef.current.scrollToIndex({ animated: true, index });
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

  const handleOkAlert = () => {
    if (showAlertyesButtonText == translate('continue')) {
      setShowAlert(false)
    }
    if (showAlertyesButtonText == translate('proceed')) {
      sendOTPApiCall(userAcceptanceKey = "1")
    }
    setShowAlert(false)
  }

  const skipButtonPress = () => {
    storeData(GETSTARTED, true);
    navigation.navigate('LoginNew')
  }

  const nextButtonPress = () => {
    if (flatListRef.current) {
      if (onboardingData.length - 1 == currentIndexImage) {

      }
      else {
        setCurrentIndexImage(currentIndexImage + 1);
        const nextIndex = currentIndexImage;
        flatListRef.current.scrollToIndex({ index: nextIndex });
      }

    }
  }

  const onScrollEnd = (e) => {
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;

    let pageNum = Math.floor(contentOffset.x / viewSize.width);
    if (pageNum == onboardingData.length - 1) {
      setShowGetStarted(true)
    } else {
      setShowGetStarted(false)
    }
    setCurrentIndexImage(pageNum < 0 ? 0 : pageNum)
  }

  const getStartButtonPress = () => {
    storeData(GETSTARTED, true);
    navigation.navigate('LoginNew')
  }

  function renderOnboardingItem(item, index) {
    return (
      <View style={[{ height: Dimensions.get('window').height, width: Dimensions.get('window').width }]}>
        <View style={[{ width: Dimensions.get('window').width / 1.5, height: Dimensions.get('window').height / 3.5, alignSelf: 'center', marginTop: Dimensions.get('window').height / 5, }]}>
          <Image source={{ uri: item.imageUrl }} style={[{ height: '100%', width: '100%' }]} />
        </View>
        <View style={[{ width: Dimensions.get('window').width / 1.5, height: Dimensions.get('window').height / 3.5, alignSelf: 'center', marginTop: 30, }]}>
          <Text style={[styles['margin_top_20'], styles['text_align_center'], styles['align_self_center'], styles['font_size_24_semibold'], styles['text_color_purple'], styles['width_90%'], styles['align_self_center']]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles['margin_top_20'], styles['text_align_center'], styles['font_size_14_regular'], styles['text_color_black'], styles['width_90%'], styles['align_self_center']]} numberOfLines={4}>
            {item.description}
          </Text>
        </View>
      </View>
    )
  }

  const renderIndicator = (index) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 10, alignSelf: 'center' }}>
        {onboardingData.map((_, i) => (
          <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i === index ? Colors.purple : "#FF383E", marginHorizontal: 4, opacity: i === index ? 1 : 0.3 }} />
        ))}
      </View>
    );
  };

  const renderLineIndicator = (index) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 10, alignSelf: 'center' }}>
        {onboardingData.map((_, i) => (
          <View key={i} style={{ width: 3.5, height: i == index ? 45 : 20, borderRadius: 5, backgroundColor: i === index ? 'black' : Colors.very_light_grey, marginHorizontal: 5, alignSelf: 'center' }} />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles['full_screen']]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={'white'} barStyle='dark-content' />}
      <View style={[styles[''], { height: Dimensions.get('window').height, width: Dimensions.get('window').width }]}>
        <ImageBackground /* source={require('../assets/images/bg_view_plain.png')} */ resizeMode='stretch' style={[{ height: Dimensions.get('window').height, width: Dimensions.get('window').width,backgroundColor:"white" }]}>
        <Image source={require('../assets/images/newAppIcon.png')} style={[styleSheetStyles.appIcon, {top:Platform.OS == 'ios' ? 30 : 0}]} />
        {/* <Image source={require('../assets/images/rightCornerStars.png')} style={[styleSheetStyles.stars]} /> */}
          <View style={[{ position: 'relative', width: '100%', height: '100%' }]}>

            {(onboardingData != undefined && onboardingData.length > 0) ? <FlatList
              ref={flatListRef}
              data={onboardingData}
              renderItem={({ item, index }) => renderOnboardingItem(item, index)}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={true}
              style={[styles['width_100%']]}
              pagingEnabled={true}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              snapToInterval={Dimensions.get('window').width}
              decelerationRate={'normal'}
              scrollEventThrottle={16}
              onMomentumScrollEnd={onScrollEnd}
            /> : <View style={[{ position: 'absolute', alignSelf: 'center', justifyContent: 'center', height: '100%' }]}>
              <Text style={[styleSheetStyles.addFontFam,styles['font_size_14_semibold'], styles['text_color_black']]}>{translate('no_data_available')}</Text>
            </View>}

            <View style={[{ position: 'absolute', alignSelf: 'center', marginTop: Dimensions.get('window').height / 2 }]}>
              {renderIndicator(currentIndexImage)}
            </View>

            {(!showGetStarted) && onboardingData != undefined && onboardingData.length > 0 &&
              <View style={[{ height: 45, width: '95%', marginBottom: 35, flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', alignSelf: 'center', position: 'absolute', bottom: responsiveHeight(2.5) }]}>
                <TouchableOpacity onPress={skipButtonPress}>
                  <Text style={[
                  [styles['text_align_center'],
                  styles['margin_10'],
                  styles['font_size_14_semibold'],
                  { color: Colors.purple }
                  ]]} numberOfLines={2}>{translate('skip')}</Text>
                </TouchableOpacity>
                {!showGetStarted && renderLineIndicator(currentIndexImage)}
                <CustomButton title={">"} onPress={nextButtonPress} buttonBg={Colors.buttonColorPurple} titleTextColor={Colors.white} btnWidth={50} isBoldText={true} />
              </View>}
            {(showGetStarted) &&
              <View>
                <TouchableOpacity style={[{ width: '90%', backgroundColor: Colors.buttonColorPurple, height: 45, borderRadius: 10, marginBottom: 35, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: responsiveHeight(2.5) }]} onPress={() => getStartButtonPress()}>
                  <Text style={[styleSheetStyles.addFontFam,styles['font_size_16_semibold'], styles['text_color_white'], styles['text_align_center'], { width: "100%" }]}>{translate('getStarted')}</Text>
                  <Text style={[styleSheetStyles.addFontFam,styles['font_size_16_semibold'], styles['text_color_white'], { width: "90%", position: 'absolute', textAlign: 'right', marginRight: 45, }]}>{strings.rightArrw}</Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        </ImageBackground>
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

      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
    </View>
  )

}
let styleSheetStyles = StyleSheet.create({
  appIcon:{height:75,width:75,resizeMode:"contain",position:'absolute',right:15,top:0,zIndex:1},
  stars:{height:150,width:150,position:'absolute',right:20,top:0,zIndex:2}
 })

export default OnBoardingScreens;