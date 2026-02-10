import React, { useEffect, useMemo, useState } from "react";
import { Styles } from "../assets/style/styles";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import { View, Image, Text, TouchableOpacity, FlatList, ScrollView, Modal, Platform, StatusBar } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors } from "../assets/Utils/Color";
import { strings } from "../strings/strings";
import CustomInputDropDown from "../Components/CustomInputDropDown";
import CustomButton from "../Components/CustomButton";
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus } from "../NetworkUtils/NetworkUtils";
import SimpleToast from "react-native-simple-toast";
import CustomLoader from "../Components/CustomLoader";
import CustomSuccessLoader from "../Components/CustomSuccessLoader";
import CustomErrorLoader from "../Components/CustomErrorLoader";
import { HTTP_OK, configs } from "../helpers/URLConstants";
import CustomListViewModal from "../Modals/CustomListViewModal";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { useSelector } from "react-redux";
import CustomSearchListViewModal from "../Modals/CustomSearchListViewModal";
import { filterObjects, filterArrayOfObjects2, filterArrayOfObjects3 } from "../assets/Utils/Utils";
import CustomCalanderSelection from "../Components/CustomCalanderSelection";
import { translate } from "../Localisation/Localisation";
import { createStyles } from "../assets/style/createStyles";

var styles = BuildStyleOverwrite(Styles);

const records_per_page = 10;

