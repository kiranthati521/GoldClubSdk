import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import {
    View, Platform, StatusBar, Text, Image, AppState,
    TouchableOpacity, FlatList, TextInput,
    Dimensions,
    ScrollView
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { ROLENAME, retrieveData } from '../assets/Utils/Utils';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../Components/CustomAlert';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { configs } from '../helpers/URLConstants';
import { GetApiHeaders, PostRequest } from '../NetworkUtils/NetworkUtils';
import moment from 'moment';
import CustomPagination from '../Components/CustomPagination';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomBorderInputDropDown from '../Components/CustomBorderInputDropDown';
import CustomPaginationFunctional from '../Components/CustomPaginationFunctional';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
// import { ScrollView } from "react-native";

var styles = BuildStyleOverwrite(Styles);

function KYCApproval() {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const dispatch = useDispatch();
    const getUserData = useSelector(selectUser);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [loading, setLoading] = useState(false)
    const [successLoading, setSuccessLoading] = useState(false)
    const [errorLoading, setErrorLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/vm_loader.gif'))
    const networkStatus = useSelector(state => state.networkStatus.value)
    const navigation = useNavigation()

    const [showAlert, setShowAlert] = useState(false)
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertHeader, setShowAlertHeader] = useState(false)
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
    const [showAlertYesButton, setShowAlertYesButton] = useState(false)
    const [showAlertNoButton, setShowAlertNoButton] = useState(false)
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
    const [selectedPage, setSelectedPage] = useState('REQUESTS');

    const [dropDownData, setdropDownData] = useState();
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");

    const [postStatus, setPostStatus] = useState(null);
    const [remarks, setRemarks] = useState(null);
    const [showStatusChangeDialogue, setShowStatusChangeDialogue] = useState(null);

    const [showPendingKYC, setShowPendingKYC] = useState(true);
    const [pendingKYC, setPendingKYC] = useState(null);
    const [apiPendingData, setApiPendingData] = useState(null);


    const [KYCHistory, setKYCHistory] = useState(null);
    const [apiHistoryData, setApiHistoryData] = useState(null);

    const [showApprovalDetails, setShowApprovalDetails] = useState(null);

    const handleLoading = () => {
        setLoading(false);
    }

    useEffect(() => {
        handleLoading();
        getPendingList(currentPage);
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
        const roleTypeDetails = await retrieveData(ROLENAME)
        if (roleTypeDetails) {
            let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard': 'Dashboard'
            navigation.navigate(navigateTo)
        }
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

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    const handleItemPress = (item, index) => {
        setPendingKYC(prevData => {
            const newData = [...prevData];
            // Toggle the "Selected" key for the selected item
            newData[index] = { ...newData[index], selected: !newData[index]?.selected };
            return newData;
        });
    };

    const getPendingList = async (pageNo) => {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var header = await GetApiHeaders();
        var input = {
            id: header?.userId,
            mobileNumber: header?.mobileNumber,
            page: pageNo,
            itemsPerPage: 10
        }

        var url = configs.BASE_URL + configs.KYCAPPROVAL.GETPENDINGKYC;

        console.log("URL =>", url, " Headers =>", header, " Input =>", input);
        var apiResponse = await PostRequest(url, header, input);
        setLoading(false)
        setLoadingMessage("")
        console.log("SAINATH_REDDY", JSON.stringify(apiResponse));
        if (apiResponse.statusCode == 200) {
            setApiPendingData(apiResponse?.response)
            setPendingKYC(apiResponse?.response?.ekycStatusList)
        } else {
            setApiPendingData(null);
            setPendingKYC(null);
        }
    }

    const getKYCHistoryList = async (pageNo) => {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var header = await GetApiHeaders();
        var input = {
            id: header?.userId,
            mobileNumber: header?.mobileNumber,
            page: pageNo,
            itemsPerPage: 10
        }

        var url = configs.BASE_URL + configs.KYCAPPROVAL.GETKYCHISTORY;

        console.log("URL =>", url, " Headers =>", header, " Input =>", input);
        var apiResponse = await PostRequest(url, header, input);
        setLoading(false)
        setLoadingMessage("")
        console.log("SAINATH_REDDY", JSON.stringify(apiResponse));
        if (apiResponse.statusCode == 200) {
            setApiHistoryData(apiResponse.response)
            setKYCHistory(apiResponse.response.kycHistoryList)
        }
        else {
            showAlertWithMessage(translate('alert'), true, true, apiResponse.message, false, true, translate('ok'), translate('cancel'))
        }
    }

    const bulkApproveOrReject = async (status) => {
        const data = pendingKYC.filter(item => item.selected == true)
        if (data && data.length > 0) {
            setLoading(true)
            setLoadingMessage(translate('please_wait_getting_data'))
            var header = await GetApiHeaders();
            var input =
            {
                "status": status,
                "mobileNumber": header?.mobileNumber,
                "ekycId": pendingKYC.filter(item => item.selected == true).map(item => item.id).join(','),
                "userId": header?.userId,
                "remarks": remarks
            }

            var url = configs.BASE_URL + configs.KYCAPPROVAL.KYCBULKAPPROVAL;

            console.log("URL =>", url, " Headers =>", header, " Input =>", input);
            var apiResponse = await PostRequest(url, header, input);
            setTimeout(() => {
                setLoadingMessage()
                setLoading(false)
            }, 500);
            console.log("SAINATH_REDDY", JSON.stringify(apiResponse));
            if (apiResponse.statusCode == 200) {

                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoading(true)
                    setSuccessLoadingMessage(apiResponse.message)
                }, 1000);

                setTimeout(() => {
                    setSuccessLoading(false);
                    setSuccessLoadingMessage(null);
                    getPendingList(currentPage);
                    setPostStatus(null);
                    setRemarks(null);
                }, 3000);
            }
        } else {
            showAlertWithMessage(translate('alert'), true, true, translate('pleaseSelectKycToApprove'), false, true, translate('ok'), translate('cancel'))
        }
    }

    function renderItem(item, index) {
        console.log("SAINATH++++", item);
        return (
            <TouchableOpacity style={[{ height: 50, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => { setShowApprovalDetails(item) }}>
                <TouchableOpacity onPress={() => { handleItemPress(item, index) }} style={[{ width: '13%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }, styles['centerItems'],]}>
                    <Image style={[{ width: 20, height: 23, resizeMode: 'contain' }]} source={item?.selected ? require('../assets/images/kycApprovalCheck.png') : require('../assets/images/kycApprovalUncheck.png')} />
                </TouchableOpacity>
                <View style={[styles['centerItems'], { width: '12%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{((currentPage - 1) * 10) + index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_semibold'], { color: 'black' }]}>{item?.retailer?.proprietorName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{moment(item.createdOn).format('DD-MMM-YYYY')}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%' }]}>
                    <Text style={[{ color: (item.ekycStatus == 'pending' || item.ekycStatus == 'byPass') ? '#FFB525' : item.ekycStatus == 'Approve' ? '#00881E' : item.ekycStatus == 'reject' ? '#ED3237' : 'black' }, styles['text_align_center'], styles['font_size_13_semibold']]}>{item.ekycStatus}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    function renderHistoryItem(item, index) {
        return (
            <View style={[{ height: 50, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => { setShowApprovalDetails(item) }}>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_regular']]}>{((historyCurrentPage - 1) * 10) + index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_regular'], { color: 'black' }]}>{item?.retailer?.proprietorName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_regular']]}>
                        {moment(item?.retailer?.ekycDoneDate).format('DD-MMM-YYYY')}
                    </Text>
                </View>
                <TouchableOpacity style={[{ width: '25%' }]} key={index.toString()} onPress={() => { setShowApprovalDetails(item) }}>
                    <View style={[styles['centerItems'], { width: '100%', height: 50 }]}>
                        <Text style={[{ color: (item.ekycStatus == 'pending' || item.ekycStatus == 'byPass') ? '#FFB525' : item.ekycStatus == 'Approved' ? '#00881E' : item.ekycStatus == 'Rejected' ? '#ED3237' : 'black' }, styles['text_align_center'], styles['font_size_13_semibold']]}>{item.ekycStatus}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    return (

        <View style={[styles['full_screen'], styles['bg_white']]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

            <View style={[{backgroundColor:dynamicStyles.primaryColor},{ paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
                <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
                    <Image style={[ {tintColor:dynamicStyles.secondaryColor}, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'],{color:dynamicStyles.secondaryColor},styles['font_size_18_bold']]}>{translate('kycApprovalCap')}</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles['flex_direction_row'], styles['width_90%'], styles['space_between'], styles['align_self_center'], styles['margin_top_10']]}>
                <TouchableOpacity onPress={() => { setSelectedPage('REQUESTS'); setApiHistoryData(null); setKYCHistory(null); getPendingList(currentPage) }} style={[selectedPage == 'REQUESTS' && { backgroundColor: '#ED3237' }, { width: '50%' }, styles['border_radius_5'], styles['padding_14']]}><Text style={[styles['text_align_center'], styles['font_size_16_regular'], styles['text_color_black'], selectedPage == 'REQUESTS' && { color: 'white' }]}>{translate('request')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => { setSelectedPage('HISTORY'); setApiPendingData(null); setPendingKYC(null); getKYCHistoryList(historyCurrentPage) }} style={[selectedPage == 'HISTORY' && { backgroundColor: '#ED3237' }, { width: '50%' }, styles['border_radius_5'], styles['padding_14']]}><Text style={[styles['text_align_center'], styles['font_size_16_regular'], styles['text_color_black'], selectedPage == 'HISTORY' && { color: 'white' }]}>{translate('history')}</Text></TouchableOpacity>
            </View>
            <ScrollView style={[styles['full_screen']]}>
                {pendingKYC &&
                    <View style={[styles['margin_top_10']]}>
                        <View style={[styles['align_self_center'], styles['width_90%'], { borderWidth: 0.5, borderRadius: 10, overflow: 'hidden', borderColor: '#B4B4B4' }]}>
                            <View style={[{ height: 50, width: '100%', backgroundColor: '#E5E5E5', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                                <TouchableOpacity style={[{ width: '13%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }, styles['centerItems'],]}>
                                    <Image style={[{ width: 20, height: 23, resizeMode: 'contain' }]} source={require('../assets/images/kycApprovalUncheck.png')} />
                                </TouchableOpacity>
                                <View style={[styles['centerItems'], { width: '12%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('sno')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('retailerName')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('requestedDate')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('status')}</Text>
                                </View>
                            </View>
                            {showPendingKYC &&
                                <FlatList
                                    data={pendingKYC}
                                    renderItem={({ item, index }) => renderItem(item, index)}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            }
                        </View>
                        {<View>
                            <View style={[styles['flex_direction_row'], styles['width_90%'], styles['space_between'], styles['align_self_center'], styles['top_10']]}>
                                <TouchableOpacity onPress={() => { bulkApproveOrReject('Approve'); setPostStatus('Approve') }} style={[{ backgroundColor: '#009F4A', width: '48%' }, styles['border_radius_5'], styles['padding_14']]}><Text style={[styles['text_align_center'], styles['text_color_white'], styles['font_size_16_regular']]}>{translate('approveKYC')}</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => { bulkApproveOrReject('Reject'); setPostStatus('Reject') }} style={[{ backgroundColor: '#ED3237', width: '48%' }, styles['border_radius_5'], styles['padding_14']]}><Text style={[styles['text_align_center'], styles['text_color_white'], styles['font_size_16_regular']]}>{translate('reject')}</Text></TouchableOpacity>
                            </View>
                            {currentPage && apiPendingData?.count > 10 &&
                                <View style={[{ marginBottom: 15 }]}>
                                    <CustomPaginationFunctional
                                        selectedIndex={currentPage}
                                        pageItemArray={pendingKYC}
                                        onpressIndexClicked={(index) => { if (apiPendingData?.count && (currentPage <= Math.ceil(apiPendingData.count / 10))) { setCurrentPage(index); getPendingList(index) } }}
                                        pgHeight={40}
                                        itemsPerPage={apiPendingData?.count ? Math.ceil((apiPendingData.count / 10)) : 1}
                                        itemBackgroundColor={'#ED3237'}
                                        pgWidth={'100%'}
                                    />
                                </View>}
                        </View>}
                    </View>
                }
                {(!pendingKYC || pendingKYC?.length <= 0) && (selectedPage == 'REQUESTS') && (
                    <View style={[styles['full_screen'], styles['centerItems']]}>
                        <Text style={[styles['text_color_black'], styles['centerItems'],styles['font_size_16_regular']]}>{translate('no_data_available')}</Text>
                    </View>
                )}
                {KYCHistory &&
                    <View style={[{ top: 5, bottom: 5 }]}>
                        <View style={[styles['align_self_center'], styles['width_90%'], { borderWidth: 0.5, borderRadius: 10, overflow: 'hidden', borderColor: '#B4B4B4' }]}>
                            <View style={[{ height: 50, width: '100%', backgroundColor: '#E5E5E5', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', }]}>
                                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('sno')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('retailerName')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('requestedDate')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('status')}</Text>
                                </View>
                            </View>
                            <FlatList
                                data={KYCHistory}
                                renderItem={({ item, index }) => renderHistoryItem(item, index)}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                        {historyCurrentPage && apiHistoryData?.count > 10 &&
                            <View style={[styles['margin_top_10'], { marginBottom: 15 }]}>
                                <CustomPagination
                                    selectedIndex={historyCurrentPage}
                                    pageItemArray={KYCHistory}
                                    onpressIndexClicked={(index) => { if (apiHistoryData?.count && (index <= Math.ceil(apiHistoryData.count / 10))) { setHistoryCurrentPage(index); getKYCHistoryList(index) } }}
                                    pgHeight={40}
                                    itemsPerPage={apiHistoryData?.count ? Math.ceil((apiHistoryData.count / 10)) : 1}
                                    itemBackgroundColor={'#ED3237'}
                                    pgWidth={'100%'}
                                />
                            </View>
                        }
                    </View>
                }
            </ScrollView>

            {(!KYCHistory || KYCHistory?.length <= 0) && (selectedPage == 'HISTORY') && (
                <View style={[styles['full_screen'], styles['centerItems']]}>
                    <Text style={[styles['text_color_black'], styles['centerItems'],styles['font_size_16_regular']]}>{translate('no_data_available')}</Text>
                </View>
            )}

            {
                showAlert && (
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
                )
            }
            {showApprovalDetails &&
                <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
                    <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], { borderRadius: 8 }]}>
                        <View style={[styles['width_100%'], styles['padding_10'], { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ED3237' }]}>
                            <Text style={[styles['width_80%'], styles['font_size_18_semibold'], { textAlign: 'left', color: Colors.white }]} >{translate('kycApprovalDetails')}</Text>
                            <TouchableOpacity onPress={() => { setShowApprovalDetails(null) }}>
                                <Image style={[styles['width_height_30'], { resizeMode: 'contain' }]} source={require('../assets/images/alertCloseKYC.png')} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles['width_90%'], styles['align_self_center']]}>
                            <View>
                                {showApprovalDetails?.retailer?.proprietorName &&
                                    <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '42%' }]}>{translate('name')}</Text>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '58%' }]}>: {showApprovalDetails?.retailer?.proprietorName}</Text>
                                    </View>
                                }
                                {showApprovalDetails?.retailerMobileNumber &&
                                    <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '42%' }]}>{translate('mobile_number')}</Text>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '58%' }]}>: {showApprovalDetails?.retailerMobileNumber}</Text>
                                    </View>
                                }
                                {showApprovalDetails?.gstNumber &&
                                    <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '42%' }]}>{translate('gstNumber')}</Text>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '58%' }]}>: {showApprovalDetails?.gstNumber}</Text>
                                    </View>
                                }
                                {showApprovalDetails?.panNumber &&
                                    <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '42%' }]}>{translate('panNumber')}</Text>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '58%' }]}>: {showApprovalDetails?.panNumber}</Text>
                                    </View>
                                }
                                {showApprovalDetails?.seedLicenseNumber &&
                                    <View style={[styles['width_100%'], styles['margin_top_10'], styles['align_self_center'], styles['flex_direction_row']]}>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '42%' }]}>{translate('seedLicenseNumber')}</Text>
                                        <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '58%' }]}>: {showApprovalDetails?.seedLicenseNumber}</Text>
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
            {
                showStatusChangeDialogue &&
                <View style={[styles['full_screen'], styles['transparent_black_bg'], styles['centerItems'], styles['absolute_position'], { top: 0, right: 0, left: 0, bottom: 0 }]}>
                    <View style={[styles['width_80%'], styles['align_self_center'], styles['bg_white'], { borderRadius: 8 }]}>
                        <View style={[styles['width_100%'], styles['padding_10'], { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ED3237' }]}>
                            <Text style={[styles['width_80%'], styles['font_size_18_semibold'], { textAlign: 'left', color: Colors.white }]} >{translate('kycApproval')}</Text>
                            <TouchableOpacity onPress={() => { setShowStatusChangeDialogue(null) }}>
                                <Image style={[styles['width_height_30'], { resizeMode: 'contain' }]} source={require('../assets/images/alertCloseKYC.png')} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles['width_90%'], styles['align_self_center'], styles['margin_top_10'], styles['margin_bottom_10']]}>
                            <View style={[styles['margin_bottom_10']]}>
                                <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '95%' }]}>{translate('selectApproveReject')}</Text>
                                <CustomBorderInputDropDown
                                    width={[styles['width_100%'], styles['centerItems']]}
                                    defaultValue={postStatus ? postStatus : ''}
                                    // labelName={translate('selectApproveReject')}
                                    IsRequired={true}
                                    placeholder={translate('select')}
                                    onEndEditing={async event => {
                                        // calculateTotalOrderValue()
                                    }}
                                    onFocus={() => {
                                        changeDropDownData([{ name: 'Approve' }, { name: 'Reject' }], strings.selectApproveReject, postStatus)
                                    }}
                                />
                            </View>
                            <View>
                                <Text style={[styles['text_align_left'], styles['text_color_black'], styles['font_size_16_regular'], { width: '55%' }]}>{translate('remarks')}</Text>
                                <TextInput multiline={true} placeholder={'Type here...'} value={remarks} onChangeText={(text) => { setRemarks(text) }} placeholderTextColor={'#B4B4B4'} style={[styles['width_100%'], styles['text_color_black'], styles["bg_white"], styles['border_width_1'], styles['border_radius_6'], styles['border_color_light_grey'], styles['margin_top_10'], { minHeight: 100, textAlignVertical: 'top' }]} />
                            </View>
                        </View>
                    </View>
                </View>
            }

            {
                showDropDowns &&
                <CustomListViewModal
                    dropDownType={dropDownType}
                    listItems={dropDownData}
                    selectedItem={selectedDropDownItem}
                    onSelectedStatus={(item) => { setPostStatus(item.name); setShowDropDowns(false); }}
                    closeModal={() => setShowDropDowns(false)} />
            }

            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
            {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
        </View >
    )
}

export default KYCApproval;