import { Platform, Text, StatusBar, View, Alert, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, TextInput, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { strings } from "../strings/strings";
import SimpleToast from 'react-native-simple-toast';
import { Colors } from '../assets/Utils/Color';
import CustomLoader from '../Components/CustomLoader';
import { selectUser } from '../redux/store/slices/UserSlice';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomButton from '../Components/CustomButton';
import { GetApiHeaders, GetRequest, getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CustomBorderInputDropDown from '../Components/CustomBorderInputDropDown';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../Components/CustomAlert';
import store from '../redux/store/store';
import { updateOfflineCount } from './synchCountUtils';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

export const getExistedRetailersDataPlanningTOol = async (currentCompanyName, currentCompanyCode) => {
    let realm = new Realm({ path: 'User.realm' });
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getRetailerBusinessPlanningTool;
            var getHeaders = await GetApiHeaders()
            var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    var masterResp = APIResponse.response
                    console.log(masterResp, "??????????????????? check what existing we got")
                    if (masterResp != undefined && masterResp != null) {
                        const cleanedData = masterResp.map(({ mobileNumber, retailerId, ...rest }) => rest);
                        if (cleanedData.length > 0) {
                            try {
                                const res = JSON.stringify(cleanedData);
                                realm.write(() => {
                                    realm.delete(realm.objects('RetailerEntries'));
                                    realm.create('RetailerEntries', {
                                        RetailerEntriesData: res
                                    });
                                    console.log('data saved from get method------------------------>', {
                                        RetailerEntriesData: res
                                    })
                                });
                                console.log("planning tool Data inserted successfully into Realm");
                            } catch (error) {
                                console.error("Error inserting data into Realm: planning tool", error);
                            }
                        }
                    }
                }
                else {
                }

            } else {
            }
        }
        catch (error) {
        }
    } else {
    }
}

export const getHybridsListPlanningTool = async () => {
    let realm = new Realm({ path: 'User.realm' });
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getProductBrandsForAllCompany;
            var getHeaders = await GetApiHeaders()
            var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    var masterResp = APIResponse?.response
                    if (masterResp != undefined && masterResp != null) {
                        let hybridList = masterResp?.brandList
                        try {
                            const res = JSON.stringify(hybridList);
                            realm.write(() => {
                                realm.delete(realm.objects('hybridMasterPlanningTool'));
                                realm.create('hybridMasterPlanningTool', {
                                    hybridMasterPlanningToolData: res
                                });
                            });
                            console.log("planning tool Data inserted successfully into Realm");
                        } catch (error) {
                            console.error("Error inserting data into Realm: planning tool", error);
                        }
                    }
                }

            } else {
            }
        }
        catch (error) { }
    } else { }
}

export const getCropsListPlanningTool = async () => {
    let realm = new Realm({ path: 'User.realm' });
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getAllCropMasterWithCompany;
            var getHeaders = await GetApiHeaders()
            var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    var masterResp = APIResponse.response
                    if (masterResp != undefined && masterResp != null) {
                        // insertCropMastersIntoRealm(masterResp?.cropsList)
                        try {
                            const res = JSON.stringify(masterResp?.cropsList);
                            realm.write(() => {
                                realm.delete(realm.objects('cropMasterPlanningTool'));
                                realm.create('cropMasterPlanningTool', {
                                    cropMasterPlanningToolData: res
                                });
                            });

                            console.log("planning tool Data inserted successfully into Realm");
                        } catch (error) {
                            console.error("Error inserting data into Realm: planning tool", error);
                        }
                    }
                }
                else { }

            } else { }
        }
        catch (error) { }
    } else { }
}

export const getCompaniesListPlanningTool = async () => {
    let realm = new Realm({ path: 'User.realm' });
    // const getUserData = useSelector(selectUser);
    const state = store.getState();
    const getUserData = selectUser(state);
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getAllCompaniesForDropDown;
            var getHeaders = await GetApiHeaders()
            var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    var masterResp = APIResponse.response
                    if (masterResp != undefined && masterResp != null) {
                        let currentCompanyCode = getUserData[0]?.companyCode;
                        // console.log(getUserData[0]?.companyCode,"<<<<<<<<<<<<<<<<<<<<<<<<<getUserData[0]?.companyCode")
                        let currentCompanyName = masterResp?.CompanyList?.find((item) => item.companyCode === currentCompanyCode).name
                        try {
                            const res = JSON.stringify(masterResp.CompanyList);
                            realm.write(() => {
                                realm.delete(realm.objects('companyCodeMasterPlanningTool'));
                                realm.create('companyCodeMasterPlanningTool', {
                                    companyCodeMasterPlanningToolData: res
                                });
                            });
                            console.log("companies list successfully into Realm using planning tool");
                        } catch (error) {
                            console.error("Error inserting data into Realm: planning tool", error);
                        }
                        getExistedRetailersDataPlanningTOol(currentCompanyName, currentCompanyCode)
                    }
                }
                else { }

            } else { }
        }
        catch (error) { }
    } else { }
}