function EmployeeScanHistory({ route }) {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const navigation = useNavigation();
    const [totalPoints, setTotalPoints] = useState('0');
    const roleID = route?.params?.roleid;
    const [loading, setLoading] = useState(false)
    const [successLoading, setSuccessLoading] = useState(false)
    const [errorLoading, setErrorLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/vm_loader.gif'))
    const networkStatus = useSelector(state => state.networkStatus.value)
    const [dropDownData, setdropDownData] = useState();
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    //Search
    const [dropDownDataSearch, setdropDownDataSearch] = useState();
    const [showDropDownsSearch, setShowDropDownsSearch] = useState(false)
    const [dropDownTypeSearch, setDropDownTypeSearch] = useState("");
    const [selectedDropDownItemSearch, setSelectedDropDownItemSearch] = useState("");

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setDatePicker] = useState(false);
    const [minimumDate, setMinDate] = useState();
    const [maximumDate, setMaxDate] = useState();
    const [scanHistoryData, setScanHistoryData] = useState([])
    const [scanHistoryDataDummy, setScanHistoryDataDummy] = useState([])
    const [seasonMasterMain, setSeasonMasterMain] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isSelectingFromDate, setIsSelectingFromDate] = useState(true);
    const [showCouponDetails, setShowCouponDetails] = useState(false)
    const [numberOfRecords, setNumberOfRecords] = useState(0);
    const [numberOfPages, setNumberOfPages] = useState(0);
    const [itemClicked, setItemClicked] = useState({})
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [filterOld, setFilterOld] = useState(true)
    const [filterNew, setFilterNew] = useState(false)
    const [pagesArray, setPagesArray] = useState([])
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [showCropData, setShowCropData] = useState(true)
    const [showProductData, setShowProductData] = useState(false)
    const [showScanData, setShowScanData] = useState(false)
    const [cropHistoryData, setCropHistoryData] = useState([])
    const [productsHistoryData, setProductsHistoryData] = useState([])
    const [cropName, setCropName] = useState('')
    const [cropId, setCropId] = useState('')
    const [productName, setProductName] = useState('')
    const [productId, setProductId] = useState('')
    const [bonusPoints, setBonusPoints] = useState(0)
    const [productItem, setProductItem] = useState({})
    const [zoneSelected, setZoneSelected] = useState('')
    const [zoneSelectedId, setZoneSelectedId] = useState(0)
    const [regionSelected, setRegionSelected] = useState('')
    const [regionSelectedId, setRegionSelectedId] = useState(0)
    const [territorySelected, setTerritorySelected] = useState('')
    const [territorySelectedId, setTerritorySelectedId] = useState(0)
    const [headquarterSelected, setHeadquarterSelected] = useState('')
    const [headquarterSelectedId, setHeadquarterSelectedId] = useState(0)
    const [retailerSelected, setRetailerSelected] = useState('')
    const [retailerSelectedId, setRetailerSelectedId] = useState(0)
    const [seasonSelected, setSeasonSelected] = useState('')
    const [seasonSelectedId, setSeasonSelectedId] = useState(0)
    const [yearSelected, setYearSelected] = useState('')
    const [yearSelectedId, setYearSelectedId] = useState(0)
    const [dropDownMaster, setDropDownMaster] = useState([]);
    const [zoneMaster, setZoneMaster] = useState([]);
    const [regionMaster, setRegionMaster] = useState([]);
    const [territoryMaster, setTerritoryMaster] = useState([]);
    const [headQuarterMaster, setHeadQuarterMaster] = useState([]);
    const [retailerMaster, setRetailerMaster] = useState([]);
    const [seasonMaster, setSeasonMaster] = useState([]);
    const [yearMaster, setYearMaster] = useState([]);

    const [regionMasterOriginal, setRegionMasterOriginal] = useState([]);
    const [territoryMasterOriginal, setTerritoryMasterOriginal] = useState([]);
    const [headQuarterMasterOriginal, setHeadQuarterMasterOriginal] = useState([]);
    const [activeRetilerCount, setActiveRetilerCount] = useState('');
    const [signUpBonusPoints, setSignUpBonusPoints] = useState(0)
    const [key, setKey] = useState(1);

    useEffect(() => {

        if (seasonMaster.length == 1) {
            setSeasonSelected(seasonMaster[0].name)
            setSeasonSelectedId(seasonMaster[0].id);
        }
    }, [seasonMaster])

    useEffect(() => {

        if (yearMaster.length == 1) {
            setYearSelected(yearMaster[0].name)
            setYearSelectedId(yearMaster[0].id);
        }
    }, [yearMaster])

    useEffect(() => {

        zoneFilterSingle()

    }, [zoneMaster])

    useEffect(() => {

        regionFilterSingle()

    }, [regionMaster])

    useEffect(() => {

    }, [numberOfPages, pagesArray])
    useEffect(() => {

        territoryFilterSingle()

    }, [territoryMaster])

    useEffect(() => {

        if (headQuarterMaster != undefined && headQuarterMaster != null) {
            if (headQuarterMaster.length == 1) {
                setHeadquarterSelected(headQuarterMaster[0].name);
                setHeadquarterSelectedId(headQuarterMaster[0].id);
            }
        }
    }, [headQuarterMaster])

    const zoneFilterSingle = async () => {
        if (zoneMaster != undefined && zoneMaster != null) {
            if (zoneMaster.length == 1) {
                setZoneSelected(zoneMaster[0].name);
                setZoneSelectedId(zoneMaster[0].id);
                var filterList = await filterObjects(regionMasterOriginal, "zoneId", zoneMaster[0].id)
                console.log("Region", filterList)
                setRegionMaster(filterList)
            }
        }
    }

    const regionFilterSingle = async () => {
        if (regionMaster != undefined && regionMaster != null) {
            if (regionMaster.length == 1) {
                setRegionSelected(regionMaster[0].name)
                setRegionSelectedId(regionMaster[0].id);
                var filterList = await filterArrayOfObjects2(territoryMasterOriginal, "regionId", regionMaster[0].id, "zoneId", zoneSelectedId)
                console.log("terrytory", filterList)
                setTerritoryMaster(filterList)
            }
        }
    }

    const territoryFilterSingle = async () => {
        if (territoryMaster != undefined && territoryMaster != null) {
            if (territoryMaster.length == 1) {
                setTerritorySelected(territoryMaster[0].name)
                setTerritorySelectedId(territoryMaster[0].id);
                var filterList = await filterArrayOfObjects3(headQuarterMasterOriginal, "regionId", regionSelectedId, "territoryId", territoryMaster[0].id, "zoneId", zoneSelectedId)
                setHeadQuarterMaster(filterList)
            }
        }
    }

    useEffect(() => {

    }, [selectedPageIndex])

    useFocusEffect(
        React.useCallback(() => {
            handleFocus();
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [])
    );

    useEffect(() => {

        console.log("showCropData", showCropData)
        console.log("showProductData", showProductData)
        console.log("showScanData", showScanData)

    }, [showCropData, showProductData, showScanData])

    const handleFocus = () => {
        console.log('Screen is focused!');
        if (networkStatus) {
            getSeasonMaster();
        }
    };

    useEffect(() => {
        getDropdownMasters();
    }, [])


    const goBack = async () => {
        navigation.goBack()
    };

    const getDropdownMasters = async () => {
        var networkStatus = await getNetworkStatus()

        if (networkStatus) {
            try {
                setLoading(true);
                setLoadingMessage(translate('please_wait_getting_data'))

                var getloginURL = configs.BASE_URL + configs.QRSCAN.DROPDOWNS_MASTERS;
                var getHeaders = await GetApiHeaders();

                var dataList = {
                    "zoneId": zoneSelectedId,
                    "regionId": regionSelectedId,
                    "territoryId": territorySelectedId,
                    "hqId": headquarterSelectedId,
                    "roleId": roleID
                }
                console.log('url is', getloginURL)
                console.log('getHeaders is', getHeaders)
                console.log('dataList is11', dataList)

                var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
                console.log('the dropdown Resp is001', JSON.stringify(APIResponse))
                if (APIResponse.statusCode == HTTP_OK) {

                    console.log('the dropdown Resp is :', APIResponse.response)
                    //GetNotificationDetailsApiCall()      
                    setDropDownMaster(APIResponse.response)

                    setRegionMasterOriginal(APIResponse.response.regions)
                    setTerritoryMasterOriginal(APIResponse.response.territory)
                    setHeadQuarterMasterOriginal(APIResponse.response.headQuarters)
                    // setRetailerMaster(APIResponse.response.retailers)  // commented by kiran t
                    setSeasonMaster(APIResponse.response.seasons)
                    setYearMaster(APIResponse.response.years)
                    setZoneMaster(APIResponse.response.zones)
                    setLoading(false)
                    setLoadingMessage('')
                }


                submitButtonPress(1)

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

    // const getRetailersMasters = async () => {
    //     var networkStatus = await getNetworkStatus()

    //     if (networkStatus) {
    //         try {
    //             setLoading(true);
    //             setLoadingMessage(translate('please_wait_getting_data'))

    //             var getloginURL = configs.BASE_URL + configs.QRSCAN.RETAILERS_MASTERS;
    //             var getHeaders = await GetApiHeaders();

    //             var dataList = {
    //                 // "zoneId": zoneSelectedId,
    //                 // "regionId": regionSelectedId,
    //                 // "territoryId": territorySelectedId,
    //                 // "hqId": headquarterSelectedId,
    //                 "roleId": roleID,
    //                 "page":1
    //             }
    //             console.log('url is', getloginURL)
    //             console.log('getHeaders is', getHeaders)
    //             console.log('dataList is11', dataList)

    //             var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
    //             console.log('the dropdown Resp is001', JSON.stringify(APIResponse))
    //             if (APIResponse.statusCode == HTTP_OK) {

    //                 console.log('the dropdown Resp is :', APIResponse.response)

    //                 setRetailerMaster(APIResponse.response)
    //                 setLoading(false);
    //                 setLoadingMessage("")
    //             }

    //         } catch (error) {
    //             setTimeout(() => {
    //                 setLoading(false)
    //                 setSuccessLoadingMessage(error.message)
    //             }, 1000);
    //         }
    //     } else {
    //         SimpleToast.show(translate('no_internet_conneccted'))
    //     }
    // }


    const getSeasonMaster = async () => {
        if (networkStatus) {
            try {
                // setTimeout(() => {
                //     setLoading(true)
                //     setLoadingMessage(translate('please_wait_getting_data'))
                // }, 100);

                var seasonMasterUrl = configs.BASE_URL + configs.MASTERS.FILTER_SEASON;
                var getHeaders = await GetApiHeaders();
                var APIResponse = await GetRequest(seasonMasterUrl, getHeaders);
                // submitButtonPress(1)
                if (APIResponse != undefined && APIResponse != null) {
                    // setTimeout(() => {
                    //     setLoadingMessage()
                    //     setLoading(false)
                    // }, 200);
                    if (APIResponse.statusCode == HTTP_OK) {
                        // setTimeout(() => {
                        //     setLoading(false)
                        // }, 300);
                        var response = APIResponse.response
                        var data = response?.seasonList
                        setSeasonMasterMain(data)
                    }
                    else {
                        SimpleToast.show(APIResponse.message)
                    }
                } else {
                    setTimeout(() => {
                        // setLoading(false)
                        // setLoadingMessage()
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

    const submitButtonPress = async (pageNo) => {
        setTimeout(() => {
            setLoading(true);
            setLoadingMessage(translate('please_wait_getting_data'));
        }, 50);

        const header = await GetApiHeaders();
        const input = {
            userId: header?.userId,
            seasonId: seasonSelectedId,
            zoneId: zoneSelectedId,
            regionId: regionSelectedId,
            territoryId: territorySelectedId,
            headQuarterId: headquarterSelectedId,
            retailerId: retailerSelectedId,
            yearId: yearSelectedId,
            fromDate: fromDate ? moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
            toDate: toDate ? moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
        };

        const url = `${configs.BASE_URL}${configs.QRSCAN.SCAN_HISTORY_EMPLOYEE}`;

        console.log("URL =>", url, " Headers =>", header, " Input =>", input);
        const apiResponse = await PostRequest(url, header, input);

        setLoading(false);
        setLoadingMessage("");
        setCropHistoryData(apiResponse?.response?.scanHistory);
        // console.log("SAINATH_REDDY", JSON.stringify(apiResponse));
        setTotalPoints(apiResponse?.response?.totalCashbackEarnedPoints);
        setActiveRetilerCount(apiResponse?.response?.activeRetailers);
        setShowScanData(false);
        setShowProductData(false);
        setShowCropData(true);
        setNumberOfRecords(apiResponse?.response?.count);

        const total_pages = Math.ceil(apiResponse?.response?.count / records_per_page);
        const pagesAr = generateIntegerArray(total_pages);
        setBonusPoints(apiResponse?.response?.bonusPoints);
        setSignUpBonusPoints(apiResponse?.response?.signUpBonusPoints);
        setPagesArray(pagesAr);
        setNumberOfPages(total_pages);
        setKey(prevKey => prevKey + 1);  // Update key to force re-render
        console.log("pagesAr", pagesAr, "--", total_pages);

        setTimeout(() => {
            setLoading(false);
            setLoadingMessage("");
        }, 1000);
    };


    function generateIntegerArray(n) {
        const result = [];
        for (let i = 1; i <= n; i++) {
            result.push(i);
        }
        return result;
    }

    async function getProductsScanned(item) {
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var header = await GetApiHeaders();
                var input = {
                    "userId": header?.userId,
                    "seasonId": seasonSelectedId,
                    "zoneId": zoneSelectedId,
                    "regionId": regionSelectedId,
                    "territoryId": territorySelectedId,
                    "headQuarterId": headquarterSelectedId,
                    "retailerId": retailerSelectedId,
                    "yearId": yearSelectedId,
                    "cropName": item?.cropName,
                    "cropId": item?.cropId,
                    "fromDate": fromDate != undefined && fromDate != "" ? moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                    "toDate": toDate != undefined && toDate != "" ? moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                };

                var url = configs.BASE_URL + configs.QRSCAN.SCANNED_PRODUCTS_EMPLOYEE;

                var apiResponse = await PostRequest(url, header, input);
                setLoading(false)
                setLoadingMessage("")
                console.log("SAINATH", JSON.stringify(apiResponse));
                setNumberOfRecords(apiResponse?.response?.count)
                setProductsHistoryData(apiResponse?.response?.scanHistory)
                setShowCropData(false)
                setShowProductData(true)
                setLoading(false)
                setLoadingMessage('')

            } catch (error) {

            }
        }
    }

    async function getScannedHistory(item, page) {
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var header = await GetApiHeaders();
                var input = {
                    "userId": header?.userId,
                    "seasonId": seasonSelectedId,
                    "zoneId": zoneSelectedId,
                    "regionId": regionSelectedId,
                    "territoryId": territorySelectedId,
                    "headQuarterId": headquarterSelectedId,
                    "retailerId": retailerSelectedId,
                    "yearId": yearSelectedId,
                    "productName": item?.productName,
                    "cropId": cropId,
                    "itemsPerPage": 10,
                    "page": page,
                    "productId": item?.productId,
                    "fromDate": fromDate != undefined && fromDate != "" ? moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                    "toDate": toDate != undefined && toDate != "" ? moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                };
                console.log("SAINATH_PROducts", JSON.stringify(apiResponse));

                var url = configs.BASE_URL + configs.QRSCAN.SCAN_HIS_BY_PRODUCTS_EMPLOYEE;

                var apiResponse = await PostRequest(url, header, input);
                setLoading(false)
                setLoadingMessage("")
                console.log("SAINATH_PROducts", JSON.stringify(apiResponse));
                setNumberOfRecords(apiResponse?.response?.count)
                setScanHistoryData(apiResponse?.response?.scanHistory)
                setScanHistoryDataDummy(apiResponse?.response?.scanHistory)
                setShowCropData(false)
                setShowProductData(false)
                setShowScanData(true)
                setLoading(false)
                setLoadingMessage('')
                const total_pages = Math.ceil(apiResponse?.response?.count / records_per_page);
                const pagesAr = generateIntegerArray(total_pages)
                setPagesArray(pagesAr)
                setNumberOfPages(total_pages)
                setKey(prevKey => prevKey + 1);
            } catch (error) {

            }
        }
    }

    function renderScanHistory(item, index) {
        return (
            <TouchableOpacity style={[{ height: 50, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => {
                setShowCouponDetails(true);
                setItemClicked(item)
            }}>
                <View style={[styles['centerItems'], { width: '15%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{(((selectedPageIndex + 1) - 1) * 10) + index + 1}</Text>
                </View>
                {!showScanData && <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_semibold'], { color: '#00881E' }]}>{item?.productName}</Text>
                </View>}
                <View style={[styles['centerItems'], { width: showScanData ? '50%' : '35%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item?.couponCode}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%' }]}>
                    {/* <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item?.pointsEarned}</Text> */}
                    <Text style={[(item?.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? styles['text_color_green'] : styles['text_color_red']), styles['font_size_13_semibold'], styles['text_align_center']]}>{item.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? " + " + item.pointsEarned : item.pointsEarned == 0 ? item.pointsEarned : " - " + item.pointsEarned}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    function renderProductsItems(item, index) {
        return (
            <TouchableOpacity style={[{ height: 50, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => {
                setProductId(item.productId)
                setProductName(item.productName)
                getScannedHistory(item, 1)
                setProductItem(item)
            }}>
                <View style={[styles['centerItems'], { width: '15%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_semibold'], { color: '#00881E' }]}>{item.productName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '35%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item.noOfBagsScanned}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item.pointsEarned}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    function renderCropHistoryItem(item, index) {
        return (
            <TouchableOpacity style={[{ height: 50, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => {
                // setShowCropData(false)
                // setShowProductData(true)
                setCropName(item.cropName)
                setCropId(item.cropId)
                getProductsScanned(item)
            }}>
                <View style={[styles['centerItems'], { width: '15%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_semibold'], { color: '#00881E' }]}>{item.cropName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '35%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item.noOfBagsScanned}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item.pointsEarned}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    // Old Design
    // const renderScanHistoryItem = (item, index) => {
    //     if (!item || !item.scanDate) {
    //         return null;
    //     }
    //     // const [datePart, timePart] = item.scanDate.split('T');
    //     const formattedDate = moment(item.scanDate).format("Do MMM")
    //     const formattedTime = moment(item.scanDate, 'HH:mm:ss').format('h:mm A');

    //     return (
    //         <TouchableOpacity style={[{ borderWidth: 0.5, borderRadius: 5, borderColor: Colors.lightish_grey }]} onPress={() => {
    //             setShowCouponDetails(true);
    //             setItemClicked(item)
    //         }} key={index.toString()}>
    //             <View style={[styles['flex_direction_row'], styles['width_95%'], styles['padding_5']]}>
    //                 <View style={[styles['border_width_1'], styles['padding_5'], styles['border_color_lightish_grey'], { height: 40, width: 40 }]}>
    //                     <Image source={require('../assets/images/ic_coin.png')} style={[styles['width_height_30'],]} />
    //                 </View>
    //                 <View style={[styles['margin_left_10'], { width: '65%' }]}>
    //                     <Text style={[styles['text_color_black']]}>{item.productName}</Text>
    //                     <Text style={[styles['text_color_grey']]}>{formattedDate}</Text>
    //                 </View>
    //                 <View style={[styles['margin_left_10'], styles['centerItems'], {}]}>
    //                     <Text style={[(item.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? styles['text_color_green'] : styles['text_color_red']), styles['font_size_14_bold'], styles['text_align_center']]}>{item.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? " + " + item.rewardedPoints : " - " + item.rewardedPoints}</Text>
    //                 </View>
    //                 <Image source={require('../assets/images/ic_forward.png')} style={[styles['width_height_15'], styles['align_self_center'], styles['margin_left_10'], { tintColor: Colors.lightish_grey }]} />
    //             </View>
    //         </TouchableOpacity>
    //     )
    // }

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    const changeSearchDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDownsSearch(true);
        setdropDownDataSearch(dropDownData);
        setDropDownTypeSearch(type);
        setSelectedDropDownItemSearch(selectedItem);
    }

    // const onSelectedSeasonItem = (itemdata) => {
    //     if (itemdata != null) {
    //         setSeasonId(itemdata?.id)
    //         setSeasonName(itemdata?.name)
    //         setShowDropDowns(false)
    //     }
    // }



    const onSelectedSeason = async (itemdata) => {
        if (itemdata != null) {
            setSeasonSelectedId(itemdata?.id)
            setSeasonSelected(itemdata?.name)
            setShowDropDowns(false)
        }
    }
    const onSelectedYear = async (itemdata) => {
        var year = new Date().getFullYear();
        if (itemdata != null) {
            if (year == itemdata?.name) {
                setYearSelectedId(itemdata?.id)
                setYearSelected(itemdata?.name)
                setShowDropDowns(false)
            }
            else {
                setShowDropDowns(false)
                setTimeout(() => {
                    SimpleToast.show(translate('selectCurrentYear'));
                }, 150);
            }
        }
    }

    const onSelectedZone = async (itemdata) => {
        if (itemdata != null) {
            setZoneSelectedId(itemdata?.id)
            setZoneSelected(itemdata?.name)
            setShowDropDowns(false)
            setRetailerSelected(translate('select'))
            setRetailerSelectedId("-1")
            setRegionSelected(translate('selectRegion'))
            setRegionSelectedId(0);
            setRegionMaster([])
            setTerritorySelected(translate('selectTerritory'))
            setTerritorySelectedId(0);
            setTerritoryMaster([])
            setHeadquarterSelected(translate('selectHeadquarter'))
            setHeadquarterSelectedId(0);
            setHeadQuarterMaster([])
            console.log('the filter data is region001')
            setTimeout(async () => {
                if (itemdata?.id == 0) {
                    var filterList = regionMasterOriginal
                    // if (filterList.length != 0) {
                    //     filterList = [{ name: "All", id: 0 }, ...filterList]
                    // }
                    setRegionMaster(filterList)
                }
                else {
                    var filterList = await filterObjects(regionMasterOriginal, "zoneId", itemdata?.id)
                    // if (filterList.length != 0) {
                    //     filterList.unshift({ name: "All", id: 0 });
                    // }
                    setRegionMaster(filterList)
                }
            }, 500);
        }
    }

    const onSelectedRegion = async (itemdata) => {
        if (itemdata != null) {
            setRetailerSelected(translate('select'))
            setRetailerSelectedId("-1")
            setRegionSelectedId(itemdata?.id)
            setRegionSelected(itemdata?.name)
            setShowDropDowns(false)
            setTerritorySelected(translate('selectTerritory'))
            setTerritorySelectedId(0);
            setTerritoryMaster([])
            setHeadquarterSelected(translate('selectHeadquarter'))
            setHeadquarterSelectedId(0);
            setHeadQuarterMaster([])
            setTimeout(async () => {
                if (itemdata?.id == 0) {
                    var filterList = territoryMasterOriginal
                    setTerritoryMaster(filterList)
                }
                else {
                    var filterList = await filterArrayOfObjects2(territoryMasterOriginal, "regionId", itemdata?.id, "zoneId", zoneSelectedId)
                    setTerritoryMaster(filterList)
                }
            }, 500);
        }
    }
    const onSelectedTerritory = async (itemdata) => {
        if (itemdata != null) {
            setRetailerSelected(translate('select'))
            setRetailerSelectedId("-1")
            setTerritorySelectedId(itemdata?.id)
            setTerritorySelected(itemdata?.name)
            setShowDropDowns(false)
            setHeadquarterSelected(translate('selectHeadquarter'))
            setHeadquarterSelectedId(0);
            setHeadQuarterMaster([])
            setTimeout(async () => {
                if (itemdata?.id == 0) {
                    var filterList = headQuarterMasterOriginal
                    setHeadQuarterMaster(filterList)
                }
                else {
                    var filterList = await filterArrayOfObjects3(headQuarterMasterOriginal, "regionId", regionSelectedId, "territoryId", itemdata?.id, "zoneId", zoneSelectedId)
                    setHeadQuarterMaster(filterList)
                }
            }, 500);
        }
    }
    const onSelectedHeadquarter = async (itemdata) => {
        setRetailerSelected(translate('select'))
        setRetailerSelectedId("-1")
        if (itemdata != null) {
            setHeadquarterSelectedId(itemdata?.id)
            setHeadquarterSelected(itemdata?.name)
            setShowDropDowns(false)
        }
    }
    const onSelectedRetailerName = async (itemdata) => {
        if (itemdata != null) {
            setRetailerSelectedId(itemdata?.id)
            setRetailerSelected(itemdata?.name)
            setShowDropDownsSearch(false)
        }
    }

    const openFromDatePicker = () => {
        console.log("Open Calender");
        var minDate = '';
        minDate = new Date();
        minDate.setMonth(minDate.getMonth() - 432);
        setMinDate(new Date(minDate))
        setMaxDate(new Date())
        setIsSelectingFromDate(true);
        setDatePicker(true)
    };

    const openToDatePicker = () => {
        var minDate = '';
        minDate = new Date();
        minDate.setMonth(minDate.getMonth() - 432);
        setMinDate(new Date(minDate))
        setMaxDate(new Date())
        setIsSelectingFromDate(false);
        setDatePicker(true)
    }

    const onpressIndexClicked = (index) => {
        let newIndex = index + 1;
        var fromIndex = (newIndex - 1) * 10
        var toIndex = (newIndex * 10) - 1

        var filteredArr = pagesArray.filter(function (item, newIndex) {
            return newIndex >= fromIndex && newIndex <= toIndex
        })
        setSelectedPageIndex(index);
        setPagesArray(filteredArr);

    }


    const handleConfirm = (date) => {
        var selectedDate = moment(date).format('DD-MM-YYYY');

        if (isSelectingFromDate) {
            setFromDate(selectedDate);
            setToDate("")
        } else {
            if (moment(selectedDate, 'DD-MM-YYYY').isBefore(moment(fromDate, 'DD-MM-YYYY'))) {
                SimpleToast.show(translate('toDateAfterFromDate'));
                setDatePicker(false);
                return;
            }
            setToDate(selectedDate);
        }

        setDatePicker(false);
    }

    const handleCancel = () => {
        setDatePicker(false)
    }

    const onPressOldtoNew = () => {
        setFilterNew(false)
        setFilterOld(true)
        sortFilterData(translate('oldtoNew'))
    }

    const onPressNewtoOld = () => {
        setFilterNew(true)
        setFilterOld(false)
        sortFilterData(translate('newtoOld'))
    }

    const nextPage = () => {
        if (selectedPageIndex < pagesArray.length - 1) {
            if (showScanData) {
                setSelectedPageIndex((prevIndex) => prevIndex + 1);
                getScannedHistory(productItem, selectedPageIndex + 2)
            }
        }

    }
    const previousPage = () => {
        if (selectedPageIndex > 0) {
            if (showScanData) {
                setSelectedPageIndex(selectedPageIndex - 1)
                getScannedHistory(productItem, selectedPageIndex)
            }
            // setSelectedPageIndex(selectedPageIndex - 1)
            // submitButtonPress(selectedPageIndex)
        }
    }

    const sortFilterData = (filter) => {

        console.log('++++++++', scanHistoryDataDummy);
        if (filter == translate('oldtoNew')) {
            var sortedData = scanHistoryDataDummy.sort((a, b) => {
                return new Date(a.scanDate) - new Date(b.scanDate);
            });
            setScanHistoryData(sortedData)
        } else if (filter == translate('newtoOld')) {
            var sortedData = scanHistoryDataDummy.sort((a, b) => {
                return new Date(b.scanDate) - new Date(a.scanDate);
            });
            setScanHistoryData(sortedData)
        }
    }

    const showFilters = () => {
        return (
            <Modal animationType="slide"
                transparent={true}
                visible={showFilterModal}
                onRequestClose={() => setShowFilterModal(false)}>

                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.blackTransparent }}>
                    <View style={{ height: 75, width: 75, borderRadius: 40, backgroundColor: 'white', bottom: -55, alignSelf: 'center', padding: 10 }}>
                        <View style={[{ height: '100%', width: '100%', backgroundColor: "#D9D9D9", borderRadius: 40 }]}>
                        </View>
                    </View>
                    {console.log(itemClicked, "========> SAINATH")}
                    <View style={[{ borderTopRightRadius: 20, borderTopLeftRadius: 20, overflow: 'hidden', backgroundColor: 'white', height: 25 }]}>
                    </View>
                    <View style={[{ backgroundColor: 'white' }]}>
                        <View style={[{ borderRadius: 100, alignSelf: 'center' }]}>
                            <Text style={[styles['font_size_24_semibold'], { textAlign: 'center', color: 'black', padding: 2 }]}>{translate('filters')}</Text>
                        </View>
                        <View style={[{ height: 1, width: '90%', borderTopWidth: 1, marginTop: 5, marginBottom: 5, borderTopColor: Colors.very_light_grey, alignSelf: 'center' }]}></View>
                        <View style={[{ marginBottom: 25 }]}>
                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5, borderRadius: 8, borderWidth: 1, padding: 5, alignSelf: 'center', borderColor: Colors.very_light_grey }]}>
                                <TouchableOpacity style={[{ height: '100%', width: '100%', padding: 5 }, styles['flex_direction_row']]} onPress={() => {
                                    onPressOldtoNew()
                                    setTimeout(() => {
                                        setShowFilterModal(false)
                                    }, 150);
                                }}>
                                    <Image style={[{ height: 15, width: 15, }, styles['align_self_center']]} source={(filterOld && !filterNew) ? require('../assets/images/selectRadio_1.png') : require('../assets/images/selectRadio.png')} />
                                    <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['margin_left_20'], styles['text_align_center']]}>{translate('oldtoNew')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5, borderRadius: 8, borderWidth: 1, padding: 5, alignSelf: 'center', borderColor: Colors.very_light_grey }]}>
                                <TouchableOpacity style={[{ height: '100%', width: '100%', padding: 5 }, styles['flex_direction_row']]} onPress={() => {
                                    onPressNewtoOld()
                                    setTimeout(() => {
                                        setShowFilterModal(false)
                                    }, 150);
                                }}>
                                    <Image style={[{ height: 15, width: 15, }, styles['align_self_center']]} source={(!filterOld && filterNew) ? require('../assets/images/selectRadio_1.png') : require('../assets/images/selectRadio.png')} />
                                    <Text style={[styles['font_size_14_regular'], styles['text_color_black'], styles['margin_left_20'], styles['text_align_center']]}>{translate('newtoOld')}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </View>

            </Modal>
        )
    }

    const renderPageNumber = (item, index) => {
        return (
            <View style={[{ borderRadius: 25, borderWidth: 0.5, borderColor: Colors.very_light_grey, padding: 5, margin: 5, height: 30, width: 30, backgroundColor: selectedPageIndex == index ? Colors.themeRed : Colors.white }]}>
                <TouchableOpacity style={[{ height: '100%', width: '100%' }]} onPress={() => {
                    setSelectedPageIndex(index)
                    if (showScanData) {
                        getScannedHistory(productItem, index + 1)
                    }
                    // submitButtonPress(index + 1)
                }}>
                    <Text style={[{ textAlign: 'center', color: selectedPageIndex == index ? Colors.white : Colors.black }, styles['font_size_12_semibold']]}>{item}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const showCouponData = () => {
        const momentDate = moment(itemClicked?.scanDate, "YYYY-MM-DD HH:mm:ss.SSS");
        return (
            <Modal animationType="slide"
                transparent={true}
                visible={showCouponDetails}
                onRequestClose={() => setShowCouponDetails(false)}>
                {/* <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.blackTransparent }} onPress={() => setShowCouponDetails(false)}> */}
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.blackTransparent }}>
                    <View style={{ height: 75, width: 75, borderRadius: 40, backgroundColor: 'white', bottom: -55, alignSelf: 'center', padding: 10 }}>
                        <View style={[{ height: '100%', width: '100%', backgroundColor: "#D9D9D9", borderRadius: 40 }]}>
                        </View>
                    </View>
                    {console.log(itemClicked, "========> SAINATH")}
                    <View style={[{ borderTopRightRadius: 20, borderTopLeftRadius: 20, overflow: 'hidden', backgroundColor: 'white', height: 25 }]}>
                    </View>
                    <View style={[{ backgroundColor: 'white' }]}>
                        <View style={[{ height: 125, width: 125, backgroundColor: Colors.imageUploadBackColor, borderRadius: 100, alignSelf: 'center' }]}>
                            <Image source={require('../assets/images/ic_gift.png')} style={[{ height: '100%', width: '100%' }]} />
                        </View>
                        <TouchableOpacity style={[{ position: 'absolute', height: 20, width: 20, end: 0, marginEnd: 25 }]} onPress={() => { setShowCouponDetails(false) }}>
                            <Image style={[{ height: '100%', width: '100%' }]} source={require('../assets/images/ic_close_red.png')} />
                        </TouchableOpacity>
                        <View style={{ width: '80%', borderRadius: 15, padding: 10, backgroundColor: "#1ebb001f", alignSelf: 'center', marginTop: 10, marginBottom: 15 }}>
                            <View style={styles.flex_direction_row}>
                                <Image style={[styles.font_size_16_semibold, { height: 50, width: 50, padding: 10, alignSelf: 'flex-start' }]} source={itemClicked == undefined ? require('../assets/images/ic_default_scan.png') : { uri: itemClicked?.productImage }} resizeMode="contain" />
                                <View style={[styles['margin_left_15']]}>
                                    <Text style={[styles['font_size_14_regular'], { textAlign: 'center', color: 'black', padding: 2 }]}>{itemClicked?.brandName}</Text>
                                    <Text style={[styles['font_size_12_regular'], { textAlign: 'center', color: 'grey', padding: 2 }]}>{itemClicked?.productDescription + " | " + itemClicked?.packSize}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[{ height: 1, width: '90%', borderTopWidth: 1, marginTop: 5, marginBottom: 5, borderTopColor: Colors.very_light_grey, alignSelf: 'center' }]}></View>
                        <View style={[{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginBottom: 20 }]}>
                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{translate('coupon_id')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{itemClicked.couponCode}</Text>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{translate('transaction_id')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{itemClicked.tansactionId}</Text>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{translate('transaction_date')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{moment(momentDate).format("DD-MMM-YYYY")}</Text>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{translate('transaction_time')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{moment(momentDate).format('hh:mm A')}</Text>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{itemClicked.creditOrDebit == translate('credit') ? translate('credit_points') : translate('debit_points')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: itemClicked?.creditOrDebit == translate('credit') ? Colors.green : Colors.themeRed, padding: 2, width: '45%' }]}>{itemClicked?.creditOrDebit == translate('credit') ? "+ " + itemClicked?.pointsEarned : " - " + itemClicked?.pointsEarned}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    const checkPagesDisplying = () => {
        if (showScanData) {
            setShowScanData(false)
            setShowProductData(true)
            setShowCropData(false)
        } else if (showProductData && !showScanData) {
            setShowScanData(false)
            setShowProductData(false)
            setShowCropData(true)
        }
        setSelectedPageIndex(0)

        console.log("showScanData", showScanData, selectedPageIndex)
    }

    return (
        <View style={[styles['full_screen'], { backgroundColor: Colors.very_light_grey }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={Colors.themeRed} barStyle='dark-content' />}
            <View style={[styles['bg_themeRed'], { borderBottomEndRadius: 10, borderBottomStartRadius: 10, paddingTop: Platform.OS === 'ios' ? 60 : 0 }]}>
                <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_top_10']]} onPress={() => { goBack() }}>
                    <Image style={[styles['margin_left_20'], styles[''], styles['tint_color_white'], { height: 15, width: 20, top: Platform.OS == 'ios' ? 10 : 10 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], styles[''], styles['text_color_white'], styles[''], styles['font_size_18_bold'], { marginTop: 5 }]}>{translate('scan_history')}</Text>
                </TouchableOpacity>

                <View style={[styles['flex_direction_row'], styles['width_90%'], styles['height_80'], styles['bg_white'], styles['border_radius_10'], styles['centerItems'], { marginTop: 20, marginBottom: 10 }]}>
                    <View style={[{ width: '15%' }]}>
                        <Image style={[styles['width_height_50'], { marginRight: 25 }]} source={require('../assets/images/ic_cummulative.png')}></Image>
                    </View>
                    <View style={[styles['flex_direction_column'], styles['margin_left_20'], { width: '60%' }]}>
                        <Text style={[styles['font_size_16_bold'], styles['text_color_black'], styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_5']]}>{totalPoints}</Text>
                        <Text style={[styles['font_size_12_semibold'], styles['text_color_grey'], styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_5']]}>{translate('totalPoints') + " " + translate('EarnedTillDate')}</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={[{ marginTop: 5, marginBottom: numberOfPages > 1 ? 55 : 20, }]}>
                <View style={[{ padding: 10, width: '95%', backgroundColor: 'white', marginTop: 10 }, styles['centerItems'], styles['border_radius_8']]}>


                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={yearMaster.length == 1 ? yearMaster[0].name : yearSelected != undefined ? yearSelected : translate('selectYear')}
                        labelName={translate('year')}
                        IsRequired={false}
                        placeholder={translate('selectYear')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                yearMaster.length == 1 ? undefined
                                    : changeDropDownData(yearMaster, strings.year, yearSelected)
                            }
                        }}
                    />
                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={seasonMaster.length == 1 ? seasonMaster[0].name : seasonSelected != undefined ? seasonSelected : translate('select_season')}
                        labelName={translate('season')}
                        IsRequired={false}
                        placeholder={translate('select_season')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                seasonMaster.length == 1 ? undefined
                                    : changeDropDownData(seasonMaster, strings.season, seasonSelected)
                            }
                        }}
                    />
                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={zoneMaster.length == 1 ? zoneMaster[0].name : zoneSelected != undefined ? zoneSelected : translate('selectZone')}
                        labelName={translate('zone')}
                        IsRequired={false}
                        placeholder={translate('selectZone')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                zoneMaster.length == 1 ? undefined
                                    : changeDropDownData(zoneMaster, strings.zone, zoneSelected)
                            }
                        }}
                    />

                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={regionMaster.length == 1 ? regionMaster[0].name : regionSelected != undefined ? regionSelected : translate('selectRegion')}
                        labelName={translate('selectRegion')}
                        IsRequired={false}
                        placeholder={translate('selectRegion')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                regionMaster.length == 1 ? undefined
                                    : changeDropDownData(regionMaster, strings.selectRegion, regionSelected)
                            }
                        }}
                    />

                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={territoryMaster.length == 1 ? territoryMaster[0].name : territorySelected != undefined ? territorySelected : translate('selectTerritory')}
                        labelName={translate('selectTerritory')}
                        IsRequired={false}
                        placeholder={translate('selectTerritory')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                territoryMaster.length == 1 ? undefined
                                    : changeDropDownData(territoryMaster, strings.selectTerritory, territorySelected)
                            }
                        }}
                    />

                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={headQuarterMaster.length == 1 ? headQuarterMaster[0].name : headquarterSelected != undefined ? headquarterSelected : translate('selectHeadquarter')}
                        labelName={translate('selectHeadquarter')}
                        IsRequired={false}
                        placeholder={translate('selectHeadquarter')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                headQuarterMaster.length == 1 ? undefined
                                    : changeDropDownData(headQuarterMaster, strings.selectHeadquarter, headquarterSelected)
                            }
                        }}
                    />

                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={(retailerMaster != undefined && retailerMaster.length == 1) ? retailerMaster[0].name : retailerSelected != undefined ? retailerSelected : translate('selectRetailerName')}
                        labelName={translate('retailerName')}
                        IsRequired={false}
                        placeholder={translate('selectRetailerName')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                (retailerMaster != undefined && retailerMaster.length == 1) ? undefined
                                    : changeSearchDropDownData(retailerMaster, translate('retailerName'), retailerSelected)
                            }
                        }}
                    />

                    <View style={[styles['flex_direction_row'], styles['flexGrow_1'], styles['space_between'], styles['width_95%'], styles['top_5']]}>
                        <CustomCalanderSelection
                            width={{ width: '48%' }}
                            defaultValue={fromDate}
                            labelName={translate('from_Date')}
                            placeholder={translate('select')}
                            IsRequired={true}
                            onEndEditing={event => {
                            }}
                            onFocus={openFromDatePicker}
                        />

                        <CustomCalanderSelection
                            width={{ width: '48%' }}
                            defaultValue={toDate}
                            labelName={translate('to_date')}
                            placeholder={translate('select')}
                            IsRequired={true}
                            onEndEditing={event => {
                            }}
                            onFocus={openToDatePicker}
                        />
                    </View>
                    <View style={[{ height: 15 }]}>
                    </View>
                    <CustomButton title={translate('getDetails')} onPress={() => { submitButtonPress(1) }} buttonBg={Colors.themeRed} btnWidth={"95%"} titleTextColor={Colors.white} />
                </View>

                <View style={[styles['centerItems'], styles['top_20'], { height: '100%', width: '95%', }]}>
                    <View style={[{ height: '100%', width: '100%', backgroundColor: Colors.white, borderRadius: 8, padding: 5, paddingBottom: 25 }]}>
                        {showCropData && activeRetilerCount != "" &&
                            <View style={[{ height: 50, width: '50%', marginLeft: 15, flexDirection: 'row', justifyContent: 'space-between', top: 10 }]}>
                                <Text style={[styles['font_size_16_semibold'], styles['margin_left_10'], styles['text_color_black']]}>{translate('activeRetailers')}</Text>
                                <Text style={[styles['font_size_16_semibold'], styles['margin_left_5'], styles['text_color_black']]}>{activeRetilerCount}</Text>
                            </View>
                        }
                        {!showCropData &&
                            <View style={[{ height: 50, width: '100%', marginLeft: 15, flexDirection: 'row', justifyContent: 'space-between' }]}>
                                <TouchableOpacity style={[{ alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'row' }]} onPress={() => { checkPagesDisplying() }}>
                                    <Image style={[{ alignSelf: 'center', height: 15, width: 20, transform: [{ scaleX: -1 }], tintColor: 'black' }]} source={require('../assets/images/arrowLineWhite.png')} />
                                    <Text style={[styles['font_size_16_semibold'], styles['margin_left_10'], styles['text_color_black']]}>{translate('back')}</Text>
                                </TouchableOpacity>
                                <View style={[{ alignSelf: 'center' }]}>
                                    <Text style={[styles['font_size_13_semibold'], { textAlign: 'right', marginEnd: 50, color: '#00881E' }]}>{cropName}
                                        {showScanData && <Text style={[{ color: Colors.black }]}>{" -- "} <Text style={[styles['font_size_13_semibold'], { textAlign: 'right', marginEnd: 50, color: '#00881E' }]}>{productName}</Text></Text>}</Text>
                                </View>
                            </View>}

                        <View style={[{ borderRadius: 8, borderWidth: 0.5, borderColor: '#B4B4B4', overflow: 'hidden' }]}>
                            <View style={[{ height: 50, width: '100%', backgroundColor: '#E5E5E5', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                                <View style={[styles['centerItems'], { width: '15%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('sno')}</Text>
                                </View>
                                {!showScanData && <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{showCropData ? translate('crop') : translate('products')}</Text>
                                </View>}
                                <View style={[styles['centerItems'], { width: showScanData ? '50%' : '35%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{!showScanData ? translate('noofbagsScanned') : translate('couponCode')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('points')}</Text>
                                </View>
                            </View>

                            {/* cropHistoryData.length == 0 && productsHistoryData.length == 0 && scanHistoryData.length == 0 && */}
                            {showCropData ? (
                                ((cropHistoryData != undefined && cropHistoryData.length == 0)) &&
                                <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                                </View>
                            ) :
                                showProductData ? (
                                    ((productsHistoryData != undefined && productsHistoryData.length == 0)) &&
                                    <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                                    </View>
                                ) :
                                    showScanData ? (
                                        ((scanHistoryData != undefined && scanHistoryData.length == 0)) &&
                                        <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                            <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                                        </View>
                                    )
                                        :
                                        undefined
                            }
                            {showCropData ? (
                                <FlatList
                                    data={cropHistoryData != undefined ? cropHistoryData : []}
                                    renderItem={({ item, index }) => renderCropHistoryItem(item, index)}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            ) :
                                showProductData ? (
                                    <FlatList
                                        data={productsHistoryData != undefined ? productsHistoryData : []}
                                        renderItem={({ item, index }) => renderProductsItems(item, index)}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                ) :
                                    showScanData ? (
                                        <FlatList

                                            data={scanHistoryData != undefined ? scanHistoryData : []}
                                            renderItem={({ item, index }) => renderScanHistory(item, index)}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                    ) : (
                                        <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                            {/* <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text> */}
                                        </View>

                                    )}

                            {showCropData && cropHistoryData.length > 0 &&
                                <View style={[{ height: 60, width: '100%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', borderTopWidth: 0.5, borderColor: '#B4B4B4', }]}>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4', padding: 2 }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('totalPoints')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('bonus_points')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('signUp_bonus_points')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', padding: 2 }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('grand_total')}</Text>
                                    </View>
                                </View>}

                            {showCropData && cropHistoryData.length > 0 &&
                                <View style={[{ height: 50, width: '100%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', borderTopWidth: 0.5, borderColor: '#B4B4B4' }]}>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{cropHistoryData != undefined ? cropHistoryData.reduce((acc, crop) => acc + crop.pointsEarned, 0) : 0}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{bonusPoints}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{signUpBonusPoints}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{(Number.parseInt(signUpBonusPoints) + Number.parseInt(bonusPoints) + Number.parseInt(cropHistoryData != undefined ? cropHistoryData.reduce((acc, crop) => acc + crop.pointsEarned, 0) : 0) || 0).toString()}</Text>
                                    </View>
                                </View>
                            }

                        </View>
                    </View>
                </View>
            </ScrollView>

            {numberOfPages > 1 && pagesArray.length > 0 && showScanData && (
                <View style={[{ height: 40, width: '95%', position: 'absolute', bottom: 0, marginBottom: 15, borderRadius: 8, overflow: 'hidden', backgroundColor: 'white', borderTopWidth: 0.5, borderColor: Colors.lightish_grey }, styles['centerItems']]}>
                    <Text style={[styles['font_size_16_bold'], styles['text_color_black'], styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['margin_top_minus_12']]}></Text>
                    <View style={[{ height: '100%', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }]}>
                        <TouchableOpacity style={[styles['width_15%'], styles['centerItems'], { height: '100%' }]} onPress={() => { selectedPageIndex > 0 ? previousPage() : '' }}>
                            <Image source={require('../assets/images/ic_forward.png')} style={[styles['width_height_10'], styles['align_self_center'], styles['margin_left_10'], { tintColor: Colors.black, transform: [{ scaleX: -1 }] }]} />
                        </TouchableOpacity>
                        <View style={[{ height: '100%', width: '70%' }, styles['centerItems']]}>
                            <FlatList
                                key={`flatlist-${numberOfPages}`}  // Dynamic key to force re-render
                                data={pagesArray}
                                renderItem={({ item, index }) => renderPageNumber(item, index)}
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={numberOfPages}
                                style={[{ alignSelf: 'flex-start', height: '100%', width: '100%' }]}
                            />
                        </View>
                        <TouchableOpacity style={[styles['width_15%'], styles['centerItems'], { height: '100%' }]} onPress={() => { nextPage() }}>
                            <Image source={require('../assets/images/ic_forward.png')} style={[styles['width_height_10'], styles['align_self_center'], styles['margin_left_10'], { tintColor: Colors.black }]} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {
                showDropDowns &&
                <CustomListViewModal
                    dropDownType={dropDownType}
                    listItems={dropDownData}
                    selectedItem={selectedDropDownItem}
                    onSelectedZone={(item) => { onSelectedZone(item) }}
                    onSelectedRegion={(item) => { onSelectedRegion(item) }}
                    onSelectedTerritory={(item) => { onSelectedTerritory(item) }}
                    onSelectedHeadquarter={(item) => { onSelectedHeadquarter(item) }}
                    onSelectedSeason={(item) => { onSelectedSeason(item) }}
                    onSelectedYear={(item) => { onSelectedYear(item) }}
                    closeModal={() => setShowDropDowns(false)}
                />
            }

            {
                showDropDownsSearch &&
                <CustomSearchListViewModal
                    dropDownType={dropDownTypeSearch}
                    listItems={dropDownDataSearch}
                    selectedItem={selectedDropDownItemSearch}
                    onSelectedRetailerName={(item) => { onSelectedRetailerName(item) }}
                    closeModal={() => setShowDropDownsSearch(false)}
                    zoneId={zoneSelectedId}
                    regionId={regionSelectedId}
                    hqId={headquarterSelectedId}
                    territoryId={territorySelectedId}
                />
            }

            {
                showDatePicker && (
                    <DateTimePickerModal
                        isVisible={true}
                        mode="date"
                        is24Hour={false}
                        date={new Date(selectedDate)}
                        maximumDate={new Date()}
                        onConfirm={(date) => { handleConfirm(date) }}
                        onCancel={() => handleCancel()}
                    />
                    // <CustomCalendarModal
                    //     labelName={translate('selectDate')}
                    //     visible={true}
                    //     mode="date"
                    //     date={new Date(selectedDate)}
                    //     onConfirm={(date) => { handleConfirm(date) }}
                    //     onCancel={() => handleCancel()}
                    //     minimumDate={new Date(minimumDate)}
                    //     maximumDate={new Date(maximumDate)}
                    // />
                )
            }
            {showCouponDetails && showCouponData()}
            {showFilterModal && showFilters()}
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
            {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
        </View>
    )
}

export default EmployeeScanHistory;