import { Platform, Text, StatusBar, View, Alert, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomTextInput from '../Components/CustomTextInput';
import { strings } from "../strings/strings";
import SimpleToast from 'react-native-simple-toast';
import { sortObjectsAlphabetically } from '../assets/Utils/Utils';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
// import CustomErrorLoader from '../Components/CustomErrorLoader';
import { GetApiHeaders, GetApiHeaderswithLoginResponse, GetRequest, PostRequest, getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, HTTP_ACCEPTED, HTTP_CREATED, HTTP_OK, configs } from '../helpers/URLConstants';
import { Colors } from '../assets/Utils/Color';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import CustomBorderInputDropDown from '../Components/CustomBorderInputDropDown';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import CustomButton from '../Components/CustomButton'
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { createStyles } from '../assets/style/createStyles';


export let getMastersFertilizer = async () => {
    let realm = new Realm({ path: 'User.realm' });
    let networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getFertilizerCalcURL = configs.BASE_URL + configs.CALCULATOR.getFertilizerCalculatorMaster;
            var getHeaders = await GetApiHeaders()
            var APIResponse = await GetRequest(getFertilizerCalcURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    var masterResp = APIResponse.response
                    if (masterResp != undefined && masterResp != null) {
                        try {
                            realm.write(() => {
                                realm.delete(realm.objects('fertiliserCalculatorMaster'));
                                realm.create('fertiliserCalculatorMaster', {
                                    _id: new Date(),
                                    data: JSON.stringify(masterResp),
                                    timestamp: new Date(),
                                });
                                console.log('added successfully into realm fertiliser calc master')
                            });
                        } catch (err) {
                            // console.log(err)
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

export const getFertilizerCalcRes = async () => {
    let realm = new Realm({ path: 'User.realm' });
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getFertilizerCalcURL = configs.BASE_URL + configs.CALCULATOR.GETFERTILIZERCALCULATOR;
            var getHeaders = await GetApiHeaders()
            var APIResponse = await GetRequest(getFertilizerCalcURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    var masterResp = APIResponse.response
                    if (masterResp != undefined && masterResp != null) {
                        try {
                            realm.write(() => {
                                realm.delete(realm.objects('fertiliserCalculatorResponse'));
                                realm.create('fertiliserCalculatorResponse', {
                                    _id: new Date(),
                                    data: JSON.stringify(masterResp),
                                    timestamp: new Date(),
                                });
                                console.log('added successfully into realm fertiliser calc response')
                            });
                        } catch (err) {
                            console.log(err)
                        }
                    }
                }
                else {
                    // Alert.alert(APIResponse?.message)
                }

            } else {

            }
        }
        catch (error) {

        }
    } else {
    }
}

var styles = BuildStyleOverwrite(Styles);


const FertilizerCalculator = ({ route }) => {
    var realm = new Realm({ path: 'User.realm' });
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const networkStatusval = useSelector(state => state.networkStatus.value)
    const calcType = route?.params?.calcType;
    const viewShotRef = useRef();
    const [showAlert, setShowAlert] = useState(false)
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    let [selectedCrop, setSelectedCrop] = useState('')
    let [SeedRateKg, setSeedRateKg] = useState('')
    let [selectedSoil, setSelectedSoil] = useState('')
    let [VarietyOrPlantingSystem, setVarietyOrPlantingSystem] = useState('')
    let [listPlantingSystem, setListPlantingSystem] = useState([])
    let [listRowSpace, setListRowSpace] = useState([])
    let [PlantToPlantArr, setPlantToPlantArr] = useState([])
    let [productiveTillersListt, setProductiveTillersListt] = useState([])
    let [AvgGrainsPannicleListtt, setAvgGrainsPannicleListtt] = useState([])
    let [AvgBollWtListt, setAvgBollWtListt] = useState([])
    let [yieldNote, setYieldNote] = useState('');
    let [apiHit, setApiHit] = useState(false)
    let [yieldNoteDesc, setYieldNoteDesc] = useState('');
    let [GrainYieldListtt, setGrainYieldListtt] = useState([])
    let [AvgBollsPerPlantListtt, setAvgBollsPerPlantListtt] = useState([])
    let [rowSpacing, setRowSpacing] = useState('')
    let [plantSpacing, setPlantSpacing] = useState('')
    const [IdealPlantPopulationOrAcre, setIdealPlantPopulationOrAcre] = useState('')
    let [CottonSeedRate, setCottonSeedRate] = useState('')
    let [areaToPlanted, setAreaToPlanted] = useState('')
    let [areaPlantedArr, setAreaPlantedArr] = useState('')
    let [totalSeedRequired, setTotalSeedRequired] = useState('')
    let [AvgBollsPerPlant, setAvgBollsPerPlant] = useState('')
    let [AvgBollWt, setAvgBollWt] = useState('')
    let [GrainYield, setGrainYield] = useState('');
    let [ExpectedYieldQtlPerAcre, setExpectedYieldQtlPerAcre] = useState('')
    let [AtthetimeNPK, setAtthetimeNPK] = useState('')
    let [atTheTimeUrea, setAtTheTimeUrea] = useState('')
    let [FirstDose, setFirstDose] = useState('')
    let [FirstDoseUrea, setFirstDoseUrea] = useState('')
    let [secondDoseNPK, setsecondDoseNpk] = useState('')
    let [secondDoseUrea, setsecondDoseUrea] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    let [yieldCalcRes, setYieldCalcRes] = useState(null)
    let [cropsList, setCropList] = useState(null)
    let [seasonsalList, setSeasonsalList] = useState(null)
    let [allSeasonsList, setAllSeasonsList] = useState(null)
    let [vrtyOrPlntngList, setVrtyOrPlntngList] = useState(null)
    let [rowSpacingCmList, setRowSpacingCmList] = useState(null)
    let [plantToPlantList, setPlantToPlantList] = useState(null)
    let [areaToPlantedList, setAreaPlantedList] = useState(null)
    let [productiveTillersList, setProductiveTillersList] = useState(null)
    let [avgGrainsPerPannicleList, setAgGrainsPerPannicleList] = useState(null)
    let [AvgBollWeightList, setAvgBollWeightList] = useState(null)
    let [AvgBollsPerPlantList, setAvgBollsPerPlantList] = useState(null)
    let [grainYieldCobsList, setgrainYieldCobsList] = useState(null)
    //setgrainYieldCobsList
    let [productiveTillers, setProductiveTillers] = useState('')
    let [AvgGrainsPannicle, setAvgGrainsPannicle] = useState('')
    let [masterData, setMasterData] = useState(null)

    const [dapAtSowing, setDapAtSowing] = useState('')
    const [mopAtSowing, setMopAtSowing] = useState('')
    const [mopSecondDose, setMopSecondDose] = useState('')
    const [sulphurSecondDose, setSulphurSecondDose] = useState('')
    const [zincSulphateSecondDose, setZincSulphateSecondDose] = useState('')
    const [sulphurAtSowing, setSulphurAtSowing] = useState('')
    const [zincSulphateAtSowing, setZincSulphateAtSowing] = useState('')
    let [renderContent, setRenderContent] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false);

    const navigation = useNavigation()

    let resetValues = () => {
        setSelectedSoil('')
        setSeasonsalList(null)
        setDapAtSowing('')
        setMopAtSowing('')
        setMopSecondDose('')
        setSulphurAtSowing('')
        setSulphurSecondDose('')
        setZincSulphateAtSowing('')
        setZincSulphateSecondDose('')
        setAtthetimeNPK('')
        setFirstDose('')
        setsecondDoseNpk('')
        setAtTheTimeUrea('')
        setFirstDoseUrea('')
        setsecondDoseUrea('')
        setRenderContent(false)
    }
    useEffect(() => {
        resetValues()
        let a = allSeasonsList;
        let crops = []
        a?.forEach((item) => {
            if (crops?.includes(item.crop)) return
            else crops?.push(item.crop)
        })
        let cropsDataTwo = {};
        crops?.forEach((crop) => {
            let cropList = a?.filter(item => item.crop === crop);
            cropList?.forEach((item, index) => {
                item.name = item.seasonSoilType;
                item.code = `${index + 1}`;
            });
            // this[crop.toLowerCase()] = cropList;
            cropsDataTwo[crop.toLowerCase()] = cropList;
        });

        if (selectedCrop !== '') {
            if (cropsDataTwo[selectedCrop?.toLowerCase()]?.length === 1) {
                setSelectedSoil(cropsDataTwo[selectedCrop?.toLowerCase()][0].seasonSoilType);
            } else {
                setSelectedSoil('');
            }
            setSeasonsalList(cropsDataTwo[selectedCrop?.toLowerCase()]);
        }

    }, [selectedCrop])

    useEffect(() => {
        if (selectedCrop !== '' && selectedSoil !== '') {
            getOtherDetails()
        }
    }, [selectedCrop, selectedSoil])

    let getOtherDetails = async () => {
        // var networkStatus = await getNetworkStatus()
        // if (networkStatus) {
        //     try {
        //         setRenderContent(false)
        //         setLoading(true)
        //         setLoadingMessage(translate('please_wait_getting_data'))
        //         var getTotalSeedReqURL = configs.BASE_URL + configs.CALCULATOR.getFertilizerDropdownValuesBySelectedData;
        //         var getHeaders = await GetApiHeaders();
        //         var body = {
        //             "crop": selectedCrop,
        //             "SeasonSoilType": selectedSoil
        //         }
        //         var APIResponse = await PostRequest(getTotalSeedReqURL, getHeaders, body);
        //         if (APIResponse != undefined && APIResponse != null) {
        //             setTimeout(() => {
        //                 setLoadingMessage()
        //                 setLoading(false)
        //             }, 500);
        //             setTimeout(() => {
        //                 if (APIResponse.statusCode == HTTP_OK) {
        //                     var dashboardResp = APIResponse.response
        //                     let FertiliseLs = dashboardResp.FertilizerDetails[0]
        //                     if(dashboardResp.FertilizerDetails.length > 0) {
        //                     setDapAtSowing(FertiliseLs?.dapAtSowing ? FertiliseLs?.dapAtSowing : translate('dataUnavailable'))
        //                     setMopAtSowing(FertiliseLs?.mopAtSowing ? FertiliseLs?.mopAtSowing : translate('dataUnavailable'))
        //                     setMopSecondDose(FertiliseLs?.mopSecondDose ? FertiliseLs?.mopSecondDose : translate('dataUnavailable'))
        //                     setSulphurAtSowing(FertiliseLs?.sulphurAtSowing ? FertiliseLs?.sulphurAtSowing : translate('dataUnavailable'))
        //                     setSulphurSecondDose(FertiliseLs?.sulphurSecondDose ? FertiliseLs?.sulphurSecondDose : translate('dataUnavailable'))
        //                     setZincSulphateAtSowing(FertiliseLs?.zincSulphateAtSowing ? FertiliseLs?.zincSulphateAtSowing : translate('dataUnavailable'))
        //                     setZincSulphateSecondDose(FertiliseLs?.zincSulphateSecondDose ? FertiliseLs?.zincSulphateSecondDose : translate('dataUnavailable'))
        //                     setAtthetimeNPK(FertiliseLs?.npk10_26_26_AtSowing ? FertiliseLs?.npk10_26_26_AtSowing : translate('dataUnavailable'))
        //                     setFirstDose(FertiliseLs?.npk10_26_26_First_Dose ? FertiliseLs?.npk10_26_26_First_Dose : translate('dataUnavailable'))
        //                     setsecondDoseNpk(FertiliseLs?.npk10_26_26_Second_Dose ? FertiliseLs?.npk10_26_26_Second_Dose : translate('dataUnavailable'))
        //                     setAtTheTimeUrea(FertiliseLs?.ureaAtSowing ? FertiliseLs?.ureaAtSowing : translate('dataUnavailable'))
        //                     setFirstDoseUrea(FertiliseLs?.ureaFirstDose ? FertiliseLs?.ureaFirstDose : translate('dataUnavailable'))
        //                     setsecondDoseUrea(FertiliseLs?.ureaSecondDose ? FertiliseLs?.ureaSecondDose : translate('dataUnavailable'))
        //                     setRenderContent(true)
        //                     } else {
        //                         setSelectedSoil('')
        //                         setDapAtSowing(translate('dataUnavailable'))
        //                         setMopAtSowing(translate('dataUnavailable'))
        //                         setMopSecondDose(translate('dataUnavailable'))
        //                         setSulphurAtSowing(translate('dataUnavailable'))
        //                         setSulphurSecondDose(translate('dataUnavailable'))
        //                         setZincSulphateAtSowing(translate('dataUnavailable'))
        //                         setZincSulphateSecondDose(translate('dataUnavailable'))
        //                         setAtthetimeNPK(translate('dataUnavailable'))
        //                         setFirstDose(translate('dataUnavailable'))
        //                         setsecondDoseNpk(translate('dataUnavailable'))
        //                         setAtTheTimeUrea(translate('dataUnavailable'))
        //                         setFirstDoseUrea(translate('dataUnavailable'))
        //                         setsecondDoseUrea(translate('dataUnavailable'))
        //                     }
        //                 }
        //                 else {
        //                     setLoadingMessage(APIResponse?.message ?? "")
        //                     setLoading(false)
        //                     Alert.alert(APIResponse?.message)
        //                 }
        //             }, 500);

        //         } else {
        //             setTimeout(() => {
        //                 setLoading(false)
        //                 setLoadingMessage()
        //             }, 500);
        //         }
        //     }
        //     catch (error) {
        //         setTimeout(() => {
        //             setLoading(false)
        //             setSuccessLoadingMessage(error.message)
        //         }, 1000);
        //     }
        // } else {
        // SimpleToast.show(translate('no_internet_conneccted'))
        let fertiliserData = masterData.fretilizerCalData
        console.log(fertiliserData, "datatatatatatatt")
        let fertilisedData = fertiliserData.filter((item) => {
            return item.crop.toLowerCase() === selectedCrop.toLowerCase() && item.seasonSoilType.toLowerCase() === selectedSoil.toLowerCase()
        })
        if (fertilisedData.length > 0) {
            let FertiliseLs = fertilisedData[0]
            setDapAtSowing(FertiliseLs?.dapAtSowing ? FertiliseLs?.dapAtSowing : translate('dataUnavailable'))
            setMopAtSowing(FertiliseLs?.mopAtSowing ? FertiliseLs?.mopAtSowing : translate('dataUnavailable'))
            setMopSecondDose(FertiliseLs?.mopSecondDose ? FertiliseLs?.mopSecondDose : translate('dataUnavailable'))
            setSulphurAtSowing(FertiliseLs?.sulphurAtSowing ? FertiliseLs?.sulphurAtSowing : translate('dataUnavailable'))
            setSulphurSecondDose(FertiliseLs?.sulphurSecondDose ? FertiliseLs?.sulphurSecondDose : translate('dataUnavailable'))
            setZincSulphateAtSowing(FertiliseLs?.zincSulphateAtSowing ? FertiliseLs?.zincSulphateAtSowing : translate('dataUnavailable'))
            setZincSulphateSecondDose(FertiliseLs?.zincSulphateSecondDose ? FertiliseLs?.zincSulphateSecondDose : translate('dataUnavailable'))
            setAtthetimeNPK(FertiliseLs?.npk10_26_26_AtSowing ? FertiliseLs?.npk10_26_26_AtSowing : translate('dataUnavailable'))
            setFirstDose(FertiliseLs?.npk10_26_26_First_Dose ? FertiliseLs?.npk10_26_26_First_Dose : translate('dataUnavailable'))
            setsecondDoseNpk(FertiliseLs?.npk10_26_26_Second_Dose ? FertiliseLs?.npk10_26_26_Second_Dose : translate('dataUnavailable'))
            setAtTheTimeUrea(FertiliseLs?.ureaAtSowing ? FertiliseLs?.ureaAtSowing : translate('dataUnavailable'))
            setFirstDoseUrea(FertiliseLs?.ureaFirstDose ? FertiliseLs?.ureaFirstDose : translate('dataUnavailable'))
            setsecondDoseUrea(FertiliseLs?.ureaSecondDose ? FertiliseLs?.ureaSecondDose : translate('dataUnavailable'))
            setRenderContent(true)
        } else {
            setSelectedSoil('')
            setDapAtSowing(translate('dataUnavailable'))
            setMopAtSowing(translate('dataUnavailable'))
            setMopSecondDose(translate('dataUnavailable'))
            setSulphurAtSowing(translate('dataUnavailable'))
            setSulphurSecondDose(translate('dataUnavailable'))
            setZincSulphateAtSowing(translate('dataUnavailable'))
            setZincSulphateSecondDose(translate('dataUnavailable'))
            setAtthetimeNPK(translate('dataUnavailable'))
            setFirstDose(translate('dataUnavailable'))
            setsecondDoseNpk(translate('dataUnavailable'))
            setAtTheTimeUrea(translate('dataUnavailable'))
            setFirstDoseUrea(translate('dataUnavailable'))
            setsecondDoseUrea(translate('dataUnavailable'))
        }

        // }
    }

    let getMastersData = async () => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getFertilizerCalcURL = configs.BASE_URL + configs.CALCULATOR.getFertilizerCalculatorMaster;
                var getHeaders = await GetApiHeaders()

                var APIResponse = await GetRequest(getFertilizerCalcURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.response
                        if (masterResp != undefined && masterResp != null) {
                            try {
                                realm.write(() => {
                                    realm.delete(realm.objects('fertiliserCalculatorMaster'));
                                    realm.create('fertiliserCalculatorMaster', {
                                        _id: new Date(),
                                        data: JSON.stringify(masterResp),
                                        timestamp: new Date(),
                                    });
                                    console.log('added successfully into realm fertiliser calc master')
                                });
                            } catch (err) {
                                console.log(err)
                            }
                            setMasterData(masterResp)
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

    const getFertilizerCalc = async () => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getFertilizerCalcURL = configs.BASE_URL + configs.CALCULATOR.GETFERTILIZERCALCULATOR;
                var getHeaders = await GetApiHeaders()

                var APIResponse = await GetRequest(getFertilizerCalcURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.response
                        if (masterResp != undefined && masterResp != null) {
                            try {
                                realm.write(() => {
                                    realm.delete(realm.objects('fertiliserCalculatorResponse'));
                                    realm.create('fertiliserCalculatorResponse', {
                                        _id: new Date(),
                                        data: JSON.stringify(masterResp),
                                        timestamp: new Date(),
                                    });
                                    console.log('added successfully into realm fertiliser calc response')
                                });
                            } catch (err) {
                                console.log(err)
                            }
                            //   setShowCustomActionSheet(false)
                            setYieldCalcRes(masterResp)
                            let cropLis = masterResp.cropList
                            cropLis.forEach((crop, index) => {
                                crop.name = crop.crop;
                                // delete crop.crop; 
                                crop.code = `crop${index + 1}`;
                            });
                            setCropList(cropLis)
                            setAllSeasonsList(masterResp?.seasonSoilTypeList)
                            setYieldNote(masterResp?.fertilizerTitle)
                            setYieldNoteDesc(masterResp?.fertilizerDescription)
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

    // useEffect(() => {
    //     getFertilizerCalc()
    //     getMastersData()
    // }, []);


    let checkRealData = async () => {
        const fertiliserDataRes = realm.objects('fertiliserCalculatorResponse');
        const fertiliserDataMaster = realm.objects('fertiliserCalculatorMaster');
        if (fertiliserDataRes.length !== 0) {
            let data = fertiliserDataRes[0];
            const masterResp = JSON.parse(data?.data);
            setYieldCalcRes(masterResp)
            let cropLis = masterResp.cropList
            cropLis.forEach((crop, index) => {
                crop.name = crop.crop;
                // delete crop.crop; 
                crop.code = `crop${index + 1}`;
            });
            setCropList(cropLis)
            setAllSeasonsList(masterResp?.seasonSoilTypeList)
            setYieldNote(masterResp?.fertilizerTitle)
            setYieldNoteDesc(masterResp?.fertilizerDescription)
        }
        if (fertiliserDataMaster.length !== 0) {
            let data = fertiliserDataMaster[0];
            const masterResp = JSON.parse(data?.data);
            setMasterData(masterResp)
        }
        if (fertiliserDataRes.length === 0 && fertiliserDataMaster.length === 0) {
            showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            const fertiliserDataRes = realm.objects('fertiliserCalculatorResponse');
            const fertiliserDataMaster = realm.objects('fertiliserCalculatorMaster');
            if (fertiliserDataRes !== 0 && fertiliserDataMaster !== 0) {
                checkRealData()
            } else {
                getFertilizerCalc()
                getMastersData()
            }
            // let getData = async () => {
            //     if (networkStatusval) {
            //         getFertilizerCalc()
            //         getMastersData()
            //     } else {
            //         checkRealData()
            //     }
            // }
            // getData()
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [networkStatusval])
    );

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    const onSelectItem = (itemdata, setStateFn) => {
        if (itemdata != null) {
            setStateFn(itemdata?.name);
            setShowDropDowns(false);
        }
    };
    const onSelectCropItem = (itemdata, setStateFn) => {
        if (itemdata != null) {
            setStateFn(itemdata?.name);
            setSelectedSoil('')
            setShowDropDowns(false);
        }
    };

    const takeScreenshot = async () => {
        if (isProcessing) return; // prevent multiple clicks
        setIsProcessing(true);

        setTimeout(async () => {
            try {
                const uri = await viewShotRef.current.capture();
                const shareOptions = {
                    title: 'Share via',
                    message: `${translate('Note')} ${yieldNoteDesc}`,
                    url: uri,
                    // social: Share.Social.WHATSAPP,
                };
                Share.open(shareOptions);
            } catch (error) {
                console.error('Failed to capture screenshot:', error);
            } finally {
                setIsProcessing(false);
            }
        }, 200);


    };

    const showStatus = () => {
        if (selectedCrop === 'Bajra') {
            if (dapAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === 'Jute') {
            if (dapAtSowing === '' && mopAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === 'Wheat') {
            if (dapAtSowing === '' && mopAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '' && mopSecondDose === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === 'Mustard') {
            if (dapAtSowing === '' && mopAtSowing === '' && sulphurAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '' && mopSecondDose === '' && sulphurSecondDose === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === 'Maize') {
            if (dapAtSowing === '' && mopAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '' && mopSecondDose === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === 'Paddy') {
            if (dapAtSowing === '' && mopAtSowing === '' && zincSulphateAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '' && mopSecondDose === '' && zincSulphateSecondDose === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === 'Cotton') {
            if (AtthetimeNPK === '' && atTheTimeUrea === '' && FirstDose === '' && FirstDoseUrea === '' && secondDoseNPK === '' && secondDoseUrea === '') {
                return false
            } else {
                return true
            }
        }
    };

    let returnArray = (value) => {
        let obj = {
            code: value?.length,
            name: value
        }
        return [obj];
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            <View style={[styleSheetStyles.flexFull, styleSheetStyles.gray300bg]}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
                <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
                    <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => navigation.goBack()}>
                        <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                        <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{calcType}</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    <ViewShot ref={viewShotRef} style={styleSheetStyles.viewShot} captureMode="mount" options={{ format: 'jpg', quality: 0.9 }}>
                        <View style={{
                            backgroundColor: "#fff",
                            width: "90%",
                            alignSelf: "center",
                            elevation: 5,
                            borderRadius: 5,
                            marginTop: 10,
                            marginBottom: responsiveHeight(3),
                            paddingBottom: responsiveHeight(3),
                        }}>
                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }]}  >
                                {translate('selectCrop')}
                            </Text>
                            <CustomBorderInputDropDown
                                width={[{ width: '92%' }, styles['centerItems']]}
                                defaultValue={selectedCrop != undefined && selectedCrop != translate('select') ? selectedCrop : translate('select')}
                                IsRequired={true}
                                placeholder={translate('selectCrop')}
                                onFocus={() => {
                                    changeDropDownData(cropsList, strings.yieldOne, selectedCrop)
                                    // setSelectedSoil('')
                                }}
                            />


                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }, Platform.OS === 'ios' && { lineHeight: 25 }]}  >
                                {translate('yieldTwo')}
                            </Text>
                            <CustomBorderInputDropDown
                                width={[{ width: '92%' }, styles['centerItems']]}
                                defaultValue={selectedSoil != undefined && selectedSoil != translate('select') ? selectedSoil : translate('select')}
                                IsRequired={true}
                                placeholder={translate('yieldTwo')}
                                onFocus={() => {
                                    changeDropDownData(seasonsalList, strings.yieldTwo, selectedSoil)
                                }}
                            />

                            <View>
                                {renderContent && <View>
                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }]}  >
                                        {translate('Atthetime')}
                                    </Text>
                                    <View style={[{
                                        borderWidth: 1,
                                        borderColor: 'rgba(180, 180, 180, 0.5)',
                                        width: '92%',
                                        alignSelf: "center",
                                        borderRadius: 10,
                                        paddingVertical: 10,
                                        marginTop: 5
                                    }]}>
                                        {dapAtSowing !== translate('dataUnavailable') &&
                                            <>
                                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                    <View style={{ width: '40%' }}>
                                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                            {translate('DOP')}
                                                        </Text>
                                                    </View>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                        {translate('dots')}
                                                    </Text>
                                                    <Text style={[{ color: dapAtSowing ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                        {dapAtSowing ? dapAtSowing : 0}
                                                    </Text>
                                                </View>
                                            </>
                                        }
                                        {AtthetimeNPK !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('NPK')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: AtthetimeNPK ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {AtthetimeNPK ? AtthetimeNPK : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {atTheTimeUrea !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('Urea')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: atTheTimeUrea ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {atTheTimeUrea ? atTheTimeUrea : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {mopAtSowing !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('MOP')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: mopAtSowing ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {mopAtSowing ? mopAtSowing : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {zincSulphateAtSowing !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('zincSulphate')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: zincSulphateAtSowing ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {zincSulphateAtSowing ? zincSulphateAtSowing : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {sulphurAtSowing !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('Sulphur')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: sulphurAtSowing ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {sulphurAtSowing ? sulphurAtSowing : 0}
                                                </Text>
                                            </View>
                                        </>}
                                    </View>

                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }]}  >
                                        {translate('FirstDose')}
                                    </Text>
                                    <View style={[{
                                        borderWidth: 1,
                                        borderColor: 'rgba(180, 180, 180, 0.5)',
                                        width: '92%',
                                        alignSelf: "center",
                                        borderRadius: 10,
                                        paddingVertical: 10,
                                        marginTop: 5
                                    }]}>
                                        {FirstDose !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('NPK')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: FirstDose ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {FirstDose ? FirstDose : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {FirstDoseUrea !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('Urea')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: FirstDoseUrea ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {FirstDoseUrea ? FirstDoseUrea : 0}
                                                </Text>
                                            </View>
                                        </>}
                                    </View>

                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }]}  >
                                        {translate('secondDose')}
                                    </Text>
                                    <View style={[{
                                        borderWidth: 1,
                                        borderColor: 'rgba(180, 180, 180, 0.5)',
                                        width: '92%',
                                        alignSelf: "center",
                                        borderRadius: 10,
                                        paddingVertical: 10,
                                        marginTop: 5
                                    }]}>
                                        {secondDoseNPK !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('NPK')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: secondDoseNPK ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {secondDoseNPK ? secondDoseNPK : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {secondDoseUrea !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('Urea')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: secondDoseUrea ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {secondDoseUrea ? secondDoseUrea : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {mopSecondDose !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('MOP')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: mopSecondDose ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {mopSecondDose ? mopSecondDose : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {zincSulphateSecondDose !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('zincSulphate')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: zincSulphateSecondDose ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {zincSulphateSecondDose ? zincSulphateSecondDose : 0}
                                                </Text>
                                            </View>
                                        </>}
                                        {sulphurSecondDose !== translate('dataUnavailable') && <>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], {}]}  >
                                                        {translate('Sulphur')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: sulphurSecondDose ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
                                                    {sulphurSecondDose ? sulphurSecondDose : 0}
                                                </Text>
                                            </View>
                                        </>}
                                    </View>
                                </View>}
                                {
                                    showDropDowns &&
                                    <CustomListViewModal
                                        dropDownType={dropDownType}
                                        listItems={dropDownData}
                                        selectedItem={selectedDropDownItem}
                                        onSelectedCropCal={(item) => onSelectCropItem(item, setSelectedCrop)}
                                        onSelectedSoilType={(item) => onSelectItem(item, setSelectedSoil)}
                                        onSelectedPlantingType={(item) => onSelectItem(item, setVarietyOrPlantingSystem)}
                                        onSelectedRowSpacing={(item) => onSelectItem(item, setRowSpacing)}
                                        onSelectedPlantSpacing={(item) => onSelectItem(item, setPlantSpacing)}
                                        onSelectedAreaToPlanted={(item) => onSelectItem(item, setAreaToPlanted)}
                                        onSelectedAvgBollsPerPlant={(item) => onSelectItem(item, setAvgBollsPerPlant)}
                                        onSelectedsetAvgBollWt={(item) => onSelectItem(item, setAvgBollWt)}
                                        onSelectedAtthetime={(item) => onSelectItem(item, setAtthetimeNPK)}
                                        // new addings start
                                        onSelectedDAPAtSowing={(item) => onSelectItem(item, setDapAtSowing)}
                                        onSelectedMOPAtSowing={(item) => onSelectItem(item, setMopAtSowing)}
                                        onSelectedZincSuplhateAtSowing={(item) => onSelectItem(item, setZincSulphateAtSowing)}
                                        onSelectedSulphurSowing={(item) => onSelectItem(item, setSulphurAtSowing)}
                                        //second dose
                                        onSelectedMopSecondDose={(item) => onSelectItem(item, setMopSecondDose)}
                                        onSelectedSulphurSecondDose={(item) => onSelectItem(item, setSulphurSecondDose)}
                                        onSelectedZincSulphateSecondDose={(item) => onSelectItem(item, setZincSulphateSecondDose)}
                                        // end
                                        onSelectedUrea={(item) => onSelectItem(item, setAtTheTimeUrea)}
                                        onSelectedFirstDose={(item) => onSelectItem(item, setFirstDose)}
                                        onSelectedFirstDoseUrea={(item) => onSelectItem(item, setFirstDoseUrea)}
                                        onSelectedsecondDose={(item) => onSelectItem(item, setsecondDoseNpk)}
                                        onSelectedsecondDoseUrea={(item) => onSelectItem(item, setsecondDoseUrea)}

                                        closeModal={() => setShowDropDowns(false)}
                                    />
                                }
                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_semibold'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }]}  >
                                    {yieldNote}
                                </Text>
                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], { marginBottom: 2.5, marginLeft: 15, marginTop: 5, width: "90%", textAlign: "left" }]}  >
                                    {yieldNoteDesc}
                                </Text>
                            </View>
                        </View>
                    </ViewShot>
                    {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
                    {/* {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />} */}
                    {/* {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />} */}
                </ScrollView>
                {!isProcessing && <View style={{ bottom: 10 }}>
                    <CustomButton shouldDisable={!showStatus()} title={translate('Share')} onPress={() => { takeScreenshot() }}
                        buttonBg={!showStatus() ? Colors.lightGray : dynamicStyles.primaryColor}
                        titleTextColor={!showStatus() ? Colors.white : dynamicStyles.secondaryColor}
                        btnWidth={'90%'}
                        addIcon={showStatus()}
                        textAlign='center' />
                </View>}
            </View>
        </SafeAreaView>
    );
};

const styleSheetStyles = StyleSheet.create({
    viewShot: {
        width: '100%',
        height: '100%',
    },
    flexFull: { flex: 1 },
    gray300bg: { backgroundColor: '#f5f5f5' },
    header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
    backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
});

export default FertilizerCalculator;
