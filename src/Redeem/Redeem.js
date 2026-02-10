import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, Keyboard, Dimensions, TouchableOpacity, FlatList, TextInput, BackHandler } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../assets/Utils/Color';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { GetApiHeaders, PostRequest, getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import SimpleToast from 'react-native-simple-toast';
import { filterObjects } from '../assets/Utils/Utils';
import CustomPaginationFunctional from '../Components/CustomPaginationFunctional';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';



var styles = BuildStyleOverwrite(Styles);

function Redeem() {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [loading, setLoading] = useState(false)
  const [successLoading, setSuccessLoading] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/mcrc_loader.gif'))

  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)


  const [showFilterSelectionModal, setShowFilterSelectionModal] = useState(false)

  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation()
  const [modalVisible, setModalVisible] = useState(false);
  const [allSelected, setAllSelected] = useState(true)
  const [productSelected, setProductSelected] = useState(false)
  const [voucherSelected, setVoucherSelected] = useState(false)
  const [selectedItem, setselectedItem] = useState([])
  const [selectedIndex, setSelectedIndex] = useState([])
  const [totalAvailablePoints, setTotalAvailablePoints] = useState("0");
  const [totalCartPoints, setTotalCartPoints] = useState("");
  const [currentPage, setCurrentPage] = useState(1)
  const [dataAPI, setDataAPI] = useState(null);
  const [showSearch, setShowSearch] = useState(false)
  const [selectTrueFalse, setSelectTrueFalse] = useState(false)
  const [selectDeSelectAllTrueFalse, setSelectDeSelectAllTrueFalse] = useState(false)
  const [selectCountTrueFalse, setSelectCountTrueFalse] = useState(false)
  const [totalSelectedItems, setTotalSelectedItems] = useState(0);

  // const [filterProductsData, setFilterProductsData] = useState([
  //     {
  //         itemName: "NMH-4786-P4KG",
  //         cash: 500,
  //         redeemPoints: 50,
  //         itemDescription: "Diabetic Fiendly white rice | 0.5 kg Registered Clinically Certified Low GI",
  //         itemImage: require('../assets/images/product.png'),
  //         itemQty: "01",
  //         sku:"EL05765",
  //         id:'P001',
  //         name:'product'
  //     },
  //     {
  //         itemName: "Amazon 67",
  //         cash: 600,
  //         redeemPoints: 56,
  //         itemDescription: "Diabetic Fiendly white rice | 0.5 kg Registered Clinically Certified Low GI",
  //         itemImage: require('../assets/images/amazonCard.png'),
  //         itemQty: "01",
  //         sku:"KJ05765",
  //         id:'V001',
  //         name:'voucher'
  //     } 
  // ]);
  // const [productsData, setProductsData] = useState([
  //     {
  //         itemName: "NMH-4786-P4KG",
  //         cash: 500,
  //         redeemPoints: 50,
  //         itemDescription: "Diabetic Fiendly white rice | 0.5 kg Registered Clinically Certified Low GI",
  //         itemImage: require('../assets/images/product.png'),
  //         itemQty: "01",
  //         sku:"EL05765",
  //         id:'P001',
  //         name:'product'
  //     },
  //     {
  //         itemName: "Amazon 67",
  //         cash: 600,
  //         redeemPoints: 56,
  //         itemDescription: "Diabetic Fiendly white rice | 0.5 kg Registered Clinically Certified Low GI",
  //         itemImage: require('../assets/images/amazonCard.png'),
  //         itemQty: "01",
  //         sku:"KJ05765",
  //         id:'V001',
  //         name:'voucher'
  //     }
  // ]);

  // const [addCartList, setAddCartList] = useState(
  //     [
  //      {
  //        "addCartStatus": false,
  //        "cash": 500,
  //        "id": 1,
  //        "productName": "NMH-4786-P4KG",
  //        "redeemPoints": 50,
  //        "redeemStatus": true,
  //        "status": false,
  //        "type": "Credit"
  //      },
  //      {
  //        "addCartStatus": false,
  //        "cash": 1000,
  //        "id": 2,
  //        "productName": "NMH-4786-P4KG",
  //        "redeemPoints": 100,
  //        "redeemStatus": false,
  //        "status": false,
  //        "type": "Credit"
  //      }
  //    ]
  //  )
  //  const [redeemList, setRedeemList] = useState(
  //     [
  //      {
  //        "addCartStatus": false,
  //        "cash": 5000,
  //        "id": 1,
  //        "productName": "NMH-4786-P4KG",
  //        "redeemPoints": 530,
  //        "redeemStatus": false,
  //        "status": false,
  //        "type": "Credit"
  //      },
  //      {
  //        "addCartStatus": false,
  //        "cash": 6000,
  //        "id": 2,
  //        "productName": "NMH-4786-P4KG",
  //        "redeemPoints": 630,
  //        "redeemStatus": true,
  //        "status": false,
  //        "type": "Credit"
  //      }
  //    ]
  //  )

  const [redeemData, setRedeemData] = useState([])
  const [redeemDataSelected, setRedeemDataSelected] = useState([])
  const [filterRedeemData, setFilterRedeemData] = useState([])
  const [totalRedeemCountData, setTotalRedeemCountData] = useState([])

  useEffect(() => {
    console.log('what is in iselectedItem', selectedItem)
  }, [selectedItem])

  useEffect(() => {
    console.log('what is in redeem Data is:', redeemData)
  }, [redeemData, totalSelectedItems])

  useFocusEffect(
    React.useCallback(() => {
      handleFocus();
      setShowFilterSelectionModal(false)
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [])
  );


  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton
    );

    return () => {
      backHandler.remove(); // ✅ Correct cleanup
    };
  }, [handleBackButton, showFilterSelectionModal]);

  const handleBackButton = () => {
    if (showFilterSelectionModal) {
      setShowFilterSelectionModal(false);
      return true;
    } else {
      navigation.goBack();
      return true;
    }
  }

  const handleFocus = () => {
    console.log('Screen is focused!');
    unSelectAllItems()
    setSearchText('')
    setSelectTrueFalse(false)
    setSelectDeSelectAllTrueFalse(false)
    setSelectCountTrueFalse(false)
    setAllSelected(true)
    setProductSelected(false)
    setVoucherSelected(false)
    getRedeemApiCall(1);
    setCurrentPage(1);
    getRedeemCountApiCall();
  };

  // const renderItem = (item, index) => (
  //     <View>
  //         <Image source={require('../assets/images/productBgCard.png')} style={[{ margin: 5, height: 70, width: Dimensions.get('window').width / 2.2 }]} resizeMode='stretch' />
  //         <TouchableOpacity style={[styles['absolute_position'], styles['centerItems']]} onPress={() => { onPressCouponItem(item, index) }}>
  //             <View style={[styles['flex_direction_row'], styles['width_98%'], styles['height_95%'], styles['centerItems']]}>
  //                 <View style={[styles['flex_direction_column'], styles['width_50%'], styles['height_100%'],  styles['margin_top_10'],styles['centerItems']]}>
  //                     <Image source={{ uri: item.productImage }} style={[styles['width_height_60'], styles['centerItems']]} resizeMode='contain' />
  //                 </View>
  //                 <View style={[styles['flex_direction_column'], styles['width_50%'], styles['margin_top_20'], styles['height_100%'], styles['left_10']]}>
  //                     <View style={{height:'50%'}}>
  //                     <Text allowFontScaling={false} style={[styles['font_size_12_regular'], styles['text_color_black']]} numberOfLines={2}>
  //                         {item.productName}</Text>
  //                     <Text allowFontScaling={false} style={[styles['font_size_10_regular'], styles['text_color_black']]} numberOfLines={1}>
  //                         ₹ {item.cash}</Text>
  //                     </View>
  //                     <Text allowFontScaling={false} style={[styles['font_size_8_regular'], styles['text_color_black'],styles['right_10'],styles['align_self_flex_end'],styles['margin_right_8'],styles['']]} numberOfLines={1}>
  //                         {item.redeemPoints} {translate('points')}</Text>
  //                 </View>
  //             </View>
  //         </TouchableOpacity>
  //     </View>
  // );
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
          <View style={[styles['flex_direction_column'], styles['width_45%'], styles['height_100%'], styles['left_10'], styles['margin_top_5']]}>
            <Text allowFontScaling={false} style={[styles['font_size_12_regular'], styles['text_color_black']]} numberOfLines={1}>
              {item.productName}</Text>
            <Text allowFontScaling={false} style={[styles['font_size_10_regular'], styles['text_color_black']]} numberOfLines={2}>
              ₹ {item.cash}</Text>
            <Text allowFontScaling={false} style={[styles['font_size_8_regular'], styles['text_color_black'], styles['align_self_flex_end'], styles['right_10'], styles['top_5']]} numberOfLines={2}>
              {item.redeemPoints} {translate('points')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );


  const goBack = async () => {
    if (showFilterSelectionModal) {
      setShowFilterSelectionModal(false)
    } else {
      navigation.goBack()
    }
  };

  const onCartButtonClick = () => {
    navigation.navigate('Cart', { totalAvailablePoints: totalAvailablePoints })
  }
  const cartBtnPress = () => {
    console.log('dddddd0000', totalAvailablePoints)
    console.log('dddddd1111', selectedItem.redeemPoints)

    if (selectCountTrueFalse == true) {
      var getTotalPointsValue = 1
      const redeemArray = [...redeemData];
      for (let i = 0; i < redeemArray.length; i++) {
        getTotalPointsValue = getTotalPointsValue + redeemArray[i].redeemPoints
      }
      console.log('totalllll', getTotalPointsValue)

      if (getTotalPointsValue > totalAvailablePoints) {
        showAlertWithMessage(translate('alert'), true, true, translate('noenoughpoints'), false, true, translate('ok'), translate('cancel'))
      }
      else {
        redeemApiCall()
      }
    }
    else {
      if (selectedItem.redeemPoints > totalAvailablePoints) {
        showAlertWithMessage(translate('alert'), true, true, translate('noenoughpointsaddCart'), false, true, translate('ok'), translate('cancel'))
      }
      else {
        const addcartArray = [...redeemData];
        for (let i = 0; i < addcartArray.length; i++) {
          if (i == selectedIndex) {
            addcartArray[i].addCartStatus = true
            addcartArray[i].id = 0
          }
        }
        setRedeemData(addcartArray)
        addCartApiCall()
      }
    }
  }
  const redeemBtnPress = () => {
    console.log('dddddd2222', selectedItem.redeemPoints)
    if (selectCountTrueFalse == true) {
      var getTotalPointsValue = 0
      const redeemArray = [...redeemData];
      for (let i = 0; i < redeemArray.length; i++) {
        getTotalPointsValue = getTotalPointsValue + redeemArray[i].redeemPoints
      }
      console.log('totalllll', getTotalPointsValue)

      if (getTotalPointsValue > totalAvailablePoints) {
        showAlertWithMessage(translate('alert'), true, true, translate('noenoughpoints'), false, true, translate('ok'), translate('cancel'))
      }
      else {
        redeemApiCall()
      }
    }
    else {
      if (selectedItem.redeemPoints > totalAvailablePoints) {
        showAlertWithMessage(translate('alert'), true, true, translate('noenoughpoints'), false, true, translate('ok'), translate('cancel'))
      }
      else {
        const redeemArray = [...redeemData];
        for (let i = 0; i < redeemArray.length; i++) {
          if (i == selectedIndex) {
            redeemArray[i].redeemStatus = true
          }
        }
        setRedeemData(redeemArray)
        redeemApiCall()
      }
    }
  }
  const closeFilterSection = () => {
    setselectedItem([])
    setShowFilterSelectionModal(false)
  }

  const allBtnPress = () => {
    unSelectAllItems()
    setAllSelected(true)
    setProductSelected(false)
    setVoucherSelected(false)
    //     var filterDistList = await filterObjects(districtListOriginal, "stateId", item.id)
    setFilterRedeemData(redeemData)
    setRedeemDataSelected(redeemData)
    setTotalSelectedItems(redeemData.length)
    setSelectTrueFalse(false)
    setSelectDeSelectAllTrueFalse(false)
    setSelectCountTrueFalse(false)
  }
  const productsBtnPress = async () => {
    unSelectAllItems()
    setAllSelected(false)
    setProductSelected(true)
    setVoucherSelected(false)
    var filterProductList = await filterObjects(redeemData, "itemType", "Product")
    console.log('filterProductList is here:', filterProductList)
    setFilterRedeemData(filterProductList)
    setRedeemDataSelected(filterProductList)
    setTotalSelectedItems(filterProductList.length)
    setSelectTrueFalse(false)
    setSelectDeSelectAllTrueFalse(false)
    setSelectCountTrueFalse(false)
  }
  const vouchersBtnPress = async () => {
    unSelectAllItems()
    setAllSelected(false)
    setProductSelected(false)
    setVoucherSelected(true)
    var filterVoucherList = await filterObjects(redeemData, "itemType", "Voucher")
    console.log('filterVoucherList is here:', filterVoucherList)
    setFilterRedeemData(filterVoucherList)
    setRedeemDataSelected(filterVoucherList)
    setTotalSelectedItems(filterVoucherList.length)
    setSelectTrueFalse(false)
    setSelectDeSelectAllTrueFalse(false)
    setSelectCountTrueFalse(false)
  }

  const onPressCouponItem = async (item, index) => {
    console.log('what is in item & index', item, index)

    if (selectTrueFalse == true) {
      const RedeemArray = [...filterRedeemData];
      for (let i = 0; i < RedeemArray.length; i++) {
        if (i == index) {
          RedeemArray[i].redeemStatus = !RedeemArray[i].redeemStatus
        }
      }
      setFilterRedeemData(RedeemArray)
      console.log('nnnnnnnn45')
      checkSelectedCount()
    }
    else {
      setselectedItem(item)
      setSelectedIndex(index)
      setShowFilterSelectionModal(true)
    }
  }

  const unSelectAllItems = () => {
    const RedeemArray = [...filterRedeemData];
    for (let i = 0; i < RedeemArray.length; i++) {
      RedeemArray[i].redeemStatus = false
    }
    setFilterRedeemData(RedeemArray)
  }

  const checkSelectedCount = () => {
    var getSelectedCount = 0
    const RedeemCountArray = [...filterRedeemData];
    for (let i = 0; i < RedeemCountArray.length; i++) {
      if (RedeemCountArray[i].redeemStatus == true) {
        getSelectedCount = getSelectedCount + 1
      }
    }
    console.log('count11', getSelectedCount)
    setTotalSelectedItems(getSelectedCount)
  }

  const filterSearch = () => {
    var listItems = redeemDataSelected
    var array = listItems.filter(data => data.productName.toString().toLowerCase().includes(searchText.toLowerCase()));
    setFilterRedeemData(array.length > 0 ? array : [])



    // var listItems = filterProductsData
    // var array = listItems.filter(data => data.brandName.toString().toLowerCase().includes(searchText.toLowerCase()));
    // setFilterProductsData(array.length > 0 ? array : [])
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

  const searchOpenButtonClick = () => {
    setShowSearch(true)
  }

  const searchCloseButtonClick = () => {
    setSearchText('')
    setFilterRedeemData(redeemDataSelected)
    setShowSearch(false)
  }


  const showFilterSection = () => {
    return (
      <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
        <View style={[styles['width_100%'], styles['absolute_position'], styles['bottom_20'], styles['centerItems']]}>
          <Image style={[styles['width_100%'], styles['height_40'], styles['bottom_minus_1']]} resizeMode='stretch' source={require('../assets/images/pyramid.png')}></Image>

          <View style={[styles['bg_white'], styles['width_100%']]}>
            <TouchableOpacity style={[styles['width_height_20'], styles['right_20'], styles['absolute_position'], styles['margin_top_minus_20'], { alignSelf: 'flex-end' }]} onPress={() => { closeFilterSection() }}>
              <Image source={require('../assets/images/close.png')} style={[styles['width_height_20'], { tintColor: 'red' }]} />
            </TouchableOpacity>

            <Text style={[styles['text_color_black'], styles['align_self_center'], styles['font_size_24_semibold']]}>{translate('rewards')}</Text>
            <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>

            <View style={[styles['width_90%'], styles['align_self_center'], styles['lightRedBgColor'], styles['margin_top_20'], styles['padding_10'], styles['flex_direction_row'], styles['border_radius_15']]}>
              <Image style={[styles['centerItems'], styles['width_height_70']]} source={{ uri: selectedItem.productImage }} resizeMode='contain' />
              <View style={[styles['left_10'], styles['width_70%']]}>
                <Text style={[styles['text_color_black'], styles['font_size_18_bold']]}>{selectedItem.productName}</Text>
                <Text style={[styles['text_color_black'], styles['margin_top_5']]}>{selectedItem.productDescription}</Text>
                {/* <Text style={[styles['text_color_black']]}>Registered Clinically Certified Low GI</Text> */}
              </View>
            </View>

            {/* <View style={[styles['width_90%'], styles['centerItems'], styles['padding_10'], styles['bg_lightwhiteGray'], styles['border_radius_8'], styles['margin_top_20'], styles['centerItems']]}>
                            <Text style={[styles['text_color_black'], styles['font_size_18_bold'],]}>UPI Transfer</Text>
                            <Text style={[styles['text_color_black']]}>UPI-Transfer Rs.50000</Text>
                        </View> */}

            <View style={[styles['margin_top_20'], styles['margin_left_20']]}>
              <View style={[styles['flex_direction_row']]}>
                <Text style={[styles['text_color_black'], styles['width_20%']]}>{translate('points')}</Text>
                <Text style={[styles['text_color_black']]}>: {selectedItem.redeemPoints}</Text>
              </View>
              <View style={[styles['flex_direction_row'], styles['top_5']]}>
                <Text style={[styles['text_color_black'], styles['width_20%']]}>{translate('sku')}</Text>
                <Text style={[styles['text_color_black']]}>: {selectedItem.sku}</Text>
              </View>
              {/* <Text style={[styles['text_color_black'], styles['margin_top_5']]}>Category : Cash Transfer UPI Payment</Text> */}

              <View style={[styles['flex_direction_row'], styles['margin_top_15']]}>
                <Text style={[styles['text_color_black']]}>{translate('qty')}</Text>
                <View style={[styles['bg_light_grey_color'], styles['margin_left_15'], styles['width_70'], styles['height_28'], styles['border_radius_15'], styles['flex_direction_row'], styles['space_between'], styles['padding_4']]}>
                  <View style={[styles['bg_white'], styles['width_20'], styles['height_20'], styles['border_radius_50']]}>
                    <Text style={[styles['text_color_black'], styles['centerItems']]}>-</Text>
                  </View>
                  <Text style={[styles['text_color_black']]}>{selectedItem.quantity}</Text>
                  <View style={[styles['bg_white'], styles['width_20'], styles['height_20'], styles['border_radius_50']]}>
                    <Text style={[styles['text_color_black'], styles['centerItems']]}>+</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles['flex_direction_row'], styles['space_evenly'], styles['margin_top_30']]}>
              <View style={[styles['width_40%']]}>
                <TouchableOpacity style={[styles['width_100%'], styles['border_radius_8'], styles['centerItems'], styles['button_height_45'], styles['border_width_1'], styles['border_color_red']]} onPress={() => { cartBtnPress() }} >
                  <Text style={[styles['font_size_14_semibold'], { color: Colors.red }]}>
                    {translate('add_to_cart')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles['width_40%']]}>
                <TouchableOpacity style={[styles['width_100%'], styles['border_radius_8'], styles['centerItems'], styles['button_height_45'], styles['bg_red']]} onPress={() => { redeemBtnPress() }}>
                  <Text style={[styles['font_size_14_semibold'], { color: Colors.white }]}>
                    {translate('redeem')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles['margin_top_30']]}></View>
          </View>
        </View>
      </View>
    )
  }

  const getRedeemCountApiCall = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait'))

        var getURL = configs.BASE_URL + configs.REDEEM.REDEEM_COUNT;


        var getHeaders = await GetApiHeaders();
        var dataList = {
          "retailerId": getHeaders.userId,
          "mobileNumber": getHeaders.mobileNumber
        }
        console.log('url is', getURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getURL, getHeaders, dataList);
        console.log('redeem count response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
            }, 300);
            console.log('the Redeem count Resp is', JSON.stringify(APIResponse))
            setTotalAvailablePoints(APIResponse.response.TotalBalancePoints)
            setTotalCartPoints(APIResponse.response.AddCartCount)
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

  const getRedeemApiCall = async (page) => {
    const networkStatus = await getNetworkStatus();
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getCartUrl = configs.BASE_URL + configs.REDEEM.REDEEM_GET_MASTER;
        var getHeaders = await GetApiHeaders();



        var dataList = {
          page: page,
          itemsPerPage: "10"
        }
        console.log('what is reposee22', getCartUrl)
        console.log('what is reposee33', getHeaders)
        console.log('what is reposee44', dataList)

        var APIResponse = await PostRequest(getCartUrl, getHeaders, dataList);
        if (APIResponse != undefined && APIResponse != null) {
          console.log('what is reposee111', APIResponse)
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 200);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
            }, 300);
            // var response = APIResponse.response.redeemCartList;
            // var list = APIResponse.response.redeemCartList.map((obj) => {
            //     return {
            //         ...obj, isSelected: false
            //     }
            // })
            console.log('what is reposee redeem 123', APIResponse.response.redeemCartList)
            setRedeemData(APIResponse.response.redeemCartList)
            setFilterRedeemData(APIResponse.response.redeemCartList)
            setRedeemDataSelected(APIResponse.response.redeemCartList)
            setDataAPI(APIResponse?.response)
            console.log('DataAPI is:', dataAPI.count)
            // console.log('what is actual resp',response.redeemCartList)
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
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const redeemApiCall = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait'))

        var getURL = configs.BASE_URL + configs.REDEEM.REDEEM_CARTPOINTS;

        console.log('cart data is', redeemData)

        var getHeaders = await GetApiHeaders();
        var dataList = {
          catelogueList: redeemData
        }
        console.log('url is', getURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getURL, getHeaders, dataList);
        console.log('redeem response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            console.log('the Redeem Resp is', APIResponse)
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('redeem_successfully'))
            }, 700);

            setTimeout(() => {
              getRedeemApiCall(currentPage);
              getRedeemCountApiCall();
              setSuccessLoading(false)
              setSuccessLoadingMessage()
            }, 1500);

            setTimeout(() => {
              setShowFilterSelectionModal(false)
            }, 2000);
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
  const addCartApiCall = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait'))

        var getURL = configs.BASE_URL + configs.REDEEM.REDEEM_ADDCART;

        console.log('cart data iskkk', redeemData)

        var getHeaders = await GetApiHeaders();
        var dataList = {
          catelogueList: redeemData
        }

        console.log('url is', getURL)
        console.log('getHeaders is', getHeaders)
        console.log('dataList is', dataList)

        var APIResponse = await PostRequest(getURL, getHeaders, dataList);
        console.log('addcat response is:', APIResponse)
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            console.log('the addcart Resp is', APIResponse)
            setTimeout(() => {
              setLoading(false)
              setSuccessLoading(true)
              setSuccessLoadingMessage(translate('added_successfully'))
            }, 700);

            setTimeout(() => {
              setSuccessLoading(false)
              setSuccessLoadingMessage()
            }, 1500);

            setTimeout(() => {
              navigation.navigate('Cart')
            }, 2000);
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
  const onSelectClick = () => {
    unSelectAllItems()
    setTotalSelectedItems(0)
    setSelectTrueFalse(!selectTrueFalse)
    setSelectDeSelectAllTrueFalse(false)
    setSelectCountTrueFalse(!selectCountTrueFalse)

  }
  // const onSelectAllClick = () => {
  //   setSelectTrueFalse(true)
  //   setSelectDeSelectAllTrueFalse(false)
  //   const RedeemArray = [...filterRedeemData];
  //   for (let i = 0; i < RedeemArray.length; i++) {
  //     RedeemArray[i].redeemStatus = true
  //   }
  //   setTotalSelectedItems(RedeemArray.length)
  //   setFilterRedeemData(RedeemArray)
  // }

  const onSelectDeSelectAllClick = () => {
    // setSelectDeSelectAllTrueFalse(!selectDeSelectAllTrueFalse)
    // setSelectTrueFalse(false)
    // const RedeemArray = [...filterRedeemData];
    // for (let i = 0; i < RedeemArray.length; i++) {
    //   RedeemArray[i].redeemStatus = false
    // }
    // setTotalSelectedItems(0)
    // setFilterRedeemData(RedeemArray)
    setSelectTrueFalse(false)
    setSelectDeSelectAllTrueFalse(!selectDeSelectAllTrueFalse)
    setSelectCountTrueFalse(!selectCountTrueFalse)
    const RedeemArray = [...filterRedeemData];
    for (let i = 0; i < RedeemArray.length; i++) {
      RedeemArray[i].redeemStatus = !RedeemArray[i].redeemStatus
    }
    setTotalSelectedItems(RedeemArray.length)
    setFilterRedeemData(RedeemArray)
  }

  return (
    <View style={[styles['full_screen']]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

      <View style={[styles['margin_top'], (Platform.OS == 'ios' ? styles['padding_top_30'] : styles['']), styles['border_bottom_left_radius_25'], styles['border_bottom_right_radius_25'], { backgroundColor: dynamicStyles.primaryColor }]}>
        <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_10'], styles['width_80%']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_10'], { tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: Platform.OS == 'ios' ? 10 : 10 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], { marginTop: 5 }]}>{translate('rewards_catalogue')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[(Platform.OS == 'ios' ? { top: 45 } : styles['padding_top_20']), styles['absolute_position'], styles['right_20'], styles['align_self_flex_end']]} onPress={() => { onCartButtonClick() }}>
          <Image style={[styles['margin_left_20'], styles['width_height_25'], { tintColor: dynamicStyles.secondaryColor }]} source={require('../assets/images/cartIcon.png')}></Image>
        </TouchableOpacity>

        {
          (totalCartPoints != undefined && totalCartPoints != null && totalCartPoints != "") &&
          <View style={[{ backgroundColor: Colors.green, borderRadius: totalCartPoints != undefined && totalCartPoints != null && totalCartPoints.toString().length > 2 ? 15 : 10, position: 'absolute', top: totalCartPoints != undefined && totalCartPoints != null && totalCartPoints.toString().length > 2 ? 10 : 20, end: 0, width: totalCartPoints != undefined && totalCartPoints != null && totalCartPoints.toString().length > 2 ? 30 : 20, height: totalCartPoints != undefined && totalCartPoints != null && totalCartPoints.toString().length > 2 ? 30 : 20, alignContent: 'center', justifyContent: 'center', marginTop: Platform.OS == 'ios' ? 20 : 0, right: 11 }]}>
            <Text
              style={[{ color: Colors.black }, styles['font_size_11_semibold'], styles['text_align_center']]}>
              {totalCartPoints != undefined ? totalCartPoints : ""}
            </Text>
          </View>
        }


        <View style={[styles['centerItems'], styles['margin_5'], styles['flex_direction_row']]}>
          <Image style={[styles['width_height_70']]} source={require('../assets/images/goldStar.png')}></Image>
          <View style={[styles['centerItems'], styles['margin_10'], styles['flex_direction_column']]}>
            <Text style={[styles['font_size_50_semibold'], styles['text_color_white']]}>{totalAvailablePoints}</Text>
            <Text style={[styles['font_size_17_regular'], styles['text_color_white']]}>{translate('totalPoints')}</Text>
          </View>
        </View>
      </View>



      <View style={[styles['margin_10']]}>

        <View style={[styles['flex_direction_row'], styles['space_between'], styles['margin_top_15'], styles['width_98%'], styles['centerItems']]}>

          {/* SEARCH BAR */}
          {showSearch == true ?
            <View style={[styles['flex_direction_row'], styles['bg_white'], styles['border_radius_normal'], styles['height_45'], styles['border_width_1'], styles['align_end'], styles['border_color_light_grey'], { right: 0, top: 0, width: '85%' }, styles['centerItems']]}>
              <TouchableOpacity style={[styles['centerItems']]}
                onPress={() => {
                  if (searchText != "") {
                    Keyboard.dismiss();
                  }
                  setSearchText('')
                  setFilterRedeemData(redeemDataSelected)
                }}>
                <Image style={[styles['width_height_15'], styles['centerItems'], { tintColor: "#C0C1C1" }]}
                  source={(searchText == '') ? require('../assets/images/searchGray.png') : require('../assets/images/close.png')} />
              </TouchableOpacity>

              <TextInput
                value={searchText}
                onChangeText={(search) => {
                  setSearchText(search)
                  setTimeout(() => {
                    if (search == "") {
                      setSearchText('')
                      setFilterRedeemData(redeemDataSelected)
                    } else {
                      filterSearch()
                    }
                  }, 200);
                }}
                placeholder={translate('search')}
                placeholderTextColor={Colors.darkgrey}
                style={[styles['width_90%'], styles['font_size_14_regular'], styles['text_color_black'], styles['height_45'], { paddingLeft: 5 }]} />
            </View>
            :
            <View style={[styles['flex_direction_row'], styles['space_between']]}>
              <View style={[styles['width_15%']]}>
                <TouchableOpacity style={[styles['width_100%'], styles['border_radius_10'], styles['centerItems'], styles['button_height_45'], (allSelected == true ? styles['bg_Orange'] : styles['bg_white']), (allSelected == true ? undefined : styles['border_width_1']), (allSelected == true ? undefined : styles['border_color_light_grey'])]} onPress={() => { allBtnPress() }} >
                  <Text style={[styles['font_size_14_semibold'], allSelected == true ? styles['text_color_white'] : styles['text_color_black']]}>
                    {translate('all')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles['width_28%']]}>
                <TouchableOpacity style={[styles['width_100%'], styles['border_radius_10'], styles['centerItems'], styles['button_height_45'], (productSelected == true ? styles['bg_Orange'] : styles['bg_white']), (productSelected == true ? undefined : styles['border_width_1']), (productSelected == true ? undefined : styles['border_color_light_grey'])]} onPress={() => { productsBtnPress() }} >
                  <Text style={[styles['font_size_14_semibold'], productSelected == true ? styles['text_color_white'] : styles['text_color_black']]}>
                    {translate('products')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles['width_28%']]}>
                <TouchableOpacity style={[styles['width_100%'], styles['border_radius_10'], styles['centerItems'], styles['button_height_45'], (voucherSelected == true ? styles['bg_Orange'] : styles['bg_white']), (voucherSelected == true ? undefined : styles['border_width_1']), (voucherSelected == true ? undefined : styles['border_color_light_grey'])]} onPress={() => { vouchersBtnPress() }}>
                  <Text style={[styles['font_size_14_semibold'], voucherSelected == true ? styles['text_color_white'] : styles['text_color_black']]}>
                    {translate('vouchers')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles['width_10%']]}>
                <TouchableOpacity style={[styles['width_height_45'], styles['bg_themeRed'], styles['border_radius_10'], styles['centerItems']]} onPress={() => { searchOpenButtonClick() }}>
                  <Image style={[styles['width_height_15'], styles['tint_color_white'], styles['centerItems']]} resizeMode='stretch' source={require('../assets/images/search.png')}></Image>
                </TouchableOpacity>
              </View>
            </View>
          }

          <View style={[styles['left_5'], styles['width_10%']]}>
            <TouchableOpacity style={[styles['width_height_45'], styles['bg_themeRed'], styles['border_radius_10'], styles['centerItems']]} onPress={() => { searchCloseButtonClick() }}>
              <Image style={[styles['width_height_15'], styles['tint_color_white'], styles['centerItems']]} resizeMode='stretch' source={require('../assets/images/filterSeason.png')}></Image>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <View style={[styles['flex_direction_row'], styles['left_10'], styles['width_95%']]}>
        <TouchableOpacity style={[styles['flex_direction_row'], { height: 45, width: '30%', padding: 5, marginTop: 5 }]} onPress={() => {
          onSelectClick()
        }}>
          <View style={[styles['flex_direction_row']]}>
            <Image style={[{ height: 15, width: 15, }]} source={selectTrueFalse == true ? require('../assets/images/selectRadio_1.png') : require('../assets/images/selectRadio.png')} />
            <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['margin_left_10'], styles['text_align_center']]}>{translate('select')}</Text>
          </View>
        </TouchableOpacity>


        <View style={[styles['flex_direction_row'], styles['width_100%']]}>
          {!selectTrueFalse &&
            <TouchableOpacity style={[styles['flex_direction_row'], { height: 45, width: '30%', padding: 5, marginTop: 5 }]} onPress={() => {
              onSelectDeSelectAllClick()
            }}>
              <View style={[styles['flex_direction_row']]}>
                <Image style={[{ height: 15, width: 15, }]} source={selectDeSelectAllTrueFalse == true ? require('../assets/images/selectRadio_1.png') : require('../assets/images/selectRadio.png')} />
                <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['margin_left_10'], styles['text_align_center']]}>{selectDeSelectAllTrueFalse == false ? translate('selectALl') : translate('deSelectAll')}</Text>
              </View>
            </TouchableOpacity>
          }
          {selectCountTrueFalse &&
            <View style={[styles['flex_direction_row'], styles['justify_content_flex_end'], { height: 45, width: '40%', padding: 5, marginTop: 5, right: 10 }]}>
              <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['margin_left_10'], styles['text_align_center']]}>{translate('selectedCount')}</Text>
              <Text style={[styles['font_size_14_regular'], styles['text_color_red'], styles['left_5'], styles['text_align_center']]}>{totalSelectedItems}</Text>
            </View>
          }
        </View>
      </View>


      {/* <View style={[styles[''],]}> */}
      {filterRedeemData.length > 0 ?
        (
          <View style={{ height: Dimensions.get('window').height * 0.5 }}>
            <FlatList
              data={filterRedeemData}
              renderItem={({ item, index }) => renderItem(item, index)}
              keyExtractor={(item, index) => index.toString()}
              style={[styles['align_self_center']]}
              numColumns={2}
            />
          </View>
        )
        :
        (
          <View>
            <Text style={[styles['text_color_black'], styles['centerItems'], styles['margin_top_100']]}>{translate('no_data_available')}</Text>
          </View>
        )
      }
      {/* </View> */}

      <View style={[styles['width_100%'], { bottom: Platform.OS === 'android' ? -Dimensions.get('window').height * 0.035 : 100 }]}>
        {(selectTrueFalse || selectDeSelectAllTrueFalse) &&
          <View style={[styles['flex_direction_row'], styles['space_evenly'], styles['margin_top_10']]}>
            <View style={[styles['width_40%']]}>
              <TouchableOpacity style={[styles['width_100%'], styles['border_radius_8'], styles['centerItems'], styles['button_height_45'], styles['border_width_1'], styles['border_color_red'], styles['bg_white']]} onPress={() => { cartBtnPress() }} >
                <Text style={[styles['font_size_14_semibold'], { color: Colors.red }]}>
                  {translate('add_to_cart')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles['width_40%']]}>
              <TouchableOpacity style={[styles['width_100%'], styles['border_radius_8'], styles['centerItems'], styles['button_height_45'], styles['bg_red']]} onPress={() => { redeemBtnPress() }}>
                <Text style={[styles['font_size_14_semibold'], { color: Colors.white }]}>
                  {translate('redeem')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        {currentPage && dataAPI && filterRedeemData.length >= 10 &&
          <View style={[styles['margin_bottom_10'], styles['align_self_center'], styles['centerItems'], !selectTrueFalse || !selectDeSelectAllTrueFalse || { marginTop: 50 }]}>
            <CustomPaginationFunctional
              selectedIndex={currentPage}
              pageItemArray={filterRedeemData}
              onpressIndexClicked={(index) => {
                if (dataAPI?.count && (index <= Math.ceil(dataAPI.count / 10))) {
                  setSelectTrueFalse(false)
                  setSelectDeSelectAllTrueFalse(false)
                  setSelectCountTrueFalse(false)
                  setCurrentPage(index);
                  getRedeemApiCall(index)

                }
              }}
              pgHeight={40}
              itemsPerPage={dataAPI?.count ? Math.ceil((dataAPI.count / 10)) : 1}
              itemBackgroundColor={'#B58A37'}
              pgWidth={'85%'}
            />
          </View>
        }
      </View>


      {showFilterSelectionModal == true &&
        showFilterSection()
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
  );
}
export default Redeem;