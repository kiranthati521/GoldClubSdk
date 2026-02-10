import React, { useEffect, useMemo, useState } from "react";
import { Styles } from "../assets/style/styles";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import { View, Image, Text, TouchableOpacity, FlatList, ScrollView, Platform, StatusBar } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors } from "../assets/Utils/Color";
import { strings } from "../strings/strings";
import CustomInputDropDown from "../Components/CustomInputDropDown";
import CustomButton from "../Components/CustomButton";
import { GetApiHeaders, PostRequest, getNetworkStatus } from "../NetworkUtils/NetworkUtils";
import SimpleToast from "react-native-simple-toast";
import CustomLoader from "../Components/CustomLoader";
import CustomSuccessLoader from "../Components/CustomSuccessLoader";
import CustomErrorLoader from "../Components/CustomErrorLoader";
import { HTTP_OK, configs } from "../helpers/URLConstants";
import CustomListViewModal from "../Modals/CustomListViewModal";
import { useSelector } from "react-redux";
import { filterObjects, filterArrayOfObjects2, filterArrayOfObjects3, ROLEID, retrieveData } from "../assets/Utils/Utils";
import CustomPaginationFunctional from "../Components/CustomPaginationFunctional";
import { translate } from "../Localisation/Localisation";
import { createStyles } from "../assets/style/createStyles";

var styles = BuildStyleOverwrite(Styles);

const records_per_page = 10;

