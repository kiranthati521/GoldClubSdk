import { Platform, Text, StatusBar, View, FlatList, StyleSheet, Image, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import ImagePicker from 'react-native-image-crop-picker';
import { GetApiHeaders, GetRequest, getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { useNavigation } from '@react-navigation/native';
import CustomLoader from '../Components/CustomLoader';
import SimpleToast from 'react-native-simple-toast';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomButton from '../Components/CustomButton'
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomGalleryPopup from '../Components/CustomGalleryPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);
const CropDiagonstic = ({ route }) => {

  const { latitude, longitude } = useSelector((state) => state.location);
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const navigation = useNavigation()
  const companyStyle = useSelector(getCompanyStyles);
  const [loading, setLoading] = useState(false)
  const [cropLoading, setCropLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState(translate('Crop_Diagnostic'));
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [ImageData, setImageData] = useState(null);
  const [cameraRelatedPopUp, setCameraRelatedPopUp] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [fromGallery, setFromGallery] = useState(false);
  const [diseases, setDiseases] = useState([]);



  useEffect(() => {
    if (selectedFilter === translate('history')) {
      getHistory();
    }
  }, [selectedFilter]);

  const getHistory = async () => {
    const networkStatus = await getNetworkStatus();
    if (networkStatus) {
      try {
        setTimeout(() => {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))
        }, 50);
        var getHistoryUrl = configs.BASE_URL + configs.CROPDETECTION.CROPDIAGNOSTICHISTORY;
        var getHeaders = await GetApiHeaders();
        console.log('headersInCropDiagnosis', getHeaders);
        var APIResponse = await GetRequest(getHistoryUrl, getHeaders);

        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
            }, 1000);
            console.log('what is reponse In history', APIResponse)
            setDiseases(APIResponse.response);

          }
          else {
            SimpleToast.show(APIResponse.message)
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 1000);
        }
      } catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const cropDiagDATA = [
    {
      name: translate('Go_to_Farm'),
      id: 1,
      image: require('../assets/images/cropOne.png'),
      textColor: "rgba(52, 136, 250, 1)"
    },
    {
      name: translate('Click_Photo'),
      id: 2,
      image: require('../assets/images/cropTwo.png'),
      textColor: "rgba(8, 128, 180, 1)"
    },
    {
      name: translate('Find_Disease'),
      id: 3,
      image: require('../assets/images/cropThree.png'),
      textColor: "rgba(70, 140, 0, 1)"
    },
  ];

  const CarouselDATA = [
    {
      name: translate('titleOne'),
      desc: translate('Desc_one'),
      id: 1,
    },
    {
      name: translate('titleTwo'),
      desc: translate('Desc_two'),
      id: 2,
    },
  ];

  const openCameraProfilePic = async () => {
    try {
      var image = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo'
      })
      var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
      setImageData(response)
      setFromGallery(false)
      // if (!cameraRelatedPopUp) {
      setCameraRelatedPopUp(true)
      // }
    } catch (err) {
      console.error(err)
    }
    setShowSelectionModal(false)
  }

  const submitCrop = async () => {
    const networkStatus = await getNetworkStatus()
    console.log('networkStatus', networkStatus)
    if (networkStatus) {
      try {
        setLoading(true)
        setCropLoading(true)
        setLoadingMessage(translate('Detecting_Problem'))

        var getloginURL = configs.BASE_URL + configs.CROPDETECTION.CROPDISEASEIDENTIFICATION;
        var getHeaders = await GetApiHeaders();
        console.log('headersIncropdiseases', getHeaders);

        const jsonData = {
          "latitude": latitude.toString(),
          "longitude": longitude.toString(),
          // "latitude": latitude,
          // "longitude": longitude,
          // "language": languageName
        };

        const formData = new FormData();
        // formData.append('jsonData', JSON.stringify(jsonData));

        const fileExtension = ImageData.name.split('.').pop().toLowerCase();

        // Map extension to MIME type
        const mimeTypeMap = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
          gif: 'image/gif',
          bmp: 'image/bmp',
        };

        const mimeType = mimeTypeMap[fileExtension] || 'image/jpeg'; // fallback to jpeg if unknown


        console.log("📸 multipartFileBeforeAppend:", {
          uri: ImageData.uri,
          type: mimeType,
          name: ImageData.name
        });

        if (ImageData != undefined && ImageData != "" && ImageData != "") {
          console.log('ImageDataInformdata', ImageData)
          formData.append('file',
            {
              uri: ImageData.uri,
              type: mimeType,
              name: ImageData.name
            });
        } else {
          formData.append('file', "");
        }

        formData.append('jsonData', JSON.stringify(jsonData));

        console.log("FormData:", JSON.stringify(formData));

        const APIResponse = await uploadFormData(formData, getloginURL, getHeaders);
        console.log('APIResponse APIResponseis:', APIResponse)
        // console.log('Full advisory array:', APIResponse.response[0].advisory);
        if (APIResponse.response === null) {
          setTimeout(() => {
            setLoading(false)
            setCropLoading(false)
            setLoadingMessage()
            SimpleToast.show(APIResponse?.message)
          }, 100);
        }
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
            setCropLoading(false)
          }, 100);
          if (APIResponse.statusCode == HTTP_OK) {
            const dashboardRespBYPASS = APIResponse.response
            console.log(dashboardRespBYPASS);
            navigation.navigate("CropDesiesDetection", { data: dashboardRespBYPASS })
            setTimeout(() => {
              setLoading(false)
              setCropLoading(false)
              setLoadingMessage()
            }, 100);
          } else {
            // alert("reached to else condition")
            setLoading(false)
            setCropLoading(false)
            setLoadingMessage()
            // SimpleToast.show(translate('something_went_wrong'))
          }
        } else {
          // Alert.alert("reached to other else  condition")
          setTimeout(() => {
            setLoading(false)
            setCropLoading(false)
            setLoadingMessage()
            SimpleToast.show(translate('something_went_wrong'))
          }, 100);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setCropLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 100);
      }
    } else {
      // SimpleToast.show(translate('no_internet_conneccted'))
    }
    setCameraRelatedPopUp(false)
  }


  const openImagePickerProfilePic = async () => {
    try {
      var image = await ImagePicker.openPicker({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 1.0,
        mediaType: 'photo'
      })
      var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
      setImageData(response)
      setCameraRelatedPopUp(true)
      setFromGallery(true)
    } catch (err) {
      console.error(err)
    }
    setShowSelectionModal(false)
  }

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('dontShowThisAgain', JSON.stringify(value));
      setCameraRelatedPopUp(false)
      openCameraProfilePic()
    } catch (e) {
      console.error(e)
    }
  };

  const checkData = async () => {
    try {
      const result = await AsyncStorage.getItem('dontShowThisAgain');
      return JSON.parse(result);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      <View style={[styles['flex_1'], { backgroundColor: 'rgba(249, 249, 249, 1)' }]}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
        <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 20 : 20 }]}>
          <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => navigation.goBack()}>
            <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
            <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('Crop_Diagnostic_Tool')}</Text>
          </TouchableOpacity>
        </View>
        <View style={[{ backgroundColor: dynamicStyles?.highLightedColor }, styleSheetStyles.tabMain]}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => setSelectedFilter(translate('Crop_Diagnostic'))} style={[selectedFilter === translate('Crop_Diagnostic') && { backgroundColor: dynamicStyles.primaryColor }, styleSheetStyles.tabBtn]}>
            <Text style={[selectedFilter === translate('Crop_Diagnostic') ? { color: dynamicStyles.secondaryColor } : { color: dynamicStyles.textColor }, styles['font_size_14_semibold'], Platform.OS === 'ios' && { lineHeight: 25 }]}>{translate('Crop_Diagnostic')}</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={() => setSelectedFilter(translate('history'))} style={[selectedFilter === translate('history') && { backgroundColor: dynamicStyles.primaryColor }, styleSheetStyles.tabBtn]}>
            <Text style={[selectedFilter === translate('history') ? { color: dynamicStyles.secondaryColor } : { color: dynamicStyles.textColor }, styles['font_size_14_semibold']]}>{translate('history')}</Text></TouchableOpacity>
        </View>

        {
          selectedFilter === translate('Crop_Diagnostic') &&
          <View style={{ marginVertical: 10, height: '80%' }}>
            <FlatList
              data={cropDiagDATA}
              ListFooterComponent={<>
                <View style={{ marginTop: responsiveHeight(3), bottom: responsiveHeight(1) }}>
                  <CustomButton
                    onPress={() => {
                      setShowSelectionModal(true)
                    }}
                    title={translate('Take_a_Picture')}
                    buttonBg={dynamicStyles.primaryColor}
                    btnWidth={'90%'}
                    titleTextColor={dynamicStyles.secondaryColor}
                    textAlign='center'
                  />
                </View>
                <View style={{ height: 50 }} /></>}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<>
                <View style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 20,
                  height: responsiveHeight(60)
                }}>
                  <Text style={[styles['font_size_16_semibold'], {
                    color: dynamicStyles?.primaryColor
                  }]}>
                    {translate('NoDataFound')}
                  </Text>
                </View>
              </>}
              renderItem={({ item }) => <View key={item.id} style={{
                width: "90%", backgroundColor: "white", marginVertical: 10, alignSelf: "center", elevation: 1, borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "center", paddingVertical: 15
              }}>
                <Image source={item.image} style={{ height: 60, width: 60, resizeMode: "contain", alignSelf: "center" }} />
                <Text style={[{ color: item.textColor, alignSelf: "center", marginTop: 5 }, styles['font_size_12_semibold']]}>{item.name}</Text>
              </View>}
              keyExtractor={item => item.id}

            />
            <Modal
              animationType="fade"
              transparent={true}
              visible={cameraRelatedPopUp}
            // onRequestClose={onPressingOut}
            >
              <View
                // testID="openAttachmentModal"
                //   onPressOut={onPressingOut}
                style={stylesheetStyes.overallContainer}
              >
                <TouchableWithoutFeedback>
                  {ImageData !== null
                    ?
                    <View style={[[stylesheetStyes.subContainer, {
                    }]]}>
                      <Image source={{ uri: ImageData?.uri }} style={{
                        height: responsiveHeight(68),
                        marginTop: 10,
                        borderRadius: 15,
                        width: responsiveWidth(85), resizeMode: "cover", alignSelf: "center",
                      }} />
                      <View style={[styleSheetStyles.container, {
                        marginTop: 25
                      }]}>
                        <TouchableOpacity onPress={() => {
                          if (fromGallery) {
                            // setCameraRelatedPopUp(false)
                            openImagePickerProfilePic()
                          }
                          else { openCameraProfilePic() }
                        }} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: dynamicStyles.iconPrimaryColor }]}>
                          <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.iconPrimaryColor }]}>{fromGallery ? translate("ReSelect") : translate('Re-Take')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          submitCrop()
                        }} style={[styleSheetStyles.button, styleSheetStyles.saveButton, { borderColor: Colors.lightGray, backgroundColor: dynamicStyles.primaryColor, }]}>
                          <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.secondaryColor }]}>{translate('proceed')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    : <View style={[stylesheetStyes.subContainer]}>
                      <TouchableOpacity
                        onPress={() => {
                          storeData(true)
                        }}
                        style={{ position: "absolute", right: 15, top: 20 }}>
                        <Text style={[{ color: dynamicStyles.primaryColor }, styles['font_size_10_semibold']]}>{translate('Dont_show_this_again')}</Text>
                      </TouchableOpacity>
                      <Image style={{ height: 200, width: 200, resizeMode: "contain", alignSelf: "center", marginTop: responsiveHeight(10) }} source={require('../assets/images/cameraPopup.png')} />
                      <Text style={[{ color: dynamicStyles.primaryColor, alignSelf: "center", marginTop: responsiveHeight(5) }, styles['font_size_13_semibold']]}>{CarouselDATA[carouselIndex].name}</Text>
                      <Text style={[styles['font_size_11_regular'], { color: dynamicStyles.textColor, alignSelf: "center", textAlign: "center", width: "92%", marginTop: 5 }]}>{CarouselDATA[carouselIndex].desc}</Text>
                      <View style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", position: "absolute", bottom: responsiveHeight(18) }}>
                        <View style={[carouselIndex === 0 ? { height: 10, width: 10, backgroundColor: dynamicStyles.primaryColor, borderRadius: 60, marginRight: 2.5 } : { height: 10, width: 10, borderColor: dynamicStyles.primaryColor, borderRadius: 60, borderWidth: 1, marginRight: 2.5 }]} />
                        <View style={[carouselIndex === 1 ? { height: 10, width: 10, backgroundColor: dynamicStyles.primaryColor, borderRadius: 60 } : { height: 10, width: 10, borderColor: dynamicStyles.primaryColor, borderRadius: 60, borderWidth: 1 }]} />
                      </View>
                      <View style={[styleSheetStyles.container, {
                        marginTop: "auto"
                      }]}>
                        <TouchableOpacity onPress={() => {
                          setCarouselIndex(1)
                          openCameraProfilePic()
                        }} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: dynamicStyles.iconPrimaryColor }]}>
                          <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.iconPrimaryColor }]}>{translate('skip')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          if (carouselIndex === 0) {
                            setCarouselIndex(carouselIndex + 1)
                          } else {
                            openCameraProfilePic()
                          }
                        }} style={[styleSheetStyles.button, styleSheetStyles.saveButton, { borderColor: Colors.lightGray, backgroundColor: dynamicStyles.primaryColor, marginLeft: 10 }]}>
                          <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.secondaryColor }]}>{translate('Next')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>}
                </TouchableWithoutFeedback>
              </View>
            </Modal>
          </View>
        }

        <CustomGalleryPopup
          showOrNot={showSelectionModal}
          onPressingOut={() => setShowSelectionModal(false)}
          onPressingCamera={async () => {
            if (await checkData()) {
              openCameraProfilePic()
            } else {
              setCameraRelatedPopUp(true), setShowSelectionModal(false), setImageData(null), setCarouselIndex(0)
            }
          }}
          onPressingGallery={() => { setImageData(null), openImagePickerProfilePic() }}
        />

        {
          selectedFilter === translate('history') &&
          <View style={{ marginVertical: 10, height: '80%' }}>
            {diseases.length > 0 ? (
              <FlatList
                data={diseases}
                ListFooterComponent={<View style={{ height: 50 }} />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<>
                  <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 20,
                    height: responsiveHeight(60)
                  }}>
                    <Text style={[styles['font_size_16_semibold'], {
                      color: dynamicStyles?.primaryColor
                    }]}>
                      {translate('NoDataFound')}
                    </Text>
                  </View>
                </>}
                renderItem={({ item }) => <View style={{
                  width: "90%", backgroundColor: "white", marginVertical: 10, alignSelf: "center", elevation: 1, borderRadius: 10, padding: 10
                }}>
                  {console.log('itemsInrender', item)}
                  <View style={{ flex: 1, borderWidth: 2, borderColor: "rgba(0, 0, 0, 0.05)", borderRadius: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: dynamicStyles.highLightedColor, height: 35, paddingHorizontal: 10 }}>
                      <Image tintColor={dynamicStyles.primaryColor} source={require('../assets/images/diseaseDetected.png')} style={{ height: 20, width: 20, resizeMode: "contain" }} />
                      <Text style={[styles['font_size_14_semibold'], { color: dynamicStyles.primaryColor, marginLeft: 10, }]}>{item?.cropDiseaseTitle ? item?.cropDiseaseTitle : translate('No_Disease_Detected')}</Text>
                    </View>
                    <View style={{ padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Image source={item?.imageUrl ? { uri: item.imageUrl } : require('../assets/images/image_not_exist.png')} style={{ height: 65, width: 65, resizeMode: "contain", borderRadius: 60 }} />
                        <View>
                          {item?.diseaseName && <Text style={[{ color: dynamicStyles.textColor, marginLeft: 10 }, styles['font_size_12_semibold']]}>{item?.diseaseName}</Text>}
                          {item?.cropName && <Text style={[{ color: dynamicStyles.textColor, marginLeft: 10 }, styles['font_size_10_regular']]}>{item?.cropName}</Text>}
                          {item?.createdOn && <Text style={[styles['font_size_10_semibold'], { color: 'rgba(85, 85, 85, 1)', marginLeft: 10 }]}>{item?.createdOn?.split('T')[0] || ''}</Text>}
                        </View>
                      </View>
                      {/* <CustomCircularProgress
                      percentage={item.confidence} radius={30} strokeWidth={6} percentageText={item.confidence} level={item.status} hideStatus={true}
                    /> */}
                    </View>
                    <TouchableOpacity style={{ maxWidth: "40%", alignItems: "center", justifyContent: "center", padding: 8, margin: 8, borderWidth: 1, borderColor: dynamicStyles.primaryColor, borderRadius: 5 }} onPress={() => navigation.navigate("CropDesiesDetection", { data: item })}>
                      <Text style={{ color: dynamicStyles.primaryColor }}>{translate("View_Details")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>}
                keyExtractor={item => item.id}

              />
            ) : (
              <View style={{ alignSelf: 'center', justifyContent: 'center', flex: 1 }}>
                <Text style={[{ color: 'red', marginLeft: 10 }, styles['font_size_14_semibold']]}>{translate('NoDataFound')}</Text>
              </View>
            )}
          </View>
        }

        {cropLoading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} fromCropDiag={cropLoading} />}
        {loading && !cropLoading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} fromCropDiag={false} />}
        {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
        {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
      </View>
    </SafeAreaView>
  );
};

