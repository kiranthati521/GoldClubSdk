import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from "react";
import { Styles } from "../assets/style/styles";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import { View, Image, Text, TouchableOpacity, FlatList, ScrollView, Modal, Platform, StatusBar } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors } from "../assets/Utils/Color";
import { strings } from "../strings/strings";
import CustomInputDropDown from "../Components/CustomInputDropDown";
import CustomButton from "../Components/CustomButton";
import { GetApiHeaders, getNetworkStatus, GetRequest, PostRequest } from "../NetworkUtils/NetworkUtils";
import SimpleToast from "react-native-simple-toast";
import CustomLoader from "../Components/CustomLoader";
import { HTTP_OK, configs } from "../helpers/URLConstants";
import CustomListViewModal from "../Modals/CustomListViewModal";
import moment from "moment";
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import CustomPaginationScanHistory from '../Components/CustomPaginationScanHistory';
import CustomAlert from '../Components/CustomAlert';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const records_per_page = 10;

export const getDataOfScanHistory = async () => {
    let realm = new Realm({ path: 'User.realm' });
    const programsList = realm.objects('ScanHistoryProgramsList')
    let globalProgramName;
    let globalProgramID;
    if (programsList.length !== 0) {
        let data = programsList[0];
        const apiResponse = JSON.parse(data?.data);
        let programLs = apiResponse?.response?.programList
        let currentDBProgram = apiResponse?.response?.currentDBProgram
        let filterz = programLs.filter((item) => item?.id === currentDBProgram?.id)
        globalProgramName = filterz[0]?.name;
        globalProgramID = filterz[0]?.id;
    }
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        var header = await GetApiHeaders();
        var input = {
            fromDate: "",
            toDate: "",
            programName: globalProgramName || '',
            programId: globalProgramID || null,
            companyName: '',
            companyId: 0,
            companyCode: "",
        };
        var url = configs.BASE_URL + configs.QRSCAN.SCAN_HISTORY_V3;
        console.log("URL =>", url, " Headers =>", header, " Input =>", input);
        var apiResponse = await PostRequest(url, header, input);
        console.log(apiResponse, "<---------------------===================== scan history response")
        if (apiResponse?.response?.cropList.length > 0) {
            try {
                realm.write(() => {
                    realm.delete(realm.objects('ScanHistoryResponse'));
                    realm.create('ScanHistoryResponse', {
                        _id: new Date(),
                        data: JSON.stringify(apiResponse),
                        timestamp: new Date(),
                    });
                    console.log('added successfully into realm scan history')
                });
            } catch (err) {
                console.log(err)
            }
        }
    }
}

export const getProgramsList = async () => {
    let realm = new Realm({ path: 'User.realm' });
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        var header = await GetApiHeaders();
        var url = configs.BASE_URL + configs.QRSCAN.PROGRAMS_LIST;
        console.log("URL =>", url, " Headers =>", header,);
        var apiResponse = await GetRequest(url, header);
        console.log(apiResponse, "<---------------------===================== scan history programs list response")
        if (apiResponse?.response?.programList.length > 0) {
            try {
                realm.write(() => {
                    realm.delete(realm.objects('ScanHistoryProgramsList'));
                    realm.create('ScanHistoryProgramsList', {
                        _id: new Date(),
                        data: JSON.stringify(apiResponse),
                        timestamp: new Date(),
                    });
                    console.log('added successfully into realm scan history programs list')
                });
            } catch (err) {
                console.log(err)
            }
        }
    }
}