export const saveAPIPlanningTool = async (ifOfflineDataExists = null, dispatch) => {
    let realm = new Realm({ path: 'User.realm' });
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getExpctYldURL = configs.BASE_URL + configs.PLANNING_TOOL.saveRetailerBusinessPlanningTool;
            var getHeaders = await GetApiHeaders();
            const jsonData = ifOfflineDataExists;
            const formData = new FormData();
            formData.append('jsonData', JSON.stringify(jsonData));
            console.log(formData, "formmmmmmmmmmmmmmmmmmmmmmmmmmmdataaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
            const APIResponse = await uploadFormData(formData, getExpctYldURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                setTimeout(async () => {
                    if (APIResponse.statusCode == HTTP_OK) {
                        var dashboardResp = APIResponse
                        if (ifOfflineDataExists) {
                            console.log(ifOfflineDataExists, "yes offline data exists it is saved please delete now")
                            try {
                                realm.write(() => {
                                    realm.delete(realm.objects('finalRetailerEntries'));
                                    // realm.refresh();
                                });
                                console.log('offline data cleared successfully in planning tool');
                                updateOfflineCount(dispatch)
                                await getExistedRetailersDataPlanningTOol()
                            } catch (error) {
                                console.error('Error clearing data from Realm in planning tool:', error);
                            }
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }, 500);

            } else {
                return false;
            }
        }
        catch (error) {
            return false;
        }
    } else {
        return false;
    }
}

const PlanningTool = ({ route }) => {
    var realm = new Realm({ path: 'User.realm' });
    const dispatch = useDispatch()
    const initialData = realm.objects('RetailerEntries')[0]?.RetailerEntriesData;
    const finalData = realm.objects('finalRetailerEntries')[0]?.finalRetailerEntriesData;
    const isInitialDataValid = initialData?.length > 0;
    const isFinalDataValid = finalData?.length > 0;
    const isDataDifferent = isInitialDataValid && isFinalDataValid && initialData !== finalData;
    const [checkUpdated, setCheckUpdated] = useState(false);
    const calcType = route?.params?.calcType;
    const getUserData = useSelector(selectUser);
    const companyStyle = useSelector(getCompanyStyles);
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [showAlertHeader, setShowAlertHeader] = useState(false)
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertYesButton, setShowAlertYesButton] = useState(false)
    const [showAlertNoButton, setShowAlertNoButton] = useState(false)
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [loading, setLoading] = useState(false)
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    const [sectionGeneralOpen, setSectionGeneralOpen] = useState(true)
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    let [hybridsList, setHybridsList] = useState([]);
    let [hybridsMasterList, setHybridsMasterList] = useState([]);
    const [sectionAddressOpen, setSectionAddressOpen] = useState(true)
    const [retailerEntries, setRetailerEntries] = useState([
        {
            id: 0,
            cropMasterId: 0,
            cropName: "",
            productId: 0,
            brandName: "",
            fy26: 0,
            fy25: 0,
            companyName: '',
            companyCode: 0
        },
    ]);
    const currentIndexRef = useRef(null);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [cropMastersFilter, setCropMastersFilter] = useState([]);
    const [companyList, setCompanyList] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('')
    const [selectedCompanyId, setSelectedCompanyId] = useState(getUserData[0]?.companyCode)
    const networkStatus = useSelector(state => state.networkStatus.value)

    const [btnVisible, setBtnVisible] = useState(true)

    let getCompaniesList = async () => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getAllCompaniesForDropDown;
                var getHeaders = await GetApiHeaders()
                var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.response
                        if (masterResp != undefined && masterResp != null) {
                            setCompanyList(masterResp.CompanyList)
                            let currentCompanyCode = getUserData[0]?.companyCode;
                            let currentCompanyName = masterResp?.CompanyList?.find((item) => item.companyCode === currentCompanyCode).name
                            setSelectedCompany(currentCompanyName)
                            setSelectedCompanyId(currentCompanyCode);
                            insertCompanyCOdeMastersIntoRealm(masterResp.CompanyList)
                            getExistedRetailersData(currentCompanyName, currentCompanyCode)
                        }
                    }
                    else {
                        Alert.alert(APIResponse?.message)
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
                SimpleToast.show(error.message)
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }
    }

    const validateEntries = useCallback(() => {
        const isValid = retailerEntries.every(
            (entry) =>
                entry.cropName.trim() &&
                entry?.brandName?.trim() &&
                entry.fy25 > 0 &&
                entry.fy26 > 0
        );
        setIsSubmitDisabled(!isValid);
    }, [retailerEntries]);

    useEffect(() => {
        validateEntries();
    }, [retailerEntries, validateEntries]);



    const addEntry = () => {
        if (!validateLastEntry()) return;
        const newEntry = {
            id: 0,
            cropMasterId: 0,
            cropName: "",
            productId: 0,
            brandName: "",
            fy26: 0,
            fy25: 0,
            companyName: selectedCompany,
            companyCode: selectedCompanyId
        };
        setRetailerEntries([...retailerEntries, newEntry]);
    };

    const removeEntry = (index) => {
        const updatedEntries = [...retailerEntries];
        updatedEntries.splice(index, 1);
        setRetailerEntries(updatedEntries);
    };

    const updateEntry = (index, field, value) => {
        const updatedEntries = [...retailerEntries];
        updatedEntries[index][field] = value;
        setRetailerEntries(updatedEntries);
    };


    const validateLastEntry = () => {
        const lastEntry = retailerEntries[retailerEntries?.length - 1];
        return (
            lastEntry?.cropName?.trim() &&
            lastEntry?.brandName?.trim() &&
            lastEntry?.fy25 > 0 &&
            lastEntry?.fy26 > 0
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            console.log('screen focused')
            const offlineRetailerEntriesData = realm.objects('finalRetailerEntries');
            if (networkStatus) {
                getCropsList()
                getHybridsList()
                getCompaniesList()
                if (offlineRetailerEntriesData.length !== 0) {
                    console.log('offline data exists so----------------------------- saving in online now', offlineRetailerEntriesData)
                    let dataOfRetailerEntriesData = JSON.parse(offlineRetailerEntriesData[0]?.finalRetailerEntriesData);
                    saveAPI(dataOfRetailerEntriesData)
                } else {
                    console.log('offline data  doesnt exists so calling get api')
                    getExistedRetailersData()
                }
            } else {
                checkRealmData()
            }
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [])
    );

    let checkRealmData = async () => {
        const offlineRetailerEntriesData = realm.objects('finalRetailerEntries');
        const RetailerEntriesOld = realm.objects('RetailerEntries');
        const cropMasterPlanningToolData = realm.objects('cropMasterPlanningTool');
        const hybridMasterPlanningToolData = realm.objects('hybridMasterPlanningTool');
        let companyCodeMasters = realm.objects('companyCodeMasterPlanningTool');

        console.log("offlineRetailerEntriesData", JSON.stringify(offlineRetailerEntriesData))
        console.log("RetailerEntriesOld", JSON.stringify(RetailerEntriesOld))
        console.log("companyCodeMasters", JSON.stringify(companyCodeMasters))


        //If nothing available in Realm
        if (
            offlineRetailerEntriesData.length === 0 &&
            cropMasterPlanningToolData.length === 0 &&
            hybridMasterPlanningToolData.length === 0
        ) {
            showAlertWithMessage(
                translate('oopsNoInternet'),
                true,
                true,
                translate('oopsNoInternetDesc'),
                false,
                true,
                translate('ok'),
                translate('ok')
            );
        }
        else {
            // Crops
            if (cropMasterPlanningToolData.length !== 0) {
                let dataOfCrops = JSON.parse(cropMasterPlanningToolData[0].cropMasterPlanningToolData);
                setCropMastersFilter(dataOfCrops);
            }

            setTimeout(() => {
                // Hybrids
                if (hybridMasterPlanningToolData.length !== 0) {
                    let dataOfHybrids = JSON.parse(hybridMasterPlanningToolData[0].hybridMasterPlanningToolData);
                    setHybridsList(dataOfHybrids);
                    setHybridsMasterList(dataOfHybrids);
                }
            }, 500);

            setTimeout(() => {
                // Companies
                if (companyCodeMasters.length !== 0) {
                    let dataOfCompanyCodes = JSON.parse(companyCodeMasters[0].companyCodeMasterPlanningToolData);
                    setCompanyList(dataOfCompanyCodes);

                    if (offlineRetailerEntriesData.length !== 0) {
                        let dataOfRetailerEntriesData = JSON.parse(
                            offlineRetailerEntriesData[0]?.finalRetailerEntriesData
                        );
                        setRetailerEntries(dataOfRetailerEntriesData);
                    }
                    else if (
                        offlineRetailerEntriesData.length === 0 &&
                        RetailerEntriesOld.length > 0 &&
                        RetailerEntriesOld[0].RetailerEntriesData
                    ) {
                        let dataOfRetailerEntriesOld = JSON.parse(RetailerEntriesOld[0].RetailerEntriesData);
                        setRetailerEntries(dataOfRetailerEntriesOld);
                    }
                    else {
                        let currentCompanyCode = getUserData[0]?.companyCode;
                        let currentCompanyName = dataOfCompanyCodes?.find((item) => item.companyCode === currentCompanyCode).name
                        setSelectedCompany(currentCompanyName)
                        setSelectedCompanyId(currentCompanyCode);
                        setRetailerEntries([{
                            id: 0,
                            cropMasterId: 0,
                            cropName: "",
                            productId: 0,
                            brandName: "",
                            fy26: 0,
                            fy25: 0,
                            companyName: currentCompanyName,
                            companyCode: currentCompanyCode
                        }]);
                    }




                    // setRetailerEntries((prevEntries) =>
                    //     prevEntries.map((entry) => {
                    //         const matchedCompany = dataOfCompanyCodes.find(
                    //             (c) => c.companyCode === entry.companyCode
                    //         );
                    //         return {
                    //             ...entry,
                    //             companyName: matchedCompany ? matchedCompany.name : entry.companyName,
                    //         };
                    //     })
                    // );

                    // Keep current user’s company for selection defaults
                    // let currentCompanyCode = getUserData[0]?.companyCode;
                    // let currentCompanyName =
                    //     dataOfCompanyCodes.find((item) => item.companyCode === currentCompanyCode)?.name || '';
                    // setSelectedCompany(currentCompanyName);
                    // setSelectedCompanyId(currentCompanyCode);
                    // setRetailerEntries([{
                    //     id: 0,
                    //     cropMasterId: 0,
                    //     cropName: "",
                    //     productId: 0,
                    //     brandName: "",
                    //     fy26: 0,
                    //     fy25: 0,
                    //     companyName: currentCompanyName,
                    //     companyCode: currentCompanyCode
                    // }]);

                }
            }, 800);
        }







        // // Retailer entries
        // if (offlineRetailerEntriesData?.length !== 0) {
        //     let dataOfRetailerEntriesData = JSON.parse(
        //         offlineRetailerEntriesData[0]?.finalRetailerEntriesData
        //     );
        //     setRetailerEntries(dataOfRetailerEntriesData);
        // }
        // else if (
        //     offlineRetailerEntriesData.length === 0 &&
        //     RetailerEntriesOld.length > 0 &&
        //     RetailerEntriesOld[0].RetailerEntriesData
        // ) {
        //     let dataOfRetailerEntriesOld = JSON.parse(RetailerEntriesOld[0].RetailerEntriesData);
        //     setRetailerEntries(dataOfRetailerEntriesOld);
        // }
    };


    let insertDataRetailerEntries = (response) => {
        if (!response) {
            console.log("Invalid response");
            return;
        }
        console.log("retailer entreies res", response);
        try {
            const res = JSON.stringify(response);
            realm.write(() => {
                realm.delete(realm.objects('RetailerEntries'));
                realm.create('RetailerEntries', {
                    RetailerEntriesData: res
                });
                console.log('data saved from get method------------------------>', {
                    RetailerEntriesData: res
                })
            });

            console.log("planning tool Data inserted successfully into Realm");
        } catch (error) {
            console.error("Error inserting data into Realm: planning tool", error);
        }
    }


    let insertCompanyCOdeMastersIntoRealm = (response) => {
        if (!response) {
            console.log("Invalid response");
            return;
        }
        console.log("SAINATH_ONLINE_Company code LIST_RESPONSE", response);
        try {
            const res = JSON.stringify(response);
            realm.write(() => {
                realm.delete(realm.objects('companyCodeMasterPlanningTool'));
                realm.create('companyCodeMasterPlanningTool', {
                    companyCodeMasterPlanningToolData: res
                });
            });

            console.log("planning tool Data inserted successfully into Realm");
        } catch (error) {
            console.error("Error inserting data into Realm: planning tool", error);
        }
    }

    let insertHybridListInRealm = (response) => {
        if (!response) {
            console.log("Invalid response");
            return;
        }
        console.log("SAINATH_ONLINE_HYBRID LIST_RESPONSE", response);
        try {
            const res = JSON.stringify(response);
            realm.write(() => {
                realm.delete(realm.objects('hybridMasterPlanningTool'));
                realm.create('hybridMasterPlanningTool', {
                    hybridMasterPlanningToolData: res
                });
            });

            console.log("planning tool Data inserted successfully into Realm");
        } catch (error) {
            console.error("Error inserting data into Realm: planning tool", error);
        }
    }

    let insertCropMastersIntoRealm = (response) => {
        if (!response) {
            console.log("Invalid response");
            return;
        }
        console.log("SAINATH_ONLINE_PROGRAMDETAILS_RESPONSE", response);
        try {
            const res = JSON.stringify(response);
            realm.write(() => {
                realm.delete(realm.objects('cropMasterPlanningTool'));
                realm.create('cropMasterPlanningTool', {
                    cropMasterPlanningToolData: res
                });
            });

            console.log("planning tool Data inserted successfully into Realm");
        } catch (error) {
            console.error("Error inserting data into Realm: planning tool", error);
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

    const getExistedRetailersData = async (currentCompanyName, currentCompanyCode) => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setTimeout(() => {
                    setLoading(true)
                    setLoadingMessage(translate('please_wait_getting_data'))
                }, 100);

                var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getRetailerBusinessPlanningTool;
                var getHeaders = await GetApiHeaders()
                var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    if (APIResponse.statusCode == HTTP_OK) {
                        setTimeout(() => {
                            setLoading(false)
                            setLoadingMessage()
                        }, 500);
                        var masterResp = APIResponse.response
                        console.log(masterResp, "??????????????????? check what existing we got")
                        if (masterResp != undefined && masterResp != null) {
                            const cleanedData = masterResp.map(({ mobileNumber, retailerId, ...rest }) => rest);
                            if (cleanedData.length > 0) {
                                setRetailerEntries(cleanedData)
                                insertDataRetailerEntries(cleanedData)
                            } else {
                                setRetailerEntries([{
                                    id: 0,
                                    cropMasterId: 0,
                                    cropName: "",
                                    productId: 0,
                                    brandName: "",
                                    fy26: 0,
                                    fy25: 0,
                                    companyName: currentCompanyName,
                                    companyCode: currentCompanyCode
                                }]);
                            }
                        }
                    }
                    else {
                        Alert.alert(APIResponse?.message)
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
                SimpleToast.show(error.message)
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }
    }

    let getHybridsList = async () => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getProductBrandsForAllCompany;
                var getHeaders = await GetApiHeaders()
                var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse?.response
                        if (masterResp != undefined && masterResp != null) {
                            //   setCropMastersFilter(masterResp?.cropsList)
                            let hybridList = masterResp?.brandList
                            insertHybridListInRealm(hybridList)
                            setHybridsList(hybridList)
                            setHybridsMasterList(hybridList)
                            console.log(JSON.stringify(masterResp), "adsfkbsdkfkdsfvdsfieriuewriureiureiurueibui<<<<<<<<<<<<<<<hybridList")
                        }
                    }
                    else {
                        Alert.alert(APIResponse?.message)
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
                SimpleToast.show(error.message)
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }
    }

    const changeDropDownData = (dropDownData, type, selectedItem, index) => {
        if (type === strings.Hybrid) {
            // if (type === translate('Hybrid')) {
            // Get the selected crop for the current entry
            const selectedCrop = retailerEntries[index].cropName;
            const selectedCompanyId = retailerEntries[index].companyCode;

            // Filter the hybrid list based on the selected crop
            const filteredHybrids = hybridsMasterList.filter(
                (item) => item.cropName === selectedCrop && item.companyCode === selectedCompanyId
            );
            const convertedList = filteredHybrids.map(item => ({
                ...item,
                name: `${item.brandName}`,
                id: `${item.productId}`

            }));
            setdropDownData(convertedList);
        } else {
            setdropDownData(dropDownData);
        }

        setShowDropDowns(true);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
        currentIndexRef.current = index;
    };

    let getCropsList = async () => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getAllCropMasterWithCompany;
                var getHeaders = await GetApiHeaders()
                console.log(getYeildCalcURL, "urllllwesfmweklflkernf")
                console.log(getHeaders, "asfasdfsdnfsjdklvnkjerngjkngetHeaders")
                var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
                console.log(APIResponse, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> api ressasdasdf")
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.response
                        if (masterResp != undefined && masterResp != null) {
                            setCropMastersFilter(masterResp?.cropsList)
                            insertCropMastersIntoRealm(masterResp?.cropsList)
                            console.log(JSON.stringify(masterResp), "sdfkjkjgvergbvjkerkjfkjerferoioieroieroi<<<<<cropsList")
                        }
                    }
                    else {
                        Alert.alert(APIResponse?.message)
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
                SimpleToast.show(error.message)
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }
    }

    const navigation = useNavigation()

    const openPotentialInfo = () => {
        setSectionGeneralOpen(false)
        setSectionAddressOpen(!sectionAddressOpen)
        // setSectionFirmInfoOpen(false)
    }

    const onSelectItem = (itemdata) => {
        if (
            itemdata != null &&
            currentIndexRef.current !== null &&
            currentIndexRef.current >= 0 &&
            currentIndexRef.current < retailerEntries.length
        ) {
            const updatedEntries = [...retailerEntries];
            const index = currentIndexRef.current;

            if (dropDownType === strings.company) {
                updatedEntries[index].companyCode = itemdata.id;
                updatedEntries[index].companyName = itemdata.name;
                updatedEntries[index].cropName = '';
                updatedEntries[index].cropMasterId = 0;
                updatedEntries[index].brandName = '';
                updatedEntries[index].productId = '';
            }
            if (dropDownType === strings.crop) {
                console.log(itemdata, "???? item data")
                const selectedCrop = itemdata.name;
                const selectedCompany = retailerEntries[index].companyCode;
                const hybridsForCrop = hybridsMasterList.filter((item) => item?.cropName === selectedCrop);
                const recordedHybrids = retailerEntries
                    .filter((entry) => entry.cropName === selectedCrop && entry.companyCode === selectedCompany)
                    .map((entry) => entry.brandName);

                if (recordedHybrids.length >= hybridsForCrop.length) {
                    SimpleToast.show(translate('crop_and_brand_already_selected'));
                    return;
                }

                updatedEntries[index].cropName = itemdata.name;
                updatedEntries[index].cropMasterId = itemdata.id;

                updatedEntries[index].brandName = '';
                updatedEntries[index].productId = '';

                // let res = hybridsMasterList?.filter((item) => item.cropName === itemdata.name);
                // // let res = hybridsMasterList?.filter((item) => item.cropName === itemdata.name && item.companyCode === itemdata.companyCode);
                // setHybridsList(res);
            } else if (dropDownType === strings.Hybrid) {
                // } else if (dropDownType === translate('Hybrid')) {
                // Check if the selected hybrid is already used for the same crop and company in another entry
                const selectedCrop = retailerEntries[index].cropName;
                const selectedCompany = retailerEntries[index].companyCode;
                const isDuplicate = retailerEntries.some(
                    (entry, idx) =>
                        idx !== index &&
                        entry.cropName === selectedCrop &&
                        entry.brandName === itemdata.name &&
                        entry.companyCode === selectedCompany
                );

                if (isDuplicate) {
                    SimpleToast.show(translate("brand_already_chosen_for_crop"));
                    return;
                }

                updatedEntries[index].brandName = itemdata.name;
                updatedEntries[index].productId = itemdata.id;
            }

            // Update the state with the modified retailerEntries
            setRetailerEntries(updatedEntries);
            setShowDropDowns(false);
        } else {
            console.warn(
                "Invalid selection data or index:",
                itemdata,
                currentIndexRef.current,
                retailerEntries.length
            );
            setShowDropDowns(false);
        }
    };
    let saveAPI = async (ifOfflineDataExists = null) => {
        setBtnVisible(false)
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var getExpctYldURL = configs.BASE_URL + configs.PLANNING_TOOL.saveRetailerBusinessPlanningTool;
                var getHeaders = await GetApiHeaders();
                // var getUserID = (await retrieveData(USER_ID))
                const jsonData = ifOfflineDataExists ? ifOfflineDataExists : retailerEntries;
                const formData = new FormData();
                formData.append('jsonData', JSON.stringify(jsonData));
                console.log(formData, "formmmmmmmmmmmmmmmmmmmmmmmmmmmdataaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

                const APIResponse = await uploadFormData(formData, getExpctYldURL, getHeaders);

                // var APIResponse = await PostRequest(getExpctYldURL, getHeaders, body);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    setTimeout(async () => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse
                            console.log(dashboardResp, "save apiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii<<<<<<<<<<<<<<<<<<<")
                            setLoadingMessage()

                            setTimeout(() => {
                                SimpleToast.show(dashboardResp?.message)
                                // getExistedRetailersData()
                            }, 100);
                            setTimeout(() => {
                                if (ifOfflineDataExists) {
                                    console.log(ifOfflineDataExists, "yes offline data exists it is saved please delete now")
                                    // realm.delete(realm.objects('finalRetailerEntries'));
                                    clearOfflineFinalData()
                                } else {
                                    navigation.goBack()
                                }
                            }, 600);
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
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
            finally {
                setBtnVisible(true)
            }
        } else {
            // SimpleToast.show(translate('no_internet_conneccted'))
            storeDataOffline();
        }
        setBtnVisible(true)
    }

    let clearOfflineFinalData = () => {
        try {
            realm.write(() => {
                realm.delete(realm.objects('finalRetailerEntries'));
                // realm.refresh();
            });
            console.log('offline data cleared successfully in planning tool');
        } catch (error) {
            console.error('Error clearing data from Realm in planning tool:', error);
        }
    }

    let storeDataOffline = async () => {
        let offlineData = realm.objects('finalRetailerEntries')[0]?.finalRetailerEntriesData;
        // let offlineData = realm.objects('RetailerEntries')[0].RetailerEntriesData;
        console.log(JSON.stringify(retailerEntries) === offlineData)
        if (JSON.stringify(retailerEntries) !== offlineData) {
            try {
                const res = JSON.stringify(retailerEntries);
                realm.write(() => {
                    realm.delete(realm.objects('finalRetailerEntries'));
                    realm.create('finalRetailerEntries', {
                        finalRetailerEntriesData: res
                    });
                });

                console.log("storeDataOffline Data inserted successfully into Realm");
                setCheckUpdated(true)
                updateOfflineCount(dispatch)
                showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('offlineBut'), false, true, translate('ok'), translate('ok'))
            } catch (error) {
                console.error("Error inserting data into Realm: storeDataOffline", error);
            }
        } else {
            SimpleToast.show(translate('addingSameData'))
        }
    };

    const handleCancelAlert = () => {
        setShowAlert(false)
        if (checkUpdated) {
            navigation.goBack();
            setCheckUpdated(false)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            <View style={[styles['full_screen'], styles['bg_white']]}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
                <View
                    style={[styleSheetStyles.header, { backgroundColor: dynamicStyles.primaryColor }]}
                >
                    <TouchableOpacity style={styleSheetStyles.backButton} onPress={() => navigation.goBack()}>
                        <Image source={require('../assets/images/previous.png')} resizeMode='contain' style={{
                            height: 20, width: 20, tintColor: dynamicStyles.secondaryColor, marginLeft: 20, marginRight: 10
                        }} />
                        <Text style={[{ color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('RetailerPlanning')}</Text>
                    </TouchableOpacity>
                    {!networkStatus && isDataDifferent && <TouchableOpacity style={{ marginLeft: "auto", marginRight: 20 }} onPress={() => {
                        SimpleToast.show(translate("no_internet_conneccted"))
                    }}>
                        <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 30, width: 30, resizeMode: "contain" }]} source={require('../assets/images/dataRefresh.png')}></Image>
                    </TouchableOpacity>}
                </View>

                <ScrollView nestedScrollEnabled={true}
                    contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}>
                    <View style={[styles['shadow_box'], styles['bg_white'], styles['align_self_center'], styles['border_radius_5'], { width: '90%', margin: 10 }]}>
                        <View style={[{ width: '90%' }, styles['align_self_center'], { marginTop: 10, marginBottom: 5 }]}>
                            <TouchableOpacity disabled={true} onPress={() => { openPotentialInfo() }} style={[styles['width_100%'], styles['border_radius_8'], styles['justify_content_center'], styles['align_self_center']]} >
                                <Text style={[styles['width_85%'], styles['text_align_left'], styles['font_size_16_semibold'], { color: dynamicStyles.textColor }]}>{translate('RetailCounterPotential')}</Text>
                            </TouchableOpacity>
                        </View>
                        {sectionAddressOpen == true &&

                            <View style={[styles['align_self_center'], styles['margin_top_5'], { flexGrow: 1, }]}>

                                <FlatList
                                    data={retailerEntries}
                                    nestedScrollEnabled={false}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item, index }) => (
                                        <View style={{ marginBottom: 5, marginTop: 5, borderWidth: 1, borderColor: "rgba(180, 180, 180, 0.5)", borderRadius: 10, alignSelf: "center", padding: 8 }}>

                                            <View style={{ width: "95%", alignSelf: "center", marginBottom: 5, marginTop: 5 }}>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_12_regular']]}  >
                                                    {translate('selectCompany')}
                                                </Text>
                                                {console.log('xy3', item.companyName)}
                                                <CustomBorderInputDropDown
                                                    width={[{ width: '100%' }]}
                                                    defaultValue={(item.companyName) || ''}
                                                    // defaultValue={crop != undefined && crop != translate('select') ? crop : translate('select')}
                                                    IsRequired={true}
                                                    // disabled={selectedFilter === translate('YieldCalculator')}
                                                    placeholder={translate('select')}
                                                    placeholderTextColor={'rgba(180, 180, 180, 0.5)'}
                                                    onFocus={() => {
                                                        changeDropDownData(companyList, strings.company, item.companyName, index)
                                                    }}
                                                />
                                            </View>

                                            <View style={{
                                                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                                                width: "95%", alignSelf: "center", marginBottom: 5
                                            }}>


                                                <View style={{ width: '48%', marginLeft: responsiveWidth(1) }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, { marginBottom: 2.5 }, styles['font_size_12_regular']]}  >
                                                        {translate('crop')}
                                                    </Text>
                                                    <CustomBorderInputDropDown
                                                        width={[{ width: '100%' }]}
                                                        defaultValue={(item?.cropName.length > 12 ? `${item?.cropName.slice(0, 12).trim()}...` : item?.cropName) || ''}
                                                        // defaultValue={crop != undefined && crop != translate('select') ? crop : translate('select')}
                                                        IsRequired={true}
                                                        // disabled={selectedFilter === translate('YieldCalculator')}
                                                        placeholder={translate('select')}
                                                        placeholderTextColor={'rgba(180, 180, 180, 0.5)'}
                                                        onFocus={() => {
                                                            // console.log(cropMastersFilter,"crop masters<------------------------",typeof item?.companyCode)
                                                            let filterItemsThroughCompanyCode = cropMastersFilter?.filter((dataa) => {
                                                                return dataa?.companyCode == item?.companyCode
                                                            })
                                                            changeDropDownData(filterItemsThroughCompanyCode, strings.crop, item.cropName, index);
                                                            // changeDropDownData(cropMastersFilter, strings.crop, item.cropName, index);
                                                        }}
                                                    />
                                                </View>
                                                <View style={{ width: '48%', marginLeft: responsiveWidth(1) }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, { marginBottom: 2.5 }, styles['font_size_12_regular']]}  >
                                                        {translate('Hybrid')}
                                                    </Text>
                                                    <CustomBorderInputDropDown
                                                        width={[{ width: '100%' }]}
                                                        // defaultValue={item.brandName || ''}
                                                        defaultValue={(item?.brandName.length > 12 ? `${item?.brandName.slice(0, 12).trim()}...` : item?.brandName) || ''}
                                                        // defaultValue={hybrid != undefined && hybrid != translate('select') ? hybrid : translate('select')}
                                                        IsRequired={true}
                                                        // disabled={selectedFilter === translate('YieldCalculator')}
                                                        placeholder={translate('select')}
                                                        placeholderTextColor={'rgba(180, 180, 180, 0.5)'}
                                                        onFocus={() => {
                                                            if (item.cropName) {
                                                                // console.log(hybridsList,"hybrid masters<------------------------",typeof item?.companyCode)
                                                                let filterItemsThroughCompanyCode = hybridsList?.filter((dataa) => {
                                                                    return dataa?.cropName === item?.cropName && dataa?.companyCode === item?.companyCode
                                                                })
                                                                console.log(JSON.stringify(filterItemsThroughCompanyCode), "<<< aslkdasklj")
                                                                //    alert(JSON.stringify(filterItemsThroughCompanyCode),"< filtered")
                                                                changeDropDownData(filterItemsThroughCompanyCode, strings.Hybrid, item.brandName, index)
                                                            } else {
                                                                SimpleToast.show(translate('please_select_crop'))
                                                            }
                                                        }}
                                                    />
                                                </View>
                                            </View>

                                            {retailerEntries.length > 1 &&
                                                <TouchableOpacity onPress={() => removeEntry(index)} activeOpacity={0.5}
                                                    style={{
                                                        position: "absolute", right: 5, top: Platform.OS === 'android' ? 5 : 2.5,
                                                        backgroundColor: dynamicStyles.iconPrimaryColor, borderRadius: 60, height: 20, width: 20,
                                                        alignItems: "center", justifyContent: "center"
                                                    }}>
                                                    <Image source={require('../assets/images/minussTool.png')} resizeMode='contain' style={{ height: 8, width: 8 }} />
                                                </TouchableOpacity>}

                                            <View style={{
                                                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                                                alignSelf: "center", marginBottom: 10, marginTop: 2.5
                                            }}>

                                                <View style={{ width: '48%', marginLeft: responsiveWidth(2), }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, { marginBottom: 6, marginLeft: 5, }, styles['font_size_12_regular']]}  >
                                                        {`${translate('FY25')} ${item.cropName !== '' ? item.cropName.toLowerCase() === 'cotton' ? '(in pkts)' : '(in kgs)' : ''}`}
                                                    </Text>
                                                    <TextInput
                                                        style={[{
                                                            color: dynamicStyles?.textColor ?? Colors.black,
                                                            borderWidth: 1,
                                                            borderColor: "rgba(180, 180, 180, 0.5)",
                                                            borderRadius: 5,
                                                            width: '5%'
                                                        },
                                                        styles['font_size_14_regular'],
                                                        styles['text_align_left'],
                                                        { padding: 5, paddingLeft: 10, width: "95%" }]}
                                                        value={item.fy25}
                                                        keyboardType={'decimal-pad'}
                                                        placeholder={translate('enter')}
                                                        placeholderTextColor={'rgba(180, 180, 180, 0.5)'}
                                                        underlineColorAndroid="transparent"
                                                        editable={true}
                                                        multiline={false}
                                                        onChangeText={(text) => {
                                                            let enteredText = text
                                                                .replace(/[^0-9.]/g, '')
                                                                .replace(/^\./, '0.')
                                                                .replace(/(\..*)\./g, '$1')
                                                                .replace(/(\.\d{2}).*/g, '$1');

                                                            updateEntry(index, 'fy25', enteredText);
                                                        }}
                                                        onBlur={() => {
                                                            if (item.fy25) {
                                                                let formattedValue = parseFloat(item.fy25).toString();
                                                                if (formattedValue.indexOf('.') !== -1) {
                                                                    const [integerPart, decimalPart] = formattedValue.split('.');
                                                                    if (decimalPart === '0' || decimalPart === '00') {
                                                                        formattedValue = integerPart;
                                                                    } else if (decimalPart.length === 1) {
                                                                        formattedValue = `${integerPart}.${decimalPart}0`;
                                                                    }
                                                                }
                                                                updateEntry(index, 'fy25', formattedValue);
                                                            }
                                                        }}
                                                        maxLength={9}
                                                        allowFontScaling={true}
                                                    />
                                                </View>
                                                <View style={{ width: '48%', marginLeft: responsiveWidth(0.5) }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, { marginBottom: 6, }, styles['font_size_12_regular']]}  >
                                                        {/* {translate('FY26Plan')} */}
                                                        {`${translate('FY26Plan')} ${item.cropName !== '' ? item.cropName.toLowerCase() === 'cotton' ? '(in pkts)' : '(in kgs)' : ''}`}
                                                    </Text>
                                                    <TextInput
                                                        style={[{
                                                            color: dynamicStyles?.textColor ?? Colors.black,
                                                            borderWidth: 1,
                                                            borderColor: "rgba(180, 180, 180, 0.5)",
                                                            borderRadius: 5,
                                                            width: '5%'
                                                        },
                                                        styles['font_size_14_regular'],
                                                        styles['text_align_left'],
                                                        { padding: 5, paddingLeft: 10, width: "95%" }]}
                                                        value={item.fy26}
                                                        keyboardType={'decimal-pad'}
                                                        placeholder={translate('enter')}
                                                        placeholderTextColor={'rgba(180, 180, 180, 0.5)'}
                                                        underlineColorAndroid="transparent"
                                                        editable={true}
                                                        multiline={false}
                                                        onChangeText={(text) => {
                                                            let enteredText = text
                                                                .replace(/[^0-9.]/g, '')
                                                                .replace(/^\./, '0.')
                                                                .replace(/(\..*)\./g, '$1')
                                                                .replace(/(\.\d{2}).*/g, '$1');
                                                            updateEntry(index, 'fy26', enteredText);
                                                        }}
                                                        onBlur={() => {
                                                            if (item.fy26) {
                                                                let formattedValue = parseFloat(item.fy26).toString();

                                                                if (formattedValue.indexOf('.') !== -1) {
                                                                    const [integerPart, decimalPart] = formattedValue.split('.');
                                                                    if (decimalPart === '0' || decimalPart === '00') {
                                                                        formattedValue = integerPart;
                                                                    } else if (decimalPart.length === 1) {
                                                                        formattedValue = `${integerPart}.${decimalPart}0`;
                                                                    }
                                                                }
                                                                updateEntry(index, 'fy26', formattedValue);
                                                            }
                                                        }}
                                                        maxLength={9}
                                                        allowFontScaling={true}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                    ListFooterComponent={() => (
                                        <TouchableOpacity onPress={addEntry}
                                            disabled={!validateLastEntry()} activeOpacity={0.5}
                                            style={{
                                                marginLeft: "auto", alignItems: "center",
                                                justifyContent: "center", flexDirection: "row",
                                                opacity: validateLastEntry() ? 1 : 0.5, right: 10, top: 10
                                            }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >{translate('Add')}</Text>
                                            <View style={{ backgroundColor: dynamicStyles.iconPrimaryColor, borderRadius: 60, height: 20, width: 20, alignItems: "center", justifyContent: "center", marginLeft: responsiveWidth(1) }}>
                                                <Image source={require('../assets/images/PlussTool.png')} resizeMode='contain' style={{ height: 10, width: 10 }} />
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />

                            </View>
                        }
                    </View>
                </ScrollView>

                {btnVisible &&
                    <View style={[{ marginTop: "auto" }, styles['margin_bottom_10']]}>
                        <CustomButton
                            shouldDisable={isSubmitDisabled}
                            onPress={() => saveAPI()}
                            title={translate('submit')}
                            margin={{ marginTop: 12, marginBottom: 4 }}
                            buttonBg={
                                isSubmitDisabled ? '#E5E5E5' :
                                    dynamicStyles.primaryColor}
                            btnWidth={"90%"}
                            titleTextColor={
                                isSubmitDisabled ? 'white' :
                                    dynamicStyles.secondaryColor} />
                    </View>}
            </View>
            {
                showDropDowns &&
                <CustomListViewModal
                    dropDownType={dropDownType}
                    listItems={dropDownData}
                    selectedItem={selectedDropDownItem}
                    onSelectedCrop={onSelectItem}
                    onSelectedHybrid={onSelectItem}
                    onSelectedCompanyName={onSelectItem}
                    closeModal={() => setShowDropDowns(false)}
                />
            }
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {showAlert && (
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
            )}
        </SafeAreaView>
    );
};

const styleSheetStyles = StyleSheet.create({
    // flexFull: { flex: 1 },
    gray300bg: { backgroundColor: '#f5f5f5' },
    header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
    backButton: { flexDirection: "row", alignItems: "center" },
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

export default PlanningTool;