const styleSheetStyles = StyleSheet.create({
  container: {
    // top:5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
  button: {
    width: '45%',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    bottom: 10
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  saveButton: {},
  flexFull: { flex: 1 },
  tabBtn: { width: "50%", height: "100%", borderRadius: 5, alignItems: "center", justifyContent: "center" },
  tabMain: {
    height: 45, width: responsiveWidth(90), alignSelf: "center", marginTop: responsiveHeight(2), borderRadius: 5, marginBottom: responsiveHeight(0.5),
    flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
  gray300bg: { backgroundColor: '#f5f5f5' },
  header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
  dabba: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    width: "90%",
    alignSelf: "center",
    // height: 200,
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    // borderColor:'rgba(0, 0, 0, 0.06)',borderWidth:2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
});

const stylesheetStyes = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewTen: { marginLeft: responsiveWidth(2.5) },
  imgTwo: {
    height: 50,
    width: 50,
    borderRadius: 6,
  },
  textFive: { marginBottom: responsiveHeight(1) },
  viewTwelve: { marginTop: 20 },
  textSeven: {
    textAlign: "center",
    // color: COLORS.paragraphText
  },
  textSix: {
    position: "absolute",
    right: responsiveWidth(1),
    bottom: responsiveHeight(0),
    fontSize: responsiveFontSize(1.5),
    color: "rgba(37,39,73,0.5)",
  },
  viewEleven: {
    height: responsiveHeight(35),
    width: responsiveWidth(100),
    backgroundColor: "rgba(255,255,255,1)",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  textEight: { fontSize: responsiveFontSize(3) },
  viewThirteen: { padding: responsiveHeight(1) },
  touchOne: {
    flexDirection: "row",
    height: responsiveHeight(6),
    borderRadius: 50,
    margin: responsiveHeight(1),
    width: responsiveWidth(12),
    alignItems: "center",
    justifyContent: "center",
  },
  subContainer: {
    height: responsiveHeight(80),
    width: responsiveWidth(90),
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingBottom: 15,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  image3: {
    height: responsiveHeight(4),
    width: responsiveWidth(8),
  },
  touchTwo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 0.3,
    borderBottomColor: "rgba(37,39,73,0.1)",
  },
  viewNine: { flexDirection: "row" },
  scrollViewStyle: { flex: 1, backgroundColor: "rgba(255,255,255,1)" },
  textFour: {
    //  color: COLORS.petwatchOrange
  },
  viewEight: {
    // borderColor: COLORS.petwatchOrange,
    borderRadius: responsiveHeight(1),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: responsiveHeight(0.1),
    height: responsiveHeight(5),
    width: responsiveWidth(25),
    marginRight: responsiveWidth(5),
  },
  textThree: {
    //  color: COLORS.paragraphText
  },
  textTwo: {
    marginRight: responsiveWidth(2),
    // color: COLORS.petwatchOrange
  },
  viewSeven: { paddingLeft: responsiveWidth(5) },
  viewSix: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(0.5),
  },
  viewFive: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F1F1",
    height: responsiveHeight(10),
    width: responsiveWidth(100),
  },
  cameraView: { alignItems: "center", justifyContent: "center" },
  viewFour: { marginLeft: responsiveWidth(2) },
  textOne: {
    marginLeft: responsiveWidth(3),
    // color: COLORS.darkBlueGrey,
    fontSize: responsiveFontSize(2.2),
  },
  imgOne: {
    height: 50,
    width: 50,
    borderRadius: 6,
  },
  viewTwentyOne: {
    height: responsiveHeight(8),
    width: responsiveWidth(16),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginRight: responsiveWidth(10),
  },
  cameraOverallView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(5),
    marginLeft: responsiveWidth(5),
  },
  galleryImage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
  },
  viewThree: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: responsiveWidth(70),
  },
  viewOne: {
    height: responsiveHeight(8),
    width: responsiveWidth(100),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,1)",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  overallContainer: {
    flex: 1,
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    alignItems: "center",
    justifyContent: "center"
  },
  viewTwo: { padding: responsiveWidth(4) },
  outerContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,1)",
    marginTop: responsiveHeight(3),
  },
  topContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "rgba(37,39,73,0.1)",
    width: responsiveWidth(75),
  },
  avatar: {
    marginTop: responsiveHeight(2),
    alignItems: "flex-start",
    justifyContent: "flex-start",
    borderRadius: responsiveHeight(1),
  },
  trueBorder: {
    borderBottomLeftRadius: responsiveHeight(2),
    borderBottomRightRadius: responsiveHeight(2),
    borderTopRightRadius: responsiveHeight(2),
    backgroundColor: "rgba(254, 91, 87,0.1)",
  },
  falseBorder: {
    borderBottomLeftRadius: responsiveHeight(2),
    borderBottomRightRadius: responsiveHeight(2),
    borderTopLeftRadius: responsiveHeight(2),
  },
  leftMargin: { marginRight: 16 },
  rightMargin: { marginLeft: 16 },
  avatarContent: {
    fontSize: 30,
    textAlign: "center",
    textAlignVertical: "center",
  },
  messageContent: {
    padding: responsiveHeight(1),
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(2),
    padding: 3,
    backgroundColor: "#F4F4F4",
    width: responsiveWidth(90),
    marginLeft: responsiveWidth(5),
    borderRadius: responsiveHeight(3),
    marginBottom: responsiveHeight(3),
  },
  textInput: {
    backgroundColor: "#F4F4F4",
    width: responsiveWidth(64),
    marginLeft: responsiveWidth(3),
    padding: 16,
  },
  submit: { marginLeft: responsiveWidth(2) },
  view4: { borderRadius: responsiveHeight(60) },
  viewSafe: { flex: 1, backgroundColor: "white" },
  image: {
    minWidth: responsiveWidth(50),
    minHeight: responsiveHeight(50),
    marginBottom: responsiveHeight(1),
  },
  fastImageOne: {
    height: responsiveHeight(10),
    width: responsiveWidth(20),
    marginBottom: responsiveHeight(2),
  },
  touchThree: {
    height: responsiveHeight(15),
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CropDiagonstic;