function ScanHistory({ route }) {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    var realm = new Realm({ path: 'User.realm' });
    const navigation = useNavigation();
    const totalPoints = route?.params?.userPointsEarned;
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const networkStatus = useSelector(state => state.networkStatus.value)
    const [dropDownData, setdropDownData] = useState();
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [scanHistoryData, setScanHistoryData] = useState([])
    const [scanHistoryDataDummy, setScanHistoryDataDummy] = useState([])
    const [seasonName, setSeasonName] = useState(translate('select_season'))
    const [programName, setProgramName] = useState('')
    const [programID, setProgramID] = useState(0)
    const [programList, setProgramList] = useState([])
    const [companyList, setCompanyList] = useState([])
    const [companyName, setCompanyName] = useState('')
    const [companyId, setCompanyId] = useState(0)
    const [companyCode, setCompanyCode] = useState(0);
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
    const [signUpBonusPoints, setSignUpBonusPoints] = useState(0)
    const companyStyle = useSelector(getCompanyStyles);
    const [showAlert, setShowAlert] = useState(false)
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [alertTitle, setAlertTitle] = useState('');
    const [showAlertHeader, setShowAlertHeader] = useState(false)
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertYesButton, setShowAlertYesButton] = useState(false)
    const [showAlertNoButton, setShowAlertNoButton] = useState(false)
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)


    useFocusEffect(
        React.useCallback(() => {
            handleFocus();
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [networkStatus])
    );

    const getProgramsListLocal = async () => {
        let realm = new Realm({ path: 'User.realm' });
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            var header = await GetApiHeaders();
            var url = configs.BASE_URL + configs.QRSCAN.PROGRAMS_LIST;
            console.log("URL =>", url, " Headers =>", header,);
            var apiResponse = await GetRequest(url, header);
            console.log(apiResponse, "<---------------------===================== scan history programs list response")
            if (apiResponse?.response?.programList.length > 0) {
                try {
                    realm.write(() => {
                        realm.delete(realm.objects('ScanHistoryProgramsList'));
                        realm.create('ScanHistoryProgramsList', {
                            _id: new Date(),
                            data: JSON.stringify(apiResponse),
                            timestamp: new Date(),
                        });
                        console.log('added successfully into realm scan history programs list')
                    });
                    setProgramList(apiResponse?.response?.programList || [])
                    setCompanyList(apiResponse?.response?.CompanyList || [])
                    let programLs = apiResponse?.response?.programList
                    let currentDBProgram = apiResponse?.response?.currentDBProgram
                    let filterz = programLs.filter((item) => item?.id === currentDBProgram?.id)
                    setProgramName(filterz[0]?.name)
                    setProgramID(filterz[0]?.id)
                } catch (err) {
                    console.log(err)
                }
            }
        }
    }

    const handleFocus = () => {
        console.log('Screen is focused!');
        const programsList = realm.objects('ScanHistoryProgramsList')
        checkRealData()
        if (networkStatus) {
            // getSeasonMaster();
            submitButtonPress(seasonName, 'useLocalId')
            if (programsList.length === 0) {
                getProgramsListLocal()
            }
        }
    };

    const handleCancelAlert = () => {
        setShowAlert(false)
    }

    let checkRealData = async () => {
        const scanHistoryData = realm.objects('ScanHistoryResponse');
        const programsList = realm.objects('ScanHistoryProgramsList')
        console.log(scanHistoryData, "<===================== scan history dataaaaa")
        if (scanHistoryData.length !== 0) {
            let data = scanHistoryData[0];
            const apiResponse = JSON.parse(data?.data);
            setCropHistoryData(apiResponse?.response?.cropList)
            console.log("SAINATH_REDDY", JSON.stringify(apiResponse));
            setShowScanData(false)
            setShowProductData(false)
            setShowCropData(true)
            setNumberOfRecords(apiResponse?.response?.count)
            const total_pages = Math.ceil(apiResponse?.response?.count / records_per_page);
            const pagesAr = generateIntegerArray(total_pages)
            setBonusPoints(apiResponse?.response?.bonusPoints)
            setSignUpBonusPoints(apiResponse?.response?.signUpBonusPoints)
            setPagesArray(pagesAr)
            setNumberOfPages(total_pages)
            console.log(pagesAr);
        }
        if (programsList.length !== 0) {
            let data = programsList[0];
            const apiResponse = JSON.parse(data?.data);
            setProgramList(apiResponse?.response?.programList || [])
            setCompanyList(apiResponse?.response?.CompanyList || [])
            let programLs = apiResponse?.response?.programList
            let currentDBProgram = apiResponse?.response?.currentDBProgram
            let filterz = programLs.filter((item) => item?.id === currentDBProgram?.id)
            setProgramName(filterz[0]?.name)
            setProgramID(filterz[0]?.id)
        }
        else {
            if (!networkStatus) {
                showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
            }
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

    const goBack = async () => {
        navigation.goBack()
    };


    const paginateData = (data, page, recordsPerPage) => {
        const totalRecords = data?.length || 0;
        const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1;
        const validPage = Math.max(1, Math.min(page, totalPages));
        const startIndex = (validPage - 1) * recordsPerPage;
        console.log("startIndex", startIndex)
        console.log("recordsPerPage", recordsPerPage)
        console.log("totalPages", totalPages)
        const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
        console.log("endIndex", endIndex)
        const paginatedData = data?.slice(startIndex, endIndex) || [];
        console.log("paginatedData", paginatedData)
        return {
            paginatedData,
            totalRecords,
            totalPages,
            startIndex,
            endIndex
        };
    };

    const submitButtonPress = async (seasonNameIS, sendProgramID = null) => {
        console.log('what is coming SCAN_HISTORY:', seasonNameIS)
        const programsList = realm.objects('ScanHistoryProgramsList')
        let localProgramName;
        let localProgramID;

        let localCompanyName;
        let localCompanyID;

        if (programsList.length !== 0) {
            let data = programsList[0];
            const apiResponse = JSON.parse(data?.data);
            let programLs = apiResponse?.response?.programList
            let currentDBProgram = apiResponse?.response?.currentDBProgram
            let filterz = programLs.filter((item) => item?.id === currentDBProgram?.id)
            localProgramName = filterz[0]?.name;
            localProgramID = filterz[0]?.id;
            if (sendProgramID !== null) {
                setProgramID(localProgramID)
                setProgramName(localProgramName)
            }
        }
        var header = await GetApiHeaders();
        var input = {
            fromDate: "",
            toDate: "",
            programName: sendProgramID !== null ? localProgramName || '' : programName || '',
            programId: sendProgramID !== null ? localProgramID || null : programID || 0,

            companyName: companyName || '',
            companyId: companyId || 0,
            companyCode: companyCode || "",
        };

        var url = configs.BASE_URL + configs.QRSCAN.SCAN_HISTORY_V3;

        console.log("URL =>", url, " Headers =>", header, " Input =>", input);
        var apiResponse = await PostRequest(url, header, input);
        if (apiResponse?.response?.cropList.length > 0) {
            setCropHistoryData(apiResponse?.response?.cropList)
            console.log("online sainath reddy scan history data", JSON.stringify(apiResponse));
            setShowScanData(false)
            setShowProductData(false)
            setShowCropData(true)
            setNumberOfRecords(apiResponse?.response?.count)
            const total_pages = Math.ceil(apiResponse?.response?.count / records_per_page);
            const pagesAr = generateIntegerArray(total_pages)
            setBonusPoints(apiResponse?.response?.bonusPoints)
            setSignUpBonusPoints(apiResponse?.response?.signUpBonusPoints)
            setPagesArray(pagesAr)
            setNumberOfPages(total_pages)
            console.log(pagesAr);
            try {
                // realm.write(() => {
                //     realm.delete(realm.objects('ScanHistoryResponse'));
                //     realm.create('ScanHistoryResponse', {
                //         _id: new Date(),
                //         data: JSON.stringify(apiResponse),
                //         timestamp: new Date(),
                //     });
                //     console.log('added successfully into realm scan history')
                // });
            } catch (err) {
                console.log(err)
            }
        }
        if (apiResponse?.response?.cropList?.length === 0) {
            setCropHistoryData(apiResponse?.response?.cropList)
            console.log("online sainath reddy scan history data", JSON.stringify(apiResponse));
            setShowScanData(false)
            setShowProductData(false)
            setShowCropData(true)
            setNumberOfRecords(apiResponse?.response?.count)
            const total_pages = Math.ceil(apiResponse?.response?.count / records_per_page);
            const pagesAr = generateIntegerArray(total_pages)
            setBonusPoints(apiResponse?.response?.bonusPoints)
            setSignUpBonusPoints(apiResponse?.response?.signUpBonusPoints)
            setPagesArray(pagesAr)
            setNumberOfPages(total_pages)
            console.log(pagesAr);
        }
        setTimeout(() => {
            setLoading(false)
            setLoadingMessage("")
        }, 500);
    }

    function generateIntegerArray(n) {
        const result = [];
        for (let i = 1; i <= n; i++) {
            result.push(i);
        }
        return result;
    }

    async function getProductsScanned(item) {
        setProductsHistoryData(item?.productList)
        setShowCropData(false)
        setShowProductData(true)
    }


    const getScannedHistory = (item, page) => {
        console.log("item", item)
        console.log("page", page)
        console.log("paginatedData", item?.couponsList)
        const {
            paginatedData,
            totalRecords,
            totalPages
        } = paginateData(item?.couponsList, page, records_per_page);
        console.log("paginatedData===>", paginatedData)
        setNumberOfRecords(totalRecords);
        setScanHistoryData(paginatedData);
        setScanHistoryDataDummy(item?.couponsList || []);
        setShowCropData(false);
        setShowProductData(false);
        setShowScanData(true);
        setNumberOfPages(totalPages);
        setPagesArray(generateIntegerArray(totalPages));
        setSelectedPageIndex(page - 1);
    };

    function renderScanHistory(item, index) {
        console.log("item", index)
        return (
            <TouchableOpacity style={[{ height: 70, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => {
                setShowCouponDetails(true);
                setItemClicked(item)
            }}>
                <View style={[styles['centerItems'], { width: '20%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{(selectedPageIndex * records_per_page) + index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '50%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4', }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold'],]}>{item.couponCode}</Text>
                </View>

                <View style={[styles['centerItems'], { width: '30%' }]}>
                    <Text style={[(item.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? styles['text_color_green'] : styles['text_color_red']), styles['font_size_13_semibold'], styles['text_align_center']]}>{item.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? " + " + item.pointsEarned : " - " + item.pointsEarned}</Text>
                </View>

            </TouchableOpacity>
        )
    }

    function renderProductsItems(item, index) {
        return (
            <TouchableOpacity style={[{
                height: 70, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4',
                flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between'
            }]} key={index.toString()} onPress={() => {
                setProductId(item.productId)
                setProductName(item.productName)
                getScannedHistory(item, 1)
                setProductItem(item)
            }}>
                <View style={[styles['centerItems'], { width: '20%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '30%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_left'], styles['font_size_13_semibold'], { color: '#00881E' }]}>{item.productName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_left'], styles['font_size_13_semibold']]}>{item.noOfBagsScanned}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_left'], styles['font_size_13_semibold']]}>{item.pointsEarned}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    function renderCropHistoryItem(item, index) {
        console.log("ssasasasa", index)
        return (
            <TouchableOpacity style={[{
                height: 70, width: '100%', borderTopWidth: 0.5,
                borderColor: '#B4B4B4', flexDirection: 'row',
                flexGrow: 1, justifyContent: 'space-between',
            }]} key={index.toString()} onPress={() => {
                setCropName(item.cropName)
                setCropId(item.cropId)
                getProductsScanned(item)
            }}>
                <View style={[styles['centerItems'], { width: '10%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_12_semibold']]}>{index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_12_semibold'], styles['text_color_black']]}>{item.companyName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_12_semibold'], { color: '#00881E' }]}>{item.cropName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '20%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_12_semibold']]}>{item.noOfBagsScanned}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '20%' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_12_semibold']]}>{item.pointsEarned}</Text>
                </View>
            </TouchableOpacity>
        )
    }



    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    const onSelectedSeasonItem = (itemdata) => {
        if (itemdata != null) {
            setSeasonName(itemdata?.name)
            setShowDropDowns(false)
            setProgramName(itemdata?.name)
            setProgramID(itemdata?.id)
        }
    }
    const onSelectedCompanyNameItem = (itemdata) => {
        if (itemdata != null) {
            setCompanyId(itemdata?.id)
            setCompanyName(itemdata?.name)
            setCompanyCode(itemdata?.companyCode);
            setShowDropDowns(false)
        }
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



    const sortFilterData = (filter) => {

        console.log('++++++++', scanHistoryDataDummy);
        if (filter == translate('oldtoNew')) {
            var sortedData = scanHistoryDataDummy.sort((a, b) => {
                return new Date(a.transactionDate) - new Date(b.transactionDate);
            });
            setScanHistoryData(sortedData)
        } else if (filter == translate('newtoOld')) {
            var sortedData = scanHistoryDataDummy.sort((a, b) => {
                return new Date(b.transactionDate) - new Date(a.transactionDate);
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


    const showCouponData = () => {
        const momentDate = moment(itemClicked?.transactionDate, "YYYY-MM-DD HH:mm:ss.SSS");
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
                            <Image style={[{ height: '100%', width: '100%', tintColor: dynamicStyles.iconPrimaryColor }]} source={require('../assets/images/cancel.png')} />
                        </TouchableOpacity>
                        <View style={{ width: '80%', borderRadius: 15, padding: 10, backgroundColor: "#1ebb001f", alignSelf: 'center', marginTop: 10, marginBottom: 15 }}>
                            <View style={styles.flex_direction_row}>
                                <Image style={[styles.font_size_16_semibold, { height: 50, width: 50, padding: 10, alignSelf: 'flex-start' }]} source={itemClicked == undefined ? require('../assets/images/ic_default_scan.png') : { uri: itemClicked?.productImage }} resizeMode="contain" />
                                <View style={[styles['margin_left_15']]}>
                                    <Text style={[styles['font_size_14_regular'], { textAlign: 'center', color: 'black', padding: 2 }]}>{itemClicked?.brandName}</Text>
                                    {(itemClicked?.productDescription !== undefined && itemClicked?.productDescription !== null) &&
                                        <Text style={[styles['font_size_12_regular'], { textAlign: 'center', color: 'black', padding: 2 }]}>
                                            {itemClicked?.productDescription + " | " + itemClicked?.packSize}
                                        </Text>}
                                    {/* <Text style={[styles['font_size_12_regular'], { textAlign: 'center', color: 'grey', padding: 2 }]}>{itemClicked?.productDescription + " | " + itemClicked?.packSize}</Text> */}
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
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{itemClicked?.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? translate('credit_points') : translate('debit_points')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: itemClicked?.creditOrDebit?.toLowerCase() == translate('credit').toLowerCase() ? Colors.green : Colors.themeRed, padding: 2, width: '45%' }]}>{itemClicked?.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? "+ " + itemClicked?.pointsEarned : " - " + itemClicked?.pointsEarned}</Text>
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
    }

    return (
        <View style={[styles['full_screen'], { backgroundColor: Colors.very_light_grey }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={[{ backgroundColor: dynamicStyles.primaryColor, borderBottomEndRadius: 10, borderBottomStartRadius: 10, paddingTop: Platform.OS === 'ios' ? 40 : 0 }]}>
                <TouchableOpacity style={[styles['flex_direction_row'], Platform.OS == "ios" ? styles['margin_top_20'] : styles['margin_top_10'],]} onPress={() => { goBack() }}>
                    <Image style={[styles['margin_left_20'], styles[''], { tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: Platform.OS == 'ios' ? 10 : 10 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], styles[''], { color: dynamicStyles.secondaryColor }, styles[''], styles['font_size_18_bold'], { marginTop: 5 }, Platform.OS === 'ios' && { minHeight: 26 }]}>{translate('scan_history')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ position: "absolute", top: Platform.OS == "ios" ? 60 : 10, right: 20 }} onPress={() => {
                    // GetComplaintsApiCall(true)
                    if (networkStatus) {
                        setLoading(true)
                        setLoadingMessage(translate('please_wait_getting_data'))
                        //reset prev values
                        setCropHistoryData([])
                        setShowScanData(false)
                        setShowProductData(false)
                        setShowCropData(true)
                        setNumberOfRecords(0)
                        setBonusPoints(0)
                        setSignUpBonusPoints(0)
                        setPagesArray([])
                        setNumberOfPages(0)
                        //call again
                        submitButtonPress(seasonName, 'useLocalId')
                    } else {
                        SimpleToast.show(translate('no_internet_conneccted'))
                    }
                }}>
                    <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 30, width: 30, resizeMode: "contain" }]} source={require('../assets/images/dataRefresh.png')}></Image>
                </TouchableOpacity>

                <View style={[styles['flex_direction_row'], styles['width_90%'], styles['height_80'], styles['bg_white'], styles['border_radius_6'], styles['centerItems'], { marginTop: 20, marginBottom: 10 }]}>
                    <View style={[{ width: '15%' }]}>
                        <Image style={[styles['width_height_50'], { marginRight: 25, tintColor: dynamicStyles.iconPrimaryColor }]} source={require('../assets/images/ic_cummulative.png')}></Image>
                    </View>
                    <View style={[styles['flex_direction_column'], styles['margin_left_20'], { width: '60%' }]}>
                        <Text style={[styles['font_size_16_bold'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_5']]}>{totalPoints}</Text>
                        <Text style={[styles['font_size_12_regular'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_5']]}>{translate('totalPoints') + " " + translate('EarnedTillDate')}</Text>
                    </View>
                </View>
            </View>

            <View style={[{ padding: 10, width: '95%', backgroundColor: 'white', marginTop: 10 }, styles['centerItems'], styles['border_radius_8']]}>
                <CustomInputDropDown
                    width={[styles['width_100%'], styles['centerItems']]}
                    defaultValue={programName != undefined ? programName : translate('Select_Programs')}
                    labelName={translate('Programs')}
                    IsRequired={false}
                    placeholder={translate('Select_Programs')}
                    onEndEditing={async event => {
                    }}
                    onFocus={() => {
                        changeDropDownData(programList.sort((a, b) => a.displayOrder - b.displayOrder), strings.season, programName)
                    }}
                />

                <CustomInputDropDown
                    width={[styles['width_100%'], styles['centerItems']]}
                    defaultValue={companyName != undefined ? companyName : translate('company_name')}
                    labelName={translate('company_name')}
                    IsRequired={false}
                    placeholder={translate('select_company_name')}
                    onEndEditing={async event => {
                    }}
                    onFocus={() => {
                        changeDropDownData(companyList.sort((a, b) => a.displayOrder - b.displayOrder), strings.company, companyName)
                    }}
                />

                <CustomButton title={translate('submit')} onPress={() => {
                    if (networkStatus) {
                        setLoading(true)
                        setLoadingMessage(translate('please_wait_getting_data'))
                        //reset prev values
                        setCropHistoryData([])
                        setShowScanData(false)
                        setShowProductData(false)
                        setShowCropData(true)
                        setNumberOfRecords(0)
                        setBonusPoints(0)
                        setSignUpBonusPoints(0)
                        setPagesArray([])
                        setNumberOfPages(0)
                        //call again
                        submitButtonPress(seasonName)
                    } else {
                        SimpleToast.show(translate('no_internet_conneccted'))
                    }
                }} buttonBg={dynamicStyles.primaryColor} btnWidth={"100%"} titleTextColor={dynamicStyles.secondaryColor} />
            </View>
            <ScrollView style={[{ marginTop: 10, marginBottom: numberOfPages > 1 ? 55 : 20, }]}>
                <View style={[styles['centerItems'], { height: '100%', width: '95%' }]}>
                    <View style={[{ width: '100%', backgroundColor: Colors.white, borderRadius: 8, padding: 5 }]}>
                        {!showCropData &&
                            <View style={[{ width: '100%' }]}>
                                <TouchableOpacity style={[{ alignSelf: 'flex-start', 
                                alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop:10 }]} onPress={() => { checkPagesDisplying() }}>
                                    <Image style={[{ alignSelf: 'center', height: 15, width: 20, transform: [{ scaleX: -1 }], tintColor: 'black' }]} source={require('../assets/images/arrowLineWhite.png')} />
                                    <Text style={[styles['font_size_16_semibold'], styles['margin_left_10'], { color: dynamicStyles.textColor }]}>{translate('back')}</Text>
                                </TouchableOpacity>
                                <View style={[{ alignSelf: 'flex-end' }]}>
                                    <Text style={[styles['font_size_13_semibold'], { textAlign: 'right', marginEnd: 10, color: '#00881E' }]}>{cropName}
                                        {showScanData && <Text style={[{ color: Colors.black }]}>{" -- "} <Text style={[styles['font_size_13_semibold'], { textAlign: 'right', marginEnd: 50, color: '#00881E' }]}>{productName}</Text></Text>}</Text>
                                </View>
                            </View>}

                        <View style={[{ borderRadius: 8, borderWidth: 0.5, borderColor: '#B4B4B4', overflow: 'hidden' }]}>
                            {showCropData &&
                                <View style={[{ height: 60, width: '100%', backgroundColor: '#E5E5E5', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                                    <View style={[styles['centerItems'], { width: '10%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('sno')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4', }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('company_name')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('crop2')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '20%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4', }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('noofbagsScanned')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '20%' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('points')}</Text>
                                    </View>
                                </View>}

                            {showProductData &&
                                <View style={[{ height: 60, width: '100%', backgroundColor: '#E5E5E5', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                                    <View style={[styles['centerItems'], { width: '20%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('sno')}</Text>
                                    </View>

                                    <View style={[styles['centerItems'], { width: '30%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('products')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4', }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('noofbagsScanned')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '25%' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('points')}</Text>
                                    </View>
                                </View>}

                            {showScanData &&
                                <View style={[{ height: 60, width: '100%', backgroundColor: '#E5E5E5', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                                    <View style={[styles['centerItems'], { width: '20%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('sno')}</Text>
                                    </View>

                                    <View style={[styles['centerItems'], { width: '50%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4', }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('couponCode')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '30%' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('points')}</Text>
                                    </View>
                                </View>}

                            {showCropData ? (
                                ((cropHistoryData != undefined && cropHistoryData.length == 0)) &&
                                <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                    <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                                </View>
                            ) :
                                showProductData ? (
                                    ((productsHistoryData != undefined && productsHistoryData.length == 0)) &&
                                    <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                                    </View>
                                ) :
                                    showScanData ? (
                                        ((scanHistoryData != undefined && scanHistoryData.length == 0)) &&
                                        <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                            <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
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
                                    )
                                        : (
                                            <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                                {/* <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text> */}
                                            </View>

                                        )
                            }
                        </View>
                    </View>

                    {showCropData && (cropHistoryData != undefined && cropHistoryData.length > 0) &&
                        <View style={[{ width: '100%', backgroundColor: Colors.white, borderRadius: 8, padding: 5, marginTop: 10 }]}>

                            <View style={[{
                                height: 50, width: '100%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between',
                                borderTopWidth: 0.5, borderColor: '#B4B4B4'
                            }]}>
                                <View style={[{ width: "100%", backgroundColor: '#E5E5E5', height: '100%', borderColor: '#B4B4B4', justifyContent: 'center' }]}>
                                    <Text style={[{ color: dynamicStyles.textColor, paddingStart: 10 }, styles['font_size_13_semibold']]}>{translate('total_earned_points')}</Text>
                                </View>
                                {/* <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('bonus_points')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('signUp_bonus')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '25%' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('totalPoints')}</Text>
                                    </View> */}
                            </View>


                            <View style={[{ height: 50, width: '100%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', borderTopWidth: 0.5, borderColor: '#B4B4B4' }]}>
                                <View style={[{ width: '100%', height: '100%', borderColor: '#B4B4B4', justifyContent: 'center' }]}>
                                    <Text style={[{ color: dynamicStyles.textColor, paddingStart: 10 }, styles['font_size_13_semibold']]}>{cropHistoryData != undefined ? cropHistoryData.reduce((acc, crop) => acc + crop.pointsEarned, 0) : 0}</Text>
                                </View>
                                {/* <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{bonusPoints}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{signUpBonusPoints}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '25%' }]}>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['text_align_center'], styles['font_size_13_semibold']]}>{(Number.parseInt(signUpBonusPoints) + Number.parseInt(bonusPoints) + Number.parseInt(cropHistoryData != undefined ? cropHistoryData.reduce((acc, crop) => acc + crop.pointsEarned, 0) : 0) || 0).toString()}</Text>
                                    </View> */}
                            </View>

                        </View>}

                </View>
            </ScrollView>

            {numberOfPages > 1 && showScanData && <View style={[{ height: 40, width: '95%', position: 'absolute', bottom: 0, marginBottom: 10, borderRadius: 8, overflow: 'hidden', backgroundColor: 'white', borderTopWidth: 0.5, borderColor: Colors.lightish_grey }, styles['centerItems']]}>
                <View style={[{ height: '100%', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }]}>
                    <CustomPaginationScanHistory
                        selectedIndex={selectedPageIndex}
                        itemsPerPage={numberOfPages}
                        onpressIndexClicked={(index) => {
                            console.log("saasaasas===>", productItem)
                            setSelectedPageIndex(index);
                            getScannedHistory(productItem, index + 1);
                        }}
                        pgHeight={40}
                        itemBackgroundColor={dynamicStyles.primaryColor}
                        pgWidth={'100%'}
                    />
                </View>
            </View>}
            {
                showDropDowns &&
                <CustomListViewModal
                    dropDownType={dropDownType}
                    listItems={dropDownData}
                    selectedItem={selectedDropDownItem}
                    onSelectedSeason={(item) => { onSelectedSeasonItem(item) }}
                    onSelectedCompanyName={(item) => { onSelectedCompanyNameItem(item) }}
                    closeModal={() => setShowDropDowns(false)}
                />
            }
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


            {showCouponDetails && showCouponData()}
            {showFilterModal && showFilters()}
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
        </View>
    )
}

export default ScanHistory;