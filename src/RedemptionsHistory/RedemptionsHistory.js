import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, Keyboard, TouchableOpacity, FlatList, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { useNavigation } from '@react-navigation/native';
import CustomButton from "../Components/CustomButton";
import CustomCalanderSelection from "../Components/CustomCalanderSelection";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import SimpleToast from 'react-native-simple-toast';
import moment from 'moment';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomPaginationFunctional from '../Components/CustomPaginationFunctional';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import CustomBorderInputDropDown from '../Components/CustomBorderInputDropDown';
import CustomListViewModal from '../Modals/CustomListViewModal';
import { MOBILE_NUMBER, retrieveData, ROLENAME } from '../assets/Utils/Utils';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
import RedemptionHistoryFilterModal from './RedemptionHistoryFilterModal';
// import Rewards from './Rewards';


var styles = BuildStyleOverwrite(Styles);
function RedemptionsHistory() {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const navigation = useNavigation()
    const [fromDate, setFromDate] = useState(null);
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/mcrc_loader.gif'))
    const [toDate, setToDate] = useState(null);
    const [isSelectingFromDate, setIsSelectingFromDate] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setDatePicker] = useState(null);
    const [dataAPI, setDataAPI] = useState(null);
    const [dataForSearchCopy, setDataForSearchCopy] = useState(null);
    const [searchApiHit, setSearchApiHit] = useState(false);
    const [data, setData] = useState(null);
    const [itemTotalCount, setItemTotalCount] = useState(null);
    const [dataCopy, setDataCopy] = useState(0);
    const [minimumDate, setMinDate] = useState('');
    const [maximumDate, setMaxDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1)
    const [showAlert, setShowAlert] = useState(false)
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertHeader, setShowAlertHeader] = useState(false)
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
    const [showAlertYesButton, setShowAlertYesButton] = useState(false)
    const [showAlertNoButton, setShowAlertNoButton] = useState(false)
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
    const [dataUpdated, setDataUpdated] = useState(false)
    const [dropDownData, setdropDownData] = useState();
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [company, setCompany] = useState('')
    const [companyList, setCompanyList] = useState()
    const [companiesList, setCompaniesList] = useState([])
    const [companyName, setCompanyName] = useState([])
    const [companyId, setCompanyId] = useState([])
    const networkStatus = useSelector(state => state.networkStatus.value);
    const [scannedCompanyList, setScannedCompanyList] = useState([]);
    const [companyCode, setCompanyCode] = useState(null);
    const getUserData = useSelector(selectUser);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);

    const [showFilterModal, setShowFilterModal] = useState(false);

    useEffect(() => { GetRedemptionHistory(currentPage), fromDate, toDate }, [])

    // useEffect(() => {
    //     GetCompaniesList()
    // }, [data])

    const { height: deviceHeight } = Dimensions.get("window");

    // Decide FlatList height dynamically
    const getFlatListHeight = (hasPagination) => {
        if (hasPagination) {
            // 70% of screen height if pagination is visible
            return deviceHeight * 0.65;
        }
        // 80% of screen height if no pagination
        return deviceHeight * 0.70;
    };

    const GetRedemptionHistory = async (page, fromDate, toDate) => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var redemptionHistoryURL = configs.BASE_URL + configs.REDEMPTION.REDEMPTION_HISTORY;
                var getHeaders = await GetApiHeaders();
                console.log('headersRedemptionHistory', getHeaders)

                console.log(fromDate, "FROM_DATE");

                var dataList = {
                    page: page,
                    itemsPerPage: "10",
                    toDate: toDate != undefined && toDate != null ? moment(toDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : "",
                    fromDate: fromDate != undefined && fromDate != null ? moment(fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : ""
                }

                var APIResponse = await PostRequest(redemptionHistoryURL, getHeaders, dataList);
                console.log(APIResponse)
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        console.log('8484848', JSON.stringify(APIResponse?.response?.cartList))
                        console.log('totalCart Count', JSON.stringify(APIResponse?.response?.count))
                        setData(APIResponse?.response?.cartList)
                        setItemTotalCount(APIResponse?.response?.count | 0)
                        setDataCopy(APIResponse?.response?.cartList)
                        setDataAPI(APIResponse?.response)
                        setDataUpdated(false)
                        setDataUpdated(true)
                        if (dataForSearchCopy && dataForSearchCopy?.length > 0) {
                            const array = [...dataForSearchCopy, ...APIResponse?.response?.cartList]
                            const uniqueArray = array.reduce((accumulator, currentValue) => {
                                if (!accumulator.includes(currentValue)) {
                                    accumulator.push(currentValue);
                                }
                                return accumulator;
                            }, []);
                            setDataForSearchCopy(uniqueArray)
                        }
                        else {
                            setDataForSearchCopy(APIResponse?.response?.cartList)
                        }
                        // }
                        setTimeout(() => {
                            setLoading(false)
                        }, 1000);
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
                }, 1000);
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }
    }

    const GetCompaniesList = async () => {
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var header = await GetApiHeaders();
                const mobileNumber = await retrieveData(MOBILE_NUMBER)
                var input = {
                    "mobileNumber": mobileNumber
                }

                var url = configs.BASE_URL + configs.QRSCAN.GET_RETAILER_REDEMPTION_COMPANYS_DETAILS;

                console.log("URL =>", url, " Headers =>", header, " Input =>", input);
                var apiResponse = await PostRequest(url, header, input);
                setTimeout(() => {
                    setLoading(false)
                    setLoadingMessage("")
                }, 500);
                const response = apiResponse.response;
                const scannedCompanyListResp = response?.CompanyList;
                setScannedCompanyList(scannedCompanyListResp)
                console.log("GET_RETAILER_COUPON_SCANNED_COMPANYS_DETAILS responseeessss", JSON.stringify(apiResponse));
                const names = scannedCompanyListResp.map((company) => company.name);
                const ids = scannedCompanyListResp.map((company) => company.id);
                setCompanyName(names);
                setCompanyId(ids);
                if (scannedCompanyListResp.length > 0) {
                    setScannedCompanyList(scannedCompanyListResp);
                }
            } catch (error) {

            }
        }
    }

    const searchBackend = async (search) => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var redemptionHistorySearchURL = configs.BASE_URL + configs.REDEMPTION.REDEMPTION_HISTORY_SEARCH.replace('{search}', search);
                var getHeaders = await GetApiHeaders();
                var APIResponse = await GetRequest(redemptionHistorySearchURL, getHeaders);
                setSearchApiHit(true)
                console.log(APIResponse)
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        if (APIResponse?.response) {
                            setData(APIResponse?.response)
                            setDataCopy(APIResponse?.response)
                            setDataAPI(APIResponse?.response)
                            setDataForSearchCopy(APIResponse?.response)
                            setDataUpdated(false)
                            setDataUpdated(true)
                        }
                        setTimeout(() => {
                            setLoading(false)
                        }, 1000);
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
                    // setSuccessLoadingMessage(error.message)
                }, 1000);
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

    const onSelectedCompanyNameItem = (itemdata) => {
        if (itemdata != null) {
            setCompanyId(itemdata?.id)
            setCompanyName(itemdata?.name)
            setCompanyCode(itemdata?.companyCode);
            setShowDropDowns(false)
        }
    }

    const goBack = async () => {
        const roleTypeDetails = await retrieveData(ROLENAME)
        if (roleTypeDetails) {
            let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard' : 'Dashboard'
            navigation.navigate(navigateTo)
        }
        // navigation.navigate('Dashboard')
    };

    // const submitButtonPress = async () => {
    //     var header = await GetApiHeaders();
    //     var input = {
    //         seasonName: seasonName,
    //         fromDate: moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
    //         toDate: moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
    //         page: 1
    //     };

    //     var url = configs.BASE_URL + configs.QRSCAN.SCAN_HISTORY;

    //     console.log("URL =>", url, " Headers =>", header, " Input =>", input);
    //     var apiResponse = await PostRequest(url, header, input);
    //     setScanHistoryData(apiResponse?.response)
    //     console.log(apiResponse);
    // }
    const handleConfirm = (date) => {

        var selectedDateNew = moment(date).format('DD-MM-YYYY');
        console.log('newDate', moment(date).format('DD-MM-YYYY'))

        if (isSelectingFromDate) {
            setFromDate(selectedDateNew);
            setToDate("")
        }

        else {
            if (moment(selectedDateNew, 'DD-MM-YYYY').isBefore(moment(fromDate, 'DD-MM-YYYY'))) {
                setTimeout(() => {
                    SimpleToast.show(translate('toDateGreaterThanFromDate'));
                }, 150);
            } else {
                setToDate(selectedDateNew);
            }
        }
        setIsSelectingFromDate(null);
        setDatePicker(null);
    }
    useEffect(() => { console.log(fromDate, toDate, moment(fromDate, "DD-MM-YYYY").toISOString(), new Date()) }, [fromDate, toDate, showDatePicker])

    const openFromDatePicker = () => {
        console.log("Open Calender");
        // var minDate = '';
        const minDate = new Date();
        minDate.setMonth(minDate.getMonth() - 432);
        setMinDate(minDate)
        setMaxDate(new Date())
        setIsSelectingFromDate(true);
        // Set selected date: either fromDate (converted to Date) or today
        setDatePicker(
            fromDate
                ? moment(fromDate, "DD-MM-YYYY").toDate() // Convert to JS Date
                : new Date() // Today
        );
        // setDatePicker(fromDate ? moment(fromDate, "DD-MM-YYYY").toISOString() : moment(new Date(Date.now() - (24 * 60 * 60 * 1000))))
    };
    const openToDatePicker = () => {
        if (fromDate) {
            console.log('close calendar')
            var minDate = '';
            minDate = new Date();
            minDate.setMonth(minDate.getMonth() - 432);
            setMinDate(new Date(minDate))
            setMaxDate(new Date())
            setIsSelectingFromDate(false);
            setDatePicker(toDate ? moment(toDate, "DD-MM-YYYY").toISOString() : moment())
        } else {
            SimpleToast.show(translate('pleaseSelectFromDate'))
        }
    }
    const handleCancel = () => {
        setDatePicker(null)
    }
    const handleOkAlert = () => {
        setShowAlert(false)
    }
    const handleCancelAlert = () => {
        setShowAlert(false)
    }

    const filterDataByDateRange = () => {
        setTimeout(() => {
            GetRedemptionHistory(1, fromDate, toDate)
        }, 150);
    }

    const searchFilter = (text) => {
        const newData = dataForSearchCopy?.filter(item => {
            const orderNumber = item?.orderNumber?.toLowerCase();
            const searchTextLower = text?.toLowerCase();
            return orderNumber.includes(searchTextLower);
        });
        setData(newData);
        if (newData && newData?.length > 0) {

        } else {
            if (text.length > 4) {
                searchBackend(text)
            }
        }
    };
    const handleEmpty = () => {
        return <Text>No data present!</Text>;
    };

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    useEffect(() => { if (dataAPI) { console.log('485948911', data) } }, [data])
    const renderDetails = (item, index) => {

        return (
            <View style={[styles['flex_direction_row'], styles['margin_top_10'], styles['shadow_box'], styles['border_radius_8'], styles['bg_white'], styles['padding_top_10'], styles['widht_%'], styles['align_self_center'], styles["centerItems"], { marginBottom: (index + 1 == data.length) ? 10 : 0 }]}>
                {/* <View style={[]}>
                    <Image source={{ uri: item.productImage }} style={[styles['width_height_100'], styles['centerItems'],]} resizeMode="contain" />
                </View> */}
                <View style={[styles['centerItems'], styles['padding_3']]}>
                    <View style={[styles['flex_direction_row'], styles["centerItems"]]}>
                        <Text style={[{ color: dynamicStyles.textColor }, { width: '30%' }]}>{translate('voucherName')}</Text><Text style={[styles["width_2"]]}> : </Text><Text style={[styles['text_color_black'], { width: '65%' }]}>{item.productName}</Text>
                    </View>
                    <View style={[styles['margin_top_5'], styles['flex_direction_row'], styles["align_self_center"]]}>
                        <Text style={[{ color: dynamicStyles.textColor }, { width: '30%' }]}>{translate('qty')}</Text><Text style={[styles["width_2"]]}> : </Text><Text style={[styles['text_color_black'], { width: '65%' }]}>{item.quantity}</Text>
                    </View>
                    <View style={[styles['margin_top_5'], styles['flex_direction_row'], styles["align_self_center"]]}>
                        <Text style={[{ color: dynamicStyles.textColor }, { width: '30%' }]}>{translate('totalPoints')}</Text><Text style={[styles["width_2"]]}> : </Text><Text style={[styles['text_color_black'], { width: '65%' }]}>{item.redeemPoints}</Text>
                    </View>
                    <View style={[styles['margin_top_5'], styles['flex_direction_row'], styles["align_self_center"]]}>
                        <Text style={[{ color: dynamicStyles.textColor }, { width: '30%' }]}>{translate('transactionId')}</Text><Text style={[styles["width_2"]]}> : </Text><Text style={[styles['text_color_black'], { width: '65%' }]}>{item.transactionId}</Text>
                    </View>
                    <View style={[styles['margin_top_5'], styles['flex_direction_row'], styles["align_self_center"]]}>
                        <Text style={[{ color: dynamicStyles.textColor }, { width: '30%' }]}>{translate('transaction_date')}</Text><Text style={[styles["width_2"]]}> : </Text><Text style={[styles['text_color_black'], { width: '65%' }]}>{item.redeemDate}</Text>
                    </View>
                    <View style={[styles['margin_top_5'], styles['flex_direction_row'], styles["align_self_center"]]}>
                        <Text style={[{ color: dynamicStyles.textColor }, { width: '30%' }]}>{translate('order_no')}</Text><Text style={[styles["width_2"]]}> : </Text><Text style={[styles['text_color_black'], { width: '65%' }]}>{item.orderNumber}</Text>
                    </View>
                    <View style={[styles['margin_top_5'], styles['flex_direction_row'], styles["align_self_center"], { paddingBottom: 5 }]}>
                        <Text style={[{ color: dynamicStyles.textColor }, { width: '30%' }]}>{translate('status')}</Text><Text style={[styles["width_2"]]}> : </Text><Text style={[item.status ? styles['text_color_green'] : styles['text_color_red'], { width: '65%' }]}>{item.status ? item.status : ''}</Text>
                    </View>
                </View>
            </View>
        );
    }
    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            <View style={[styles['full_screen'], styles['bg_white']]}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

                <View style={[{ backgroundColor: dynamicStyles.primaryColor },
                {
                    paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10,
                    paddingTop: Platform.OS == 'ios' ? 20 : 20, flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center'
                }]}>
                    <TouchableOpacity style={[styles['flex_direction_row'],
                    { backgroundColor: dynamicStyles.primaryColor }]} onPress={() => { goBack() }}>
                        <Image style={[styles[''], styles[''], { tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                        <Text style={[styles['margin_left_10'], styles[''], styles[''], styles['font_size_18_bold'], { color: dynamicStyles.secondaryColor }]}>{translate('redemptions_history')}</Text>
                    </TouchableOpacity>
                    <View style={[styles['flex_direction_row'], styles['space_between']]}>
                        <TouchableOpacity onPress={() => {
                            if (networkStatus) {
                                setSearchText("")
                                setSearchApiHit(false)
                                setCurrentPage(1)
                                GetRedemptionHistory(1)
                            } else {
                                SimpleToast.show(translate('no_internet_conneccted'));
                            }
                        }}>
                            <Image style={[{ tintColor: Colors.white, height: 25, width: 25, marginEnd: 10 }]} source={require('../assets/images/dataRefresh.png')} resizeMode='contain'></Image>
                        </TouchableOpacity>
                        {<TouchableOpacity onPress={() => {
                            setShowFilterModal(true)
                            setFromDate(null)
                            setToDate(null)
                        }}>
                            <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 20, width: 20, top: 5 }]} source={require('../assets/images/ic_filter_gc.png')}></Image>
                        </TouchableOpacity>}
                    </View>


                </View>

                <View style={[styles['margin_5']]}>
                    <View style={[styles['height_60'], styles['bg_white'], styles['border_radius_8']]}>
                        <View style={[styles['flex_direction_row'], styles['bg_white'], styles['border_radius_normal'], styles['height_40'], styles['border_width_1'], styles['align_end'], styles['border_color_light_grey'], { right: 0, top: 20, width: '95%' }, styles['centerItems']]}>
                            <TouchableOpacity style={[styles['centerItems']]}
                                onPress={() => {
                                    if (searchText != "") {
                                        Keyboard.dismiss();
                                    }
                                    setSearchText('')
                                    setSearchApiHit(false)
                                    setCurrentPage(1)
                                    GetRedemptionHistory(1)
                                }}>

                                <Image style={[styles['width_height_20'], styles['centerItems'], { tintColor: "#C0C1C1" }]}
                                    source={(searchText == '') ? require('../assets/images/searchGray.png') : require('../assets/images/close.png')} />

                            </TouchableOpacity>
                            <TextInput
                                value={searchText}
                                onChangeText={(search) => {
                                    console.log(3)
                                    setSearchText(search)
                                    if (search != '') {
                                        console.log(1)
                                        setTimeout(() => {
                                            searchFilter(search)
                                        }, 200);
                                    } else if (searchApiHit) {
                                        console.log(2)
                                        setSearchApiHit(false)
                                        setCurrentPage(1)
                                        GetRedemptionHistory(1)
                                    }
                                }}
                                onEndEditing={() => {
                                    if (searchText == '') {
                                        setSearchApiHit(false)
                                        setCurrentPage(1)
                                        GetRedemptionHistory(1)
                                    }
                                }}
                                placeholder={translate('searchByOrderId')}
                                placeholderTextColor={Colors.darkgrey}
                                style={[styles['width_91%'], styles['font_size_14_regular'], { color: dynamicStyles.textColor }, styles['height_45'], { paddingLeft: 5 }]} />
                            {/* <TouchableOpacity style={[styles['']]} onPress={() => { setFromDate(null); setToDate(null); setData(dataCopy) }}>
                            <Image resizeMode='contain' style={[styles['width_height_20']]} source={require('../assets/images/filterSeason.png')}></Image>
                        </TouchableOpacity> */}
                        </View>
                        {/* <View style={[styles['margin_top_30']]}>
                    <CustomBorderInputDropDown
                        width={[{width:'92%'}, styles['centerItems']]}
                        defaultValue={companyName != undefined && companyName != translate('select') ? companyName : translate('select')}
                        IsRequired={true}
                        placeholder={translate('select_company')}
                        onEndEditing={async event => {
                            // calculateTotalOrderValue()
                        }}
                        onFocus={() => {
                           changeDropDownData(scannedCompanyList, strings.company, companyName)
                        }}
                    />
                    </View> */}
                    </View>
                    {/* <View style={[styles['height_160'], styles['bg_white'], styles['border_radius_8'], styles['margin_top_15']]}>
                        <View style={[styles['flex_direction_row'], styles['flexGrow_1'], styles['space_between'], styles['width_100%'], styles['top_10'], styles['margin_bottom_10'], styles['padding_horizontal_20']]}>
                            <CustomCalanderSelection
                                placeholder={translate('select')}
                                width={[styles['width_45%']]}
                                defaultValue={fromDate}
                                labelName={translate('from_Date')}
                                IsRequired={true}
                                onEndEditing={event => { }}
                                onFocus={() => { openFromDatePicker() }}
                            />

                            <CustomCalanderSelection
                                placeholder={translate('select')}
                                width={[styles['width_45%']]}
                                defaultValue={toDate}
                                labelName={translate('to_date')}
                                IsRequired={true}
                                onEndEditing={event => { }}
                                onFocus={() => { openToDatePicker() }}
                            />
                        </View>

                        <CustomButton title={translate('submit')} onPress={() => {
                            if (fromDate && toDate) {

                                filterDataByDateRange(fromDate, toDate)
                            }
                            else {
                                if (!fromDate || fromDate == "") {
                                    SimpleToast.show(translate('pleaseSelectFromDate'))
                                }
                                else if (!toDate || toDate == "") {
                                    SimpleToast.show(translate('pleaseSelectToDate'))
                                }
                            }

                        }
                        } buttonBg={dynamicStyles.primaryColor} btnWidth={"90%"} titleTextColor={dynamicStyles.secondaryColor} />
                    </View> */}
                    <View style={[styles['bg_white'], styles['border_radius_8'], styles['margin_top_10']]}>
                        <View style={[styles['margin_horizontal_10']]}>
                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_bold'], styles['margin_top_10']]}>{translate('orders')}</Text>
                            <View style={[styles['border_bottom_width_1'], styles['border_color_light_grey'], styles['margin_top_10 ']]}></View>
                            {(data && data?.length > 0) && (
                                <View style={[{ height: getFlatListHeight(itemTotalCount != null && itemTotalCount > 10) }]}>
                                    <FlatList
                                        style={{ flexGrow: 0 }}
                                        ListEmptyComponent={handleEmpty}
                                        data={data}
                                        renderItem={({ item, index }) => renderDetails(item, index)}
                                        keyExtractor={(item, index) => index.toString()}
                                        ItemSeparatorComponent={<View style={[styles['height_10']]}></View>}
                                    />
                                </View>
                            )}
                            {(!data || data?.length <= 0) && (
                                <View>
                                    <Text style={[styles['text_color_black'], styles['centerItems'], styles['margin_top_100'], {lineHeight : Platform.OS == 'android' ? 40 : 25}]}>{translate('no_orders_found')}</Text>
                                </View>
                            )}
                        </View>

                        {itemTotalCount != null && itemTotalCount > 10 &&
                            <View style={[{ width: '100%', borderRadius: 8, height: 60  }]}>
                                {dataUpdated && currentPage &&
                                    <CustomPaginationFunctional
                                        selectedIndex={currentPage}
                                        pageItemArray={data}
                                        onpressIndexClicked={(index) => { if (dataAPI?.count && (index <= Math.ceil(dataAPI.count / 10))) { setCurrentPage(index); GetRedemptionHistory(index) } }}
                                        pgHeight={40}
                                        itemsPerPage={dataAPI?.count ? Math.ceil((dataAPI.count / 10)) : 1}
                                        itemBackgroundColor={'#B58A37'}
                                        pgWidth={'100%'}
                                    />
                                }
                            </View>}

                    </View>




                </View>
                {showDatePicker &&
                    (
                        <DateTimePickerModal
                            isVisible={true}
                            mode="date"
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                            is24Hour={false}
                            date={new Date(showDatePicker)}
                            onConfirm={(date) => { handleConfirm(date) }}
                            onCancel={() => { handleCancel() }}
                        />
                    )
                }
                {
                    showDropDowns &&
                    <CustomListViewModal
                        dropDownType={dropDownType}
                        listItems={dropDownData}
                        selectedItem={selectedDropDownItem}
                        onSelectedStatus={(item) => { setPostStatus(item.name); setShowDropDowns(false); }}
                        onSelectedCompanyName={(item) => { onSelectedCompanyNameItem(item) }}
                        closeModal={() => setShowDropDowns(false)} />
                }

                {
                    showAlert &&
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
                }
                {showFilterModal &&
                    <RedemptionHistoryFilterModal
                        isVisible={showFilterModal}
                        onClose={() => { setShowFilterModal(false) }}
                        fromDate={fromDate}
                        toDate={toDate}
                        dynamicStyles={dynamicStyles}
                        onFromDatePress={() => { openFromDatePicker() }}
                        onToDatePress={() => { openToDatePicker() }}
                        onApplyPress={() => {
                            if (fromDate && toDate) {
                                setShowFilterModal(false)
                                filterDataByDateRange(fromDate, toDate)
                            }
                            else {
                                if (!fromDate || fromDate == "") {
                                    SimpleToast.show(translate('pleaseSelectFromDate'))
                                }
                                else if (!toDate || toDate == "") {
                                    SimpleToast.show(translate('pleaseSelectToDate'))
                                }
                            }

                        }}
                        onClearPress={() => {
                            setFromDate(null);
                            setToDate(null);
                            // setShowFilterModal(false)
                            // setCurrentPage(1)
                            // GetRedemptionHistory(1)
                        }}
                    />
                }
                {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            </View>
        </SafeAreaView>

    );
}


export default RedemptionsHistory;