function SalesTeam() {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const navigation = useNavigation();
    const [roleID, setRoleID] = useState(null)
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
    const [showCouponDetails, setShowCouponDetails] = useState(false)
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [showCropData, setShowCropData] = useState(true)
    const [showProductData, setShowProductData] = useState(false)
    const [showScanData, setShowScanData] = useState(false)
    const [zoneSelected, setZoneSelected] = useState(null)
    const [zoneSelectedId, setZoneSelectedId] = useState(0)
    const [regionSelected, setRegionSelected] = useState(null)
    const [regionSelectedId, setRegionSelectedId] = useState(0)
    const [territorySelected, setTerritorySelected] = useState(null)
    const [territorySelectedId, setTerritorySelectedId] = useState(0)
    const [headquarterSelected, setHeadquarterSelected] = useState(null)
    const [retailerTypeSelected, setretailerTypeSelected] = useState('Select Retailer Type')
    const [headquarterSelectedId, setHeadquarterSelectedId] = useState(0)
    const [retailerSelectedId, setRetailerSelectedId] = useState(0)
    const [seasonSelectedId, setSeasonSelectedId] = useState(0)
    const [yearSelectedId, setYearSelectedId] = useState(0)

    const [dropDownMaster, setDropDownMaster] = useState([]);
    const [zoneMaster, setZoneMaster] = useState([]);
    const [regionMaster, setRegionMaster] = useState([]);
    const [territoryMaster, setTerritoryMaster] = useState([]);
    const [headQuarterMaster, setHeadQuarterMaster] = useState([]);
    const [retailerTypeMaster, setretailerTypeMaster] = useState([]);
    // const [retailerMaster, setRetailerMaster] = useState([]);

    const [regionMasterOriginal, setRegionMasterOriginal] = useState([]);
    const [territoryMasterOriginal, setTerritoryMasterOriginal] = useState([]);
    const [headQuarterMasterOriginal, setHeadQuarterMasterOriginal] = useState([]);
    const [activeRetilerCount, setActiveRetilerCount] = useState('');
    const [showApprovalDetails, setShowApprovalDetails] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [salesTeamData, setSalesTeamData] = useState(null);
    const [apiData, setapiData] = useState(null);


    const [pagesArray, setPagesArray] = useState([])
    const [numberOfPages, setNumberOfPages] = useState(0);


    /* useEffect(async () => {
        setRoleID(await retrieveData(ROLEID))
    }, []) */
    useEffect(() => {
        const getRole = async () => {
            setRoleID(await retrieveData(ROLEID))
        };
        getRole();
    }, []);
    useEffect(() => { if (roleID) { getDropdownMasters(); } }, [roleID])

    useFocusEffect(
        React.useCallback(() => {
            handleFocus();
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [])
    );

    useEffect(() => {

    }, [apiData])


    useEffect(() => {


    }, [showCropData, showProductData, showScanData])

    const handleFocus = () => {
        console.log('Screen is focused!');
        if (networkStatus) {
        }
    };

    useEffect(() => {

        zoneFilterSingle()

    }, [zoneMaster])

    useEffect(() => {

        regionFilterSingle()

    }, [regionMaster])

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
                // setLoading(false);
                // setLoadingMessage("")
                var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
                console.log('the dropdown Resp is001', JSON.stringify(APIResponse))
                if (APIResponse.statusCode == HTTP_OK) {
                    console.log('the dropdown Resp is :', APIResponse.response)
                    setDropDownMaster(APIResponse.response)

                    setRegionMasterOriginal(APIResponse.response.regions != undefined ? APIResponse.response.regions : [])
                    setTerritoryMasterOriginal(APIResponse.response.territory != undefined ? APIResponse.response.territory : [])
                    setHeadQuarterMasterOriginal(APIResponse.response.headQuarters != undefined ? APIResponse.response.headQuarters : [])
                    setretailerTypeMaster(APIResponse.response.retailerTypeMaster != undefined ? APIResponse.response.retailerTypeMaster : [])


                    setZoneMaster(APIResponse.response.zones != undefined ? APIResponse.response.zones : [])
                }

                fetchSalesTeamData(currentPage);


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


    // const submitButtonPress = async (pageNo) => {
    //     setTimeout(() => {
    //         setLoading(true)
    //         setLoadingMessage(translate('please_wait_getting_data'))
    //     }, 50);
    //     var header = await GetApiHeaders();
    //     var input = {
    //         "userId": header?.userId,
    //         "seasonId": seasonSelectedId,
    //         "zoneId": zoneSelectedId,
    //         "regionId": regionSelectedId,
    //         "territoryId": territorySelectedId,
    //         "headQuarterId": headquarterSelectedId,
    //         "retailerId": retailerSelectedId,
    //         "yearId": yearSelectedId,
    //         "fromDate": fromDate != undefined && fromDate != "" ? moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
    //         "toDate": toDate != undefined && toDate != "" ? moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
    //     };

    //     var url = configs.BASE_URL + configs.QRSCAN.SCAN_HISTORY_EMPLOYEE;

    //     console.log("URL =>", url, " Headers =>", header, " Input =>", input);
    //     var apiResponse = await PostRequest(url, header, input);
    //     setLoading(false)
    //     setLoadingMessage("")
    //     setCropHistoryData(apiResponse?.response?.scanHistory)
    //     console.log("SAINATH_REDDY", JSON.stringify(apiResponse));
    //     // setScanHistoryData(apiResponse?.response?.scanHistoryList)
    //     // setScanHistoryDataDummy(apiResponse?.response?.scanHistoryList)
    //     setActiveRetilerCount(apiResponse?.response?.activeRetailers)
    //     setShowScanData(false)
    //     setShowProductData(false)
    //     setShowCropData(true)
    //     setNumberOfRecords(apiResponse?.response?.count)
    //     const total_pages = Math.ceil(apiResponse?.response?.count / records_per_page);
    //     const pagesAr = generateIntegerArray(total_pages)
    //     setBonusPoints(apiResponse?.response?.bonusPoints)
    //     setPagesArray(pagesAr)
    //     setNumberOfPages(total_pages)
    //     console.log("pagesAr", pagesAr+"--"+total_pages);
    // }

    const fetchSalesTeamData = async (pageNo) => {
        setTimeout(() => {
            setLoading(true);
            setLoadingMessage(translate('please_wait_getting_data'));
        }, 50);
        var header = await GetApiHeaders();
        var input = {
            "zoneId": zoneSelectedId,
            "regionId": regionSelectedId,
            "territoryId": territorySelectedId,
            "headquarterId": headquarterSelectedId,
            "type": retailerTypeSelected != "Select Retailer Type" ? retailerTypeSelected : "ALL",
            "page": pageNo,
            "itemsPerPage": 10
        };

        var url = configs.BASE_URL + configs.SALESTEAM.GET_SALES_TEAM;

        console.log("URL =>", url, " Headers =>", header, " Input =>", input);
        var apiResponse = await PostRequest(url, header, input);
        console.log('165168461', JSON.stringify(apiResponse))
        setTimeout(() => {
            setLoading(false)
        }, 200);
        setLoadingMessage("")
        if (apiResponse?.response?.retailerList) {
            setapiData(apiResponse?.response)
            setSalesTeamData(apiResponse?.response?.retailerList);
            const total_pages = Math.ceil(apiResponse?.response?.totalRetailerCount / records_per_page);
            const pagesAr = generateIntegerArray(total_pages)
            setPagesArray(pagesAr)
            console.log("total_pages", total_pages)
            setNumberOfPages(total_pages)
        }

    }

    function generateIntegerArray(n) {
        const result = [];
        for (let i = 1; i <= n; i++) {
            result.push(i);
        }
        return result;
    }

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    const onSelectedZone = async (itemdata) => {
        if (itemdata != null) {
            setZoneSelectedId(itemdata?.id)
            setZoneSelected(itemdata?.name)
            setShowDropDowns(false)

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
            // setTimeout(async () => {
            //     var filterList = await filterObjects(regionMasterOriginal, "zoneId", itemdata?.id)
            //     console.log('the filter data is region', filterList)
            //     setRegionMaster(filterList)
            // }, 500);

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
                    setRegionMaster(filterList)
                }
            }, 500);

            // setTimeout(() => {
            //     console.log('regionMaster.length',regionMaster.length)
            //     if (regionMaster.length == 1) {
            //         console.log('regionMaster.length came here')
            //         setRegionSelected(regionMaster[0].name)
            //         setRegionSelectedId(regionMaster[0].id)
            //     }
            // }, 1000);

        }
    }

    const onSelectedRegion = async (itemdata) => {
        if (itemdata != null) {
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
                    // if (filterList.length != 0) {
                    //     filterList = [{ name: "All", id: 0 }, ...filterList]
                    // }
                    setTerritoryMaster(filterList)
                }
                else {
                    var filterList = await filterArrayOfObjects2(territoryMasterOriginal, "regionId", itemdata?.id, "zoneId", zoneSelectedId)
                    // if (filterList.length != 0) {
                    //     filterList.unshift({ name: "All", id: 0 });
                    // }
                    setTerritoryMaster(filterList)
                }
            }, 500);

        }
    }
    const onSelectedTerritory = async (itemdata) => {
        if (itemdata != null) {
            setTerritorySelectedId(itemdata?.id)
            setTerritorySelected(itemdata?.name)
            setShowDropDowns(false)
            setHeadquarterSelected(translate('selectHeadquarter'))
            setHeadquarterSelectedId(0);
            setHeadQuarterMaster([])
            // setTimeout(async () => {
            //     var filterList = await filterArrayOfObjects3(headQuarterMasterOriginal, "regionId", regionSelectedId, "territoryId", itemdata?.id, "zoneId", zoneSelectedId)
            //     setHeadQuarterMaster(filterList)
            // }, 500);
            setTimeout(async () => {
                if (itemdata?.id == 0) {
                    var filterList = headQuarterMasterOriginal
                    // if (filterList.length != 0) {
                    //     filterList = [{ name: "All", id: 0 }, ...filterList]
                    // }
                    setHeadQuarterMaster(filterList)
                }
                else {
                    var filterList = await filterArrayOfObjects3(headQuarterMasterOriginal, "regionId", regionSelectedId, "territoryId", itemdata?.id, "zoneId", zoneSelectedId)
                    // if (filterList.length != 0) {
                    //     filterList.unshift({ name: "All", id: 0 });
                    // }
                    setHeadQuarterMaster(filterList)
                }
            }, 500);
            // setTimeout(() => {
            //     if (headQuarterMaster.length == 1) {
            //         setHeadquarterSelected(headQuarterMaster[0].name)




            //         setHeadquarterSelectedId(headQuarterMaster[0].id);
            //     }
            // }, 200);

        }
    }
    const onSelectedHeadquarter = async (itemdata) => {
        if (itemdata != null) {
            setHeadquarterSelectedId(itemdata?.id)
            setHeadquarterSelected(itemdata?.name)
            setShowDropDowns(false)
        }
    }

    {
        showApprovalDetails &&
            <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
                <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], { borderRadius: 8 }]}>
                    <View style={[styles['width_100%'], styles['padding_10'], { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ED3237' }]}>
                        <Text style={[styles['width_80%'], styles['font_size_18_semibold'], { textAlign: 'left', color: Colors.white }]} >{translate('kycApproval')}</Text>
                        <TouchableOpacity onPress={() => { setShowApprovalDetails(null) }}>
                            <Image style={[styles['width_height_30'], { resizeMode: 'contain' }]} source={require('../assets/images/alertCloseKYC.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles['width_90%'], styles['align_self_center']]}>
                        <View>
                            {showApprovalDetails?.retailer?.proprietorName &&
                                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('name')}</Text>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.retailer?.proprietorName}</Text>
                                </View>
                            }
                            {showApprovalDetails?.retailerMobileNumber &&
                                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('mobile_number')}</Text>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.retailerMobileNumber}</Text>
                                </View>
                            }
                            {showApprovalDetails?.gstNumber &&
                                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('gstNumber')}</Text>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.gstNumber}</Text>
                                </View>
                            }
                            {showApprovalDetails?.panNumber &&
                                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('panNumber')}</Text>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.panNumber}</Text>
                                </View>
                            }
                            {showApprovalDetails?.seedLicenseNumber &&
                                <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '45%' }]}>{translate('seedLicenseNumber')}</Text>
                                    <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>: {showApprovalDetails?.seedLicenseNumber}</Text>
                                </View>
                            }
                        </View>
                        {showApprovalDetails?.panImage &&
                            <View style={[styles['margin_bottom_10']]}>
                                <Image source={{ uri: showApprovalDetails?.panImage }} style={[styles['widht_95%'], styles['align_self_center'], styles['margin_top_10'], { height: Dimensions.get('window').height / 5, resizeMode: 'contain' }]} />
                            </View>
                        }
                    </View>
                </View>
            </View>
    }

    function renderItem(item, index) {
        return (
            <TouchableOpacity
                style={[
                    {
                        width: '100%',
                        borderTopWidth: 0.5,
                        borderColor: '#B4B4B4',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        height: 60,
                    }
                ]}
                key={index.toString()}
                onPress={() => { setShowApprovalDetails(item) }}
            >
                <View style={[styles['centerItems'], { width: '10%', borderRightWidth: 0.5, borderColor: '#B4B4B4', height: "100%" }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>
                        {((currentPage - 1) * 10) + index + 1}
                    </Text>
                </View>
                <View style={[styles['centerItems'], { width: '30%', borderRightWidth: 0.5, borderColor: '#B4B4B4', height: "100%" }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_semibold'], { color: "#00881E" }]}>
                        {item?.proprietorName}
                    </Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, borderColor: '#B4B4B4', height: "100%" }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>
                        {item?.mobileNumber}
                    </Text>
                </View>
                <View style={[styles['centerItems'], { width: '30%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>
                        {item?.firmName}
                    </Text>
                </View>
            </TouchableOpacity>

        )
    }

    return (
        <View style={[styles['full_screen'], { backgroundColor: Colors.very_light_grey }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={Colors.themeRed} barStyle='dark-content' />}
            <View style={[styles['bg_themeRed'], { borderBottomEndRadius: 10, borderBottomStartRadius: 10, paddingTop: Platform.OS === 'ios' ? 60 : 0 }]}>
                <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_top_10']]} onPress={() => { goBack() }}>
                    <Image style={[styles['margin_left_20'], styles['tint_color_white'], { height: 15, width: 20, top: Platform.OS == 'ios' ? 10 : 10 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], styles['text_color_white'], styles['font_size_18_bold'], { marginTop: 5 }]}>{translate('salesTeam')}</Text>
                </TouchableOpacity>
                <View style={[{ height: 10 }]}>
                </View>

            </View>
            <ScrollView>
                <View style={[{ padding: 10, width: '95%', backgroundColor: 'white', marginTop: 5 }, styles['centerItems'], styles['border_radius_8']]}>
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
                        defaultValue={(retailerTypeMaster != undefined && retailerTypeMaster.length == 1) ? retailerTypeMaster[0].name : retailerTypeSelected != undefined ? retailerTypeSelected : translate('selectRetailerType')}
                        labelName={translate('retailerType')}
                        IsRequired={false}
                        placeholder={translate('selectRetailerType')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                (retailerTypeMaster != undefined && retailerTypeMaster.length == 1) ? undefined
                                    : changeDropDownData(retailerTypeMaster, strings.selectRetailerType, retailerTypeSelected)
                            }
                        }}
                    />

                    <CustomButton title={translate('getDetails')} onPress={() => { setCurrentPage(1), fetchSalesTeamData(1) }} buttonBg={Colors.themeRed} btnWidth={"95%"} titleTextColor={Colors.white} />
                </View>
                {salesTeamData && salesTeamData.length > 0 &&
                    <View style={[styles['margin_top_10'], styles['bg_white'], styles['border_radius_5'], styles['shadow_box'], styles['widht_95%'], styles['centerItems'], { paddingBottom: 10 }]}>
                        {/* <View style={[styles['width_90%'], styles['margin_10']]}>
                            <Text style={[styles['text_color_black'], styles['text_align_left'], styles['font_size_13_semibold']]}>{translate('activeRetailers')} {apiData?.activeRetailersCount}</Text>
                        </View> */}
                        <View style={[styles['align_self_center'], styles['width_90%'], { borderWidth: 0.5, borderRadius: 10, overflow: 'hidden', borderColor: '#B4B4B4', marginTop: 15, }]}>
                            <View style={[{ height: 60, width: '100%', backgroundColor: '#E5E5E5', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                                <View style={[styles['centerItems'], { width: '10%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('sno')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '30%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('retailerName')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('mobile_number')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '30%' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('firmName')}</Text>
                                </View>
                            </View>
                            {salesTeamData &&
                                <FlatList
                                    data={salesTeamData}
                                    renderItem={({ item, index }) => renderItem(item, index)}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            }
                        </View>

                    </View>
                }
                {(!salesTeamData || salesTeamData?.length <= 0) && (
                    <View style={[styles['centerItems'], styles['margin_top_50']]}>
                        <Text style={[styles['text_color_black'], styles['centerItems']]}>{translate('no_data_available')}</Text>
                    </View>
                )}
            </ScrollView>

            {numberOfPages > 1 && apiData?.totalRetailerCount > 10 &&
                <View style={[styles[''], { marginBottom: 15 }]}>
                    {console.log("APIDATA_PAGE", JSON.stringify(apiData))}

                    <CustomPaginationFunctional
                        selectedIndex={currentPage}
                        pageItemArray={salesTeamData}
                        onpressIndexClicked={(index) => { if (apiData?.totalRetailerCount && (index <= Math.ceil(apiData.totalRetailerCount / 10))) { console.log('54545145', index); setCurrentPage(index); fetchSalesTeamData(index) } }}
                        pgHeight={40}
                        itemsPerPage={apiData?.totalRetailerCount ? Math.ceil((apiData.totalRetailerCount / 10)) : 1}
                        itemBackgroundColor={'#ED3237'}
                        pgWidth={'100%'}
                    />
                </View>
            }

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
                    onSelectedRetailerType={(item) => { setretailerTypeSelected(item?.name); setShowDropDowns(false) }}

                    closeModal={() => setShowDropDowns(false)}
                />
            }
            {showCouponDetails && showCouponData()}
            {showFilterModal && showFilters()}
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
            {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
        </View>
    )
}

export default SalesTeam;