import React, { useEffect, useMemo, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, PermissionsAndroid, AppState, Linking, KeyboardAvoidingView, Dimensions, Keyboard, TouchableOpacity } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import CustomTextInput from '../Components/CustomTextInput';
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { MOBILE_NUMBER, USER_ID, retrieveData } from '../assets/Utils/Utils';
import { useNavigation } from '@react-navigation/native';
import { FlatList, ScrollView, TextInput } from 'react-native-gesture-handler';
import CustomAlert from '../Components/CustomAlert';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomLoader from '../Components/CustomLoader';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
// import { ScrollView } from "react-native";

var styles = BuildStyleOverwrite(Styles);


function Address() {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))

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
  const [searchText, setSearchText] = useState("");
  const [filteredIndex, setfilteredIndex] = useState([])


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
    navigation.navigate('Profile')
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
  const logoutButtonPress = async () => {
    console.log('mmmnmnm')
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

  const filterSearch = () => {
    // var listItems = openStock
    // if (selectedLocationId == 0) {
    //     listItems = openStock;
    // } else {
    //     listItems = openStock;
    // }
    // var array = listItems.filter(data => data.productName.toString().toLowerCase().includes(searchText.toLowerCase()));
    // setfilteredIndex(array.length > 0 ? array : [])
  }

  editBtnClicked = () => {
  }

  deleteBtnClicked = () => {
  }

  shareBtnClicked = () => {
  }

  return (
    <View style={[styles['full_screen'], styles['bg_themeRed']]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={'white'} barStyle='dark-content' />}

      <View style={[styles['absolute_position'], styles['padding_top_50'], styles['height_100%'], styles['width_100%'], { Colors: Colors.themeRed }]}>

        <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_20'], styles['width_height_30'], styles['tint_color_white']]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles['height_30'], styles['text_color_white'], styles['padding_top_8']]}>{translate('address')}</Text>
        </TouchableOpacity>

        <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true}>

          <Image style={[styles['margin_top_20'], styles['width_100%'], styles['height_40'], styles['bottom_minus_1']]} resizeMode='stretch' source={require('../assets/images/pyramid.png')}></Image>
          <View style={[styles['bg_white'], styles['width_100%'], styles['height_100%']]}>


            <Text style={[styles['top_5'], styles['height_40'], styles['text_color_black'], styles['centerItems'], styles['font_size_24_semibold']]}>{translate('selectAddress')}</Text>
            <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>

            {/* Search Bar here */}
            <View style={[styles['flex_direction_row'], styles['bg_white'], styles['border_radius_normal'], styles['height_40'], styles['border_width_1'], styles['align_end'], { borderColor: Colors.grey, right: 0, top: 20, width: '90%' }, styles['centerItems']]}>
              <Image style={[styles['width_height_20'], styles['centerItems'], { tintColor: "#C0C1C1" }]}
                source={(searchText == '') ? require('../assets/images/searchGray.png') : require('../assets/images/close.png')} />
              <TextInput
                value={searchText}
                onChangeText={(search) => {
                  setSearchText(search)
                  setTimeout(() => {
                    if (search == "") {
                      setSearchText('')
                      // if (selectedLocationId == 0) {
                      //      setfilteredIndex(masters.openStock)
                      // } else {
                      //      setfilteredIndex(masters.openStock)
                      // }
                    } else {
                      filterSearch()
                    }
                  }, 200);
                }}
                placeholder={translate('search')}
                placeholderTextColor={Colors.darkgrey}
                style={[styles['width_90%'], styles['font_size_14_regular'], styles['text_color_black'], styles['height_45'], { paddingLeft: 5 }]} />

              <TouchableOpacity style={[styles['centerItems']]}
                onPress={() => {
                  if (searchText != "") {
                    Keyboard.dismiss();
                  }
                  setSearchText('')
                  console.log("selectedLocation", selectedLocation)
                  if (selectedLocation == "All") {
                    //setfilteredIndex(masters.openStock)
                  }
                  else if (selectedLocation != undefined && duplicateData.length > 0) {
                    //setfilteredIndex(masters.openStock)
                  }
                  else {
                    //setfilteredIndex(openStock)
                  }
                }}>
              </TouchableOpacity>
            </View>

            <View style={[styles['height_100'], styles['bg_lightwhiteGray'], styles['width_90%'], styles['margin_top_40'], styles['align_self_center'], styles['border_radius_6']]}>
              <View style={[styles['flex_direction_row'], styles['align_self_center'], styles['margin_left_20'], styles['margin_top_5']]}>
                <Image style={[styles['margin_left_10'], styles['width_height_30'], styles['margin_top_10']]} source={require('../assets/images/locationOrange.png')}></Image>
                <View style={[styles['flex_direction_column'], styles['align_self_center']]}>
                  <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['text_align_left'], styles['left_5'], styles['width_90%'], styles['top_5']]}>{translate('usermyCurrentLocation')}</Text>
                  <Text style={[styles['font_size_10_regular'], styles['text_color_grey'], styles['text_align_left'], styles['left_5'], styles['width_90%'], styles['top_5']]}>Cyber Hills Colony, VIP Hills, Silicon Valley, Madhapur, Hyderabad</Text>
                </View>
              </View>

              <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems'], styles['margin_top_10']]}></View>

              <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_top_5']]} onPress={() => { goBack() }}>
                <Image style={[styles['margin_left_20'], styles['width_height_20'], styles['align_self_center']]} source={require('../assets/images/addGreen.png')}></Image>
                <Text style={[styles['margin_left_10'], styles['height_30'], styles['text_color_black'], styles['padding_top_8'], styles['font_size_14_regular']]}>{translate('addAddress')}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles['width_90%'], styles['centerItems'], styles['margin_top_20'], styles['flex_direction_row']]}>
              <View style={[styles['bg_lightish_grey'], styles['width_30%'], styles['height_0.5'], styles['centerItems']]}></View>
              <Text style={[styles['width_40%'], styles['text_color_black'], styles['font_size_12_regular'], styles['text_align_center']]}>{translate('Save')}</Text>
              <View style={[styles['bg_lightish_grey'], styles['width_30%'], styles['height_0.5'], styles['centerItems']]}></View>
            </View>

            <View style={[styles['height_100'], styles['bg_lightwhiteGray'], styles['width_90%'], styles['margin_top_20'], styles['align_self_center'], styles['border_radius_6']]}>
              <View style={[styles['flex_direction_row'], styles['align_self_center'], styles['margin_left_20'], styles['margin_top_5']]}>
                <Image style={[styles['margin_left_10'], styles['width_height_25'], styles['margin_top_10']]} source={require('../assets/images/homeGray.png')}></Image>
                <View style={[styles['flex_direction_column'], styles['align_self_center'], styles['margin_left_10']]}>
                  <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['text_align_left'], styles['left_5'], styles['width_90%'], styles['top_5']]}>Silicon Valley</Text>
                  <Text style={[styles['font_size_10_regular'], styles['text_color_grey'], styles['text_align_left'], styles['left_5'], styles['width_90%'], styles['top_5']]}>Cyber Hills Colony, VIP Hills, Silicon Valley, Madhapur, Hyderabad</Text>
                </View>
              </View>

              <View style={[styles['flex_direction_row'], styles['margin_left_40'], styles['margin_top_15']]}>
                <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { editBtnClicked() }}>
                  <Image style={[styles['margin_left_10'], styles['width_height_30']]} source={require('../assets/images/editCircle.png')}></Image>
                </TouchableOpacity>
                <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { deleteBtnClicked() }}>
                  <Image style={[styles['margin_left_10'], styles['width_height_30']]} source={require('../assets/images/deleteCircle.png')}></Image>
                </TouchableOpacity>
                <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { shareBtnClicked() }}>
                  <Image style={[styles['margin_left_10'], styles['width_height_30']]} source={require('../assets/images/shareCircle.png')}></Image>
                </TouchableOpacity>
              </View>


              <View style={[styles['flex_direction_column'], styles['absolute_position'], styles['margin_top_40']]}>
                <Text style={[styles['font_size_8_regular'], styles['text_color_grey'], styles['text_align_center'], styles['centerItems'], styles['top_5'], { width: 50 }]}>16.5</Text>
                <Text style={[styles['font_size_8_regular'], styles['text_color_grey'], styles['text_align_center'], styles['centerItems'], styles['top_5'], { width: 50 }]}>Km</Text>
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

export default Address;