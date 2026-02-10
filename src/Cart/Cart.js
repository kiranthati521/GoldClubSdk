import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Platform, StatusBar, Text, Image,
  Dimensions, TouchableOpacity, FlatList, ScrollView,
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { useNavigation } from '@react-navigation/native';
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import SimpleToast from 'react-native-simple-toast';
import CustomAlert from '../Components/CustomAlert';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

function Cart({route}) {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const dispatch = useDispatch();
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [loading, setLoading] = useState(false)
  const totalAvailablePoints = route?.params?.totalAvailablePoints;
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/mcrc_loader.gif'))
  const [selectedItem, setselectedItem] = useState([])
  const navigation = useNavigation()
  const [selectAllTrueFalse, setSelectAllTrueFalse] = useState(false)
  const [deSelectAllTrueFalse, setDeSelectAllTrueFalse] = useState(false)
  const [totalSelectedItems, setTotalSelectedItems] = useState(0);

  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)

  // const [cartData, setCartData] = useState([
  //     {
  //         productName: "NMH-4786-P4KG",
  //         cash: 500,
  //         redeemPoints: 50,
  //     },
  //     {
  //         productName: "KHN-4786-P4KG",
  //         cash: 600,
  //         redeemPoints: 60,
  //     }
  // ]);
  const [cartData, setCartData] = useState([])

  useEffect(() => {
    getCartDetails();
    console.log('what is in cart Data is:', cartData)
  }, { cartData })

  useEffect(() => {
    console.log('what is in selectedItem is:', selectedItem)
  }, { selectedItem })

  const onPressCouponItem = async (item, index) => {
    console.log('what is in item & index', item, index)

    const cartArray = [...cartData];
    for (let i = 0; i < cartArray.length; i++) {
      if (i == index) {
        cartArray[i].redeemStatus = !cartArray[i].redeemStatus
      }
    }
    setCartData(cartArray)
    checkSelectedCount()

  }

  const checkSelectedCount=()=>{
    var getSelectedCount = 0
    const cartArray = [...cartData];
    for (let i = 0; i < cartArray.length; i++) {
      if (cartArray[i].redeemStatus == true) {
        getSelectedCount = getSelectedCount + 1
      }
    }
    setCartData(cartArray)
    setTotalSelectedItems(getSelectedCount)
  }

  const renderItem = (item, index) => (
    <View>
      <Image source={require('../assets/images/productBgCard.png')} style={[{ margin: 5, height: 70, width: Dimensions.get('window').width / 2.2 }]} resizeMode='stretch' />
      {item.redeemStatus == true &&
        <Image source={require('../assets/images/greenSelected.png')} style={[styles['absolute_position'], styles['align_self_flex_end'], styles['width_height_20']]} resizeMode='stretch' />
      }
      <TouchableOpacity style={[styles['absolute_position'], styles['centerItems']]} onPress={() => { onPressCouponItem(item, index) }}>
        <View style={[styles['flex_direction_row'], styles['width_95%'], styles['height_90%'], styles['margin_top_10']]}>
          <View style={[styles['flex_direction_column'], styles['width_50%'], styles['height_100%'], styles['centerItems']]}>
            <Image source={{ uri: item.productImage }} style={[styles['width_height_60'], styles['centerItems']]} resizeMode='contain' />
          </View>
          <View style={[styles['flex_direction_column'], styles['width_45%'], styles['margin_top_5'], styles['height_100%'], styles['left_5']]}>
            <Text allowFontScaling={false} style={[styles['font_size_12_regular'], styles['text_color_black']]} numberOfLines={1}>
              {item.productName}</Text>
            <Text allowFontScaling={false} style={[styles['font_size_10_regular'], styles['text_color_black']]} numberOfLines={2}>
              ₹ {item.price}</Text>
            <Text allowFontScaling={false} style={[styles['font_size_8_regular'], styles['text_color_black'], styles['align_self_flex_end'], styles['right_10'], styles['top_5']]} numberOfLines={2}>
              {item.redeemPoints} {translate('points')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const goBack = async () => {
    console.log('ddfddfdfdf')
    navigation.goBack()
  };

  const deleteCartBtnPress = () => {
    const cartArray = [...cartData];
    for (let i = 0; i < cartArray.length; i++) {
      if (cartArray[i].redeemStatus == true) {
        cartArray[i].redeemStatus = !cartArray[i].redeemStatus
        cartArray[i].addCartStatus = false
      }
    }
    setCartData(cartArray)
    setTimeout(() => {
      for (let i = 0; i < cartArray.length; i++) {
        if (cartArray[i].addCartStatus == false) {
          deleteApiCall()
          return
        }
      }
      SimpleToast.show(translate('please_select_item'))
    }, 800);
  }

  const redeemCartBtnPress = () => {
    if(selectAllTrueFalse == true){
      var getTotalPointsValue = 0
      const cartArray = [...cartData];
      for (let i = 0; i < cartArray.length; i++) {
        getTotalPointsValue = getTotalPointsValue + cartArray[i].redeemPoints
      }
      console.log('totalllll',getTotalPointsValue)    
      if (getTotalPointsValue > totalAvailablePoints) {
        showAlertWithMessage(translate('alert'), true, true, translate('noenoughpoints'), false, true, translate('ok'), translate('cancel'))
      }
      else{
        redeemApiCall()
      }
    }
    else{

      var getTotalPointsValue = 0
      const cartArray = [...cartData];
      for (let i = 0; i < cartArray.length; i++) {
        if (cartArray[i].redeemStatus == true) {
        getTotalPointsValue = getTotalPointsValue + cartArray[i].redeemPoints
        }
      }
      console.log('totalllll01',getTotalPointsValue)  
      
      const cartArray1 = [...cartData];
      for (let i = 0; i < cartArray1.length; i++) {
      if (cartArray1[i].redeemStatus == true) {
        if (getTotalPointsValue > totalAvailablePoints) {
          showAlertWithMessage(translate('alert'), true, true, translate('noenoughpoints'), false, true, translate('ok'), translate('cancel'))
          return
        }
        else{
         redeemApiCall()
         return
       }
      }
      }
    SimpleToast.show(translate('please_select_item'))
  }
  }

  const redeemApiCall = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait'))

        var getURL = configs.BASE_URL + configs.REDEEM.REDEEM_CARTPOINTS;

        console.log('cart data is', cartData)

        var getHeaders = await GetApiHeaders();
        var dataList = {
          catelogueList: cartData
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
            console.log('the cart redeem Resp is', APIResponse)
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('redeem_successfully'))
            }, 700);

            setTimeout(() => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
            }, 1500);

            setTimeout(() => {
              getCartDetails()
            }, 2000);

            setTimeout(() => {
              navigation.goBack()
            }, 2500);
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

  const deleteApiCall = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait'))

        var getURL = configs.BASE_URL + configs.REDEEM.REDEEM_ADDCART;

        console.log('cart data is', cartData)

        var getHeaders = await GetApiHeaders();
        var dataList = {
          catelogueList: cartData
        }

        console.log('url is', getURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getURL, getHeaders, dataList);
        console.log('delete cat response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            console.log('the delete cart Resp is', APIResponse)
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('deleted_successfully'))
            }, 700);

            setTimeout(() => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
            }, 1500);

            setTimeout(() => {
              checkSelectedCount()
            }, 2000);

            setTimeout(() => {
              checkCartListCount()
            }, 2500);
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
const checkCartListCount = async () => {
  const networkStatus = await getNetworkStatus();
  if (networkStatus) {
    try {
      setTimeout(() => {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
      }, 50);
      var getCartUrl = configs.BASE_URL + configs.REDEEM.REDEEM_GET_CART;
      var getHeaders = await GetApiHeaders();
      var APIResponse = await GetRequest(getCartUrl, getHeaders);

      if (APIResponse != undefined && APIResponse != null) {
        setTimeout(() => {
          setLoadingMessage()
          setLoading(false)
        }, 500);
        if (APIResponse.statusCode == HTTP_OK) {
          setTimeout(() => {
            setLoading(false)
          }, 1000);
         // console.log('what is reposee cart 123', APIResponse.response.cartList)
          if(APIResponse.response.cartList.length == 0){
            navigation.goBack()
          }else{
          setCartData(APIResponse.response.cartList)
          }
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
  const getCartDetails = async () => {
    const networkStatus = await getNetworkStatus();
    if (networkStatus) {
      try {
        setTimeout(() => {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))
        }, 50);
        var getCartUrl = configs.BASE_URL + configs.REDEEM.REDEEM_GET_CART;
        var getHeaders = await GetApiHeaders();

        console.log('what is reposee22', getCartUrl)
        console.log('what is reposee33', getHeaders)
        var APIResponse = await GetRequest(getCartUrl, getHeaders);

        if (APIResponse != undefined && APIResponse != null) {
          console.log('what is reposee111', APIResponse)
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
            }, 1000);
            // var response = APIResponse.response.cartList;
            // var list = APIResponse.response.redeemCartList.map((obj) => {
            //     return {
            //         ...obj, isSelected: false
            //     }
            // })
            console.log('what is reposee cart 123', APIResponse.response.cartList)
            setCartData(APIResponse.response.cartList)
            // console.log('what is actual resp',response.redeemCartList)
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


  const onSelectAllClick = () => {
    setSelectAllTrueFalse(true)
    setDeSelectAllTrueFalse(false)
    const cartArray = [...cartData];
    for (let i = 0; i < cartArray.length; i++) {
        cartArray[i].redeemStatus = true
      }
    checkSelectedCount()
    setCartData(cartArray)
  }

  const onDeSelectAllClick = () => {
    setDeSelectAllTrueFalse(true)
    setSelectAllTrueFalse(false)
    const cartArray = [...cartData];
    for (let i = 0; i < cartArray.length; i++) {
        cartArray[i].redeemStatus = false
      }
      checkSelectedCount()
      setCartData(cartArray)
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

    const handleCancelAlert = () => {
      setShowAlert(false)
    }
  
    const handleOkAlert = () => {
      // if (showAlertyesButtonText == translate('continue')) {
      setShowAlert(false)
      // }
    }

  return (
    <View style={[styles['full_screen']]}>
      {Platform.OS === 'android' && <StatusBar style={[styles['bg_white']]} barStyle='dark-content' />}
      <View style={[{backgroundColor: dynamicStyles.primaryColor},{ paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles[''], styles[''], {tintColor:dynamicStyles.secondaryColor}, { height: 15, width: 20, top: 4 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], {color:dynamicStyles.secondaryColor},  styles['font_size_18_bold']]}>{translate('cart')}</Text>
        </TouchableOpacity>
      </View>
                               {cartData.length > 0 &&
                               <View style={[styles['flex_direction_row'], styles['left_10'],styles['width_95%']]}>
                                <TouchableOpacity style={[styles['flex_direction_row'], { height: 45, width: '30%', padding: 5 ,marginTop: 5 }]} onPress={() => {
                                    onSelectAllClick()
                                }}>
                                  <View style={[styles['flex_direction_row'],]}>
                                    <Image style={[{ height: 15, width: 15, }]} source={selectAllTrueFalse == true ? require('../assets/images/selectRadio_1.png') : require('../assets/images/selectRadio.png')} />
                                    <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['margin_left_10'], styles['text_align_center']]}>{translate('selectALl')}</Text>
                                </View>
                                </TouchableOpacity>
            
                                {selectAllTrueFalse &&
                                <View style={[styles['flex_direction_row'],styles['width_100%']]}>
                                <TouchableOpacity style={[styles['flex_direction_row'],  { height: 45, width: '30%', padding: 5 ,marginTop: 5}]} onPress={() => {
                                    onDeSelectAllClick()
                                }}>
                                    <View style={[styles['flex_direction_row']]}>
                                    <Image style={[{ height: 15, width: 15, }]} source={deSelectAllTrueFalse == true ? require('../assets/images/selectRadio_1.png') : require('../assets/images/selectRadio.png')} />
                                    <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['margin_left_10'], styles['text_align_center']]}>{translate('deSelectAll')}</Text>
                               </View>
                                </TouchableOpacity>

                                <View style={[styles['flex_direction_row'],styles['justify_content_flex_end'], { height: 45, width: '40%', padding: 5 ,marginTop: 5}]}>
                                <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['margin_left_10'], styles['text_align_center']]}>{translate('selectedCount')}</Text>
                                <Text style={[styles['font_size_14_regular'], styles['text_color_red'], styles['left_5'], styles['text_align_center']]}>{totalSelectedItems}</Text>
                               </View>
                               </View>
                                }
                               </View>
                               }   
      <ScrollView>
        {cartData.length > 0 ?
          (
            <FlatList
              data={cartData}
              renderItem={({ item, index }) => renderItem(item, index)}
              keyExtractor={(item, index) => index.toString()}
              style={[styles['align_self_center'], { marginTop: 10 }]}
              scrollEnabled={false}
              numColumns={2}
            />
          )
          :
          (
            <View>
              <Text style={[styles['text_color_black'], styles['centerItems'], styles['margin_top_250'],styles['font_size_18_semibold']]}>{translate('yourcartisempty')}</Text>
            </View>
          )
        }
      </ScrollView>
      {/* <View style={[styles['width_90%'], styles['margin_top_20'], styles['centerItems'],styles['bottom_20']]}>
                <TouchableOpacity style={[styles['width_100%'], styles['border_radius_10'], styles['centerItems'], styles['button_height_45'], styles['bg_red']]} >
                    <Text style={[styles['font_size_14_semibold'], styles['text_color_white']]}>
                        {translate('delete')}
                    </Text>
                </TouchableOpacity>
            </View> */}

     {cartData.length > 0 &&
      <View style={[styles['flex_direction_row'], styles['space_evenly'], styles['margin_top_30']]}>
        <View style={[styles['width_40%']]}>
          <TouchableOpacity style={[styles['width_100%'], styles['border_radius_8'], styles['centerItems'], styles['button_height_45'], styles['border_width_1'], styles['border_color_red']]} onPress={() => { deleteCartBtnPress() }} >
            <Text style={[styles['font_size_14_semibold'], { color: Colors.red }]}>
              {translate('delete')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles['width_40%']]}>
          <TouchableOpacity style={[styles['width_100%'], styles['border_radius_8'], styles['centerItems'], styles['button_height_45'], styles['bg_red']]} onPress={() => { redeemCartBtnPress() }}>
            <Text style={[styles['font_size_14_semibold'], { color: Colors.white }]}>
              {translate('redeem')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
     }
      <View style={[styles['margin_top_30']]}></View>
      {/* </View> */}
      {/* </View> */}

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
  );
}
export default Cart;
