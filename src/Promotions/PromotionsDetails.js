import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Platform, StatusBar, Text, Image, AppState,
  Dimensions, TouchableOpacity, FlatList, ScrollView, StyleSheet
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { capitalizeFirstLetter, isNullOrEmpty } from '../assets/Utils/Utils';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import Video from 'react-native-video';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
var styles = BuildStyleOverwrite(Styles);


function PromotionsDetails({ route }) {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const detailResponse = route.params.response;

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

  const [promotionsData, setPromotionsData] = useState([]);
  const [imagesArray, setImagesArray] = useState([]);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [currentIndexImage, setCurrentIndexImage] = useState(0);

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
    console.log("detailResponse is", detailResponse);
    setPromotionsData(detailResponse)
    console.log("data in promotionsData", (detailResponse));
    setImagesArray(detailResponse.fileName)
  }, [promotionsData, imagesArray]);

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
    navigation.navigate('Promotions')
  };

  const handleCancelAlert = () => {
    setShowAlert(false)
  }

  const handleScroll = (event) => {
    console.log('event event', event)
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    console.log("contentOffsetYissssss", contentOffsetX);
    const index = Math.floor(contentOffsetX / Dimensions.get('window').width); // Assuming constant item height
    setCurrentIndex(index + 1);
    console.log("currentIndexcurrentIndexcurrentIndex", currentIndex);
  }

  const handleScrollImage = (event) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const currentIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
    setCurrentIndexImage(currentIndex);
  };

  const renderIndicator = (index) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 10, alignSelf: 'center' }}>
        {imagesArray.map((_, i) => (
          <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === index ? 'green' : 'gray', marginHorizontal: 4 }} />
        ))}
      </View>
    );
  };

  segmentItem = (item, index) => {
    return (
      <View style={[styles['flex_direction_row'], styles['centerItems']]} >
        <Image style={[styles['width_height_7_7'], styles['left_5'], styles['align_self_center']]}
          source={currentIndex == index + 1 ? require('../assets/images/redSelectedSegment.png') : require('../assets/images/redUnselectSegment.png')}>
        </Image>
      </View>
    );
  }

  const listItem = (item, index) => {
    console.log(item, "Bother");
    return (
      <View style={{ width: Dimensions.get('window').width / 1 }}>
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: Dimensions.get('window').width / 1.20, aspectRatio: 18 / 11, }}
          resizeMode="center"
        />
      </View>
    );
  }


  return (
    <View style={[styles['full_screen'], styles['bg_grey_light']]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={Colors.themeRed} barStyle='dark-content' />}

      <View style={[styles['bg_themeRed'], styles[''], { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles[''], styles[''], styles['tint_color_white'], { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles[''], styles['text_color_white'], styles[''], styles['font_size_18_bold']]}>{translate('promotions')}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles['height_100%'], styles['width_100%']]}>

        {/* <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_10'], styles[''], styles['tint_color_black'], { height: 20, width: 25, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles[''], styles['text_color_black'], styles[''], styles['font_size_14_bold'], { marginTop: 5 }]}>{translate('promotions')}</Text>
        </TouchableOpacity> */}


        <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true}>

          <View style={[styles['width_100%'], styles['height_100%']]}>

            <View style={[styles['width_90%'], styles['align_self_center']]}>
              {/* {promotionsData.length > 0 && (
                                        <FlatList
                                          data={promotionsData}
                                          renderItem={({ item, index }) => ListItem(item, index)}
                                          keyExtractor={(item, index) => index.toString()}
                                          style={[styles['align_self_center'],styles['width_100%'],styles['padding_10']]}>
                                        </FlatList>
                            )} */}
              <View style={[styles['bg_white'], styles['margin_top_10'], styles['padding_10'], styles['width_100%'], styles['border_radius_10'], styles['border_color_light_grey'], { borderWidth: 1, elevation: 2, }]}>

                {isNullOrEmpty(promotionsData.name) &&
                  <Text style={[styles['text_color_black'], styles['font_size_16_semibold'], styles['margin_top_10']]}>{capitalizeFirstLetter(promotionsData?.name)}</Text>
                }

                {isNullOrEmpty(promotionsData.fileName) &&
                  //  <Image style={[styles['width_98%'],styles['border_radius_8'],{height:150}]} source={promotionsData.fileName} />
                  <View>
                    <FlatList
                      ref={flatListRef}
                      data={imagesArray}
                      renderItem={({ item, index }) => listItem(item, index)}
                      keyExtractor={(item, index) => index.toString()}
                      horizontal={true}
                      pagingEnabled={true}
                      snapToInterval={Dimensions.get('window').width}
                      decelerationRate={'normal'}
                      onScroll={handleScrollImage}
                    />

                    {imagesArray.length > 1 && renderIndicator(currentIndexImage)}
                  </View>
                }


                {isNullOrEmpty(promotionsData.promotionType) &&
                  <Text style={[styles['text_color_black'], styles['font_size_16_semibold'], styles['margin_top_5']]}>{promotionsData.promotionType}</Text>
                }
                <View style={[styles['bg_lightish_grey'], styles['width_100%'], styles['margin_top_5'], styles['height_0.5'], styles['centerItems']]} ></View>

                {isNullOrEmpty(promotionsData.enDate) &&
                  <View style={[styles['flex_direction_row'], styles['margin_top_10']]}>
                    <Image style={[styles['width_height_15'], styles['margin_right_10']]} source={require('../assets/images/smallCalendar.png')}></Image>
                    <Text style={[styles['text_color_black'], styles['font_size_14_regular']]}>{promotionsData.stDate} to {promotionsData.enDate}</Text>
                  </View>
                }

                {/* {isNullOrEmpty(promotionsData.description) && */}
                <Text style={[styles['margin_top_10'], styles['text_color_black'], styles['font_size_14_regular']]}>{promotionsData.description}</Text>
                {/* } */}

                {/* <Video
                  source={{ uri: promotionsData.videoLink }}
                  // ref={videoRef}
                  // playInBackground={false}
                  // audioOnly={false}
                  resizeMode={'contain'}
                  // fullscreen={true}
                  // playWhenInactive={false}
                  // paused={paused}
                  // onEnd={resetAudio}
                  // onLoad={fixDuration}
                  // onLoadStart={() => setLoading(isLoader)}
                  // onProgress={setTime}
                  // volume={volume}
                  // repeat={repeat}
                  // progressUpdateInterval={1}
                  // fullscreenAutorotate
                  controls={true}
                  style={[styles['margin_top_10'], { height: '50%', width: '95%', alignContent: 'center', marginLeft: 8 }]}
                /> */}

                <View style={[styles['align_self_center'], { flex: 1, width: Dimensions.get('window').width / 1.10 - 20, height: 200, marginTop: 20, paddingVertical: 10 }]}>
                  <Video
                    source={{ uri: promotionsData.videoLink }}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                    controls={true}
                    paused={false}
                  />
                </View>
              </View>
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

      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
    </View>
  )
}

const stylesg = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  vid: {
    height: 300,
    width: 300
  },
});

export default PromotionsDetails;