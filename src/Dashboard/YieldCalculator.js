import { Platform, Text, StatusBar, View, Alert, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Dimensions } from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomTextInput from '../Components/CustomTextInput';
import { strings } from "../strings/strings";
import SimpleToast from 'react-native-simple-toast';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
// import CustomErrorLoader from '../Components/CustomErrorLoader';
import { GetApiHeaders, GetApiHeaderswithLoginResponse, GetRequest, PostRequest, getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, HTTP_ACCEPTED, HTTP_CREATED, HTTP_OK, configs } from '../helpers/URLConstants';
import { Colors } from '../assets/Utils/Color';
import { USER_ID, filterObjects, readFileToBase64, requestMultiplePermissions, retrieveData } from '../assets/Utils/Utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import CustomBorderInputDropDown from '../Components/CustomBorderInputDropDown';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomButton from '../Components/CustomButton'
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../Components/CustomAlert';
import { updateOfflineCount } from './synchCountUtils';
import { createStyles } from '../assets/style/createStyles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';

export const getYieldCalcMasters = async () => {
    let realm = new Realm({ path: 'User.realm' });
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getYeildCalcURL = configs.BASE_URL + configs.CALCULATOR.GETYIELDCALCULATOR;
            var getHeaders = await GetApiHeaders()
            var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    var masterResp = APIResponse.response
                    console.log('the yield calc master resp is================================>', masterResp)
                    if (masterResp != undefined && masterResp != null) {
                        try {
                            realm.write(() => {
                                realm.delete(realm.objects('YieldCalculatorResponse'));
                                realm.create('YieldCalculatorResponse', {
                                    _id: new Date(),
                                    data: JSON.stringify(masterResp),
                                    timestamp: new Date(),
                                });
                                console.log('added successfully into realm yield calc')
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

export const SaveYieldCalcValues = async (jsonData, dispatch) => {
    let realm = new Realm({ path: 'User.realm' });
    const networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getExpctYldURL = configs.BASE_URL + configs.CALCULATOR.saveYieldCalculator;
            var getHeaders = await GetApiHeaders()
            const data = JSON.stringify(jsonData);
            const formData = new FormData();
            formData.append('jsonData', data);
            const APIResponse = await uploadFormData(formData, getExpctYldURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    try {
                        realm.write(async () => {
                            realm.delete(realm.objects('YieldCalSubmit'));
                        });
                    } catch (error) {
                        console.error('Error clearing data of saved calc', error);
                    }
                    SimpleToast.show(APIResponse?.message)
                    updateOfflineCount(dispatch)
                    return true;
                } else {
                    return false;
                }

            } else {
                return false;
            }
        }
        catch (error) {
            return false;
        }
    } else {
        return false
    }
}


var styles = BuildStyleOverwrite(Styles);

const YieldCalculator = ({ route }) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    var realm = new Realm({ path: 'User.realm' });
    const calcType = route?.params?.calcType;
    const viewShotRef = useRef();
    const dispatch = useDispatch();
    // const [selectedFilter, setSelectedFilter] = useState(translate('TotalSeed')); // enable this selected filter for tab options enabled
    const [showAlert, setShowAlert] = useState(false)
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    let [selectedCrop, setSelectedCrop] = useState('')
    let [retreivedFrmSavedData, setRetreivedFrmSavedData] = useState(false)
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
    let [actualIdealPlantPopulationPerAcre, setActualIdealPlantPopulationPerAcre] = useState('')
    let [actualSeedRateKgPerAcre, setActualSeedRateKgPerAcre] = useState('')
    let [actualExpectedYieldQtlPerAcre, setActualExpectedYieldQtlPerAcre] = useState('')
    let [actualTotalSeedRequiredKgPerPkt, setActualTotalSeedRequiredKgPerPkt] = useState('')
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
    let [totalSeedRequiredUnits, setTotalSeedRequiredUnits] = useState('')
    let [seedRateUnits, setSeedRateUnits] = useState('')
    let [AvgBollsPerPlant, setAvgBollsPerPlant] = useState('')
    let [AvgBollWt, setAvgBollWt] = useState('')
    let [GrainYield, setGrainYield] = useState('');
    let [ExpectedYieldQtlPerAcre, setExpectedYieldQtlPerAcre] = useState('')
    let [Atthetime, setAtthetime] = useState('')
    let [Urea, setUrea] = useState('')
    let [FirstDose, setFirstDose] = useState('')
    let [FirstDoseUrea, setFirstDoseUrea] = useState('')
    let [secondDose, setsecondDose] = useState('')
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
    const networkStatusval = useSelector(state => state.networkStatus.value)
    const [alertTitle, setAlertTitle] = useState('');
    const [showAlertHeader, setShowAlertHeader] = useState(false)
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertYesButton, setShowAlertYesButton] = useState(false)
    const [showAlertNoButton, setShowAlertNoButton] = useState(false)
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false);

    const navigation = useNavigation()

    const roundToNearestInteger = (value) => {
        return Math.round(value).toString();
    };

    const roundAndFormat = (value) => {
        const rounded = Math.round(value);
        return rounded.toFixed(2);
    };

    const getDoubleRoundToNearestInteger = (value) => {
        return Math.round(value);
    };

    const roundToOneDecimalPlace = (value) => {
        return Number(value.toFixed(1)).toString();
    };

    const roundCustom = (value) => {
        const bd = Number(value.toFixed(2));
        const floorValue = Number(bd.toFixed(1));
        const decimalPart = bd - floorValue;

        const firstDecimal = Math.floor((bd * 10) % 10);
        const secondDecimal = Math.floor((bd * 100) % 10);

        if (firstDecimal === 9) {
            return Math.ceil(bd).toString();
        } else if (firstDecimal > 5) {
            return Math.ceil(bd).toString();
        } else {
            if (secondDecimal > 5) {
                return (floorValue + 0.1).toFixed(1);
            } else {
                return floorValue.toFixed(1);
            }
        }
    };


    const handleCancelAlert = () => {
        setShowAlert(false)
    }


    const CROP_NAME_COTTON = 'Cotton';
    const COTTON_SEED_RATE_UNITS = translate('Packets/Acre');
    const OTHER_SEED_RATE_UNITS = translate('Kg/Acre');
    const COTTON_TOTAL_SEED_REQUIRED_UNITS = translate('Packets');
    const COTTON_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1 = translate('Packet');
    const OTHER_TOTAL_SEED_REQUIRED_UNITS = translate('Kgs');
    const OTHER_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1 = translate('Kg');

    const getYieldAndSeedRates = async (crop, selectRowToRowSpacingCm, selectPlantToplantSpacingCm) => {
        try {
            const rowSpacing = parseFloat(selectRowToRowSpacingCm);
            const plantSpacing = parseFloat(selectPlantToplantSpacingCm);

            let idealPlantPopulationPerAcre = 4047 / ((rowSpacing * plantSpacing) / 10000);
            idealPlantPopulationPerAcre = getDoubleRoundToNearestInteger(idealPlantPopulationPerAcre);

            const result = {
                actualIdealPlantPopulationPerAcre: idealPlantPopulationPerAcre.toString(),
                idealPlantPopulationPerAcre: roundToNearestInteger(idealPlantPopulationPerAcre),
            };

            if (crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()) {
                let cottonSeedRatePktsPerAcre = idealPlantPopulationPerAcre / 5000;
                result.actualCottonSeedRatePktsPerAcre = cottonSeedRatePktsPerAcre.toString();
                result.cottonSeedRatePktsPerAcre = roundToOneDecimalPlace(cottonSeedRatePktsPerAcre);
                result.seedRateUnits = COTTON_SEED_RATE_UNITS;
            } else if (crop.toLowerCase() === 'maize') {
                let seedRateKgPerAcre = idealPlantPopulationPerAcre / 4000;
                result.actualSeedRateKgPerAcre = seedRateKgPerAcre.toString();
                result.seedRateKgPerAcre = roundCustom(seedRateKgPerAcre);
                result.seedRateUnits = OTHER_SEED_RATE_UNITS;
            } else {
                let seedRateKgPerAcre = (idealPlantPopulationPerAcre / 35700) * 1.2;
                result.actualSeedRateKgPerAcre = seedRateKgPerAcre.toString();
                result.seedRateKgPerAcre = roundToOneDecimalPlace(seedRateKgPerAcre);
                result.seedRateUnits = OTHER_SEED_RATE_UNITS;
            }

            return result;
        } catch (error) {
            console.error('Error in getYieldAndSeedRates:', error);
            throw error;
        }
    };

    const getTotalSeedRequiredKgPerPkt = async (crop, cottonSeedRatePktsPerAcre, seedRateKgPerAcre, areaPlantedAcres) => {
        try {
            const areaPlanted = parseFloat(areaPlantedAcres);
            let totalSeedRequiredKgPerPkt;

            if (crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()) {
                const cottonSeedRate = parseFloat(cottonSeedRatePktsPerAcre);
                totalSeedRequiredKgPerPkt = Math.ceil((cottonSeedRate * areaPlanted) * 2) / 2;
            } else {
                const seedRate = parseFloat(seedRateKgPerAcre);
                totalSeedRequiredKgPerPkt = Math.ceil((seedRate * areaPlanted) * 2) / 2;
            }

            const totalSeedRequiredKgPerPktStr = roundAndFormat(totalSeedRequiredKgPerPkt);
            const totalSeedRequired = parseFloat(totalSeedRequiredKgPerPktStr);

            const result = {
                actualTotalSeedRequiredKgPerPkt: totalSeedRequiredKgPerPkt.toString(),
                totalSeedRequiredKgPerPkt: totalSeedRequiredKgPerPktStr,
                totalSeedRequiredUnits:
                    crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()
                        ? totalSeedRequired <= 1.0
                            ? COTTON_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1
                            : COTTON_TOTAL_SEED_REQUIRED_UNITS
                        : totalSeedRequired <= 1.0
                            ? OTHER_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1
                            : OTHER_TOTAL_SEED_REQUIRED_UNITS,
            };

            return result;
        } catch (error) {
            console.error('Error in getTotalSeedRequiredKgPerPkt:', error);
            throw error;
        }
    };

    const getExpectedYieldQtl = async (
        crop,
        idealPlantPopulationPerAcre,
        productiveTillersPer10Hills,
        avgGrainsPerPannicle,
        avgBollsPerPlant,
        avgBollWeight,
        grainYield5Cobs,
        seasonOrSoilType,
        varietyTypeOrPlantingSystem
    ) => {
        try {
            const idealPlantPopulation = parseFloat(idealPlantPopulationPerAcre);
            let expectedYieldQtlPerAcre;

            if (crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()) {
                const avgBollsPrPlant = parseFloat(avgBollsPerPlant);
                const avgBollWgt = parseFloat(avgBollWeight);
                expectedYieldQtlPerAcre = (idealPlantPopulation * avgBollsPrPlant * avgBollWgt / 100000) * 0.8;
            } else if (crop.toLowerCase() === 'hybrid rice') {
                const productiveTillers = parseFloat(productiveTillersPer10Hills);
                const avgGrains = parseFloat(avgGrainsPerPannicle);
                if (varietyTypeOrPlantingSystem === 'Basmati/LS- BX-44, X5, X8, Winner') {
                    expectedYieldQtlPerAcre =
                        ((idealPlantPopulation * productiveTillers) / 10) * avgGrains * 25 / 100000000 * 0.8;
                } else {
                    expectedYieldQtlPerAcre =
                        ((idealPlantPopulation * productiveTillers) / 10) * avgGrains * 28 / 100000000 * 0.8;
                }
            } else {
                const grainYield = parseFloat(grainYield5Cobs);
                expectedYieldQtlPerAcre = (idealPlantPopulation * grainYield / 5) * 0.8 / 1000 / 100;
            }

            const expectedYieldQtlPerAcreStr = crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()
                ? roundToOneDecimalPlace(expectedYieldQtlPerAcre)
                : roundToNearestInteger(expectedYieldQtlPerAcre);

            return {
                actualExpectedYieldQtlPerAcre: expectedYieldQtlPerAcre.toString(),
                expectedYieldQtlPerAcre: expectedYieldQtlPerAcreStr,
            };
        } catch (error) {
            console.error('Error in getExpectedYieldQtl:', error);
            throw error;
        }
    };

    let resetValues = () => {
        //reset values when crop update
        // setRetreivedFrmSavedData(false)
        // these two below conditions 
        // !retreivedFrmSavedData && setSelectedSoil('') 
        // !retreivedFrmSavedData && setVarietyOrPlantingSystem('')
        setSelectedSoil('')
        setTotalSeedRequiredUnits('')
        setSeedRateUnits('')
        setVarietyOrPlantingSystem('')
        setListPlantingSystem([])
        //area to planted reset
        setAreaToPlanted('')
        setAreaPlantedArr([])
        //row spacing
        setRowSpacing('')
        setListRowSpace([])
        setSeasonsalList(null)
        //setAvgGrainsPannicleListtt
        //reset values   
        setAvgGrainsPannicle('')
        setAvgGrainsPannicleListtt([])
        //reset seed rate and plant population per acre
        setIdealPlantPopulationOrAcre('')
        setCottonSeedRate('')
        //AvgBollsPerPlant
        //reset values   
        setAvgBollsPerPlant('')
        setAvgBollsPerPlantListtt([])
        //avgBollWeghtLs
        //reset values   
        setAvgBollWt('')
        setAvgBollWtListt([])
        setExpectedYieldQtlPerAcre('')
        setTotalSeedRequired('')
    }
    useEffect(() => {
        !retreivedFrmSavedData && resetValues()
        setSeaonsArray()
    }, [selectedCrop])

    let setSeaonsArray = () => {
        let a = allSeasonsList;
        let crops = []
        a?.forEach((item) => {
            if (crops?.includes(item.crop)) return
            else crops?.push(item.crop)
        })
        crops?.forEach((crop) => {
            let cropList = a?.filter(item => item.crop === crop);
            cropList?.forEach((item, index) => {
                item.name = item.seasonOrSoilType;
                item.code = `${index + 1}`;
            });
            this[crop.toLowerCase()] = cropList;
        });

        if (selectedCrop !== '') {
            setSeasonsalList(this[selectedCrop?.toLowerCase()]);
        }
    }

    let setArraysList = () => {
        let list = vrtyOrPlntngList;
        let rowSpcLst = rowSpacingCmList;
        let plantoPlanLs = plantToPlantList;
        let areaPlantedValues = areaToPlantedList;
        let prdctTillerLs = productiveTillersList;
        let avgGrainPannLs = avgGrainsPerPannicleList;
        let avgBollWeghtLs = AvgBollWeightList;
        let avgBollPerPlant = AvgBollsPerPlantList;
        let grainCobLs = grainYieldCobsList;
        //reset seed rate and plant population per acre
        setIdealPlantPopulationOrAcre('')
        setCottonSeedRate('')

        //GrainYield
        //reset values   
        setGrainYield('')
        setGrainYieldListtt([])
        // find if single val of row spacing
        let selectedGrainYieldVal = grainCobLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.grainYield5Cobs;
        // filter objects as per the selection of crop and soil
        let grainYieldObj = grainCobLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (grainYieldObj !== undefined && grainYieldObj.length > 0) {
            grainYieldObj = grainYieldObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.grainYield5Cobs === item.grainYield5Cobs)) {
                    item.code = acc.length + 1;
                    item.name = item.grainYield5Cobs;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setGrainYieldListtt(grainYieldObj)
            if (grainYieldObj.length === 1) {
                //set direct value if length is 1
                setGrainYield(selectedGrainYieldVal);
            }
        }

        //avgBollWeghtLs
        //reset values   
        setAvgBollWt('')
        setAvgBollWtListt([])
        // find if single val of row spacing
        let selectedAvgBollWtVal = avgBollWeghtLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.avgBollWeight;
        // filter objects as per the selection of crop and soil
        let avgBollWtObj = avgBollWeghtLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (avgBollWtObj !== undefined && avgBollWtObj.length > 0) {
            avgBollWtObj = avgBollWtObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.avgBollWeight === item.avgBollWeight)) {
                    item.code = acc.length + 1;
                    item.name = item.avgBollWeight;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setAvgBollWtListt(avgBollWtObj)
            if (avgBollWtObj.length === 1) {
                //set direct value if length is 1
                setAvgBollWt(selectedAvgBollWtVal);
            }
        }

        //AvgBollsPerPlant
        //reset values   
        setAvgBollsPerPlant('')
        setAvgBollsPerPlantListtt([])
        // find if single val of row spacing
        let selectedAvgBollsPerPlantVal = avgBollPerPlant?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.avgBollsPerPlant;
        // filter objects as per the selection of crop and soil
        let avgBollsPerPlantObj = avgBollPerPlant?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (avgBollsPerPlantObj !== undefined && avgBollsPerPlantObj.length > 0) {
            avgBollsPerPlantObj = avgBollsPerPlantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.avgBollsPerPlant === item.avgBollsPerPlant)) {
                    item.code = acc.length + 1;
                    item.name = item.avgBollsPerPlant;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setAvgBollsPerPlantListtt(avgBollsPerPlantObj)
            if (avgBollsPerPlantObj.length === 1) {
                //set direct value if length is 1
                setAvgBollsPerPlant(selectedAvgBollsPerPlantVal);
            }
        }


        //planting system
        //reset values
        setListPlantingSystem([])
        setVarietyOrPlantingSystem('')
        // find if single val of planting system
        let selectedVariety = list?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.varietyOrPlantingSys;
        // filter objects as per the selection of crop and soil
        let ls = list?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (ls !== undefined && ls.length > 0) {
            ls.forEach((item, index) => {
                item.code = index + 1;
                item.name = item.varietyOrPlantingSys;
            });
            // set array of planting system
            setListPlantingSystem(ls);
            // Only set VarietyOrPlantingSystem if ls length is 1
            if (ls.length === 1) {
                setVarietyOrPlantingSystem(selectedVariety);
            }
        }

        //row spacing 
        //reset values
        setRowSpacing('')
        setListRowSpace([])
        // find if single val of row spacing
        let selectedRowSpc = rowSpcLst?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.selectRowToRowSpacingCm;
        // filter objects as per the selection of crop and soil
        let rowSspc = rowSpcLst?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (rowSspc !== undefined && rowSspc.length > 0) {
            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.selectRowToRowSpacingCm === item.selectRowToRowSpacingCm)) {
                    item.code = acc.length + 1;
                    item.name = item.selectRowToRowSpacingCm;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set array of row space
            setListRowSpace(rowSspc);
            // Only set row space if ls length is 1
            if (rowSspc.length === 1) {
                setRowSpacing(selectedRowSpc);
            }
        }

        //plant spacing
        //reset values
        setPlantSpacing('')
        setPlantToPlantArr([])
        // find if single val of row spacing
        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.selectPlantToplantSpacingCm;
        // filter objects as per the selection of crop and soil
        let plantObj = plantoPlanLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (plantObj !== undefined && plantObj.length > 0) {
            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.selectPlantToplantSpacingCm === item.selectPlantToplantSpacingCm)) {
                    item.code = acc.length + 1;
                    item.name = item.selectPlantToplantSpacingCm;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setPlantToPlantArr(plantObj)
            if (plantObj.length === 1) {
                //set direct value if length is 1
                setPlantSpacing(selectedPlantSpc);
            }
        }

        //setAvgGrainsPannicleListtt
        //reset values   
        setAvgGrainsPannicle('')
        setAvgGrainsPannicleListtt([])
        // find if single val of row spacing
        let selectedAvgGrainPinnacleVal = avgGrainPannLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.avgGrainsPerPannicle;
        // filter objects as per the selection of crop and soil
        let avgGrainsPerPannicleObj = avgGrainPannLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (avgGrainsPerPannicleObj !== undefined && avgGrainsPerPannicleObj.length > 0) {
            avgGrainsPerPannicleObj = avgGrainsPerPannicleObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.avgGrainsPerPannicle === item.avgGrainsPerPannicle)) {
                    item.code = acc.length + 1;
                    item.name = item.avgGrainsPerPannicle;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setAvgGrainsPannicleListtt(avgGrainsPerPannicleObj)
            if (avgGrainsPerPannicleObj.length === 1) {
                //set direct value if length is 1
                setAvgGrainsPannicle(selectedAvgGrainPinnacleVal);
            }
        }

        //productive millers
        //reset values   
        setProductiveTillers('')
        setProductiveTillersListt([])
        // find if single val of row spacing
        let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.productiveTillersPer10Hills;
        // filter objects as per the selection of crop and soil
        let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (productiveTillerObj !== undefined && productiveTillerObj.length > 0) {
            productiveTillerObj = productiveTillerObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.productiveTillersPer10Hills === item.productiveTillersPer10Hills)) {
                    item.code = acc.length + 1;
                    item.name = item.productiveTillersPer10Hills;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setProductiveTillersListt(productiveTillerObj)
            if (productiveTillerObj.length === 1) {
                //set direct value if length is 1
                setProductiveTillers(selectedProdTillerVal);
            }
        }


        //Area to be planted (Acres)
        //reset values   
        setAreaToPlanted('')
        setAreaPlantedArr([])
        // find if single val of row spacing
        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.areaPlantedAcres;
        // filter objects as per the selection of crop and soil
        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
            areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                    item.code = acc.length + 1;
                    item.name = item.areaPlantedAcres;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setAreaPlantedArr(areaToPlantedObj)
            if (areaToPlantedObj.length === 1) {
                //set direct value if length is 1
                setAreaToPlanted(selectedAreaPlantedVal);
            }
        }
    }

    useEffect(() => {
        // setRetreivedFrmSavedData(false)
        setArraysList()
    }, [selectedCrop, selectedSoil])

    useEffect(() => {
        if (rowSpacing !== '') {
            // !retreivedFrmSavedData && 
            let plantoPlanLs = plantToPlantList;
            setPlantSpacing('')
            setPlantToPlantArr([])
            // find if single val of row spacing
            let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil && (rowSpacing != null ? item.selectRowToRowSpacingCm == rowSpacing : true))?.selectPlantToplantSpacingCm;
            // filter objects as per the selection of crop and soil
            let plantObj = plantoPlanLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil && (rowSpacing != null ? item.selectRowToRowSpacingCm == rowSpacing : true))
            if (plantObj !== undefined && plantObj.length > 0) {
                plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                    if (!acc.some(existingItem => existingItem.selectPlantToplantSpacingCm === item.selectPlantToplantSpacingCm)) {
                        item.code = acc.length + 1;
                        item.name = item.selectPlantToplantSpacingCm;
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // set plant arr
                setPlantToPlantArr(plantObj)
                if (plantObj.length === 1) {
                    //set direct value if length is 1
                    setPlantSpacing(selectedPlantSpc);
                }
            }
            // callApiRowPlant()
        }
    }, [rowSpacing])

    useEffect(() => {
        if (rowSpacing !== '' && plantSpacing !== '') {
            let areaPlantedValues = areaToPlantedList;
            let grainCobLs = grainYieldCobsList;
            let prdctTillerLs = productiveTillersList;

            // Reset values   
            setAreaToPlanted('');
            setAreaPlantedArr([]);

            // Add varietyOrPlantingSys condition
            let selectedAreaPlantedVal = areaPlantedValues?.find(item =>
                item.crop === selectedCrop &&
                item.seasonOrSoilType === selectedSoil &&
                (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            )?.areaPlantedAcres;

            // Filter objects based on selection of crop, soil, row spacing, plant spacing, and varietyOrPlantingSys
            let areaToPlantedObj = areaPlantedValues?.filter(item =>
                item.crop === selectedCrop &&
                item.seasonOrSoilType === selectedSoil &&
                (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            );

            if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
                areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // To avoid duplication
                    if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                        item.code = acc.length + 1;
                        item.name = item.areaPlantedAcres;
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // Set area planted array
                setAreaPlantedArr(areaToPlantedObj);
                if (areaToPlantedObj.length === 1) {
                    // Set direct value if length is 1
                    setAreaToPlanted(selectedAreaPlantedVal);
                }
            }

            setGrainYield('');
            setGrainYieldListtt([]);

            // Add varietyOrPlantingSys condition to find grain yield
            let selectedGrainYieldVal = grainCobLs?.find(item =>
                item.crop === selectedCrop &&
                item.seasonOrSoilType === selectedSoil &&
                (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            )?.grainYield5Cobs;

            // Filter grain yield objects based on selection of crop, soil, row spacing, plant spacing, and varietyOrPlantingSys
            let grainYieldObj = grainCobLs?.filter(item =>
                item.crop === selectedCrop &&
                item.seasonOrSoilType === selectedSoil &&
                (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            );

            if (grainYieldObj !== undefined && grainYieldObj.length > 0) {
                grainYieldObj = grainYieldObj.reduce((acc, item) => {    // To avoid duplication
                    if (!acc.some(existingItem => existingItem.grainYield5Cobs === item.grainYield5Cobs)) {
                        item.code = acc.length + 1;
                        item.name = item.grainYield5Cobs;
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // Set grain yield array
                setGrainYieldListtt(grainYieldObj);
                if (grainYieldObj.length === 1) {
                    // Set direct value if length is 1
                    setGrainYield(selectedGrainYieldVal);
                }
            }

            //reset values   
            setProductiveTillers('')
            setProductiveTillersListt([])
            // find if single val of row spacing
            let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === selectedCrop
                && item.seasonOrSoilType === selectedSoil
                && (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            )?.productiveTillersPer10Hills;
            // filter objects as per the selection of crop and soil
            let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === selectedCrop
                && item.seasonOrSoilType === selectedSoil
                && (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            )
            if (productiveTillerObj !== undefined && productiveTillerObj.length > 0) {
                productiveTillerObj = productiveTillerObj.reduce((acc, item) => {    // to avoid duplication i have used this
                    if (!acc.some(existingItem => existingItem.productiveTillersPer10Hills === item.productiveTillersPer10Hills)) {
                        item.code = acc.length + 1;
                        item.name = item.productiveTillersPer10Hills;
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // set plant arr
                setProductiveTillersListt(productiveTillerObj)
                if (productiveTillerObj.length === 1) {
                    //set direct value if length is 1
                    setProductiveTillers(selectedProdTillerVal);
                }
            }

            callApiRowPlant();
        }
    }, [rowSpacing, plantSpacing, VarietyOrPlantingSystem]);


    useEffect(() => {
        if (CottonSeedRate !== '' && areaToPlanted !== '' && actualSeedRateKgPerAcre !== '') {
            // !retreivedFrmSavedData && 
            callApiGETTOTALSEED()
        }
    }, [CottonSeedRate, areaToPlanted])

    useEffect(() => {
        setTimeout(() => {
            let body;
            if (selectedCrop === 'Cotton') {
                if (IdealPlantPopulationOrAcre && AvgBollsPerPlant && AvgBollWt) {
                    body = {
                        "crop": selectedCrop,
                        // 'seasonOrSoilType':selectedSoil,
                        'actualIdealPlantPopulationPerAcre': actualIdealPlantPopulationPerAcre,
                        'avgBollWeight': AvgBollWt,
                        'avgBollsPerPlant': AvgBollsPerPlant,
                        'varietyTypeOrPlantingSystem': VarietyOrPlantingSystem,
                    }
                    // !retreivedFrmSavedData && 
                    callExpctYield(body)
                    return
                }
            }
            if (selectedCrop === 'Maize') {
                if (IdealPlantPopulationOrAcre && GrainYield) {
                    body = {
                        "crop": selectedCrop,
                        // 'seasonOrSoilType':selectedSoil,
                        'actualIdealPlantPopulationPerAcre': actualIdealPlantPopulationPerAcre,
                        'grainYield5Cobs': GrainYield,
                        'varietyTypeOrPlantingSystem': VarietyOrPlantingSystem,
                    }
                    // !retreivedFrmSavedData && 
                    callExpctYield(body)
                    return
                }
            }
            else {
                if (IdealPlantPopulationOrAcre && productiveTillers && AvgGrainsPannicle) {
                    body = {
                        "crop": selectedCrop,
                        // 'seasonOrSoilType':selectedSoil,
                        'actualIdealPlantPopulationPerAcre': actualIdealPlantPopulationPerAcre,
                        'productiveTillersPer10Hills': productiveTillers,
                        'avgGrainsPerPannicle': AvgGrainsPannicle,
                        'varietyTypeOrPlantingSystem': VarietyOrPlantingSystem,
                    }
                    // !retreivedFrmSavedData && 
                    callExpctYield(body)
                    return
                }
            }
        }, 1000)
    }, [IdealPlantPopulationOrAcre, AvgBollsPerPlant, AvgBollWt, productiveTillers, AvgGrainsPannicle, GrainYield, VarietyOrPlantingSystem])

    let saveAPI = async () => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var getExpctYldURL = configs.BASE_URL + configs.CALCULATOR.saveYieldCalculator;
                var getHeaders = await GetApiHeaders();
                var getUserID = (await retrieveData(USER_ID))
                const jsonData = {
                    "id": getUserID,
                    "retailerId": getUserID,
                    "crop": selectedCrop,
                    "season": selectedSoil,
                    "seasonSoilType": selectedSoil,
                    "varietyTypeOrPlantingSystem": VarietyOrPlantingSystem,
                    "selectRowTorowSpacingCm": rowSpacing,
                    "selectPlantToplantSpacingCm": plantSpacing,
                    "idealPlantPopulationPerAcre": IdealPlantPopulationOrAcre,
                    "cottonSeedRatePktsPerAcre": CottonSeedRate,
                    "seedRateKgPerAcre": CottonSeedRate,
                    "areaPlantedAcres": areaToPlanted,
                    "totalSeedRequiredKgPerPkt": totalSeedRequired,
                    "avgBollsPerPlant": AvgBollsPerPlant,
                    "avgBollWeight": AvgBollWt,
                    "productiveTillersPer10Hills": productiveTillers,
                    "avgGrainsPerPannicle": AvgGrainsPannicle,
                    "grainYield5Cobs": GrainYield,
                    "expectedYieldQtlPerAcre": ExpectedYieldQtlPerAcre,
                    "actualExpectedYieldQtlPerAcre": actualExpectedYieldQtlPerAcre,
                    "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre,
                    "actualCottonSeedRatePktsPerAcre": actualSeedRateKgPerAcre,
                    "actualIdealPlantPopulationPerAcre": actualIdealPlantPopulationPerAcre,
                    "actualTotalSeedRequiredKgPerPkt": actualTotalSeedRequiredKgPerPkt,
                    // "farmerId": 202
                };
                const formData = new FormData();
                formData.append('jsonData', JSON.stringify(jsonData));
                console.log(formData, "formmmmmmmmmmmmmmmmmmmmmmmmmmmdataaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

                const APIResponse = await uploadFormData(formData, getExpctYldURL, getHeaders);

                // var APIResponse = await PostRequest(getExpctYldURL, getHeaders, body);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 200);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse
                            console.log(dashboardResp, "save apiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii<<<<<<<<<<<<<<<<<<<")
                            setLoadingMessage()
                            setTimeout(() => {
                                SimpleToast.show(dashboardResp?.message)
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
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
            const seedCalcRes = realm.objects('YieldCalculatorResponse');
            let data = seedCalcRes[0]?.data;
            const masterResp = JSON.parse(data);
            var getUserID = (await retrieveData(USER_ID))
            const jsonData = {
                "id": getUserID,
                "retailerId": getUserID,
                "crop": selectedCrop,
                "season": selectedSoil,
                "seasonSoilType": selectedSoil,
                "varietyTypeOrPlantingSystem": VarietyOrPlantingSystem,
                "selectRowTorowSpacingCm": rowSpacing,
                "selectPlantToplantSpacingCm": plantSpacing,
                "idealPlantPopulationPerAcre": IdealPlantPopulationOrAcre,
                "cottonSeedRatePktsPerAcre": CottonSeedRate,
                "seedRateKgPerAcre": CottonSeedRate,
                "areaPlantedAcres": areaToPlanted,
                "totalSeedRequiredKgPerPkt": totalSeedRequired,
                "avgBollsPerPlant": AvgBollsPerPlant,
                "avgBollWeight": AvgBollWt,
                "productiveTillersPer10Hills": productiveTillers,
                "avgGrainsPerPannicle": AvgGrainsPannicle,
                "grainYield5Cobs": GrainYield,
                "expectedYieldQtlPerAcre": ExpectedYieldQtlPerAcre,
                "actualExpectedYieldQtlPerAcre": actualExpectedYieldQtlPerAcre,
                "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre,
                "actualCottonSeedRatePktsPerAcre": actualSeedRateKgPerAcre,
                "actualIdealPlantPopulationPerAcre": actualIdealPlantPopulationPerAcre,
                "actualTotalSeedRequiredKgPerPkt": actualTotalSeedRequiredKgPerPkt,
            };

            masterResp.YieldCalculatoroExist = JSON.stringify(jsonData);
            saveYieldMasterList(masterResp);
            const yieldStringfyObject = jsonData;
            const saveData = saveYieldCalc(yieldStringfyObject);
            if (saveData) {
                updateOfflineCount(dispatch)
                navigation.goBack()
                SimpleToast.show(translate('Data_saved_offline'), SimpleToast.LONG)
            }
        }
    }


    const saveYieldCalc = (payloadObj) => {
        try {
            realm.write(() => {
                realm.delete(realm.objects('YieldCalSubmit'));
                realm.create(
                    'YieldCalSubmit',
                    {
                        _id: 'YieldCalcSingleRecord',
                        data: JSON.stringify(payloadObj)
                    },
                );
            });
            console.log('Saved/Updated YieldCalc:', payloadObj);
            return true;
        } catch (error) {
            console.error('Failed to save YieldCalc:', error);
            return false;
        }
    };

    const saveYieldMasterList = (masterResp) => {
        try {
            realm.write(() => {
                realm.delete(realm.objects('YieldCalculatorResponse'));
                realm.create('YieldCalculatorResponse', {
                    _id: new Date(),
                    data: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });

            });
            console.log("yield master list saved.");
            return true;
        } catch (error) {
            console.error('Failed to save yield master list:', error);
            return false;
        }
    };

    let callExpctYield = async (bodyDetails) => {
        // var networkStatus = await getNetworkStatus()
        // if (networkStatus) {
        //     try {
        //         setLoading(true)
        //         setLoadingMessage(translate('please_wait_getting_data'))
        //         var getExpctYldURL = configs.BASE_URL + configs.CALCULATOR.GETEXPECTEDYIELDQTL;
        //         var getHeaders = await GetApiHeaders();
        //         var body = bodyDetails;
        //         var APIResponse = await PostRequest(getExpctYldURL, getHeaders, body);
        //         if (APIResponse != undefined && APIResponse != null) {
        //             setTimeout(() => {
        //                 setLoadingMessage()
        //                 setLoading(false)
        //             }, 500);
        //             setTimeout(() => {
        //                 if (APIResponse.statusCode == HTTP_OK) {
        //                     var dashboardResp = APIResponse.response
        //                     console.log(dashboardResp, "////////////////////////////")
        //                     setLoadingMessage()
        //                     setExpectedYieldQtlPerAcre(dashboardResp?.expectedYieldQtlPerAcre) 
        //                     setActualExpectedYieldQtlPerAcre(dashboardResp?.actualExpectedYieldQtlPerAcre)
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
        let dashboardResp = await getExpectedYieldQtl(
            selectedCrop,
            actualIdealPlantPopulationPerAcre,
            productiveTillers,
            AvgGrainsPannicle,
            AvgBollsPerPlant,
            AvgBollWt,
            GrainYield,
            selectedSoil,
            VarietyOrPlantingSystem,
        )
        setExpectedYieldQtlPerAcre(dashboardResp?.expectedYieldQtlPerAcre)
        setActualExpectedYieldQtlPerAcre(dashboardResp?.actualExpectedYieldQtlPerAcre)
        // }
    }
    let callApiGETTOTALSEED = async () => {
        var networkStatus = await getNetworkStatus()
        // if (networkStatus) {
        //     try {
        //         setLoading(true)
        //         setLoadingMessage(translate('please_wait_getting_data'))
        //         var getTotalSeedReqURL = configs.BASE_URL + configs.CALCULATOR.GETTOTALSEEDREQUIREDKGPERPKT;
        //         var getHeaders = await GetApiHeaders();
        //         var body = selectedCrop === 'Cotton' ? {
        //             "crop": selectedCrop,
        //             'actualCottonSeedRatePktsPerAcre': actualSeedRateKgPerAcre,
        //             "areaPlantedAcres": areaToPlanted
        //         } : {
        //             "crop": selectedCrop,
        //             'actualSeedRateKgPerAcre': actualSeedRateKgPerAcre,
        //             "areaPlantedAcres": areaToPlanted
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
        //                     console.log(dashboardResp, "////////////////////////////")
        //                     setLoadingMessage()
        //                     setTotalSeedRequired(dashboardResp?.totalSeedRequiredKgPerPkt)
        //                     setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
        //                     setActualTotalSeedRequiredKgPerPkt(dashboardResp?.actualTotalSeedRequiredKgPerPkt)
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
        let dashboardResp = await getTotalSeedRequiredKgPerPkt(selectedCrop, actualSeedRateKgPerAcre, actualSeedRateKgPerAcre, areaToPlanted)
        setTotalSeedRequired(dashboardResp?.totalSeedRequiredKgPerPkt)
        setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
        setActualTotalSeedRequiredKgPerPkt(dashboardResp?.actualTotalSeedRequiredKgPerPkt)
        // }
    }

    let callApiRowPlant = async () => {
        //   var networkStatus = await getNetworkStatus()
        //   if (networkStatus) {
        //     try {

        //         setLoading(true)
        //         setLoadingMessage(translate('please_wait_getting_data'))

        //   var getYieldRatesURL = configs.BASE_URL + configs.CALCULATOR.GETYIELDANDSEEDRATES;
        //   var getHeaders = await GetApiHeaders();
        //   var body = {
        //     "crop": selectedCrop,
        //     "selectRowToRowSpacingCm":rowSpacing,
        //     "selectPlantToplantSpacingCm": plantSpacing
        // }
        //   var APIResponse = await PostRequest(getYieldRatesURL, getHeaders, body);
        //       if (APIResponse != undefined && APIResponse != null) {
        //         setTimeout(() => {
        //           setLoadingMessage()
        //           setLoading(false)
        //         }, 500);
        //         setTimeout(() => {
        //           if (APIResponse.statusCode == HTTP_OK) {
        //               var dashboardResp = APIResponse.response
        //               console.log(dashboardResp,"////////////////////////////")
        //               setLoadingMessage()
        //               setActualIdealPlantPopulationPerAcre(dashboardResp?.actualIdealPlantPopulationPerAcre)
        //               setActualSeedRateKgPerAcre(selectedCrop === 'Cotton' ? dashboardResp?.actualCottonSeedRatePktsPerAcre : dashboardResp?.actualSeedRateKgPerAcre)
        //               setIdealPlantPopulationOrAcre(dashboardResp?.idealPlantPopulationPerAcre)
        //                 setCottonSeedRate(selectedCrop === 'Cotton' ? dashboardResp?.cottonSeedRatePktsPerAcre : dashboardResp?.seedRateKgPerAcre)
        //                 setSeedRateUnits(dashboardResp?.seedRateUnits)
        //           }
        //           else {
        //             setLoadingMessage(APIResponse?.message ?? "")
        //             setLoading(false)
        //             Alert.alert(APIResponse?.message)
        //           }
        //         }, 500);

        //       } else {
        //         setTimeout(() => {
        //           setLoading(false)
        //           setLoadingMessage()
        //         }, 500);
        //       }
        //     }
        //     catch (error) {
        //       setTimeout(() => {
        //         setLoading(false)
        //         setSuccessLoadingMessage(error.message)
        //       }, 1000);
        //     }
        //   } else {
        // SimpleToast.show(translate('no_internet_conneccted'))
        let dashboardResp = await getYieldAndSeedRates(selectedCrop, rowSpacing, plantSpacing)
        setActualIdealPlantPopulationPerAcre(dashboardResp?.actualIdealPlantPopulationPerAcre)
        setActualSeedRateKgPerAcre(selectedCrop === 'Cotton' ? dashboardResp?.actualCottonSeedRatePktsPerAcre : dashboardResp?.actualSeedRateKgPerAcre)
        setIdealPlantPopulationOrAcre(dashboardResp?.idealPlantPopulationPerAcre)
        setCottonSeedRate(selectedCrop === 'Cotton' ? dashboardResp?.cottonSeedRatePktsPerAcre : dashboardResp?.seedRateKgPerAcre)
        setSeedRateUnits(dashboardResp?.seedRateUnits)
        //   }
    }

    const getYieldCalc = async () => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getYeildCalcURL = configs.BASE_URL + configs.CALCULATOR.GETYIELDCALCULATOR;
                var getHeaders = await GetApiHeaders()

                var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.response
                        console.log('the yield resp is================================>', masterResp)
                        if (masterResp != undefined && masterResp != null) {
                            try {
                                realm.write(() => {
                                    realm.delete(realm.objects('YieldCalculatorResponse'));
                                    realm.create('YieldCalculatorResponse', {
                                        _id: new Date(),
                                        data: JSON.stringify(masterResp),
                                        timestamp: new Date(),
                                    });
                                    console.log('added successfully into realm yield calc')
                                });
                            } catch (err) {
                                console.log(err)
                            }
                            //   setShowCustomActionSheet(false)
                            if (JSON.parse(masterResp.YieldCalculatoroExist).id) {
                                setRetreivedFrmSavedData(true)
                                setTimeout(async () => {
                                    let wholeData = JSON.parse(masterResp?.YieldCalculatoroExist);
                                    if (wholeData?.seasonSoilType && wholeData?.areaPlantedAcres) {
                                        setSelectedCrop(wholeData?.crop);
                                        setSelectedSoil(wholeData?.seasonSoilType);
                                        // setVarietyOrPlantingSystem(wholeData?.varietyTypeOrPlantingSystem);
                                        setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                                        setPlantSpacing(wholeData?.selectPlantToplantSpacingCm);
                                        setIdealPlantPopulationOrAcre(wholeData?.idealplantPopulationPerAcre)
                                        setCottonSeedRate(wholeData?.cottonSeedRatePktsPerAcre);
                                        setAreaToPlanted(wholeData?.areaPlantedAcres);
                                        setSeedRateUnits(wholeData?.seedRateUnits)
                                        setTotalSeedRequiredUnits(wholeData?.totalSeedRequiredUnits)
                                        setActualSeedRateKgPerAcre(wholeData?.crop === 'Cotton' ? wholeData?.actualCottonSeedRatePktsPerAcre : wholeData?.actualSeedRateKgPerAcre)
                                        setTotalSeedRequired(wholeData?.totalSeedRequiredKgPerPkt);
                                        setAvgBollsPerPlant(wholeData?.avgBollsPerPlant)
                                        // setAvgBollWt(wholeData?.avgBollWeight);
                                        // setProductiveTillers(wholeData?.productiveTillersPer10Hills);
                                        // setAvgGrainsPannicle(wholeData?.avgGrainsPerPannicle)
                                        // setGrainYield(wholeData?.grainYield5Cobs)
                                        setExpectedYieldQtlPerAcre(wholeData?.expectedYieldQtlPerAcre)
                                        //set new values start
                                        setActualExpectedYieldQtlPerAcre(wholeData?.actualExpectedYieldQtlPerAcre)
                                        // setActualSeedRateKgPerAcre(wholeData?.actualSeedRateKgPerAcre)
                                        setActualIdealPlantPopulationPerAcre(wholeData?.actualIdealPlantPopulationPerAcre)
                                        setActualTotalSeedRequiredKgPerPkt(wholeData?.actualTotalSeedRequiredKgPerPkt)
                                        //end
                                        setYieldNote(masterResp?.yieldCalculatorTitle)
                                        setYieldNoteDesc(masterResp?.yieldCalculatorDescription)

                                        // set dropdowns
                                        setYieldCalcRes(masterResp)
                                        let cropLis = masterResp?.cropList
                                        cropLis.forEach((crop, index) => {
                                            crop.name = crop.crop;
                                            delete crop.crop;
                                            crop.code = `crop${index + 1}`;
                                        });
                                        setCropList(cropLis)
                                        setAllSeasonsList(masterResp?.seasonOrSoilTypeList)
                                        if (masterResp?.seasonOrSoilTypeList) {
                                            let a = masterResp?.seasonOrSoilTypeList;
                                            let crops = []
                                            a?.forEach((item) => {
                                                if (crops?.includes(item.crop)) return
                                                else crops?.push(item.crop)
                                            })
                                            crops?.forEach((crop) => {
                                                let cropListSeas = a?.filter(item => item.crop === crop);
                                                cropListSeas?.forEach((item, index) => {
                                                    item.name = item.seasonOrSoilType;
                                                    item.code = `${index + 1}`;
                                                });
                                                this[crop.toLowerCase()] = cropListSeas;
                                            });

                                            console.log(selectedCrop !== '', 'selectedCrop !== ', selectedCrop)
                                            if (wholeData?.crop !== '') {
                                                setSeasonsalList(this[wholeData?.crop?.toLowerCase()]);
                                            }
                                        }
                                        setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)
                                        // set variety or planting system start
                                        let list = masterResp?.varietyOrPlantingSysList;
                                        setListPlantingSystem([])
                                        setVarietyOrPlantingSystem('')
                                        // find if single val of planting system
                                        let selectedVariety = list?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.varietyOrPlantingSys;
                                        // filter objects as per the selection of crop and soil
                                        let ls = list?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        if (ls !== undefined && ls.length > 0) {
                                            ls.forEach((item, index) => {
                                                item.code = index + 1;
                                                item.name = item.varietyOrPlantingSys;
                                            });
                                            // set array of planting system
                                            setListPlantingSystem(ls);
                                            // Only set VarietyOrPlantingSystem if ls length is 1
                                            // if (ls.length === 1) {
                                            //     setVarietyOrPlantingSystem(selectedVariety);
                                            //     return
                                            // } else {
                                            setVarietyOrPlantingSystem(wholeData?.varietyTypeOrPlantingSystem);

                                            // }
                                        }
                                        // end
                                        setRowSpacingCmList(masterResp?.selectRowToRowSpacingCmList)
                                        //start setting row spacing
                                        let rowSpcLst = masterResp?.selectRowToRowSpacingCmList;
                                        setRowSpacing('')
                                        setListRowSpace([])
                                        // find if single val of row spacing
                                        let selectedRowSpc = rowSpcLst?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.selectRowToRowSpacingCm;
                                        // filter objects as per the selection of crop and soil
                                        let rowSspc = rowSpcLst?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        if (rowSspc !== undefined && rowSspc.length > 0) {
                                            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.selectRowToRowSpacingCm === item.selectRowToRowSpacingCm)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.selectRowToRowSpacingCm;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set array of row space
                                            setListRowSpace(rowSspc);
                                            // Only set row space if ls length is 1
                                            //  if (rowSspc.length === 1) {
                                            //  setRowSpacing(selectedRowSpc);
                                            //  } else 
                                            setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                                        }
                                        //end

                                        setPlantToPlantList(masterResp?.selectPlantToplantSpacingCmList)
                                        let plantoPlanLs = masterResp?.selectPlantToplantSpacingCmList;
                                        // staart setting plant to plant values
                                        setPlantSpacing('')
                                        setPlantToPlantArr([])
                                        // find if single val of row spacing
                                        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true))?.selectPlantToplantSpacingCm;
                                        // filter objects as per the selection of crop and soil
                                        let plantObj = plantoPlanLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true))
                                        if (plantObj !== undefined && plantObj.length > 0) {
                                            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.selectPlantToplantSpacingCm === item.selectPlantToplantSpacingCm)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.selectPlantToplantSpacingCm;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setPlantToPlantArr(plantObj)
                                            // if (plantObj.length === 1) {
                                            //set direct value if length is 1
                                            // setPlantSpacing(selectedPlantSpc);
                                            // } else
                                            setPlantSpacing(wholeData?.selectPlantToplantSpacingCm)
                                        }
                                        //end
                                        setAreaPlantedList(masterResp?.areaPlantedAcresList)
                                        //start setting area planted list
                                        let areaPlantedValues = masterResp?.areaPlantedAcresList;
                                        //reset values   
                                        setAreaToPlanted('')
                                        setAreaPlantedArr([])
                                        // find if single val of row spacing
                                        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.areaPlantedAcres;
                                        // filter objects as per the selection of crop and soil
                                        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
                                        if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
                                            areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.areaPlantedAcres;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setAreaPlantedArr(areaToPlantedObj)
                                            // if (areaToPlantedObj.length === 1) {
                                            //set direct value if length is 1
                                            // setAreaToPlanted(selectedAreaPlantedVal);
                                            // } else
                                            setAreaToPlanted(wholeData?.areaPlantedAcres);
                                        }
                                        //end
                                        setProductiveTillersList(masterResp?.productiveTillersPer10HillsList)
                                        // start productive tillers list and value
                                        let prdctTillerLs = masterResp?.productiveTillersPer10HillsList;
                                        //reset values   
                                        setProductiveTillers('')
                                        setProductiveTillersListt([])
                                        // find if single val of row spacing
                                        let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                                            (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
                                        )?.productiveTillersPer10Hills;
                                        // filter objects as per the selection of crop and soil
                                        let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
                                        if (productiveTillerObj !== undefined && productiveTillerObj.length > 0) {
                                            productiveTillerObj = productiveTillerObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.productiveTillersPer10Hills === item.productiveTillersPer10Hills)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.productiveTillersPer10Hills;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setProductiveTillersListt(productiveTillerObj)
                                            // if (productiveTillerObj.length === 1) {
                                            //set direct value if length is 1
                                            // setProductiveTillers(selectedProdTillerVal);
                                            // }else
                                            setProductiveTillers(wholeData?.productiveTillersPer10Hills);
                                        }
                                        //end
                                        setAgGrainsPerPannicleList(masterResp?.avgGrainsPerPannicleList)
                                        // set avg grains list and value
                                        let avgGrainPannLs = masterResp?.avgGrainsPerPannicleList;
                                        //reset values   
                                        setAvgGrainsPannicle('')
                                        setAvgGrainsPannicleListtt([])
                                        // find if single val of row spacing
                                        let selectedAvgGrainPinnacleVal = avgGrainPannLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgGrainsPerPannicle;
                                        // filter objects as per the selection of crop and soil
                                        let avgGrainsPerPannicleObj = avgGrainPannLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
                                        if (avgGrainsPerPannicleObj !== undefined && avgGrainsPerPannicleObj.length > 0) {
                                            avgGrainsPerPannicleObj = avgGrainsPerPannicleObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.avgGrainsPerPannicle === item.avgGrainsPerPannicle)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.avgGrainsPerPannicle;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setAvgGrainsPannicleListtt(avgGrainsPerPannicleObj)
                                            // if (avgGrainsPerPannicleObj.length === 1) {
                                            //set direct value if length is 1
                                            // setAvgGrainsPannicle(selectedAvgGrainPinnacleVal);
                                            // } else
                                            setAvgGrainsPannicle(wholeData?.avgGrainsPerPannicle)
                                        }
                                        //end
                                        setAvgBollWeightList(masterResp?.avgBollWeightList)
                                        // start setting avg boll weight 
                                        let avgBollWeghtLs = masterResp?.avgBollWeightList;
                                        //reset values   
                                        setAvgBollWt('')
                                        setAvgBollWtListt([])
                                        // find if single val of row spacing
                                        let selectedAvgBollWtVal = avgBollWeghtLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgBollWeight;
                                        // filter objects as per the selection of crop and soil
                                        let avgBollWtObj = avgBollWeghtLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
                                        if (avgBollWtObj !== undefined && avgBollWtObj.length > 0) {
                                            avgBollWtObj = avgBollWtObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.avgBollWeight === item.avgBollWeight)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.avgBollWeight;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setAvgBollWtListt(avgBollWtObj)
                                            // if (avgBollWtObj.length === 1) {
                                            //set direct value if length is 1
                                            //     setAvgBollWt(selectedAvgBollWtVal);
                                            // } else
                                            setAvgBollWt(wholeData?.avgBollWeight);
                                        }
                                        //end
                                        setAvgBollsPerPlantList(masterResp?.avgBollsPerPlantList)
                                        // start avg bolls per plant
                                        let avgBollPerPlant = masterResp?.avgBollsPerPlantList;
                                        //reset values   
                                        setAvgBollsPerPlant('')
                                        setAvgBollsPerPlantListtt([])
                                        // find if single val of row spacing
                                        let selectedAvgBollsPerPlantVal = avgBollPerPlant?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgBollsPerPlant;
                                        // filter objects as per the selection of crop and soil
                                        let avgBollsPerPlantObj = avgBollPerPlant?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
                                        if (avgBollsPerPlantObj !== undefined && avgBollsPerPlantObj.length > 0) {
                                            avgBollsPerPlantObj = avgBollsPerPlantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.avgBollsPerPlant === item.avgBollsPerPlant)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.avgBollsPerPlant;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setAvgBollsPerPlantListtt(avgBollsPerPlantObj)
                                            // if (avgBollsPerPlantObj.length === 1) {
                                            //set direct value if length is 1
                                            // setAvgBollsPerPlant(selectedAvgBollsPerPlantVal);
                                            setAvgBollsPerPlant(wholeData?.avgBollsPerPlant)
                                            // }
                                        }
                                        //end
                                        setgrainYieldCobsList(masterResp?.grainYield5CobsList)
                                        // start grain yield list
                                        let grainCobLs = masterResp?.grainYield5CobsList;
                                        //reset values   
                                        setGrainYield('')
                                        setGrainYieldListtt([])
                                        // find if single val of row spacing
                                        let selectedGrainYieldVal = grainCobLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.grainYield5Cobs;
                                        // filter objects as per the selection of crop and soil
                                        let grainYieldObj = grainCobLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
                                        if (grainYieldObj !== undefined && grainYieldObj.length > 0) {
                                            grainYieldObj = grainYieldObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.grainYield5Cobs === item.grainYield5Cobs)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.grainYield5Cobs;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setGrainYieldListtt(grainYieldObj)
                                            // if (grainYieldObj.length === 1) {
                                            //set direct value if length is 1
                                            // setGrainYield(selectedGrainYieldVal);
                                            setGrainYield(wholeData?.grainYield5Cobs)
                                            // }
                                        }

                                        // end 
                                        // setYieldNote(masterResp?.yieldCalculatorTitle)
                                        // setArraysList()

                                    }
                                }, 100)
                                // selectedRowSpc
                            }
                            // console.log(JSON.parse(masterResp.YieldCalculatoroExist).id,"???",JSON.stringify(masterResp.YieldCalculatoroExist).id)
                            else {
                                setYieldCalcRes(masterResp)
                                let cropLis = masterResp.cropList
                                cropLis.forEach((crop, index) => {
                                    crop.name = crop.crop;
                                    delete crop.crop;
                                    crop.code = `crop${index + 1}`;
                                });
                                setCropList(cropLis)
                                setAllSeasonsList(masterResp?.seasonOrSoilTypeList)
                                setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)
                                setRowSpacingCmList(masterResp?.selectRowToRowSpacingCmList)
                                setPlantToPlantList(masterResp?.selectPlantToplantSpacingCmList)
                                setAreaPlantedList(masterResp?.areaPlantedAcresList)
                                setProductiveTillersList(masterResp?.productiveTillersPer10HillsList)
                                setAgGrainsPerPannicleList(masterResp?.avgGrainsPerPannicleList)
                                setAvgBollWeightList(masterResp?.avgBollWeightList)
                                setAvgBollsPerPlantList(masterResp?.avgBollsPerPlantList)
                                setgrainYieldCobsList(masterResp?.grainYield5CobsList)
                                setYieldNote(masterResp?.yieldCalculatorTitle)
                                setYieldNoteDesc(masterResp?.yieldCalculatorDescription)
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

    const uploadOfflineSeedCalc = async (jsonData) => {
        const networkStatus = await getNetworkStatus()
        if (!networkStatus) {
            return false;
        }
        if (networkStatus) {
            try {
                var getExpctYldURL = configs.BASE_URL + configs.CALCULATOR.saveYieldCalculator;
                var getHeaders = await GetApiHeaders()
                const data = JSON.stringify(jsonData);
                const formData = new FormData();
                formData.append('jsonData', data);
                const APIResponse = await uploadFormData(formData, getExpctYldURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    if (APIResponse.statusCode == HTTP_OK) {
                        try {
                            realm.write(async () => {
                                realm.delete(realm.objects('YieldCalSubmit'));
                            });
                        } catch (error) {
                            console.error('Error clearing data of saved calc', error);
                        }
                        SimpleToast.show(APIResponse?.message)
                        return true;
                    } else {
                        return false;
                    }

                } else {
                    return false;
                }
            }
            catch (error) {
                return false;
            }
        } else {
            return false
        }
    }


    useFocusEffect(
        React.useCallback(() => {
            const yieldCalcData = realm.objects('YieldCalculatorResponse');
            if (yieldCalcData.length !== 0) {
                checkRealData();
                //   if(networkStatusval){
                // setLoading(true)
                //   }
            } else {
                getYieldCalc()
            }
            // let getData = async () => {
            //     const seedCalcRes = realm.objects('YieldCalSubmit');
            //     const seedData = seedCalcRes[0]?.data;
            //     if (!networkStatusval) {
            // checkRealData();
            //         return;
            //     }
            //     if (seedData) {
            //         let parseIt = JSON.parse(seedData)
            //         const wasUploaded = await uploadOfflineSeedCalc(parseIt);
            // }
            //     getYieldCalc();
            // };
            // getData()
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [networkStatusval])
    );

    let checkRealData = async () => {
        const yieldCalcData = realm.objects('YieldCalculatorResponse');
        if (yieldCalcData.length !== 0) {
            let data = yieldCalcData[0];
            const masterResp = JSON.parse(data?.data);
            if (JSON.parse(masterResp.YieldCalculatoroExist).id) {
                setRetreivedFrmSavedData(true)
                setTimeout(async () => {
                    let wholeData = JSON.parse(masterResp?.YieldCalculatoroExist);
                    if (wholeData?.seasonSoilType && wholeData?.areaPlantedAcres) {
                        setSelectedCrop(wholeData?.crop);
                        setSelectedSoil(wholeData?.seasonSoilType);
                        // setVarietyOrPlantingSystem(wholeData?.varietyTypeOrPlantingSystem);
                        setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                        setPlantSpacing(wholeData?.selectPlantToplantSpacingCm);
                        setIdealPlantPopulationOrAcre(wholeData?.idealplantPopulationPerAcre)
                        setCottonSeedRate(wholeData?.cottonSeedRatePktsPerAcre);
                        setAreaToPlanted(wholeData?.areaPlantedAcres);
                        setSeedRateUnits(wholeData?.seedRateUnits)
                        setTotalSeedRequiredUnits(wholeData?.totalSeedRequiredUnits)
                        setActualSeedRateKgPerAcre(wholeData?.crop === 'Cotton' ? wholeData?.actualCottonSeedRatePktsPerAcre : wholeData?.actualSeedRateKgPerAcre)
                        setTotalSeedRequired(wholeData?.totalSeedRequiredKgPerPkt);
                        setAvgBollsPerPlant(wholeData?.avgBollsPerPlant)
                        // setAvgBollWt(wholeData?.avgBollWeight);
                        // setProductiveTillers(wholeData?.productiveTillersPer10Hills);
                        // setAvgGrainsPannicle(wholeData?.avgGrainsPerPannicle)
                        // setGrainYield(wholeData?.grainYield5Cobs)
                        setExpectedYieldQtlPerAcre(wholeData?.expectedYieldQtlPerAcre)
                        //set new values start
                        setActualExpectedYieldQtlPerAcre(wholeData?.actualExpectedYieldQtlPerAcre)
                        // setActualSeedRateKgPerAcre(wholeData?.actualSeedRateKgPerAcre)
                        setActualIdealPlantPopulationPerAcre(wholeData?.actualIdealPlantPopulationPerAcre)
                        setActualTotalSeedRequiredKgPerPkt(wholeData?.actualTotalSeedRequiredKgPerPkt)
                        //end
                        setYieldNote(masterResp?.yieldCalculatorTitle)
                        setYieldNoteDesc(masterResp?.yieldCalculatorDescription)

                        // set dropdowns
                        setYieldCalcRes(masterResp)
                        let cropLis = masterResp?.cropList
                        cropLis.forEach((crop, index) => {
                            crop.name = crop.crop;
                            delete crop.crop;
                            crop.code = `crop${index + 1}`;
                        });
                        setCropList(cropLis)
                        setAllSeasonsList(masterResp?.seasonOrSoilTypeList)
                        if (masterResp?.seasonOrSoilTypeList) {
                            let a = masterResp?.seasonOrSoilTypeList;
                            let crops = []
                            a?.forEach((item) => {
                                if (crops?.includes(item.crop)) return
                                else crops?.push(item.crop)
                            })
                            crops?.forEach((crop) => {
                                let cropListSeas = a?.filter(item => item.crop === crop);
                                cropListSeas?.forEach((item, index) => {
                                    item.name = item.seasonOrSoilType;
                                    item.code = `${index + 1}`;
                                });
                                this[crop.toLowerCase()] = cropListSeas;
                            });

                            console.log(selectedCrop !== '', 'selectedCrop !== ', selectedCrop)
                            if (wholeData?.crop !== '') {
                                setSeasonsalList(this[wholeData?.crop?.toLowerCase()]);
                            }
                        }
                        setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)
                        // set variety or planting system start
                        let list = masterResp?.varietyOrPlantingSysList;
                        setListPlantingSystem([])
                        setVarietyOrPlantingSystem('')
                        // find if single val of planting system
                        let selectedVariety = list?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.varietyOrPlantingSys;
                        // filter objects as per the selection of crop and soil
                        let ls = list?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                        if (ls !== undefined && ls.length > 0) {
                            ls.forEach((item, index) => {
                                item.code = index + 1;
                                item.name = item.varietyOrPlantingSys;
                            });
                            // set array of planting system
                            setListPlantingSystem(ls);
                            // Only set VarietyOrPlantingSystem if ls length is 1
                            // if (ls.length === 1) {
                            //     setVarietyOrPlantingSystem(selectedVariety);
                            //     return
                            // } else {
                            setVarietyOrPlantingSystem(wholeData?.varietyTypeOrPlantingSystem);

                            // }
                        }
                        // end
                        setRowSpacingCmList(masterResp?.selectRowToRowSpacingCmList)
                        //start setting row spacing
                        let rowSpcLst = masterResp?.selectRowToRowSpacingCmList;
                        setRowSpacing('')
                        setListRowSpace([])
                        // find if single val of row spacing
                        let selectedRowSpc = rowSpcLst?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.selectRowToRowSpacingCm;
                        // filter objects as per the selection of crop and soil
                        let rowSspc = rowSpcLst?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                        if (rowSspc !== undefined && rowSspc.length > 0) {
                            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.selectRowToRowSpacingCm === item.selectRowToRowSpacingCm)) {
                                    item.code = acc.length + 1;
                                    item.name = item.selectRowToRowSpacingCm;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set array of row space
                            setListRowSpace(rowSspc);
                            // Only set row space if ls length is 1
                            //  if (rowSspc.length === 1) {
                            //  setRowSpacing(selectedRowSpc);
                            //  } else 
                            setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                        }
                        //end

                        setPlantToPlantList(masterResp?.selectPlantToplantSpacingCmList)
                        let plantoPlanLs = masterResp?.selectPlantToplantSpacingCmList;
                        // staart setting plant to plant values
                        setPlantSpacing('')
                        setPlantToPlantArr([])
                        // find if single val of row spacing
                        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true))?.selectPlantToplantSpacingCm;
                        // filter objects as per the selection of crop and soil
                        let plantObj = plantoPlanLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true))
                        if (plantObj !== undefined && plantObj.length > 0) {
                            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.selectPlantToplantSpacingCm === item.selectPlantToplantSpacingCm)) {
                                    item.code = acc.length + 1;
                                    item.name = item.selectPlantToplantSpacingCm;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setPlantToPlantArr(plantObj)
                            // if (plantObj.length === 1) {
                            //set direct value if length is 1
                            // setPlantSpacing(selectedPlantSpc);
                            // } else
                            setPlantSpacing(wholeData?.selectPlantToplantSpacingCm)
                        }
                        //end
                        setAreaPlantedList(masterResp?.areaPlantedAcresList)
                        //start setting area planted list
                        let areaPlantedValues = masterResp?.areaPlantedAcresList;
                        //reset values   
                        setAreaToPlanted('')
                        setAreaPlantedArr([])
                        // find if single val of row spacing
                        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.areaPlantedAcres;
                        // filter objects as per the selection of crop and soil
                        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
                        if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
                            areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                                    item.code = acc.length + 1;
                                    item.name = item.areaPlantedAcres;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setAreaPlantedArr(areaToPlantedObj)
                            // if (areaToPlantedObj.length === 1) {
                            //set direct value if length is 1
                            // setAreaToPlanted(selectedAreaPlantedVal);
                            // } else
                            setAreaToPlanted(wholeData?.areaPlantedAcres);
                        }
                        //end
                        setProductiveTillersList(masterResp?.productiveTillersPer10HillsList)
                        // start productive tillers list and value
                        let prdctTillerLs = masterResp?.productiveTillersPer10HillsList;
                        //reset values   
                        setProductiveTillers('')
                        setProductiveTillersListt([])
                        // find if single val of row spacing
                        let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                            (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
                        )?.productiveTillersPer10Hills;
                        // filter objects as per the selection of crop and soil
                        let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
                        if (productiveTillerObj !== undefined && productiveTillerObj.length > 0) {
                            productiveTillerObj = productiveTillerObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.productiveTillersPer10Hills === item.productiveTillersPer10Hills)) {
                                    item.code = acc.length + 1;
                                    item.name = item.productiveTillersPer10Hills;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setProductiveTillersListt(productiveTillerObj)
                            // if (productiveTillerObj.length === 1) {
                            //set direct value if length is 1
                            // setProductiveTillers(selectedProdTillerVal);
                            // }else
                            setProductiveTillers(wholeData?.productiveTillersPer10Hills);
                        }
                        //end
                        setAgGrainsPerPannicleList(masterResp?.avgGrainsPerPannicleList)
                        // set avg grains list and value
                        let avgGrainPannLs = masterResp?.avgGrainsPerPannicleList;
                        //reset values   
                        setAvgGrainsPannicle('')
                        setAvgGrainsPannicleListtt([])
                        // find if single val of row spacing
                        let selectedAvgGrainPinnacleVal = avgGrainPannLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgGrainsPerPannicle;
                        // filter objects as per the selection of crop and soil
                        let avgGrainsPerPannicleObj = avgGrainPannLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
                        if (avgGrainsPerPannicleObj !== undefined && avgGrainsPerPannicleObj.length > 0) {
                            avgGrainsPerPannicleObj = avgGrainsPerPannicleObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.avgGrainsPerPannicle === item.avgGrainsPerPannicle)) {
                                    item.code = acc.length + 1;
                                    item.name = item.avgGrainsPerPannicle;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setAvgGrainsPannicleListtt(avgGrainsPerPannicleObj)
                            // if (avgGrainsPerPannicleObj.length === 1) {
                            //set direct value if length is 1
                            // setAvgGrainsPannicle(selectedAvgGrainPinnacleVal);
                            // } else
                            setAvgGrainsPannicle(wholeData?.avgGrainsPerPannicle)
                        }
                        //end
                        setAvgBollWeightList(masterResp?.avgBollWeightList)
                        // start setting avg boll weight 
                        let avgBollWeghtLs = masterResp?.avgBollWeightList;
                        //reset values   
                        setAvgBollWt('')
                        setAvgBollWtListt([])
                        // find if single val of row spacing
                        let selectedAvgBollWtVal = avgBollWeghtLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgBollWeight;
                        // filter objects as per the selection of crop and soil
                        let avgBollWtObj = avgBollWeghtLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
                        if (avgBollWtObj !== undefined && avgBollWtObj.length > 0) {
                            avgBollWtObj = avgBollWtObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.avgBollWeight === item.avgBollWeight)) {
                                    item.code = acc.length + 1;
                                    item.name = item.avgBollWeight;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setAvgBollWtListt(avgBollWtObj)
                            // if (avgBollWtObj.length === 1) {
                            //set direct value if length is 1
                            //     setAvgBollWt(selectedAvgBollWtVal);
                            // } else
                            setAvgBollWt(wholeData?.avgBollWeight);
                        }
                        //end
                        setAvgBollsPerPlantList(masterResp?.avgBollsPerPlantList)
                        // start avg bolls per plant
                        let avgBollPerPlant = masterResp?.avgBollsPerPlantList;
                        //reset values   
                        setAvgBollsPerPlant('')
                        setAvgBollsPerPlantListtt([])
                        // find if single val of row spacing
                        let selectedAvgBollsPerPlantVal = avgBollPerPlant?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgBollsPerPlant;
                        // filter objects as per the selection of crop and soil
                        let avgBollsPerPlantObj = avgBollPerPlant?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
                        if (avgBollsPerPlantObj !== undefined && avgBollsPerPlantObj.length > 0) {
                            avgBollsPerPlantObj = avgBollsPerPlantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.avgBollsPerPlant === item.avgBollsPerPlant)) {
                                    item.code = acc.length + 1;
                                    item.name = item.avgBollsPerPlant;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setAvgBollsPerPlantListtt(avgBollsPerPlantObj)
                            // if (avgBollsPerPlantObj.length === 1) {
                            //set direct value if length is 1
                            // setAvgBollsPerPlant(selectedAvgBollsPerPlantVal);
                            setAvgBollsPerPlant(wholeData?.avgBollsPerPlant)
                            // }
                        }
                        //end
                        setgrainYieldCobsList(masterResp?.grainYield5CobsList)
                        // start grain yield list
                        let grainCobLs = masterResp?.grainYield5CobsList;
                        //reset values   
                        setGrainYield('')
                        setGrainYieldListtt([])
                        // find if single val of row spacing
                        let selectedGrainYieldVal = grainCobLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.grainYield5Cobs;
                        // filter objects as per the selection of crop and soil
                        let grainYieldObj = grainCobLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
                        if (grainYieldObj !== undefined && grainYieldObj.length > 0) {
                            grainYieldObj = grainYieldObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.grainYield5Cobs === item.grainYield5Cobs)) {
                                    item.code = acc.length + 1;
                                    item.name = item.grainYield5Cobs;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setGrainYieldListtt(grainYieldObj)
                            // if (grainYieldObj.length === 1) {
                            //set direct value if length is 1
                            // setGrainYield(selectedGrainYieldVal);
                            setGrainYield(wholeData?.grainYield5Cobs)
                            // }
                        }

                        // end 
                        // setYieldNote(masterResp?.yieldCalculatorTitle)
                        // setArraysList()

                    }
                }, 100)
                // selectedRowSpc
            }
            // console.log(JSON.parse(masterResp.YieldCalculatoroExist).id,"???",JSON.stringify(masterResp.YieldCalculatoroExist).id)
            else {
                setYieldCalcRes(masterResp)
                let cropLis = masterResp.cropList
                cropLis.forEach((crop, index) => {
                    crop.name = crop.crop;
                    delete crop.crop;
                    crop.code = `crop${index + 1}`;
                });
                console.log(cropLis, "<---------------------- crpo list")
                setCropList(cropLis)
                setAllSeasonsList(masterResp?.seasonOrSoilTypeList)
                setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)
                setRowSpacingCmList(masterResp?.selectRowToRowSpacingCmList)
                setPlantToPlantList(masterResp?.selectPlantToplantSpacingCmList)
                setAreaPlantedList(masterResp?.areaPlantedAcresList)
                setProductiveTillersList(masterResp?.productiveTillersPer10HillsList)
                setAgGrainsPerPannicleList(masterResp?.avgGrainsPerPannicleList)
                setAvgBollWeightList(masterResp?.avgBollWeightList)
                setAvgBollsPerPlantList(masterResp?.avgBollsPerPlantList)
                setgrainYieldCobsList(masterResp?.grainYield5CobsList)
                setYieldNote(masterResp?.yieldCalculatorTitle)
                setYieldNoteDesc(masterResp?.yieldCalculatorDescription)
            }
        }
        else {
            showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
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

    let showStatus = () => {
        if (selectedCrop === 'Cotton') {
            return selectedCrop !== '' && selectedSoil !== '' && VarietyOrPlantingSystem !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && AvgBollsPerPlant !== '' && AvgBollWt !== '' && ExpectedYieldQtlPerAcre !== ''
        }
        if (selectedCrop === 'Maize') {
            return selectedCrop !== '' && selectedSoil !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && GrainYield !== '' && ExpectedYieldQtlPerAcre !== ''
        }
        else {
            return selectedCrop !== '' && selectedSoil !== '' && VarietyOrPlantingSystem !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && productiveTillers !== '' && AvgGrainsPannicle !== '' && ExpectedYieldQtlPerAcre !== ''
        }
    }



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            <View style={[styleSheetStyles.flexFull, styleSheetStyles.gray300bg]}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
                <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 20 : 20 }]}>
                    <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => navigation.goBack()}>
                        <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                        <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{calcType}</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ bottom: 10 }}>
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
                            <View style={[{
                                // borderWidth: 1,
                                // borderColor: 'rgba(180, 180, 180, 0.5)',
                                // width: '92%',
                                alignSelf: "center",
                                // borderRadius: 10,
                                // paddingTop: 10,
                                // paddingBottom: 20,
                                marginTop: 15,
                                paddingBottom: 5,
                            }]}>
                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 0, marginTop: 0 }]}  >
                                    {translate('selectCrop')}
                                </Text>
                                <CustomBorderInputDropDown
                                    width={[{ width: '92%' }, styles['centerItems']]}
                                    defaultValue={selectedCrop != undefined && selectedCrop != translate('select') ? selectedCrop : translate('select')}
                                    IsRequired={true}
                                    // disabled={selectedFilter === translate('YieldCalculator')}
                                    placeholder={translate('selectCrop')}
                                    onFocus={() => {
                                        changeDropDownData(cropsList, strings.yieldOne, selectedCrop)
                                        // selectedFilter === strings.TotalSeed &&  changeDropDownData(cropsList, strings.yieldOne, selectedCrop)
                                        setRetreivedFrmSavedData(false)
                                    }}
                                />
                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 0, marginTop: 10 }]}  >
                                    {translate('yieldTwo')}
                                </Text>
                                <CustomBorderInputDropDown
                                    width={[{ width: '92%' }, styles['centerItems']]}
                                    defaultValue={selectedSoil != undefined && selectedSoil != translate('select') ? selectedSoil : translate('select')}
                                    IsRequired={true}
                                    // disabled={selectedFilter === translate('YieldCalculator')}
                                    placeholder={translate('yieldTwo')}
                                    onFocus={() => {
                                        changeDropDownData(seasonsalList, strings.yieldTwo, selectedSoil)
                                        // selectedFilter === strings.TotalSeed && changeDropDownData(seasonsalList, strings.yieldTwo, selectedSoil)
                                        setRetreivedFrmSavedData(false)
                                    }}
                                />
                                {selectedCrop !== 'Maize' &&
                                    <>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 0, marginTop: 10 }]}  >
                                            {translate('yieldThree')}
                                        </Text>
                                        <CustomBorderInputDropDown
                                            width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={VarietyOrPlantingSystem != undefined && VarietyOrPlantingSystem != translate('select') ? VarietyOrPlantingSystem : translate('select')}
                                            IsRequired={true}
                                            disabled={listPlantingSystem.length === 1}
                                            // disabled={selectedFilter === translate('YieldCalculator')}
                                            placeholder={translate('yieldThree')}
                                            onFocus={() => {
                                                listPlantingSystem.length !== 1 && changeDropDownData(listPlantingSystem, strings.yieldThree, VarietyOrPlantingSystem)
                                                // selectedFilter === strings.TotalSeed && changeDropDownData(listPlantingSystem, strings.yieldThree, VarietyOrPlantingSystem)
                                            }}
                                        />
                                    </>
                                }
                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 0, marginTop: 10 }]}  >
                                    {translate('yieldFour')}
                                </Text>
                                <CustomBorderInputDropDown
                                    width={[{ width: '92%' }, styles['centerItems']]}
                                    defaultValue={rowSpacing != undefined && rowSpacing != translate('select') ? rowSpacing : translate('select')}
                                    IsRequired={true}
                                    disabled={listRowSpace.length === 1}
                                    // disabled={selectedFilter === translate('YieldCalculator')}
                                    placeholder={translate('yieldFour')}
                                    onFocus={() => {
                                        listRowSpace.length !== 1 && changeDropDownData(listRowSpace, strings.yieldFour, rowSpacing)
                                        // selectedFilter === strings.TotalSeed && changeDropDownData(listRowSpace, strings.yieldFour, rowSpacing)
                                    }}
                                />
                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 0, marginTop: 10 }]}  >
                                    {translate('yieldFive')}
                                </Text>
                                <CustomBorderInputDropDown
                                    width={[{ width: '92%' }, styles['centerItems']]}
                                    defaultValue={plantSpacing != undefined && plantSpacing != translate('select') ? plantSpacing : translate('select')}
                                    IsRequired={true}
                                    disabled={PlantToPlantArr.length === 1}
                                    // disabled={selectedFilter === translate('YieldCalculator')}
                                    placeholder={translate('yieldFive')}
                                    onFocus={() => {
                                        PlantToPlantArr.length !== 1 && changeDropDownData(PlantToPlantArr, strings.yieldFive, plantSpacing)
                                        // selectedFilter === strings.TotalSeed &&  changeDropDownData(PlantToPlantArr, strings.yieldFive, plantSpacing)
                                    }}
                                />
                                <View style={[styles['margin_top_10']]}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginTop: 10, minHeight: responsiveHeight(5) }}>
                                        <View style={{ width: '55%' }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                {translate('IdealPlantPopulationOrAcre')}
                                            </Text>
                                        </View>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                            {translate('dots')}
                                        </Text>
                                        <Text style={[{ color: IdealPlantPopulationOrAcre ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10, }, styles['font_size_20_bold']]}  >
                                            {IdealPlantPopulationOrAcre ? IdealPlantPopulationOrAcre : 0}
                                        </Text>
                                    </View>
                                    {/* <CustomTextInput
                                    style={[styles['margin_top_20'], styles['centerItems']]}
                                    labelName={translate('IdealPlantPopulationOrAcre')}
                                    IsRequired={false}
                                    maxLength={30}
                                    keyboardType='number-pad'
                                    placeholder={translate('IdealPlantPopulationOrAcre')}
                                    value={IdealPlantPopulationOrAcre}
                                    editable={false}
                                    addSpace={true}
                                    onFocus={() => {
                                    }}
                                    onChangeText={(text) => {
                                        var enteredNumber = text.replace(/[^0-9]/g, '');
                                        setIdealPlantPopulationOrAcre(enteredNumber)
                                    }}
                                    onEndEditing={event => { }}
                                /> */}
                                </View>
                            </View>


                            <View>


                                {
                                    //    selectedFilter === translate('TotalSeed') && 
                                    <>
                                        <View style={[styles['margin_top_10']]}>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: -1, marginTop: 5, marginLeft: 15 }}>
                                                <View style={{ width: '52.5%' }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                        {selectedCrop === 'Cotton' ? translate('CottonSeedRate') : translate('SeedRateKgAc')}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: CottonSeedRate ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10, }, styles['font_size_20_bold']]}  >
                                                    {CottonSeedRate ? CottonSeedRate : 0}
                                                </Text>
                                                <Text style={[{ color: dynamicStyles.textColor, marginLeft: 5, }, styles['font_size_14_regular']]}  >
                                                    {seedRateUnits}
                                                </Text>
                                            </View>
                                        </View>
                                        <CustomTextInput
                                            style={[styles['margin_top_20'], styles['centerItems']]}
                                            labelName={translate('yieldSix')}
                                            IsRequired={false}
                                            maxLength={30}
                                            keyboardType='number-pad'
                                            placeholder={translate('yieldSix')}
                                            value={areaToPlanted}
                                            editable={true}
                                            addSpace={true}
                                            onFocus={() => {
                                            }}
                                            onChangeText={(text) => {
                                                var enteredNumber = text.replace(/[^0-9]/g, '');
                                                setAreaToPlanted(enteredNumber)
                                            }}
                                            onEndEditing={event => { }}
                                        />
                                        <View style={[styles['margin_top_10']]}>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: -1, marginTop: 15, marginLeft: 15 }}>
                                                {/* <View style={{ width: '60%' }}> */}
                                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                    {translate('totalSeedRequired')}
                                                </Text>
                                                {/* </View> */}
                                                <Text style={[{ color: dynamicStyles.textColor, marginLeft: 5, }, styles['font_size_14_regular']]}  >
                                                    {translate('dots')}
                                                </Text>
                                                <Text style={[{ color: totalSeedRequired ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10, }, styles['font_size_20_bold']]}  >
                                                    {totalSeedRequired ? totalSeedRequired : 0}
                                                </Text>
                                                <Text style={[{ color: dynamicStyles.textColor, marginLeft: 5, }, styles['font_size_14_regular']]}  >
                                                    {totalSeedRequiredUnits}
                                                    {/* {selectedCrop === 'Cotton' ? Number(totalSeedRequired) > 1 ? 'pkts' :  'pkt' :  Number(totalSeedRequired) > 1 ? 'kgs' : 'kg'} */}
                                                </Text>
                                            </View>
                                            {/* <CustomTextInput
                                    style={[styles['margin_top_20'], styles['centerItems']]}
                                    labelName={translate('totalSeedRequired')}
                                    IsRequired={false}
                                    maxLength={30}
                                    keyboardType='number-pad'
                                    placeholder={translate('totalSeedRequired')}
                                    value={totalSeedRequired}
                                    editable={false}
                                    addSpace={true}
                                    onFocus={() => {
                                    }}
                                    onChangeText={(text) => {
                                        var enteredNumber = text.replace(/[^0-9]/g, '');
                                        setTotalSeedRequired(enteredNumber)
                                    }}
                                    onEndEditing={event => { }}
                                /> */}
                                        </View>
                                    </>}

                                {/* {selectedCrop === 'Cotton' ? selectedFilter !== translate('TotalSeed') && <View> */}
                                {selectedCrop === 'Cotton' ? <View>
                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 15, marginTop: 15 }]}  >
                                        {translate('AvgBollsPerPlant')}
                                    </Text>
                                    <CustomBorderInputDropDown
                                        width={[{ width: '92%' }, styles['centerItems']]}
                                        defaultValue={AvgBollsPerPlant != undefined && AvgBollsPerPlant != translate('select') ? AvgBollsPerPlant : translate('select')}
                                        IsRequired={true}
                                        disabled={AvgBollsPerPlantListtt.length === 1}
                                        placeholder={translate('AvgBollsPerPlant')}
                                        onFocus={() => {
                                            AvgBollsPerPlantListtt.length !== 1 && changeDropDownData(AvgBollsPerPlantListtt, strings.AvgBollsPerPlant, AvgBollsPerPlant)
                                        }}
                                    />
                                    <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 15, marginTop: 10 }]}  >
                                        {translate('AvgBollWt')}
                                    </Text>
                                    <CustomBorderInputDropDown
                                        width={[{ width: '92%' }, styles['centerItems']]}
                                        defaultValue={AvgBollWt != undefined && AvgBollWt != translate('select') ? AvgBollWt : translate('select')}
                                        IsRequired={true}
                                        placeholder={translate('AvgBollWt')}
                                        disabled={AvgBollWtListt.length === 1}
                                        onFocus={() => {
                                            AvgBollWtListt.length !== 1 && changeDropDownData(AvgBollWtListt, strings.AvgBollWt, AvgBollWt)
                                        }}
                                    />
                                </View> : selectedCrop === 'Maize' ?
                                    // </View> : selectedCrop === 'Maize' ? selectedFilter !== translate('TotalSeed') &&
                                    <View>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 15, marginTop: 15 }]}  >
                                            {translate('GrainYield')}
                                        </Text>
                                        <CustomBorderInputDropDown
                                            width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={GrainYield != undefined && GrainYield != translate('select') ? GrainYield : translate('select')}
                                            IsRequired={true}
                                            placeholder={translate('GrainYield')}
                                            disabled={GrainYieldListtt.length === 1}
                                            onFocus={() => {
                                                GrainYieldListtt.length !== 1 && changeDropDownData(GrainYieldListtt, strings.GrainYield, GrainYield)
                                            }}
                                        />
                                    </View>
                                    : <View>
                                        {/* : selectedFilter !== translate('TotalSeed') && <View> */}
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 15, marginTop: 15 }]}  >
                                            {translate('productiveTillers')}
                                        </Text>
                                        <CustomBorderInputDropDown
                                            width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={productiveTillers != undefined && productiveTillers != translate('select') ? productiveTillers : translate('select')}
                                            IsRequired={true}
                                            placeholder={translate('productiveTillers')}
                                            disabled={productiveTillersListt.length === 1}
                                            onFocus={() => {
                                                productiveTillersListt.length !== 1 && changeDropDownData(productiveTillersListt, strings.productiveTillers, productiveTillers)
                                            }}
                                        />
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 0.5, marginLeft: 15, marginTop: 10 }]}  >
                                            {translate('AvgGrainsPannicle')}
                                        </Text>
                                        <CustomBorderInputDropDown
                                            width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={AvgGrainsPannicle != undefined && AvgGrainsPannicle != translate('select') ? AvgGrainsPannicle : translate('select')}
                                            IsRequired={true}
                                            disabled={AvgGrainsPannicleListtt.length === 1}
                                            placeholder={translate('AvgGrainsPannicle')}
                                            onFocus={() => {
                                                AvgGrainsPannicleListtt.length !== 1 && changeDropDownData(AvgGrainsPannicleListtt, strings.AvgGrainsPannicle, AvgGrainsPannicle)
                                            }}
                                        />
                                    </View>}

                                {
                                    //    selectedFilter !== translate('TotalSeed') && 
                                    <View style={[styles['margin_top_10']]}>
                                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 15, marginTop: 10 }}>
                                            {/* <View style={{ width: '62%' }}> */}
                                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                {translate('ExpectedYieldQtlPerAcre')}
                                            </Text>
                                            {/* </View> */}
                                            <Text style={[{ color: dynamicStyles.textColor, marginLeft: 5, }, styles['font_size_14_regular']]}  >
                                                {translate('dots')}
                                            </Text>
                                            <Text style={[{ color: ExpectedYieldQtlPerAcre ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10, }, styles['font_size_20_bold']]}  >
                                                {ExpectedYieldQtlPerAcre ? ExpectedYieldQtlPerAcre : 0}
                                            </Text>
                                        </View>
                                        {/* <CustomTextInput
                                    style={[styles['margin_top_20'], styles['centerItems']]}
                                    labelName={translate('ExpectedYieldQtlPerAcre')}
                                    IsRequired={false}
                                    maxLength={30}
                                    keyboardType='number-pad'
                                    placeholder={translate('ExpectedYieldQtlPerAcre')}
                                    value={ExpectedYieldQtlPerAcre}
                                    editable={false}
                                    addSpace={true}
                                    onFocus={() => {
                                    }}
                                    onChangeText={(text) => {
                                        var enteredNumber = text
                                            .replace(/[^0-9.]/g, '')
                                            .replace(/(\..*)\./g, '$1');
                                        setExpectedYieldQtlPerAcre(enteredNumber)
                                    }}
                                    onEndEditing={event => { }}
                                /> */}
                                    </View>}
                                {
                                    showDropDowns &&
                                    <CustomListViewModal
                                        dropDownType={dropDownType}
                                        listItems={dropDownData}
                                        selectedItem={selectedDropDownItem}
                                        onSelectedCropCal={(item) => onSelectItem(item, setSelectedCrop)}
                                        onSelectedSoilType={(item) => onSelectItem(item, setSelectedSoil)}
                                        onSelectedPlantingType={(item) => onSelectItem(item, setVarietyOrPlantingSystem)}
                                        onSelectedRowSpacing={(item) => onSelectItem(item, setRowSpacing)}
                                        onSelectedPlantSpacing={(item) => onSelectItem(item, setPlantSpacing)}
                                        onSelectedAreaToPlanted={(item) => onSelectItem(item, setAreaToPlanted)}
                                        onSelectedAvgBollsPerPlant={(item) => onSelectItem(item, setAvgBollsPerPlant)}
                                        onSelectedsetAvgBollWt={(item) => onSelectItem(item, setAvgBollWt)}
                                        onSelectedGrainYield={(item) => onSelectItem(item, setGrainYield)}
                                        onSelectedProductiveTillers={(item) => onSelectItem(item, setProductiveTillers)}
                                        onSelectedAvgGrainsPannicle={(item) => onSelectItem(item, setAvgGrainsPannicle)}

                                        closeModal={() => setShowDropDowns(false)}
                                    />
                                }
                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_semibold'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 20 }]}  >
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
                {<View style={styleSheetStyles.container}>
                    <TouchableOpacity disabled={selectedCrop === ''} onPress={() => {
                        resetValues()
                        setSelectedCrop('')
                    }} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: selectedCrop === '' ? Colors.lightGray : dynamicStyles.iconPrimaryColor }]}>
                        <Text style={[styles['font_size_14_semibold'], { color: selectedCrop === '' ? Colors.lightGray : dynamicStyles.iconPrimaryColor }]}>{translate('Clear')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { saveAPI() }} disabled={!showStatus()} style={[styleSheetStyles.button, styleSheetStyles.saveButton, { borderColor: Colors.lightGray, backgroundColor: !showStatus() ? Colors.lightGray : dynamicStyles.primaryColor, }]}>
                        <Text style={[styles['font_size_14_semibold'], { color: !showStatus() ? Colors.white : dynamicStyles.secondaryColor }]}>{translate('Save')}</Text>
                    </TouchableOpacity>
                </View>}
                {!isProcessing && <View style={{ bottom: 10 }}>
                    <CustomButton shouldDisable={!showStatus()} title={translate('Share')} onPress={() => { takeScreenshot() }}
                        addIcon={showStatus()}
                        buttonBg={!showStatus() ? Colors.lightGray : dynamicStyles.primaryColor}
                        titleTextColor={!showStatus() ? Colors.white : dynamicStyles.secondaryColor}
                        btnWidth={'90%'}
                        textAlign='center' />
                </View>}
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
    container: {
        top: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        alignSelf: 'center',
    },
    tabBtn: { width: "50%", height: "100%", borderRadius: 5, alignItems: "center", justifyContent: "center" },
    tabMain: {
        height: 45, width: responsiveWidth(90), alignSelf: "center", marginTop: responsiveHeight(2), borderRadius: 5, marginBottom: responsiveHeight(0.5),
        flexDirection: "row", alignItems: "center", justifyContent: "space-between"
    },
    button: {
        width: '45%',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        bottom: 10
    },
    clearButton: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        // ,
    },
    saveButton: {
        // 
        // 
    },
});

export default YieldCalculator;
