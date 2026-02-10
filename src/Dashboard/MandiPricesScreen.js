import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import CustomListViewModal from '../Modals/CustomListViewModal';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { GetApiHeaders, GetRequest, PostRequest } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomLoader from '../Components/CustomLoader';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import { strings } from "../strings/strings";
import { filterObjects, isNullOrEmpty, sortObjectsAlphabetically } from '../assets/Utils/Utils';
import { selectUser, setUser } from '../redux/store/slices/UserSlice';
import { decodeJwt } from '../../src/assets/Utils/helpers';
import { LineChart } from 'react-native-chart-kit';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';


import { ActivityIndicator, Platform, StyleSheet, Dimensions, TouchableOpacity, Button, View, Text, FlatList, Image, StatusBar, ScrollView, TextInput, Modal, Alert, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';

import moment from 'moment';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import { Colors } from '../assets/Utils/Color';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUpdateRetailerInfoData } from '../redux/store/slices/UpdatedReatilerInfoDataSlice';
import CustomAlert from '../Components/CustomAlert';
import SimpleToast from 'react-native-simple-toast';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);
const MandiPricesScreen = () => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const viewShotRef = useRef();
    const getUpdatedUserData = useSelector(getUpdateRetailerInfoData);
    const screenWidth = Dimensions.get('window').width;
    const FILTERS = [translate('thisWeek'), translate('thisMonth'), translate('thisYear')];
    const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
    const getUserData = useSelector(selectUser);
    const userDatafrom = getUserData[0]
    let navigation = useNavigation()
    const [selectedCropId, setSelectedCropId] = useState(null);
    const [loading, setLoading] = useState(false)
    let [graphData, setGraphData] = useState(null)
    const [popup, setPopUp] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null)
    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [districtListOriginal, setDistrictListOriginal] = useState([]);
    const [mandiSelected, setMandiSelected] = useState(true);
    const [pageNo, setPage] = useState(1);
    const [selectedState, setSelectedState] = useState({ id: "", name: translate('select') });
    const [selectedDistrict, setSelectedDistrict] = useState({ id: "", name: translate('select') });
    const [hasMoreData, setHasMoreData] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [apiRequestType, setApiRequestType] = useState(null);
    const [mandiMaster, setMandiMaster] = useState()
    const [mandiPricesList, setMandiPricesList] = useState([]);
    const [selectedindex, setSelectedindex] = useState(null);
    const [selectedChildIndex, setSelectedChildIndex] = useState(null);
    const [selectedCrops, setSelectedCrops] = useState({});
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [showAlertHeader, setShowAlertHeader] = useState(false);
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertYesButton, setShowAlertYesButton] = useState(false);
    const [showAlertNoButton, setShowAlertNoButton] = useState(false);
    const [showAlertYesButtonText, setShowAlertYesButtonText] = useState("");
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState("");
    const [isStoringData, setIsStoringData] = useState(false);
    const [navigationHandled, setNavigationHandled] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const [loader, setLoader] = useState(false);
    const [progress, setProgress] = useState(10)
    const [cropMaster, setCropMaster] = useState([])
    const [placeholderText, setPlaceholderText] = useState(translate('search'));
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [searchIconColor, setSearchIconColor] = useState('grey');
    const [showProducts, setShowProducts] = useState([]);
    const [menuControler, setMenuControler] = useState([]);
    const [dashboardMaster, setDashboardMaster] = useState({})
    const [isExpanded, setIsExpanded] = useState(false);
    const [minprice, setMinPrice] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkedMarkets, setBookmarkedMarkets] = useState({});
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [dropDownType, setDropDownType] = useState("");
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    let [state, setState] = useState('')
    let [district, setDistrict] = useState('')
    let [stateID, setStateID] = useState('')
    let [districtID, setDistrictID] = useState('')
    const [isFetching, setIsFetching] = useState(false);
    const [mainLoader, setMainLoader] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
    const [apiCalledOrNot, setApiCalledOrNot] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false);

    const takeScreenshot = async () => {

        if (isProcessing) return; // prevent multiple clicks
        setIsProcessing(true);

        setTimeout(async () => {
            try {
                const uri = await viewShotRef.current.capture();
                const shareOptions = {
                    title: translate('shareVia'),
                    message: ``,
                    url: uri,
                    // social: Share.Social.WHATSAPP,
                };
                Share.open(shareOptions);
            } catch (error) {
                console.error(translate('captureErr'), error);
            } finally {
                setIsProcessing(false);
            }
        }, 200);


    };

    const updateBookmarkInList = (index, newBookmarkValue) => {
        setMandiPricesList((prevList) => {
            const updatedList = [...prevList];
            updatedList[index] = { ...updatedList[index], bookmark: newBookmarkValue };
            return updatedList;
        });
    };

    // useEffect(() => {
    //     setSearchIconColor(searchQuery.length >= 3 ? 'red' : 'grey');
    // }, [searchQuery]);
    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            setLoadingMessage(translate('please_wait_getting_data'));
            try {
                await Promise.all([
                    fetchStateMasters(),
                    fetchDistrictMasters(),
                    // fetchGraphData(),
                ]);
                if (district) {
                    await fetchMandiPrices(true, 1);
                }
            } catch (error) {
                console.error('Initialization error:', error);
            } finally {
                setLoading(false);
                setLoadingMessage('');
            }
        };
        initialize();
    }, []);
    // useEffect(() => {
    //     const initialize = async () => {
    //         setDistrict('')
    //         setDistrictID('');
    //         await fetchStateMasters();
    //         await fetchDistrictMasters();
    //         setLoading(true)
    //         await fetchGraphData()
    //     };

    //     initialize();
    // }, []);


    useEffect(() => {
        if (selectedCrop) {
            setGraphData(null)
            setLoading(true)
            fetchGraphData(selectedCrop)
            setLoadingMessage(translate('please_wait_getting_data'))
        }
    }, [selectedFilter])

    const onSelectedState = async (item) => {
        setShowDropDowns(false);
        setState(item.name)
        setStateID(item.id);
        setDistrict('')
        setDistrictID('');
        setApiCalledOrNot(false)
        let b = districtListOriginal.filter((data) => {
            return data.state.id === item.id
        })
        setMandiPricesList([]);
        setFilteredData([]);
        setDistrictsList(b)
        // showAlertWithMessage(translate('Please_Select_District'), true, true, '', false, true, translate('ok'), translate('ok'))
        if (Platform.OS === 'ios') {
            setTimeout(() => {
                SimpleToast.show(translate('Please_Select_District'), SimpleToast.LONG)
            }, 1000)
        } else {
            SimpleToast.show(translate('Please_Select_District'), SimpleToast.LONG)
        }
    }

    const onSelectedDistrict = (item) => {
        setShowDropDowns(false);
        setDistrict(item.name);
        setDistrictID(item.id);
    }

    // const fetchStateAndDistrictMasters = async () => {
    //     try {
    //         //configs.BASE_URL
    //         var stateUrl = configs.BASE_URL + configs.MANDRIPRICES.GETSTATEDISTRICTDETAILS;
    //         var getHeaders = await GetApiHeaders()
    //         var response = await GetRequest(stateUrl, getHeaders);
    //         if (response && response.statusCode == HTTP_OK) {
    //             let orderedStates = sortObjectsAlphabetically(response?.response?.stateList, 'name')
    //             setStatesList(orderedStates || []);
    //             setDistrictListOriginal(sortObjectsAlphabetically(response?.response?.districtsList, 'name') || []);
    //             var filterDistList = await filterObjects(response?.response?.districtsList, "stateId", userDatafrom?.stateId)
    //             setDistrictsList(sortObjectsAlphabetically(filterDistList, 'name'))
    //             setShowProducts(response?.response?.cropsList || []);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching state and district masters:', error);
    //     }
    // };

    const fetchStateMasters = async () => {
        try {
            //configs.BASE_URL
            var stateUrl = configs.SUBEEJ_BASE_URL + configs.MANDRIPRICES.getAllStates;
            var getHeaders = await GetApiHeaders()
            var response = await GetRequest(stateUrl, getHeaders);
            if (response && response.statusCode == HTTP_OK) {
                let states = getUpdatedUserData?.value?.stateName ? getUpdatedUserData?.value?.stateName : userDatafrom?.stateName
                setStatesList(response?.response?.statesList || []);
                let b = await response?.response?.statesList?.filter((data) => {
                    return data?.tagName?.toLowerCase() === (extractStateName(states)?.toLowerCase())
                })
                setState(b[0]?.name)
                setStateID(b[0]?.id)
            }
        } catch (error) {
            console.error('Error fetching state and district masters:', error);
        }
    };

    function extractStateName(str) {
        return str.replace(/\s*[\(\[-][^\)\]]*[\)\]]?$/, '').trim();
    }

    const fetchDistrictMasters = async () => {
        try {
            //configs.BASE_URL
            var stateUrl = configs.SUBEEJ_BASE_URL + configs.MANDRIPRICES.getDistricts;
            var getHeaders = await GetApiHeaders()
            var response = await GetRequest(stateUrl, getHeaders);
            if (response && response.statusCode == HTTP_OK) {
                setDistrictListOriginal(response?.response?.districtList || []);
                let states = getUpdatedUserData?.value?.stateName ? getUpdatedUserData?.value?.stateName : userDatafrom?.stateName
                let b = await response?.response?.districtList.filter((data) => {
                    return data.state.tagName?.toLowerCase() === (extractStateName(states)?.toLowerCase())
                })
                setDistrictsList(b)

                // let sortDistrict = b.filter((item)=>{
                //     return userDatafrom?.districtName.toLowerCase() === item?.tagName.toLowerCase().replace(" ","")
                // })
                // alert(userDatafrom?.districtName.toLowerCase(),"asdsa",item?.tagName.toLowerCase().replace(" ",""))
                // alert(JSON.stringify(sortDistrict))
                // if (sortDistrict) {
                //     setDistrict(sortDistrict[0].name);
                //     setDistrictID(sortDistrict[0].id);
                //     // setMainLoader(true)
                //     setLoadingMessage(translate('please_wait_getting_data'))
                // } else {
                // showAlertWithMessage(translate('Please_Select_District'), true, true, '', false, true, translate('ok'), translate('ok'))
                SimpleToast.show(translate('Please_Select_District'), SimpleToast.LONG)
                // }
            }
        } catch (error) {
            console.error('Error fetching state and district masters:', error);
        }
    };

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }


    // useEffect(() => {
    //     if (selectedCrops != undefined) {
    //         console.log('selectedCrops', selectedCrops)
    //         const filter = filteredData?.filter((v) => v.crops[0].name === selectedCrops.name)
    //         setFilteredData(filter);
    //     }
    // }, [selectedCrops]);

    // const isFetching = useRef(false);
    const fetchMandiPrices = async (resetData, pageNoReset = 1) => {
        try {
            // isFetching.current = true;
            setIsFetching(true)
            const payload = {
                page: pageNoReset,
                itemsPerPage,
                filterValue: searchQuery.length > 3 ? searchQuery : '',
                state: state !== '' ? state : '',
                district: district !== '' ? district : ''
            };
            // setLoading(resetData)
            const headers = await GetApiHeaders();
            const url = configs.BASE_URL + configs.MANDRIPRICES.GETMANDIPRICES;
            console.log("payload====>", payload)
            const APIResponse = await PostRequest(url, headers, payload);
            if (APIResponse != undefined && APIResponse != null) {
                setTimeout(() => {
                    if (APIResponse.statusCode == HTTP_OK) {
                        var mandiPrices = APIResponse.response
                        setApiCalledOrNot(true)
                        console.log("mandiPrices===>", mandiPrices)
                        setLoadingMessage()
                        setTimeout(() => {
                            setLoadingMessage()
                            setLoading(false)
                        }, 500);
                        if (resetData) {
                            setMandiPricesList(mandiPrices.mandiPricesList || []);
                            setFilteredData(mandiPrices.mandiPricesList || []);
                            setHasMoreData(mandiPrices?.mandiPricesList?.length == 10);
                        } else if (mandiPrices.mandiPricesList.length > 0) {
                            setMandiPricesList((prev) => [...prev, ...mandiPrices.mandiPricesList]);
                            setFilteredData((prev) => [...prev, ...mandiPrices.mandiPricesList]);
                            setHasMoreData(mandiPrices?.mandiPricesList?.length == 10);
                        } else {
                            setHasMoreData(false);
                        }
                    }
                    else {
                        setLoadingMessage(APIResponse?.message ?? "")
                        setLoading(false)
                        Alert.alert(APIResponse?.message)
                    }
                }, 500);

            } else {
                setTimeout(() => {
                    setLoading(false)
                    setLoadingMessage()
                }, 500);
            }
        } catch (error) {
            setProgress(100)
            console.error('Error fetching mandi prices:', error);
        } finally {
            setProgress(100)
            // isFetching.current = false;
            setIsFetching(false)
            setMainLoader(false)
        }
    };
    let fetchGraphData = async (item) => {
        try {
            const payload = {
                "state": state || '',
                "district": "",
                "crop": item?.name || '',
                "type": selectedFilter === translate('thisWeek') ? "W" : selectedFilter === translate('thisMonth') ? 'M' : 'Y'
            };
            const headers = await GetApiHeaders();
            let url = configs.BASE_URL + configs.MANDRIPRICES.getMandiPricesAnalysisReport_V1
            const APIResponse = await PostRequest(url, headers, payload);
            if (APIResponse != undefined && APIResponse != null) {
                setTimeout(() => {
                    if (APIResponse.statusCode == HTTP_OK) {
                        setGraphData(null)
                        var mandiPrices = APIResponse.response
                        setLoadingMessage()
                        setGraphData(mandiPrices)
                        setTimeout(() => {
                            setLoadingMessage()
                            setLoading(false)
                        }, 500);
                    }
                    else {
                        setLoadingMessage(APIResponse?.message ?? "")
                        setLoading(false)
                        Alert.alert(APIResponse?.message)
                    }
                }, 500);

            } else {
                setTimeout(() => {
                    setLoading(false)
                    setLoadingMessage()
                }, 500);
            }
        } catch (error) {
            setProgress(100)
            console.error('Error fetching mandi prices:', error);
        } finally {
            setProgress(100)
            // isFetching.current = false;
            setIsFetching(false)
        }
    };


    useEffect(() => {
        if (isNullOrEmpty(district)) {
            setPage(1);
            fetchMandiPrices(true, 1);
            setLoading(true)
            setLoadingMessage(translate('please_wait_getting_data'))
            setSearchQuery('')
        }

    }, [district]);


    const handleCancelAlert = () => {
        setShowAlert(false)
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

    const filteredDistricts = useMemo(() => {
        return districtsList.filter(district => district.stateId === selectedState.id);
    }, [districtsList, selectedState]);

    const handleLoadMore = debounce(() => {
        if (hasMoreData && !isFetching) {
            // isFetching.current = true;
            setIsFetching(true)
            let pageVar = pageNo + 1;
            setPage(pageVar);
            setLoading(true)
            if (state !== '' && district !== '') {
                fetchMandiPrices(false, pageVar);
            }
        }
    }, 500);

    useEffect(() => {
        if (searchQuery.length >= 3) {
            const filtered = mandiPricesList.filter((item) =>
                item.marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.crops.some((crop) => crop.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(mandiPricesList);
        }
    }, [searchQuery, mandiPricesList]);


    // const renderMenuController = ({ item }) => {
    //     return (
    //         <View style={{
    //             padding: 10,
    //             width: '65%',
    //             marginLeft: 5,
    //             marginRight: 5,
    //             marginTop: 10
    //         }}>
    //             <View style={{
    //                 padding: 10,
    //                 backgroundColor: '#f0f0f0',
    //                 height: 40,
    //                 width: 40,
    //                 borderRadius: 25
    //             }} />

    //             <View style={{
    //                 height: '100%',
    //                 position: 'absolute',
    //                 top: 12,
    //                 right: 19,
    //                 bottom: 20
    //             }}>
    //                 <Image
    //                     source={{ uri: item.vectorImage }}
    //                     style={{
    //                         height: 30,
    //                         width: 30
    //                     }}
    //                     accessibilityLabel={item?.name}
    //                 />
    //             </View>

    //             <Text
    //                 style={{
    //                     marginTop: 5,
    //                     fontFamily: 'regular',
    //                     fontSize: 12,
    //                     color: 'black',
    //                     textAlign: 'center'
    //                 }}
    //                 numberOfLines={1}
    //             >
    //                 {item?.name}
    //             </Text>
    //         </View>
    //     )
    // }

    const renderCropChildData = ({ item, index }) => {
        return (
            <TouchableOpacity
                key={`${item?.name}${index}`}
                style={[
                    { width: '100%', marginTop: 5, marginBottom: 5 }]}
                onPress={() => {
                    navigation.navigate('CropDetailsScreen', {
                        minPrice: item.minPrice,
                        maxPrice: item.maxPrice,
                        name: item.name,
                        marketName: mandiPricesList[index]?.location,
                        cropImage: item?.image
                    });
                }}
            >
                <View style={[{ borderRadius: 10, backgroundColor: "white", padding: 5 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ padding: 5, width: '33%' }}>
                            <Text style={[styles['font_size_12_regular'], { color: 'black', textAlign: 'center' }]}>{translate('minPrice')}</Text>
                            <Text style={[styles['font_size_16_bold'], { color: 'black', textAlign: 'center' }]} numberOfLines={1}>
                                {item?.minPrice}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Assuming 'styles.divider' refers to a divider */}
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={[styles['font_size_12_regular'], { color: 'black', textAlign: 'center' }]}>{translate('maxPrice')}</Text>
                            <Text style={[styles['font_size_16_bold'], { color: 'black', textAlign: 'center' }]} numberOfLines={1}>
                                {item?.maxPrice}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Assuming 'styles.divider' refers to a divider */}
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={[styles['font_size_12_regular'], { color: 'black', textAlign: 'center' }]}>{translate('marketPrice')}</Text>
                            <Text style={[styles['font_size_16_bold'], { color: 'green', textAlign: 'center' }]} numberOfLines={1}>
                                {item?.maxPrice}
                            </Text>
                        </View>
                    </View>
                    <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Assuming 'styles.divider' refers to a divider */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={[styles['font_size_12_regular'], { color: 'black', textAlign: 'center' }]}>{translate('Commodity')}</Text>
                            <Text style={[styles['font_size_16_bold'], { color: 'black', textAlign: 'center' }]} numberOfLines={1}>
                                {item?.name}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Divider */}
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={[styles['font_size_12_regular'], { color: 'black', textAlign: 'center' }]}>{translate('Variety')}</Text>
                            <Text style={[styles['font_size_16_bold'], { color: 'black', textAlign: 'center' }]} numberOfLines={1}>
                                {item?.name}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#000' }} /> {/* Divider */}
                        <View style={{ width: '33%', padding: 5 }}>
                            <Text style={[styles['font_size_12_regular'], { color: 'black', textAlign: 'center' }]}>{translate('arrivalDate')}</Text>
                            <Text style={[styles['font_size_16_bold'], { color: 'black', textAlign: 'center' }]} numberOfLines={1}>
                                {moment().format('DD-MM-YYYY')}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const renderCropsData = ({ item, index }) => {
        const cropKey = `${item.name}-${item.maxPrice}`;
        return (
            <View style={{ width: '100%' }} key={`${item?.name}_${index}`}>
                <View style={{
                    backgroundColor: 'white',
                    marginTop: 15,
                    marginBottom: 10,
                    padding: 5,
                    width: '100%',
                    borderRadius: 15
                }}>
                    <View style={{
                        marginLeft: 10,
                        marginRight: 10,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: 'black', fontSize: 18 }}>{item?.location}</Text>
                        {/* <TouchableOpacity
                        onPress={() => bookmarkDetails(item, index)}
                        >
                            <View>
                                {bookmarkedMarkets[cropKey] ?
                                    <Image source={require('../../src/assets/images/saved.png')} style={{ height: 30, width: 30, resizeMode: "contain" }} />
                                    :
                                    <Image source={require('../../src/assets/images/unsaved.png')} style={{ height: 30, width: 30, resizeMode: "contain" }} />
                                }
                            </View>
                        </TouchableOpacity> */}
                    </View>

                    <FlatList
                        data={item?.crops}
                        renderItem={({ item, index }) => renderCropChildData({ item, index })}
                        keyExtractor={(item, index) => `${item?.name}${index}`} />
                </View>
            </View>
        );
    };

    const renderCropItem = ({ item, marketName, action, location, commodity }) => {
        // item,
        //  marketName: item?.marketName, action: actionNAME,location:item?.location
        const cropKey = `${item.name}-${marketName}-${item.maxPrice}-${commodity}-${item.lastUpdated}`;
        item.marketName = marketName;
        item.location = location;
        // item.commodity = commodity;
        console.log("what all the images are coming", commodity)
        return (
            <View>
                {
                    // item.image.includes('NoCropImage.png') ? augustine said to add this.
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedCrop(item)
                            setPopUp(!popup)
                            setGraphData(null)
                            fetchGraphData(item)
                        }}
                    //    onPress={() => {
                    //        setSelectedCrops(prevSelectedCrop => prevSelectedCrop === cropKey ? null : cropKey);
                    //    }}
                    //    key={cropKey}
                    >
                        <View
                            style={[
                                {
                                    width: Platform.OS === 'ios' ? 90 : 90,
                                    minHeight: Platform.OS === 'ios' ? undefined : 150,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    alignItems: 'center',
                                    marginRight: 10,
                                    backgroundColor: selectedCrops === cropKey ? 'rgba(0,0,0,0.82)' : 'white',
                                    borderWidth: selectedCrops === cropKey ? 2 : 1,
                                    borderColor: selectedCrops === cropKey ? 'rgba(0,0,0,0.82)' : 'rgba(227,227,227,1)',
                                    borderRadius: 8,
                                    position: 'relative'
                                }]}
                        >
                            <>
                                <Image
                                    source={{ uri: item?.image }}
                                    style={{ width: Platform.OS === 'ios' ? 70 : 60, height: Platform.OS === 'ios' ? 100 : 90, borderRadius: 5 }}
                                    accessibilityLabel={item?.name}
                                />
                                <Text
                                    style={[{ color: dynamicStyles.textColor, marginTop: 3 }, styles['font_size_10_bold']]}
                                    numberOfLines={1}
                                    ellipsizeMode='tail'
                                >
                                    {item?.name}
                                </Text>
                                {/* {selectedCrops === cropKey && ( */}
                                <View style={styleSheetStyles.overlay}>
                                    <Text style={[styleSheetStyles.overlayTitle, styles['font_size_10_bold']]} numberOfLines={1} ellipsizeMode='tail'> {item?.name}</Text>
                                    <Image source={require('../assets/images/horizontalLine.png')} style={{ width: "100%", height: 1 }} />
                                    <Text style={[styleSheetStyles.detail, styles['font_size_6.5_regular'], { marginTop: 2.5 }]}>{translate('Quantity')}</Text>
                                    <Text style={[styleSheetStyles.detail, styles['font_size_6.5_regular']]}>{"1" + " " + translate('Quintal')}</Text>
                                    <Text style={[styleSheetStyles.detail, styles['font_size_6.5_regular']]}>{translate('Rate')} ({translate('edo')}{parseInt(item?.maxPrice.replace(/[^\d]/g, ""), 10) / 100})</Text>
                                    <Text style={[styleSheetStyles.price, styles['font_size_8_bold']]} {...(Platform.OS === 'android' ? { numberOfLines: 1, ellipsizeMode: 'tail' } : {})}>{item.maxPrice ? `${item?.maxPrice} Rs` : 'N/A'}</Text>
                                    <View style={styleSheetStyles.button}>
                                        <Text allowFontScaling={false} style={[styleSheetStyles.buttonText, styles['font_size_7_bold']]}>{action}</Text>
                                    </View>
                                </View>
                                {/* )} */}
                            </>
                        </View>
                    </TouchableOpacity>
                    // :
                    // <TouchableOpacity
                    //     onPress={() => {
                    //         setSelectedCrops(prevSelectedCrop => prevSelectedCrop === cropKey ? null : cropKey);
                    //     }}
                    //     key={cropKey}
                    // >
                    //     <View
                    //         style={[
                    //             {
                    //                 width: Platform.OS === 'ios' ? 90 : 80,
                    //                 height: Platform.OS === 'ios' ? undefined : 120,
                    //                 alignItems: "center",
                    //                 justifyContent: "center",
                    //                 overflow: "hidden",
                    //                 alignItems: 'center',
                    //                 marginRight: 10,
                    //                 backgroundColor: selectedCrops === cropKey ? 'rgba(0,0,0,0.82)' : 'white',
                    //                 borderWidth: selectedCrops === cropKey ? 2 : 1,
                    //                 borderColor: selectedCrops === cropKey ? 'rgba(0,0,0,0.82)' : 'rgba(227,227,227,1)',
                    //                 borderRadius: 8,
                    //                 position: 'relative'
                    //             }]}
                    //     >
                    //         <>
                    //             <Image
                    //                 source={{ uri: item?.image }}
                    //                 style={{ width: Platform.OS === 'ios' ? 70 : 60, height: Platform.OS === 'ios' ? 100 : 90, borderRadius: 5 }}
                    //                 accessibilityLabel={item?.name}
                    //             />
                    //             <Text
                    //                 style={{}}
                    //                 numberOfLines={1}
                    //                 ellipsizeMode='tail'
                    //             >
                    //                 {item?.name}
                    //             </Text>
                    //             {selectedCrops === cropKey && (
                    //                 <View style={styleSheetStyles.overlay}>
                    //                     <Text style={styleSheetStyles.overlayTitle} numberOfLines={1} ellipsizeMode='tail'> {item?.name}</Text>
                    //                     <Image source={require('../assets/images/horizontalLine.png')} style={{ width: "100%", height: 1 }} />
                    //                     <Text style={[styleSheetStyles.detail, { marginTop: 2.5 }]}>{translate('Quantity')}</Text>
                    //                     <Text style={styleSheetStyles.detail}>{translate('Quintal')}</Text>
                    //                     <Text style={styleSheetStyles.detail}>{translate('Rate')} ({translate('edo')}{parseInt(item?.maxPrice.replace(/[^\d]/g, ""), 10) / 100})</Text>
                    //                     <Text style={styleSheetStyles.price} {...(Platform.OS === 'android' ? { numberOfLines: 1, ellipsizeMode: 'tail' } : {})}>{item.maxPrice ? `${item?.maxPrice}Rs` : 'N/A'}</Text>
                    //                     <TouchableOpacity style={styleSheetStyles.button}
                    //                         onPress={() => {
                    //                             setSelectedCrop(item)
                    //                             setPopUp(!popup)
                    //                         }}
                    //                     >
                    //                         <Text allowFontScaling={false} style={styleSheetStyles.buttonText}>{action}</Text>
                    //                     </TouchableOpacity>
                    //                 </View>
                    //             )}
                    //         </>
                    //     </View>
                    // </TouchableOpacity>
                }
            </View>
        )

    };

    const renderMandiPrices = ({ item, index }) => {
        const selectedChild = item[index] ?? 0;
        // const selectedCrop = item.crops[selectedChild];
        let actionNAME = item.action
        // console.log(item?.action,":::")
        let marketName = item?.marketName;
        let location = item?.location;
        let commodity = item?.commodity;
        return (
            <View key={`${item}_${index}`} style={{
                padding: 10,
                marginBottom: 10,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: 'white',
                borderRadius: 15
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Text
                        style={[{ color: dynamicStyles.textColor }, styles['font_size_14_bold']]}
                        numberOfLines={1}
                    >
                        {item.marketName.length > 20
                            ? `${item.marketName.substring(0, 20)}...`
                            : item.marketName}
                    </Text>

                    {/* <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        ...(isExpanded ? { marginRight: 10 } : {})
                    }}>
                        <Image source={require('../../src/assets/images/redMarker.png')} style={{ tintColor: dynamicStyles.iconPrimaryColor, height: 16, width: 16, resizeMode: "contain" }} />
                        <Text style={{
                            color: 'rgba(107,107,107,1)',
                            marginLeft: 2,
                            fontSize: 13,
                        }}>
                            {item.location}
                        </Text>
                    </View> */}
                </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 2
                }}>
                    <Text style={[styles['font_size_13_regular'], {
                        color: 'black',
                        marginTop: 2,
                    }, Platform.OS === 'ios' && { lineHeight: 30 }]}>{translate('available_Crops')}</Text>
                    {/* <TouchableOpacity
                     onPress={() => bookmarkDetails(item, index)}
                    >
                        <View>
                            {item?.bookmark ?
                                <Image source={require('../../src/assets/images/saved.png')} style={{ tintColor: dynamicStyles.iconPrimaryColor, height: 20, width: 20, marginTop: 20, resizeMode: "contain" }} />
                                :
                                <Image source={require('../../src/assets/images/unsaved.png')} style={{ tintColor: dynamicStyles.iconPrimaryColor, height: 20, width: 20, marginTop: 20, resizeMode: "contain" }} />
                            }
                        </View>
                    </TouchableOpacity> */}
                </View>

                {/* Crops List */}
                <FlatList
                    data={item.crops}
                    nestedScrollEnable={true}
                    initialNumToRender={3}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    renderItem={({ item }) => renderCropItem({
                        item, marketName, action: actionNAME, location, commodity
                    })}
                    keyExtractor={(crop, index) => `${crop.id}_${index}`}
                    horizontal
                    style={{ width: '100%' }}
                    showsHorizontalScrollIndicator={false}
                    mt={2}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            <View style={[styles['full_screen'], styles['bg_white']]}>

                {/* <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}> */}
                {Platform.OS === 'android' && (
                    <StatusBar backgroundColor={popup ? "#000000d6" : dynamicStyles.primaryColor} barStyle={popup ? 'light-content' : 'dark-content'} />
                )}
                <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 20 : 20 }]}>
                    <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => navigation.goBack()}>
                        <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                        <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('MandiPrices')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                    {/* <View>
                    {!mandiSelected && (
                        <FlatList
                            horizontal
                            data={showProducts}
                            renderItem={renderMenuController}
                            keyExtractor={(item) => item?.id.toString()}
                            showsHorizontalScrollIndicator={false}
                        />
                    )}
                </View> */}

                    <View style={{}}>
                        <View style={{
                            elevation: 1,
                            width: "100%", backgroundColor: "white", marginBottom: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20
                        }}>
                            {/* <View style={{
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "90%",
                            flexDirection: "row",
                            marginTop: 15,
                            marginBottom: 5
                        }}>
                            <View style={{
                                alignItems: "center",
                                alignSelf: "center",
                                width: "50%",
                                marginLeft: 20
                            }}>
                                <Text style={{
                                    // textAlign: "left",
                                    alignSelf: "flex-start",
                                    // marginBottom: 10,
                                    color: 'rgba(93,93,93,1)'
                                }}>
                                    {translate('SelectState')}
                                </Text>
                            </View>

                            <View style={{
                                alignItems: "center",
                                alignSelf: "center",
                                width: "50%",
                                alignSelf: "flex-start",
                                marginLeft: -22

                            }}>
                                <Text style={{
                                    textAlign: "center",
                                    // marginBottom: 10,
                                    color: 'rgba(93,93,93,1)'
                                }}>
                                    Select District
                                </Text>
                            </View>
                        </View> */}
                            <View style={{
                                alignItems: "center",
                                // justifyContent: "space-between",
                                width: "100%",
                                flexDirection: "row",
                                marginBottom: 20
                            }}>
                                <View style={[styles['margin_top_5'], styles['centerItems'], { width: '45%', marginLeft: 15 }]}>
                                    <CustomInputDropDown
                                        width={[styles['width_150%']]}
                                        defaultValue={state != undefined && state != translate('select') ? state : translate('select')}
                                        labelName={translate('SelectState')}
                                        IsRequired={false}
                                        placeholder={translate('state')}
                                        onEndEditing={async event => {
                                            // calculateTotalOrderValue()
                                        }}
                                        onFocus={() => {
                                            changeDropDownData(statesList, strings.state, state)
                                        }}
                                    />
                                </View>

                                <View style={[styles['margin_top_5'], styles['centerItems'], { width: '45%', marginLeft: 15 }]}>
                                    <CustomInputDropDown
                                        width={[styles['width_100%']]}
                                        defaultValue={district != undefined && district != translate('select') ? district : translate('select')}
                                        labelName={translate('SelectDistrict')}
                                        IsRequired={false}
                                        placeholder={translate('district')}
                                        onEndEditing={async event => {
                                            // calculateTotalOrderValue()
                                        }}
                                        onFocus={() => {
                                            changeDropDownData(districtsList, strings.district, district)
                                        }}
                                    />
                                </View>
                                {/* States DropDown */}
                                {/* <TouchableOpacity 

                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40%",
                                marginHorizontal: 20,
                                marginLeft: 20,
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: "rgba(242,242,242,1)",
                                padding: 5,
                                paddingHorizontal: 10,
                                flexDirection: "row"
                            }}>
                                <Text style={{
                                    textAlign: "center",
                                    color: 'rgba(93,93,93,0.5)'
                                }}>
                                    Select
                                </Text>
                                <Image source={require('../../src/assets/images/dropdownArrow.png')} style={{ height: 12, width: 12, resizeMode: "contain", marginLeft: "auto" }} />

                            </TouchableOpacity>

                            <TouchableOpacity style={{
                                alignItems: "center",
                                justifyContent: "center",
                                // alignSelf: "center",
                                width: "40%",
                                marginHorizontal: 20,
                                marginLeft: 20,
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: "rgba(242,242,242,1)",
                                padding: 5,
                                paddingHorizontal: 10,
                                flexDirection: "row"
                            }}>
                                <Text style={{
                                    textAlign: "center",
                                    color: 'rgba(93,93,93,0.5)'
                                }}>
                                    Select
                                </Text>
                                <Image source={require('../../src/assets/images/dropdownArrow.png')} style={{ height: 12, width: 12, resizeMode: "contain", marginLeft: "auto" }} />

                            </TouchableOpacity> */}
                            </View>
                            {
                                showDropDowns &&
                                <CustomListViewModal
                                    dropDownType={dropDownType}
                                    listItems={dropDownData}
                                    selectedItem={selectedDropDownItem}
                                    onSelectedState={(item) => onSelectedState(item)}
                                    onSelectedDistrict={(item) => onSelectedDistrict(item)}

                                    closeModal={() => setShowDropDowns(false)}
                                />
                            }
                        </View>

                        {/* Search Functionality */}
                        <View style={{ alignItems: "center", justifyContent: "center" }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "90%",
                                borderColor: '#ccc',
                                borderWidth: 1,
                                borderRadius: 8,
                                backgroundColor: "white",
                                // paddingHorizontal: 3,
                                // elevation: 3
                            }}>
                                <TextInput
                                    placeholder={placeholderText}
                                    value={searchQuery}
                                    onChangeText={text => setSearchQuery(text)}
                                    placeholderTextColor={'rgba(93,93,93,0.5)'}
                                    style={[styles['font_size_12_regular'], {
                                        height: 40,
                                        backgroundColor: "white",
                                        color: dynamicStyles.textColor,
                                        width: "90%",
                                        alignSelf: "center",
                                    }]}
                                />
                                {/* <TouchableOpacity> */}
                                <Image style={{ height: 20, width: 20, resizeMode: "contain" }} source={require('../../src/assets/images/searchh.png')} />
                                {/* </TouchableOpacity> */}
                            </View>
                        </View>

                        {/* No Data Found */}
                        {
                            searchQuery.length > 0 && filteredData.length === 0 && apiCalledOrNot
                                ? (
                                    <View style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: 20
                                    }}>
                                        <Text style={[styles['font_size_16_bold'], {
                                            color: "red"
                                        }]}>
                                            {translate('mandiNodata')}
                                        </Text>
                                    </View>
                                ) : (
                                    <>
                                        {(
                                            <View style={{ width: '100%', marginTop: 15 }}>
                                                {
                                                    loading && pageNo === 1
                                                        ? (
                                                            // <View style={{
                                                            //     alignItems: "center",
                                                            //     justifyContent: "center",
                                                            //     marginTop: 20,
                                                            //     height: responsiveHeight(60),
                                                            // }}>
                                                            //     <ActivityIndicator size="large" color="gray" />

                                                            // </View>
                                                            <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />
                                                        ) : (
                                                            <FlatList
                                                                style={{ marginBottom: 150 }}
                                                                data={filteredData}
                                                                scrollEnabled={filteredData.length > 0}
                                                                initialNumToRender={3}
                                                                nestedScrollEnable={true}
                                                                removeClippedSubviews={true}
                                                                maxToRenderPerBatch={30}
                                                                windowSize={5}
                                                                renderItem={renderMandiPrices}
                                                                ListEmptyComponent={
                                                                    (filteredData.length === 0 && apiCalledOrNot) && <View style={{
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        marginTop: 20,
                                                                        height: responsiveHeight(60)
                                                                    }}>
                                                                        <Text style={[styles['font_size_16_bold'], {
                                                                            color: "red"
                                                                        }]}>
                                                                            {translate('mandiNodata')}
                                                                        </Text>
                                                                    </View>
                                                                }
                                                                onEndReached={handleLoadMore}
                                                                onEndReachedThreshold={0.5}
                                                                keyExtractor={(item, index) => `${item?.id || index}`}
                                                                contentContainerStyle={{ paddingBottom: 220 }}
                                                                ListFooterComponent={
                                                                    (loading && pageNo > 1 && filteredData.length > 0) ? (
                                                                        // (loading && pageNo > 1) ? ( before change
                                                                        <ActivityIndicator size="small" color="gray" />
                                                                    ) :
                                                                        //  !hasMoreData && filteredData.length>0 ? (
                                                                        //     <Text style={{ textAlign: 'center', color: 'gray' }}>{translate('No_More_Data')}</Text>
                                                                        // ) :
                                                                        null
                                                                }
                                                            />
                                                        )}
                                            </View>
                                        )}


                                        {
                                            popup &&
                                            <Modal
                                                animationType="fade"
                                                transparent={true}
                                                visible={popup}
                                                onRequestClose={() => {
                                                    setPopUp(!popup);
                                                    setSelectedCrop(null);
                                                    setSelectedFilter(FILTERS[0]);
                                                }}>

                                                <View style={styleSheetStyles.centeredView}>
                                                    <ViewShot ref={viewShotRef} style={styles.viewShot} captureMode="always" options={{ format: 'jpg', quality: 0.9 }}>
                                                        <View style={styleSheetStyles.modalView}>

                                                            {/* ---------- Header ---------- */}
                                                            <View style={{
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                width: "100%"
                                                            }}>
                                                                <Text
                                                                    ellipsizeMode='tail'
                                                                    numberOfLines={2}
                                                                    style={[styleSheetStyles.modalText, styles['font_size_18_semibold']]}
                                                                >
                                                                    {selectedCrop?.name}
                                                                </Text>

                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        setPopUp(!popup);
                                                                        setSelectedCrop(null);
                                                                        setSelectedFilter(FILTERS[0]);
                                                                    }}
                                                                >
                                                                    <Image
                                                                        source={require('../../src/assets/images/crossMark.png')}
                                                                        style={{
                                                                            tintColor: dynamicStyles.iconPrimaryColor,
                                                                            height: 20,
                                                                            width: 20,
                                                                            resizeMode: "contain"
                                                                        }}
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>

                                                            {/* ---------- Crop Image ---------- */}
                                                            <View
                                                                style={{
                                                                    borderWidth: 4,
                                                                    borderColor: "rgba(237, 50, 55, 0.28)",
                                                                    borderRadius: 9,
                                                                    backgroundColor: "rgba(237, 50, 55, 0.28)",
                                                                    marginTop: 10
                                                                }}>
                                                                <Image
                                                                    source={{ uri: selectedCrop?.image }}
                                                                    accessibilityLabel={selectedCrop?.name}
                                                                    style={{
                                                                        height: responsiveHeight(15),
                                                                        width: 300,
                                                                        resizeMode: "cover",
                                                                        borderRadius: 10
                                                                    }}
                                                                />
                                                            </View>

                                                            {/* ---------- Market Name & Share ---------- */}
                                                            <View style={{
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                width: "100%",
                                                                marginTop: 5,
                                                                paddingHorizontal: 10
                                                            }}>
                                                                <Text style={[styleSheetStyles.modalText, styles['font_size_18_semibold']]}>
                                                                    {selectedCrop?.marketName}
                                                                </Text>

                                                                {!isProcessing && <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                    <TouchableOpacity onPress={() => takeScreenshot()}>
                                                                        <Image
                                                                            source={require('../../src/assets/images/share.png')}
                                                                            style={{
                                                                                height: 30,
                                                                                width: 30,
                                                                                resizeMode: "contain",
                                                                                tintColor: dynamicStyles.iconPrimaryColor
                                                                            }}
                                                                        />
                                                                    </TouchableOpacity>
                                                                </View>}
                                                            </View>

                                                            {/* ---------- Location ---------- */}
                                                            <Text
                                                                style={[
                                                                    styles['font_size_16_regular'],
                                                                    {
                                                                        textAlign: "left",
                                                                        color: "rgba(137, 137, 137, 1)",
                                                                        width: "100%",
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                        justifyContent: "space-between",
                                                                        paddingHorizontal: 15
                                                                    }
                                                                ]}
                                                            >
                                                                {selectedCrop?.location}
                                                            </Text>

                                                            {/* ---------- ScrollView Content ---------- */}
                                                            <ScrollView style={{ width: '100%', backgroundColor: Colors.white }} showsVerticalScrollIndicator={false}>
                                                                <View style={[styleSheetStyles.center]}>
                                                                    <View style={[
                                                                        styleSheetStyles.marginTop_10,
                                                                        styleSheetStyles.widthPct_90,
                                                                        styleSheetStyles.bgF2F6F9,
                                                                        styleSheetStyles.shadow
                                                                    ]}>
                                                                        <View style={[styleSheetStyles.padding_5]}>
                                                                            {/* ---------- Top Info ---------- */}
                                                                            <View style={styleSheetStyles.row}>
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>
                                                                                        Quantity
                                                                                    </Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                                                                                        {'1'}{' '}
                                                                                        <Text style={[styles['font_size_8_bold'], styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)' }]}>
                                                                                            {translate('Quintal')}
                                                                                        </Text>
                                                                                    </Text>
                                                                                </View>

                                                                                <View style={styleSheetStyles.divider} />

                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>
                                                                                        Rate
                                                                                    </Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                                                                                        {selectedCrop?.maxPrice}{' '}
                                                                                        <Text style={[styles['font_size_8_bold'], styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)' }]}>
                                                                                            {translate('Quintal')}
                                                                                        </Text>
                                                                                    </Text>
                                                                                </View>

                                                                                <View style={styleSheetStyles.divider} />

                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>
                                                                                        Market Price
                                                                                    </Text>
                                                                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                        <Image
                                                                                            source={require('../../src/assets/images/dropdownArrow.png')}
                                                                                            style={{
                                                                                                height: 10,
                                                                                                width: 10,
                                                                                                resizeMode: "contain",
                                                                                                marginRight: 2.5,
                                                                                                tintColor: "rgba(9, 176, 43, 1)",
                                                                                                marginTop: -2,
                                                                                                transform: [{ rotate: '180deg' }]
                                                                                            }}
                                                                                        />
                                                                                        <Text style={[styles['font_size_10_bold'], styleSheetStyles.textColorGreen, styleSheetStyles.textAlignCenter]} numberOfLines={1}>
                                                                                            {selectedCrop?.maxPrice}{' '}
                                                                                            <Text style={[styles['font_size_8_bold'], styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)' }]}>
                                                                                                {translate('Quintal')}
                                                                                            </Text>
                                                                                        </Text>
                                                                                    </View>
                                                                                </View>
                                                                            </View>

                                                                            <View style={styleSheetStyles.dividerMy2} />

                                                                            {/* ---------- Details Row ---------- */}
                                                                            <View style={styleSheetStyles.row}>
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>Commodity</Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                                                                                        {selectedCrop?.commodity || '-'}
                                                                                    </Text>
                                                                                </View>
                                                                                <View style={styleSheetStyles.divider} />
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>Variety</Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                                                                                        {selectedCrop?.variety || '-'}
                                                                                    </Text>
                                                                                </View>
                                                                                <View style={styleSheetStyles.divider} />
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>Arrival Date</Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>
                                                                                        {moment(selectedCrop?.lastUpdated, "DD/MM/YYYY").format('DD-MM-YYYY')}
                                                                                    </Text>
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </View>

                                                                <View style={[styleSheetStyles.dividerMy2, { marginVertical: 0, marginTop: responsiveHeight(2), marginBottom: responsiveHeight(1) }]} />

                                                                {/* ---------- Filter Tabs ---------- */}
                                                                <FlatList
                                                                    data={FILTERS}
                                                                    horizontal
                                                                    contentContainerStyle={{
                                                                        marginVertical: 5,
                                                                        width: "100%",
                                                                        alignSelf: "center",
                                                                        justifyContent: "center",
                                                                        alignItems: "center"
                                                                    }}
                                                                    keyExtractor={(item) => item}
                                                                    renderItem={({ item }) => (
                                                                        <TouchableOpacity onPress={() => setSelectedFilter(item)} style={styleSheetStyles.tab}>
                                                                            <Text
                                                                                style={[
                                                                                    styles['font_size_16_regular'],
                                                                                    { color: "rgba(137, 137, 137, 0.7)" },
                                                                                    selectedFilter === item && [styleSheetStyles.selectedText, styles['font_size_16_bold']]
                                                                                ]}
                                                                            >
                                                                                {item}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                    showsHorizontalScrollIndicator={false}
                                                                />

                                                                {/* ---------- Chart Section ---------- */}
                                                                {graphData !== null && graphData?.labels?.length > 0 ? (
                                                                    <ScrollView
                                                                        horizontal={graphData?.labels?.length > 6}
                                                                        showsHorizontalScrollIndicator={false}
                                                                        contentContainerStyle={{ paddingHorizontal: 10 }}
                                                                    >
                                                                        <View style={[styleSheetStyles.container, { alignItems: 'center' }]}>
                                                                            <LineChart
                                                                                data={{
                                                                                    labels: graphData?.labels?.slice().reverse(),
                                                                                    datasets: [
                                                                                        {
                                                                                            data: graphData?.maxPrices?.slice().reverse(),
                                                                                            color: () => 'rgba(17, 172, 53, 1)',
                                                                                            strokeWidth: 2,
                                                                                        },
                                                                                        {
                                                                                            data: graphData?.minPrices?.slice().reverse(),
                                                                                            color: () => 'rgba(216, 193, 27, 1)',
                                                                                            strokeWidth: 2,
                                                                                        },
                                                                                    ],
                                                                                }}
                                                                                width={Math.max(responsiveWidth(85), graphData?.labels?.length * 60)}
                                                                                height={responsiveHeight(26)}
                                                                                yAxisLabel="₹"
                                                                                yAxisSuffix=""
                                                                                chartConfig={{
                                                                                    backgroundGradientFrom: '#fff',
                                                                                    backgroundGradientTo: '#fff',
                                                                                    decimalPlaces: 0,
                                                                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                                                    propsForDots: {
                                                                                        r: '5',
                                                                                        strokeWidth: '2',
                                                                                    },
                                                                                }}
                                                                                style={styleSheetStyles.chart}
                                                                            />
                                                                            <View style={styleSheetStyles.legendContainer}>
                                                                                <View style={[styleSheetStyles.legendItem, { backgroundColor: 'rgba(17, 172, 53, 1)' }]} />
                                                                                <Text style={[styleSheetStyles.legendText, styles['font_size_11_regular']]}>{translate('MaximumPrice')}</Text>
                                                                                <View style={[styleSheetStyles.legendItem, { backgroundColor: 'rgba(216, 193, 27, 1)' }]} />
                                                                                <Text style={[styleSheetStyles.legendText, styles['font_size_11_regular']]}>{translate('MinimumPrice')}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </ScrollView>
                                                                ) : (
                                                                    <View style={[{ height: responsiveHeight(10), alignItems: 'center', justifyContent: "center" }]}>
                                                                        <Text style={[{ color: dynamicStyles.textColor }, styles['centerItems'], styles['font_size_16_regular']]}>
                                                                            {translate('no_data_available')}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </ScrollView>
                                                        </View>
                                                    </ViewShot>
                                                </View>
                                            </Modal>
                                        }


                                        {/* {
                                            popup &&
                                            <Modal
                                                animationType="fade"
                                                transparent={true}
                                                visible={popup}
                                                onRequestClose={() => {
                                                    // alert('Modal has been closed.');
                                                    setPopUp(!popup);
                                                    setSelectedCrop(null)
                                                    setSelectedFilter(FILTERS[0])
                                                }}>

                                                <View style={styleSheetStyles.centeredView}>
                                                    <ViewShot ref={viewShotRef} style={styles.viewShot} captureMode="always" options={{ format: 'jpg', quality: 0.9 }}>
                                                        <View style={styleSheetStyles.modalView}>
                                                            <View style={{
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                width: "100%"
                                                            }}>
                                                                <Text ellipsizeMode='tail' numberOfLines={2} style={[styleSheetStyles.modalText,styles['font_size_18_semibold']]}>{selectedCrop?.name}</Text>
                                                                <TouchableOpacity
                                                                        onPress={() => {
                                                                            setPopUp(!popup)
                                                                            setSelectedCrop(null)
                                                                            setSelectedFilter(FILTERS[0])
                                                                        }
                                                                    }>
                                                                    <Image source={require('../../src/assets/images/crossMark.png')} style={{ tintColor: dynamicStyles.iconPrimaryColor, height: 20, width: 20, resizeMode: "contain" }} />
                                                                </TouchableOpacity>
                                                            </View>
                                                            <View style={{
                                                                borderWidth: 4, borderColor: "rgba(237, 50, 55, 0.28)", borderRadius: 9, backgroundColor: "rgba(237, 50, 55, 0.28)", marginTop: 10
                                                            }}>
                                                                <Image source={{ uri: selectedCrop?.image }}
                                                                    accessibilityLabel={selectedCrop?.name}
                                                                    style={{ height: responsiveHeight(15), width: 300, resizeMode: "cover", borderRadius: 10 }} />
                                                            </View>
                                                            <View style={{
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                width: "100%",
                                                                marginTop: 5, paddingHorizontal: 10
                                                            }}>
                                                                <Text style={[styleSheetStyles.modalText,styles['font_size_18_semibold']]}>{selectedCrop?.marketName}</Text>
                                                                <View style={
                                                                    {
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                    }
                                                                }>
                                                                    <TouchableOpacity onPress={() => takeScreenshot()}>
                                                                        <Image source={require('../../src/assets/images/share.png')} style={{ height: 30, width: 30, resizeMode: "contain", tintColor: dynamicStyles.iconPrimaryColor }} />
                                                                    </TouchableOpacity>
                                                                </View>

                                                            </View>
                                                            <Text style={
                                                                [styles['font_size_16_regular'],{
                                                                    textAlign: "left",
                                                                    color: "rgba(137, 137, 137, 1)",
                                                                    width: "100%",
                                                                    flexDirection: "row",
                                                                    alignItems: "center",
                                                                    justifyContent: "space-between",
                                                                    paddingHorizontal: 15
                                                                }]}>{selectedCrop?.location}</Text>
                                                            <ScrollView style={{ width: '100%', backgroundColor: Colors.white }}>
                                                                <View style={[styleSheetStyles.center]}>
                                                                    <View style={[styleSheetStyles.marginTop_10, styleSheetStyles.widthPct_90, styleSheetStyles.bgF2F6F9, styleSheetStyles.shadow]}>
                                                                        <View style={[styleSheetStyles.padding_5]}>
                                                                            <View style={styleSheetStyles.row}>
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>{('Quantity')}</Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>{'1'}{' '}
                                                                                        <Text style={[styles['font_size_8_bold'], styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)' }]} numberOfLines={1}>{translate('Quintal')}
                                                                                        </Text>
                                                                                    </Text>
                                                                                </View>
                                                                                <View style={styleSheetStyles.divider} />
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>{('Rate')}</Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>{selectedCrop?.maxPrice}{' '}
                                                                                        <Text style={[styles['font_size_8_bold'], styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)' }]} numberOfLines={1}>{translate('Quintal')}
                                                                                        </Text></Text>
                                                                                </View>
                                                                                <View style={styleSheetStyles.divider} />
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>{('Market Price')}</Text>
                                                                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                                        <Image source={require('../../src/assets/images/dropdownArrow.png')} style={{ height: 10, width: 10, resizeMode: "contain", marginRight: 2.5, tintColor: "rgba(9, 176, 43, 1)", marginTop: -2, transform: [{ rotate: '180deg' }] }} />
                                                                                        <Text style={[styles['font_size_10_bold'], styleSheetStyles.textColorGreen, styleSheetStyles.textAlignCenter]} numberOfLines={1}>{selectedCrop?.maxPrice}{' '}
                                                                                            <Text style={[styles['font_size_8_bold'], styleSheetStyles.textAlignCenter, { color: 'rgba(185, 187, 186, 1)' }]} numberOfLines={1}>{translate('Quintal')}
                                                                                            </Text></Text>
                                                                                    </View>
                                                                                </View>
                                                                            </View>

                                                                            <View style={styleSheetStyles.dividerMy2} />
                                                                            <View style={styleSheetStyles.row}>
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>{('Commodity')}</Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>{selectedCrop?.commodity || '-'}</Text>
                                                                                </View>
                                                                                <View style={styleSheetStyles.divider} />
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>{('Variety')}</Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>{selectedCrop?.variety || '-'}</Text>
                                                                                </View>
                                                                                <View style={styleSheetStyles.divider} />
                                                                                <View style={[styleSheetStyles.widthPct_33, styleSheetStyles.padding_5]}>
                                                                                    <Text style={[styles['font_size_11_regular'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]}>{('Arrival Date')}</Text>
                                                                                    <Text style={[styles['font_size_10_bold'], styleSheetStyles.textAlignCenter, { color: dynamicStyles.textColor }]} numberOfLines={1}>{moment(selectedCrop?.lastUpdated, "DD/MM/YYYY").format('DD-MM-YYYY')}</Text>
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                               <View style={[styleSheetStyles.dividerMy2, { marginVertical: 0, marginTop: responsiveHeight(2), marginBottom: responsiveHeight(1) }]} />
                                                                <FlatList
                                                                    data={FILTERS}
                                                                    horizontal
                                                                    contentContainerStyle={{ marginVertical: 5, width: "100%",alignSelf:"center",justifyContent:"center",alignItems:"center" }}
                                                                    keyExtractor={(item) => item}
                                                                    renderItem={({ item }) => (
                                                                        <TouchableOpacity onPress={() => setSelectedFilter(item)} style={styleSheetStyles.tab}>
                                                                            <Text style={[styles['font_size_16_regular'],{color:"rgba(137, 137, 137, 0.7)"}, selectedFilter === item && [styleSheetStyles.selectedText,styles['font_size_16_bold']]]}>
                                                                                {item}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                    showsHorizontalScrollIndicator={false}
                                                                />
                                                                {graphData !== null && graphData?.labels.length > 0 ? <View style={styleSheetStyles.container}>
                                                                    <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingRight: 20 }}
>

                                                                    <LineChart
                                                                        data={{
                                                                            labels: graphData?.labels?.slice().reverse(),
                                                                            // labels: graphData?.labels?.reverse().slice(0, -1),
                                                                            datasets: [
                                                                                {
                                                                                    data: graphData?.maxPrices?.slice().reverse(), // Maximum Price
                                                                                    color: () => 'rgba(17, 172, 53, 1)',
                                                                                    strokeWidth: 2,
                                                                                },
                                                                                {
                                                                                    data: graphData?.minPrices?.slice().reverse(), // Minimum Price
                                                                                    color: () => 'rgba(216, 193, 27, 1)',
                                                                                    strokeWidth: 2,
                                                                                },
                                                                            ],
                                                                        }}
                                                                        width={responsiveWidth(85)}
                                                                        height={responsiveHeight(26)}
                                                                        yAxisLabel="₹"
                                                                        yAxisSuffix=""
                                                                        chartConfig={{
                                                                            backgroundGradientFrom: '#fff',
                                                                            backgroundGradientTo: '#fff',
                                                                            decimalPlaces: 0,
                                                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                                            // color: (opacity = 1) => `rgba(211, 21, 10, ${opacity})`,
                                                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                                            propsForDots: {
                                                                                r: '5',
                                                                                strokeWidth: '2',
                                                                                // stroke: 'red',
                                                                            },
                                                                            // propsForBackgroundLines: {
                                                                            //     strokeWidth: 0, 
                                                                            // },
                                                                            // xAxisInterval: 4, 

                                                                        }}
                                                                        style={styleSheetStyles.chart}
                                                                    />
                                                                    </ScrollView>
                                                                    <View style={styleSheetStyles.legendContainer}>
                                                                        <View style={[styleSheetStyles.legendItem, { backgroundColor: 'rgba(17, 172, 53, 1)' }]} />
                                                                        <Text style={[styleSheetStyles.legendText,styles['font_size_11_regular'],]}>{translate('MaximumPrice')}</Text>
                                                                        <View style={[styleSheetStyles.legendItem, { backgroundColor: 'rgba(216, 193, 27, 1)' }]} />
                                                                        <Text style={[styleSheetStyles.legendText,styles['font_size_11_regular'],]}>{translate('MinimumPrice')}</Text>
                                                                    </View>
                                                                </View> : <View style={[{height:responsiveHeight(10), alignItems: 'center',justifyContent: "center",}]}>
                                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['centerItems'],styles['font_size_16_regular']]}>{translate('no_data_available')}</Text>
                                                                </View>}
                                                            </ScrollView>
                                                        </View>
                                                    </ViewShot>
                                                </View>
                                            </Modal>
                                        } */}
                                        {/* Render Crops Data */}
                                        {!mandiSelected && (
                                            <View style={{ marginBottom: 200 }}>
                                                {loading && pageNo === 1 ? (
                                                    // <ActivityIndicator size="large" color="gray" />
                                                    <></>
                                                ) : (
                                                    <FlatList
                                                        data={filteredData}
                                                        keyExtractor={(item, index) => `${item.name || index}`}
                                                        renderItem={renderCropsData}
                                                        // onEndReachedThreshold={0.2}
                                                        onEndReachedThreshold={0.5}
                                                        onEndReached={handleLoadMore}
                                                        showsVerticalScrollIndicator={false}
                                                        ListFooterComponent={
                                                            (loading && pageNo > 1) ? (
                                                                <ActivityIndicator size="small" color="gray" />
                                                            )
                                                                // : !hasMoreData && filteredData.length>0 ? (
                                                                //     <Text style={{ textAlign: 'center', color: 'gray' }}>{translate('No_More_Data')}</Text>
                                                                // )
                                                                : null
                                                        }
                                                        contentContainerStyle={{ paddingBottom: 90 }}
                                                        style={{
                                                            width: '95%',
                                                            alignSelf: 'center',
                                                            marginBottom: 90
                                                        }}
                                                    />
                                                )}
                                            </View>

                                        )}
                                        {mainLoader && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
                                    </>
                                )}
                    </View>
                </View>
            </View>
            {
                showAlert &&
                <CustomAlert
                    onPressClose={() => { handleCancelAlert() }}
                    title={alertTitle}
                    showHeader={showAlertHeader}
                    showHeaderText={showAlertHeaderText}
                    message={alertMessage}
                    onPressOkButton={() => { handleCancelAlert() }}
                    onPressNoButton={() => { handleCancelAlert() }}
                    showYesButton={showAlertYesButton}
                    showNoButton={showAlertNoButton}
                    yesButtonText={showAlertyesButtonText}
                    noButtonText={showAlertNoButtonText} />
            }
        </SafeAreaView>
    );
}

let styleSheetStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        alignSelf: "center",
    },
    tab: {
        marginHorizontal: 7,
        // backgroundColor:"red"
    },
    text: {
        color: 'rgba(137, 137, 137, 1)',
    },
    selectedText: {
        color: 'rgba(0, 0, 0, 1)',
    },
    chart: {
        marginTop: 8,
        borderRadius: 16,
        alignSelf: "center",
    },
    viewShot: {
        width: '100%',
        height: '100%',
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginTop: 10,
    },
    legendItem: {
        width: 10,
        height: 10,
        borderRadius: 50,
        marginHorizontal: 5,
    },
    legendText: {
        color: '#000',
        marginRight: 10,
    },

    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    marginTop_10: {
        marginTop: 10,
    },
    widthPct_90: {
        width: '100%',
    },
    bgF2F6F9: {
        backgroundColor: 'rgba(242, 246, 249, 1)',
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        borderRadius: 10
    },
    widthPct_33: {
        width: '33%',
    },
    padding_5: {
        padding: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    divider: {
        borderWidth: 0.5,
        borderColor: '#D1D5DB',
        height: 50,
        marginVertical: 3
    },
    textAlignCenter: {
        textAlign: 'center',
    },
    textColorGreen: {
        color: 'rgba(9, 176, 43, 1)',
    },
    textColor: {
        color: '#000',
    },
    dividerMy2: {
        marginVertical: 6,
        borderBottomWidth: 0.5,
        borderColor: '#D1D5DB',
    },

    card: {
        width: 160,
        height: 230,
        borderRadius: 10,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        position: "relative",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
        position: "absolute",
    },
    nameContainer: {
        position: "absolute",
        bottom: 10,
        backgroundColor: "rgba(255,255,255,0.8)",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    overlay: {
        position: "absolute",
        width: "100%",
        // height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)", // Semi-transparent black
        // justifyContent: "center",
        // alignItems: "center",
        borderRadius: 8,
        padding: 10,
        flex: 1,
        justifyContent: 'space-between',
    },
    overlayTitle: {
        color: "#fff",
        marginBottom: 2,
    },
    detail: {
        marginBottom: 2.5,
        color: "#ccc",
    },
    price: {
        color: "#fff",
        marginVertical: 3.5,
    },
    button: {
        backgroundColor: "red",
        // padding: 5, //old change
        borderRadius: 50,
        //new changes
        width: "100%",
        height: '20%',
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: '25%'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#000000d6"
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    modalText: {
        textAlign: "left",
        color: "rgba(0, 0, 0, 1)",
        // backgroundColor:"red",
        width: "85%"
    },
    modalView: {
        // height: responsiveHeight(100),
        width: responsiveWidth(90),
        // margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
    },
});


export default MandiPricesScreen;