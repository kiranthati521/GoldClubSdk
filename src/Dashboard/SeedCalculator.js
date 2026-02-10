import { Platform, Text, StatusBar, View, Alert, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomTextInput from '../Components/CustomTextInput';
import { strings } from "../strings/strings";
import { USER_ID, filterObjects, readFileToBase64, requestMultiplePermissions, retrieveData } from '../assets/Utils/Utils';
import SimpleToast from 'react-native-simple-toast';
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
import CustomAlert from '../Components/CustomAlert';
import { updateOfflineCount } from './synchCountUtils';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { createStyles } from '../assets/style/createStyles';

export const getMastersSeedCalc = async () => {
    let realm = new Realm({ path: 'User.realm' });
    let networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getYeildCalcURL = configs.BASE_URL + configs.CALCULATOR.geSeedAndPopulationCaculator;
            var getHeaders = await GetApiHeaders()
            var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    var masterResp = APIResponse.response
                    try {
                        realm.write(() => {
                            realm.delete(realm.objects('SeedCalculatorResponse'));
                            realm.create('SeedCalculatorResponse', {
                                _id: new Date(),
                                data: JSON.stringify(masterResp),
                                timestamp: new Date(),
                            });
                            console.log('added successfully into realm yield calc')
                        });
                    } catch (err) {
                        console.log(err)
                    }
                    console.log('the yield resp is================================>', masterResp)
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

export const saveSavedSeedCalData = async (jsonData, dispatch) => {
    let realm = new Realm({ path: 'User.realm' });
    const networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            var getExpctYldURL = configs.BASE_URL + configs.CALCULATOR.saveSeedAndPopulationCaculator;
            var getHeaders = await GetApiHeaders()
            const data = JSON.stringify(jsonData);
            const formData = new FormData();
            formData.append('jsonData', data);
            const APIResponse = await uploadFormData(formData, getExpctYldURL, getHeaders);
            if (APIResponse != undefined && APIResponse != null) {
                if (APIResponse.statusCode == HTTP_OK) {
                    console.log('seed calc data saved successfully')
                    try {
                        realm.write(async () => {
                            realm.delete(realm.objects('SeedCalSubmit'));
                        });
                    } catch (error) {
                        console.error('Error clearing data of saved calc', error);
                    }
                    updateOfflineCount(dispatch)
                    // SimpleToast.show(APIResponse?.message)
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

const SeedCalculator = ({ route }) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    var realm = new Realm({ path: 'User.realm' });
    const calcType = route?.params?.calcType;
    const viewShotRef = useRef();
    const dispatch = useDispatch();
    const [showAlert, setShowAlert] = useState(false)
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    let [retreivedFrmSavedData, setRetreivedFrmSavedData] = useState(false)
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
    let [actualTotalSeedRequiredKgPerPkt, setActualTotalSeedRequiredKgPerPkt] = useState('')
    let [actualIdealPlantpopulation, setActualIdealPlantpopulation] = useState('')
    let [actualSeedRateKgPerAcre, setActualSeedRateKgPerAcre] = useState('')
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
    let [totalSeedRequiredUnits, setTotalSeedRequiredUnits] = useState('')
    let [seedRateUnits, setSeedRateUnits] = useState('')

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
    const roundToNearestInteger = (value) => Math.round(value).toString();

    const roundAndFormat = (value) => {
        const rounded = Math.round(value);
        return rounded.toFixed(2);
    };

    const getDoubleRoundToNearestInteger = (value) => Math.round(value);

    const roundToOneDecimalPlace = (value) => Number(value.toFixed(1)).toString();

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

    const roundUpToNearestHalf = (value) => Math.ceil(value * 2) / 2.0;


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

    const getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData = async (
        crop,
        rowSpacingCm,
        selectPlantSpacingCm,
        seasonOrSoilType
    ) => {
        let response = { response: null };

        try {
            let seedRateKgPerAcreStr = '0';
            let result = {};

            // Handle Mustard and Wheat
            if (['mustard', 'wheat'].includes(crop.toLowerCase())) {
                const staticSeedRates = {
                    mustard: '1.5', // Verify these match Java's seedAndPopulationCaculatorManager
                    wheat: '40.0',
                };
                seedRateKgPerAcreStr = staticSeedRates[crop.toLowerCase()] || '0';
                result = {
                    seedRateKgPerAcre: seedRateKgPerAcreStr,
                    actualSeedRateKgPerAcre: seedRateKgPerAcreStr,
                    seedRateUnits: OTHER_SEED_RATE_UNITS,
                };
                response.response = result;
                return response;
            }

            // Validate inputs
            const rowSpacing = parseFloat(rowSpacingCm);
            const plantSpacing = parseFloat(selectPlantSpacingCm);
            if (isNaN(rowSpacing) || isNaN(plantSpacing)) {
                throw new Error('Invalid rowSpacingCm or selectPlantSpacingCm');
            }

            // Calculate Ideal Plant Population
            let idealPlantPopulation = 4047 / ((rowSpacing * plantSpacing) / 10000);
            idealPlantPopulation = getDoubleRoundToNearestInteger(idealPlantPopulation);

            let seedRateKgPerAcre = 0;
            if (crop.toLowerCase() === 'bajra') {
                if (seasonOrSoilType.toLowerCase() === 'spring') {
                    seedRateKgPerAcre = (idealPlantPopulation / 60000) * 1.2;
                } else if (seasonOrSoilType.toLowerCase() === 'kharif') {
                    seedRateKgPerAcre = (idealPlantPopulation / 60000) * 1.25;
                }
            } else if (crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()) {
                seedRateKgPerAcre = idealPlantPopulation / 5000;
            } else if (crop.toLowerCase() === 'hybrid rice') {
                seedRateKgPerAcre = (idealPlantPopulation / 35700) * 1.2;
            } else if (crop.toLowerCase() === 'jute') {
                seedRateKgPerAcre = (idealPlantPopulation / 500000) * 2.2;
            } else if (crop.toLowerCase() === 'research paddy') {
                seedRateKgPerAcre = (idealPlantPopulation / 35700) * 2; // Fixed: Removed redundant condition
            } else if (crop.toLowerCase() === 'maize') {
                seedRateKgPerAcre = idealPlantPopulation / 4000;
            }

            const idealPlantPopulationStr = roundToNearestInteger(idealPlantPopulation);
            seedRateKgPerAcreStr = crop.toLowerCase() === 'maize'
                ? roundCustom(seedRateKgPerAcre)
                : roundToOneDecimalPlace(seedRateKgPerAcre);

            result = {
                idealPlantPopulation: idealPlantPopulationStr,
                seedRateKgPerAcre: seedRateKgPerAcreStr,
                actualIdealPlantPopulation: idealPlantPopulation.toString(),
                actualSeedRateKgPerAcre: seedRateKgPerAcre.toString(),
                seedRateUnits: crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()
                    ? COTTON_SEED_RATE_UNITS
                    : OTHER_SEED_RATE_UNITS,
            };

            response.response = result;

            return response;
        } catch (error) {
            console.error('Error in getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData:', error);
            return response.response = null;
        }
    };


    const getTotalSeedRequiredKgPerPkt = async (crop, actualSeedRateKgPerAcre, areaPlantedAcre) => {
        try {
            const areaPlantedAcreD = parseFloat(areaPlantedAcre);
            const seedRateKgPerAcreD = parseFloat(actualSeedRateKgPerAcre);

            const result = areaPlantedAcreD * seedRateKgPerAcreD;
            const totalSeedRequired = Math.ceil(result);

            const resultJson = {
                totalSeedRequiredKgPerPkt: totalSeedRequired.toString(),
                actualTotalSeedRequiredKgPerPkt: totalSeedRequired.toString(),
                totalSeedRequiredUnits: crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()
                    ? totalSeedRequired <= 1.0
                        ? COTTON_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1
                        : COTTON_TOTAL_SEED_REQUIRED_UNITS
                    : totalSeedRequired <= 1.0
                        ? OTHER_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1
                        : OTHER_TOTAL_SEED_REQUIRED_UNITS,
            };

            return resultJson;
        } catch (error) {
            console.error('Error in getTotalSeedRequiredKgPerPkt:', error);
            throw error;
        }
    };

    const getYieldAndSeedRates = async (crop, selectRowToRowSpacingCm, selectPlantToplantSpacingCm, seasonOrSoilType) => {
        return getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData(
            crop,
            selectRowToRowSpacingCm,
            selectPlantToplantSpacingCm,
            seasonOrSoilType
        );
    };

    let resetValues = () => {
        //reset values when crop update
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

    let setSeasonsArray = () => {
        let a = allSeasonsList;
        let crops = [];
        a?.forEach((item) => {
            if (crops?.includes(item.crop)) return;
            else crops?.push(item.crop);
        });
        let cropsData = {};
        crops?.forEach((crop) => {
            let cropList = a?.filter(item => item.crop === crop);
            cropList?.forEach((item, index) => {
                item.name = item.seasonSoilType;
                item.code = `${index + 1}`;
            });
            cropsData[crop.toLowerCase()] = cropList;
        });

        if (selectedCrop !== '') {
            setSeasonsalList(cropsData[selectedCrop?.toLowerCase()]);
            if (selectedCrop === 'Wheat' || selectedCrop === 'Mustard') {
                if (!cropsData[selectedCrop?.toLowerCase()]) {
                    callApiRowPlant({
                        "crop": selectedCrop,
                    });
                }
            }
        }
    };


    useEffect(() => {
        !retreivedFrmSavedData && resetValues()
        setSeasonsArray()
    }, [selectedCrop])

    useEffect(() => {
        if (rowSpacing !== '') {
            // !retreivedFrmSavedData && 
            let plantoPlanLs = plantToPlantList;
            setPlantSpacing('')
            setPlantToPlantArr([])
            // find if single val of row spacing
            let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === selectedCrop && (item.seasonSoilType === selectedSoil || !selectedSoil) && (rowSpacing != null ? item.selectRowSpacingCm == rowSpacing : true))?.selectPlantSpacingCm;
            // filter objects as per the selection of crop and soil
            let plantObj = plantoPlanLs?.filter(item => item.crop === selectedCrop && (item.seasonSoilType === selectedSoil || !selectedSoil) && (rowSpacing != null ? item.selectRowSpacingCm == rowSpacing : true))
            if (plantObj !== undefined && plantObj.length > 0) {
                plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                    if (!acc.some(existingItem => existingItem.selectPlantSpacingCm === item.selectPlantSpacingCm)) {
                        item.code = acc.length + 1;
                        item.name = item.selectPlantSpacingCm;
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
        let selectedRowSpc = rowSpcLst?.find(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        )?.selectRowSpacingCm;

        // filter objects as per the selection of crop and season
        let rowSspc = rowSpcLst?.filter(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        );
        // // find if single val of row spacing
        // let selectedRowSpc = rowSpcLst?.find(item => item.crop === selectedCrop && item.seasonSoilType === selectedSoil)?.selectRowSpacingCm;
        // // filter objects as per the selection of crop and soil
        // let rowSspc = rowSpcLst?.filter(item => item.crop === selectedCrop && item.seasonSoilType === selectedSoil)
        if (rowSspc !== undefined && rowSspc.length > 0) {
            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.selectRowSpacingCm === item.selectRowSpacingCm)) {
                    item.code = acc.length + 1;
                    item.name = item.selectRowSpacingCm;
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
        let selectedPlantSpc = plantoPlanLs?.find(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        )?.selectPlantSpacingCm;

        // filter objects as per the selection of crop and season
        let plantObj = plantoPlanLs?.filter(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        );

        if (plantObj !== undefined && plantObj.length > 0) {
            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.selectPlantSpacingCm === item.selectPlantSpacingCm)) {
                    item.code = acc.length + 1;
                    item.name = item.selectPlantSpacingCm;
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
        let selectedAreaPlantedVal = areaPlantedValues?.find(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        )?.areaPlantedAcres;

        // filter objects as per the selection of crop and season
        let areaToPlantedObj = areaPlantedValues?.filter(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        );

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
    }, [selectedCrop, selectedSoil])

    useEffect(() => {
        if (rowSpacing !== '' && plantSpacing !== '') {
            let areaPlantedValues = areaToPlantedList;
            //Area to be planted (Acres)
            //reset values   
            setAreaToPlanted('')
            setAreaPlantedArr([])
            // find if single val of row spacing
            let selectedAreaPlantedVal = areaPlantedValues?.find(item =>
                item.crop === selectedCrop &&
                (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
                &&
                (rowSpacing != null ? item.selectRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantSpacingCm === plantSpacing : true)
            )?.areaPlantedAcres;

            // filter objects as per the selection of crop and season
            let areaToPlantedObj = areaPlantedValues?.filter(item =>
                item.crop === selectedCrop &&
                (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
                && (rowSpacing != null ? item.selectRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantSpacingCm === plantSpacing : true)
            );

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
            callApiRowPlant({
                "crop": selectedCrop,
                "seasonOrSoilType": selectedSoil,
                "rowSpacingCm": rowSpacing,
                "selectPlantSpacingCm": plantSpacing
            })
        }
    }, [rowSpacing, plantSpacing])

    useEffect(() => {
        if (areaToPlanted !== '' && !seasonsalList && actualSeedRateKgPerAcre !== '') {
            callApiGETTOTALSEED({
                "crop": selectedCrop,
                "areaPlantedAcre": areaToPlanted,
                "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre
            })
        }
        if (CottonSeedRate !== '' && areaToPlanted !== '') {
            callApiGETTOTALSEED({
                "crop": selectedCrop,
                "areaPlantedAcre": areaToPlanted,
                "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre
            })
        }
    }, [CottonSeedRate, areaToPlanted])


    let callApiGETTOTALSEED = async (data) => {
        // var networkStatus = await getNetworkStatus()
        // if (networkStatus) {
        //     try {
        //         setLoading(true)
        //         setLoadingMessage(translate('please_wait_getting_data'))
        //         var getTotalSeedReqURL = configs.BASE_URL + configs.CALCULATOR.getIdealPlantPopulationSeedRate;
        //         var getHeaders = await GetApiHeaders();
        //         var body = data
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
        //                     setActualTotalSeedRequiredKgPerPkt(`${dashboardResp?.actualTotalSeedRequiredKgPerPkt}`)
        //                     setTotalSeedRequired(`${dashboardResp?.totalSeedRequiredKgPerPkt}`)
        //                     setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
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
        let dashboardResp = await getTotalSeedRequiredKgPerPkt(selectedCrop, actualSeedRateKgPerAcre, areaToPlanted)
        setActualTotalSeedRequiredKgPerPkt(`${dashboardResp?.actualTotalSeedRequiredKgPerPkt}`)
        setTotalSeedRequired(`${dashboardResp?.totalSeedRequiredKgPerPkt}`)
        setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
        // }
    }

    let callApiRowPlant = async (data) => {
        //   var networkStatus = await getNetworkStatus()
        //   if (networkStatus) {
        //     try {

        //         setLoading(true)
        //         setLoadingMessage(translate('please_wait_getting_data'))

        //   var getYieldRatesURL = configs.BASE_URL + configs.CALCULATOR.getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData  ;
        //   var getHeaders = await GetApiHeaders();
        //   var body =  data
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
        //                 setActualIdealPlantpopulation(dashboardResp?.actualIdealPlantpopulation)
        //                 setActualSeedRateKgPerAcre(dashboardResp?.actualSeedRateKgPerAcre)
        //                 setIdealPlantPopulationOrAcre(dashboardResp?.idealPlantpopulation)
        //                 setCottonSeedRate(dashboardResp?.seedRateKgPerAcre)
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
        let dashboardResp = await getYieldAndSeedRates(selectedCrop, rowSpacing, plantSpacing, selectedSoil)
        //   {"response": {"actualIdealPlantPopulation": "179867", "actualSeedRateKgPerAcre": "10.07658263305322", "idealPlantPopulation": "179867", "seedRateKgPerAcre": "10.1", "seedRateUnits": "Kg/Acre"}} 
        console.log(dashboardResp, "<-------------- check calcs happening")
        setActualIdealPlantpopulation(dashboardResp?.response?.actualIdealPlantPopulation)
        setActualSeedRateKgPerAcre(dashboardResp?.response?.actualSeedRateKgPerAcre)
        setIdealPlantPopulationOrAcre(dashboardResp?.response?.idealPlantPopulation)
        setCottonSeedRate(dashboardResp?.response?.seedRateKgPerAcre)
        setSeedRateUnits(dashboardResp?.response?.seedRateUnits)
        //   }
    }

    const geSeedAndPopulationCaculator = async () => {   // done
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getYeildCalcURL = configs.BASE_URL + configs.CALCULATOR.geSeedAndPopulationCaculator;
                var getHeaders = await GetApiHeaders()
                // console.log('getYeildCalcURL is', getYeildCalcURL)
                // console.log('getHeaders is', getHeaders)

                var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(async () => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.response
                        try {
                            realm.write(() => {
                                realm.delete(realm.objects('SeedCalculatorResponse'));
                                realm.create('SeedCalculatorResponse', {
                                    _id: new Date(),
                                    data: JSON.stringify(masterResp),
                                    timestamp: new Date(),
                                });
                                console.log('added successfully into realm yield calc')
                            });
                        } catch (err) {
                            console.log(err)
                        }
                        console.log('the yield resp is================================>', masterResp)
                        if (masterResp != undefined && masterResp != null) {

                            if (JSON.parse(masterResp.seedAndPopulationCalHDtoExist).retailerId) {
                                setRetreivedFrmSavedData(true)
                                setTimeout(async () => {
                                    let wholeData = JSON.parse(masterResp?.seedAndPopulationCalHDtoExist);
                                    console.log(wholeData?.seasonSoilType, 'wholeData?.seasonSoilType', wholeData)
                                    if (wholeData?.crop) {
                                        setSelectedCrop(wholeData?.crop);
                                        setSelectedSoil(wholeData?.seasonSoilType);
                                        setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                                        setPlantSpacing(wholeData?.selectPlantToplantSpacingCm);
                                        setIdealPlantPopulationOrAcre(wholeData?.idealplantPopulationPerAcre)
                                        setCottonSeedRate(wholeData?.seedRateKgPerAcre);
                                        setSeedRateUnits(wholeData?.seedRateUnits)
                                        setTotalSeedRequiredUnits(wholeData?.totalSeedRequiredUnits)
                                        setTotalSeedRequired(wholeData?.totalSeedRequiredKgPerPkt);
                                        //set them as per new update start
                                        setActualTotalSeedRequiredKgPerPkt(wholeData?.actualTotalSeedRequiredKgPerPkt)
                                        setActualIdealPlantpopulation(wholeData?.actualIdealPlantPopulationPerAcre)
                                        setActualSeedRateKgPerAcre(wholeData?.actualSeedRateKgPerAcre)
                                        //end 

                                        // set dropdowns
                                        setYieldCalcRes(masterResp)
                                        let cropLis = masterResp?.cropList
                                        cropLis.forEach((crop, index) => {
                                            crop.name = crop.crop;
                                            delete crop.crop;
                                            crop.code = `crop${index + 1}`;
                                        });
                                        setCropList(cropLis)
                                        setAllSeasonsList(masterResp?.seasonsoilTypeList)
                                        // if (masterResp?.seasonsoilTypeList) {
                                        //     let a = masterResp?.seasonsoilTypeList;
                                        //     let crops = []
                                        //     a?.forEach((item) => {
                                        //         if (crops?.includes(item.crop)) return
                                        //         else crops?.push(item.crop)
                                        //     })
                                        //     crops?.forEach((crop) => {
                                        //         let cropListSeas = a?.filter(item => item.crop === crop);
                                        //         cropListSeas?.forEach((item, index) => {
                                        //             item.name = item.seasonSoilType;
                                        //             item.code = `${index + 1}`;
                                        //         });
                                        //         this[crop.toLowerCase()] = cropListSeas;
                                        //     });

                                        //     console.log(this[wholeData?.crop?.toLowerCase()], 'this[crop.toLowerCase()]', crops)
                                        //     if (wholeData?.crop !== '') {
                                        //         setSeasonsalList(this[wholeData?.crop?.toLowerCase()]);
                                        //     }
                                        // }
                                        if (masterResp?.seasonsoilTypeList) {
                                            let a = masterResp?.seasonsoilTypeList;
                                            let crops = [];
                                            let seasonMap = {};

                                            a?.forEach((item) => {
                                                if (!crops.includes(item.crop)) crops.push(item.crop);
                                            });

                                            crops.forEach((crop) => {
                                                let cropListSeas = a?.filter(item => item.crop === crop);
                                                cropListSeas?.forEach((item, index) => {
                                                    item.name = item.seasonSoilType;
                                                    item.code = `${index + 1}`;
                                                });
                                                seasonMap[crop.toLowerCase()] = cropListSeas;
                                            });

                                            if (wholeData?.crop !== '') {
                                                setSeasonsalList(seasonMap[wholeData?.crop?.toLowerCase()] || []);
                                            }
                                        }
                                        setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
                                        //start setting row spacing
                                        let rowSpcLst = masterResp?.selectRowSpacingCmList;
                                        setRowSpacing('')
                                        setListRowSpace([])
                                        // find if single val of row spacing
                                        let selectedRowSpc = rowSpcLst?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.selectRowSpacingCm;
                                        // filter objects as per the selection of crop and soil
                                        //  let areaToPlantedObj = areaPlantedValues?.filter(item => 
                                        //     item.crop === selectedCrop && 
                                        //     (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
                                        // );
                                        let rowSspc = rowSpcLst?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                                        if (rowSspc !== undefined && rowSspc.length > 0) {
                                            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.selectRowSpacingCm === item.selectRowSpacingCm)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.selectRowSpacingCm;
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
                                        setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
                                        let plantoPlanLs = masterResp?.selectPlantSpacingCmList;
                                        // staart setting plant to plant values
                                        setPlantSpacing('')
                                        setPlantToPlantArr([])
                                        // find if single val of row spacing
                                        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.selectPlantSpacingCm;
                                        // filter objects as per the selection of crop and soil
                                        let plantObj = plantoPlanLs?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                                        if (plantObj !== undefined && plantObj.length > 0) {
                                            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.selectPlantSpacingCm === item.selectPlantSpacingCm)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.selectPlantSpacingCm;
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
                                        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.areaPlantedAcres;
                                        // filter objects as per the selection of crop and soil
                                        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
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
                                    }
                                }, 100)
                                // selectedRowSpc
                            }
                            else {
                                console.log(masterResp, "masterrrrrrr")
                                let cropLis = masterResp?.cropList
                                cropLis.forEach((crop, index) => {
                                    crop.name = crop.crop;
                                    // delete crop.crop; 
                                    crop.code = `${index + 1}`;
                                });
                                setCropList(cropLis)
                                setAllSeasonsList(masterResp?.seasonsoilTypeList)
                                setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
                                setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
                                setAreaPlantedList(masterResp?.areaPlantedAcresList)
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
                var getExpctYldURL = configs.BASE_URL + configs.CALCULATOR.saveSeedAndPopulationCaculator;
                var getHeaders = await GetApiHeaders()
                const data = JSON.stringify(jsonData);
                const formData = new FormData();
                formData.append('jsonData', data);
                const APIResponse = await uploadFormData(formData, getExpctYldURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    if (APIResponse.statusCode == HTTP_OK) {
                        try {
                            realm.write(async () => {
                                realm.delete(realm.objects('SeedCalSubmit'));
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
            const seedCalc = realm.objects('SeedCalculatorResponse');
            if (seedCalc.length !== 0) {
                checkRealData();
                //   if(networkStatusval){
                // setLoading(true)
                //   }
            } else {
                geSeedAndPopulationCaculator()
            }
            // let getData = async () => {
            //     const seedCalcRes = realm.objects('SeedCalSubmit');
            //     const seedData = seedCalcRes[0]?.data;
            //     if (!networkStatusval) {
            //         checkRealData();
            //         return;
            //     }
            //     if (seedData) {
            //         let parseIt = JSON.parse(seedData)
            //         const wasUploaded = await uploadOfflineSeedCalc(parseIt);
            //         // if (wasUploaded) {
            //         //     setLoading(false);
            //         //     setLoadingMessage();
            //         // }
            // }
            //     geSeedAndPopulationCaculator();
            // };
            // getData()
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [networkStatusval])
    );

    // useEffect(() => {
    //     geSeedAndPopulationCaculator()
    // }, []);

    let checkRealData = async () => {
        const seedCalcRes = realm.objects('SeedCalculatorResponse');
        if (seedCalcRes.length !== 0) {
            let data = seedCalcRes[0];
            const masterResp = JSON.parse(data?.data);
            if (JSON.parse(masterResp.seedAndPopulationCalHDtoExist).retailerId) {
                setRetreivedFrmSavedData(true)
                setTimeout(async () => {
                    let wholeData = JSON.parse(masterResp?.seedAndPopulationCalHDtoExist);
                    console.log(wholeData?.seasonSoilType, 'wholeData?.seasonSoilType', wholeData)
                    if (wholeData?.crop) {
                        setSelectedCrop(wholeData?.crop);
                        setSelectedSoil(wholeData?.seasonSoilType);
                        setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                        setPlantSpacing(wholeData?.selectPlantToplantSpacingCm);
                        setIdealPlantPopulationOrAcre(wholeData?.idealplantPopulationPerAcre)
                        setCottonSeedRate(wholeData?.seedRateKgPerAcre);
                        setSeedRateUnits(wholeData?.seedRateUnits)
                        setTotalSeedRequiredUnits(wholeData?.totalSeedRequiredUnits)
                        setTotalSeedRequired(wholeData?.totalSeedRequiredKgPerPkt);
                        //set them as per new update start
                        setActualTotalSeedRequiredKgPerPkt(wholeData?.actualTotalSeedRequiredKgPerPkt)
                        setActualIdealPlantpopulation(wholeData?.actualIdealPlantPopulationPerAcre)
                        setActualSeedRateKgPerAcre(wholeData?.actualSeedRateKgPerAcre)
                        //end 

                        // set dropdowns
                        setYieldCalcRes(masterResp)
                        let cropLis = masterResp?.cropList
                        cropLis.forEach((crop, index) => {
                            crop.name = crop.crop;
                            delete crop.crop;
                            crop.code = `crop${index + 1}`;
                        });
                        setCropList(cropLis)
                        setAllSeasonsList(masterResp?.seasonsoilTypeList)
                        // if (masterResp?.seasonsoilTypeList) {
                        //     let a = masterResp?.seasonsoilTypeList;
                        //     let crops = []
                        //     a?.forEach((item) => {
                        //         if (crops?.includes(item.crop)) return
                        //         else crops?.push(item.crop)
                        //     })
                        //     crops?.forEach((crop) => {
                        //         let cropListSeas = a?.filter(item => item.crop === crop);
                        //         cropListSeas?.forEach((item, index) => {
                        //             item.name = item.seasonSoilType;
                        //             item.code = `${index + 1}`;
                        //         });
                        //         this[crop.toLowerCase()] = cropListSeas;
                        //     });

                        //     console.log(this[wholeData?.crop?.toLowerCase()], 'this[crop.toLowerCase()]', crops)
                        //     if (wholeData?.crop !== '') {
                        //         setSeasonsalList(this[wholeData?.crop?.toLowerCase()]);
                        //     }
                        // }
                        if (masterResp?.seasonsoilTypeList) {
                            let a = masterResp?.seasonsoilTypeList;
                            let crops = [];
                            let seasonMap = {};

                            a?.forEach((item) => {
                                if (!crops.includes(item.crop)) crops.push(item.crop);
                            });

                            crops.forEach((crop) => {
                                let cropListSeas = a?.filter(item => item.crop === crop);
                                cropListSeas?.forEach((item, index) => {
                                    item.name = item.seasonSoilType;
                                    item.code = `${index + 1}`;
                                });
                                seasonMap[crop.toLowerCase()] = cropListSeas;
                            });

                            if (wholeData?.crop !== '') {
                                setSeasonsalList(seasonMap[wholeData?.crop?.toLowerCase()] || []);
                            }
                        }
                        setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
                        //start setting row spacing
                        let rowSpcLst = masterResp?.selectRowSpacingCmList;
                        setRowSpacing('')
                        setListRowSpace([])
                        // find if single val of row spacing
                        let selectedRowSpc = rowSpcLst?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.selectRowSpacingCm;
                        // filter objects as per the selection of crop and soil
                        //  let areaToPlantedObj = areaPlantedValues?.filter(item => 
                        //     item.crop === selectedCrop && 
                        //     (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
                        // );
                        let rowSspc = rowSpcLst?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                        if (rowSspc !== undefined && rowSspc.length > 0) {
                            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.selectRowSpacingCm === item.selectRowSpacingCm)) {
                                    item.code = acc.length + 1;
                                    item.name = item.selectRowSpacingCm;
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
                        setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
                        let plantoPlanLs = masterResp?.selectPlantSpacingCmList;
                        // staart setting plant to plant values
                        setPlantSpacing('')
                        setPlantToPlantArr([])
                        // find if single val of row spacing
                        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.selectPlantSpacingCm;
                        // filter objects as per the selection of crop and soil
                        let plantObj = plantoPlanLs?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                        if (plantObj !== undefined && plantObj.length > 0) {
                            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.selectPlantSpacingCm === item.selectPlantSpacingCm)) {
                                    item.code = acc.length + 1;
                                    item.name = item.selectPlantSpacingCm;
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
                        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.areaPlantedAcres;
                        // filter objects as per the selection of crop and soil
                        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
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
                    }
                }, 100)
                // selectedRowSpc
            }
            else {
                console.log(masterResp, "masterrrrrrr")
                let cropLis = masterResp?.cropList
                cropLis.forEach((crop, index) => {
                    crop.name = crop.crop;
                    // delete crop.crop; 
                    crop.code = `${index + 1}`;
                });
                setCropList(cropLis)
                setAllSeasonsList(masterResp?.seasonsoilTypeList)
                setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
                setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
                setAreaPlantedList(masterResp?.areaPlantedAcresList)
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
                    // message: `${translate('Note')} ${translate('noteDesc')}`,
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
    const commonSchema = {
        requiredFields: [
            'selectedCrop',
            'rowSpacing',
            'plantSpacing',
            'IdealPlantPopulationOrAcre',
            'CottonSeedRate',
            'areaToPlanted',
            'totalSeedRequired',
        ]
    };

    const soilDependentSchema = {
        requiredFields: [
            ...commonSchema.requiredFields,
            'selectedSoil'
        ]
    };

    const minimalSchema = {
        requiredFields: [
            'selectedCrop',
            'CottonSeedRate',
            'areaToPlanted',
            'totalSeedRequired',
        ]
    };

    const validationSchemas = {
        Bajra: soilDependentSchema,
        Cotton: soilDependentSchema,
        HybridRice: commonSchema,
        Jute: commonSchema,
        Maize: soilDependentSchema,
        Mustard: minimalSchema,
        Wheat: minimalSchema,
        ReasearchPaddy: commonSchema,
        Default: commonSchema
    };

    const validateFields = (selectedCrop, fields) => {
        const normalizedCropName = normalizeCropName(selectedCrop);
        const schema = validationSchemas[normalizedCropName] || validationSchemas.Default;
        return schema.requiredFields.every(field => fields[field] !== '');
    };

    const normalizeCropName = (cropName) => {
        return cropName.replace(/\s+/g, '');
    };

    let saveAPI = async () => {
        var networkStatus = await getNetworkStatus()
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var getExpctYldURL = configs.BASE_URL + configs.CALCULATOR.saveSeedAndPopulationCaculator;
                var getHeaders = await GetApiHeaders();
                var getUserID = (await retrieveData(USER_ID))
                const jsonData = {
                    "id": getUserID,
                    "retailerId": getUserID,
                    "crop": selectedCrop,
                    "seasonSoilType": selectedSoil,
                    "selectRowTorowSpacingCm": rowSpacing,
                    "selectPlantToplantSpacingCm": plantSpacing,
                    "idealPlantPopulationPerAcre": IdealPlantPopulationOrAcre,
                    "seedRateKgPerAcre": CottonSeedRate,
                    "areaPlantedAcres": areaToPlanted,
                    "totalSeedRequiredKgPerPkt": totalSeedRequired,
                    'actualIdealPlantPopulationPerAcre': actualIdealPlantpopulation,
                    'actualSeedRateKgPerAcre': actualSeedRateKgPerAcre,
                    "actualTotalSeedRequiredKgPerPkt": actualTotalSeedRequiredKgPerPkt,
                    // "farmerId": 202
                };
                const formData = new FormData();
                formData.append('jsonData', JSON.stringify(jsonData));
                const APIResponse = await uploadFormData(formData, getExpctYldURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 200);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse
                            console.log(dashboardResp, 'dashhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
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
            const seedCalcRes = realm.objects('SeedCalculatorResponse');
            let dataa = seedCalcRes[0]?.data;
            const masterResp = JSON.parse(dataa);
            var getUserID = (await retrieveData(USER_ID))
            const jsonData = {
                retailerId: getUserID,
                id: getUserID,
                crop: selectedCrop,
                seasonSoilType: selectedSoil,
                selectRowTorowSpacingCm: rowSpacing,
                selectPlantToplantSpacingCm: plantSpacing,
                idealPlantPopulationPerAcre: IdealPlantPopulationOrAcre,
                seedRateKgPerAcre: CottonSeedRate,
                areaPlantedAcres: areaToPlanted,
                totalSeedRequiredKgPerPkt: totalSeedRequired,
                actualIdealPlantPopulationPerAcre: actualIdealPlantpopulation,
                actualSeedRateKgPerAcre: actualSeedRateKgPerAcre,
                actualTotalSeedRequiredKgPerPkt: actualTotalSeedRequiredKgPerPkt,
            };

            masterResp.seedAndPopulationCalHDtoExist = JSON.stringify(jsonData);
            const stingfiedData = jsonData;
            saveSeedMasterList(masterResp);
            const saveData = saveSeedCalc(stingfiedData);
            if (saveData) {
                updateOfflineCount(dispatch)
                navigation.goBack()
                SimpleToast.show(translate('Data_saved_offline'), SimpleToast.LONG)
            }

        }
    }

    const saveSeedMasterList = (masterResp) => {
        try {
            realm.write(() => {
                realm.delete(realm.objects('SeedCalculatorResponse'));
                realm.create('SeedCalculatorResponse', {
                    _id: new Date(),
                    data: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log("Seed master list saved.");
            return true;
        } catch (error) {
            console.error('Failed to save seed master list:', error);
            return false;
        }
    };

    const saveSeedCalc = (payloadObj) => {
        try {
            realm.write(() => {
                realm.delete(realm.objects('SeedCalSubmit'));
                realm.create(
                    'SeedCalSubmit',
                    {
                        _id: 'SeedCalcSingleRecord',
                        data: JSON.stringify(payloadObj)
                    },
                );
            });
            console.log('Saved/Updated SeedCalc:', payloadObj);
            return true;
        } catch (error) {
            console.error('Failed to save SeedCalc:', error);
            return false;
        }
    };


    const showStatus = () => {
        const fields = {
            selectedCrop,
            selectedSoil,
            rowSpacing,
            plantSpacing,
            IdealPlantPopulationOrAcre,
            CottonSeedRate,
            areaToPlanted,
            totalSeedRequired,
        };

        return validateFields(selectedCrop, fields);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            {/* <SafeAreaView style={{flex:1, backgroundColor: dynamicStyles.primaryColor}}> */}
            <View style={[styleSheetStyles.flexFull, styleSheetStyles.gray300bg]}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
                <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 20 : 20 }]}>
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
                                    setRetreivedFrmSavedData(false)
                                }}
                            />


                            {selectedCrop !== "" && seasonsalList?.length > 0 && <>
                                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }]}  >
                                    {translate('yieldTwo')}
                                </Text>
                                <CustomBorderInputDropDown
                                    width={[{ width: '92%' }, styles['centerItems']]}
                                    defaultValue={selectedSoil != undefined && selectedSoil != translate('select') ? selectedSoil : translate('select')}
                                    IsRequired={true}
                                    placeholder={translate('yieldTwo')}
                                    onFocus={() => {
                                        changeDropDownData(seasonsalList, strings.yieldTwo, selectedSoil)
                                        setRetreivedFrmSavedData(false)
                                    }}
                                />
                            </>}

                            <View>


                                {selectedCrop !== "" && listRowSpace?.length !== 0 &&
                                    <>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }, Platform.OS === 'ios' && { minHeight: 20 }]}  >
                                            {translate('yieldFour')}
                                        </Text>
                                        <CustomBorderInputDropDown
                                            width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={rowSpacing != undefined && rowSpacing != translate('select') ? rowSpacing : translate('select')}
                                            IsRequired={true}
                                            disabled={listRowSpace.length === 1}
                                            placeholder={translate('yieldFour')}
                                            onFocus={() => {
                                                listRowSpace.length !== 1 && changeDropDownData(listRowSpace, strings.yieldFour, rowSpacing)
                                            }}
                                        /></>
                                }
                                {selectedCrop !== "" && PlantToPlantArr?.length !== 0 &&
                                    <><Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular'], styles['top_5'], { marginBottom: 2.5, marginLeft: 15, marginTop: 10 }, Platform.OS === 'ios' && { minHeight: 20 }]}  >
                                        {translate('yieldFive')}
                                    </Text>
                                        <CustomBorderInputDropDown
                                            width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={plantSpacing != undefined && plantSpacing != translate('select') ? plantSpacing : translate('select')}
                                            IsRequired={true}
                                            disabled={PlantToPlantArr.length === 1}
                                            placeholder={translate('yieldFive')}
                                            onFocus={() => {
                                                PlantToPlantArr.length !== 1 && changeDropDownData(PlantToPlantArr, strings.yieldFive, plantSpacing)
                                            }}
                                        /></>
                                }
                                {(PlantToPlantArr?.length === 0 || listRowSpace?.length === 0) ? null : <View style={[styles['margin_top_10']]}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 0, marginTop: 10, marginLeft: 15 }}>
                                        <View style={{ width: '50%' }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                {translate('IdealPlantPopulationOrAcre')}
                                            </Text>
                                        </View>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                            {translate('dots')}
                                        </Text>
                                        <Text style={[{ color: IdealPlantPopulationOrAcre ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
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
                                </View>}

                                <View style={[{ marginTop: 10 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: -5, marginTop: 0, marginLeft: 15 }}>
                                        <View style={{ width: '50%' }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                {translate('SeedRateKg')}
                                            </Text>
                                        </View>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                            {translate('dots')}
                                        </Text>
                                        <Text style={[{ color: CottonSeedRate ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
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
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 0, marginTop: 15, marginLeft: 15 }}>
                                        <View style={{ width: '40%' }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                                {translate('totalSeedRequired')}
                                            </Text>
                                        </View>
                                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_regular']]}  >
                                            {translate('dots')}
                                        </Text>
                                        <Text style={[{ color: totalSeedRequired ? dynamicStyles.textColor : 'rgba(180, 180, 180, 1)' }, { marginLeft: 10 }, styles['font_size_20_bold']]}  >
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
                                    onChangeText={() => {}}
                                    onEndEditing={event => { }}
                                /> */}
                                </View>

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
                                        closeModal={() => setShowDropDowns(false)}
                                    />
                                }
                            </View>
                        </View>
                    </ViewShot>
                    {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
                    {/* {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />} */}
                    {/* {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />} */}
                </ScrollView>
                <View style={[styleSheetStyles.container]}>
                    {<TouchableOpacity onPress={() => { saveAPI() }} disabled={!showStatus()} style={[styleSheetStyles.button, styleSheetStyles.clearButton, { borderColor: !showStatus() ? Colors.lightGray : dynamicStyles.iconPrimaryColor }]}>
                        <Text style={[Platform.OS === 'ios' ? styles['font_size_14_bold'] : styles['font_size_14_semibold'], { color: !showStatus() ? Colors.lightGray : dynamicStyles.iconPrimaryColor }]}>{translate('Save')}</Text>
                    </TouchableOpacity>}
                </View>
                {!isProcessing && <View style={{ bottom: 10 }}>
                    <CustomButton shouldDisable={!showStatus()} title={translate('Share')} onPress={() => { takeScreenshot() }}
                        buttonBg={!showStatus() ? Colors.lightGray : dynamicStyles.primaryColor}
                        titleTextColor={!showStatus() ? Colors.white : dynamicStyles.secondaryColor}
                        btnWidth={'90%'}
                        addIcon={showStatus()}
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
    button: {
        width: '100%',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    clearButton: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        // ,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        alignSelf: 'center',
        bottom: 10
    },
    viewShot: {
        width: '100%',
        height: '100%',
    },
    flexFull: { flex: 1 },
    gray300bg: { backgroundColor: '#f5f5f5' },
    header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
    backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },

});

export default SeedCalculator;
