import { TouchableOpacity, Dimensions, Pressable, View, ActivityIndicator, FlatList, Text, StyleSheet, Alert, BackHandler, Platform, Image as RnImg, useWindowDimensions, StatusBar, ImageBackground, Image } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { Colors } from '../assets/Utils/Color';
import { useDispatch, useSelector } from 'react-redux';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { GetApiHeaders, GetRequest, PostRequest } from '../NetworkUtils/NetworkUtils';
// import { getFromAsyncStorage, storeInAsyncStorage } from '../utils/keychainUtils';
// import { LANGUAGECODE, LANGUAGEID, LANGUAGENAME, USER_ID,SHOWONBOARDSCREENS } from '../utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { changeLanguage } from '../Localisation/Localisation';
import { translate } from '../Localisation/Localisation';
// import CustomLoader from '../components/CustomLoader';
import { getCompanyStyles, updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { Styles } from '../assets/style/styles';
// import { setSelectedCompanyAct } from '../state/actions/selectedCompanyActions';
import { retrieveData, MOBILE_NUMBER, GETSTARTED, ROLENAME, compareLocalizationKeys } from "../assets/Utils/Utils";
const { width, height } = Dimensions.get('window');
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import CustomButton from '../Components/CustomButton';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { setLanguage } from '../redux/store/slices/LanguageSlice';
import CustomLoader from '../Components/CustomLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../Components/CustomAlert';
import en from '../Localisation/en.json';
import hin from '../Localisation/hi.json';
import mr from '../Localisation/mr.json';
import te from '../Localisation/te.json'
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const LanguageScreen = (props) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const ekycStatus = props?.route?.params?.ekycStatus != undefined ? props?.route?.params?.ekycStatus : "false";
    const companyStyle = useSelector(getCompanyStyles);
    const navigation = useNavigation()
    const { width } = useWindowDimensions();
    const dispatch = useDispatch();
    const [showAlert, setShowAlert] = useState(false)
    const { languageCode, languageName, languageId } = useSelector((state) => state.language);
    // console.log(languageCode,languageName,languageId,"from redux language options")
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [data, setData] = useState([])
    const [languageIndex, setLanguageIndex] = useState(-1)
    const [loaderApi, setLoaderApi] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [enableTheme, setEnableTheme] = useState(false);


    useFocusEffect(
        React.useCallback(() => {
            if (props?.route?.params?.from === 'profilescreen') {
                setEnableTheme(true)
            }
        }, [props?.route?.params?.from])
    );

    useEffect(() => {
        compareLocalizationKeys(en, hin, mr, te);
    }, []);

    useEffect(() => {
        const initialize = async () => {
            try {
                const url = configs.BASE_URL + configs.MASTERS.GETLANGUAGES;
                const getHeaders = await GetApiHeaders();
                var response = await GetRequest(url, getHeaders);
                if (response && response.statusCode == HTTP_OK) {
                    setLoaderApi(true)
                    setLoadingMessage(translate('please_wait_getting_data'))
                    chooseLanguageHandle(response)
                }
            } catch (err) {
                console.error(err)
            }
        };

        initialize();
    }, []);

    let chooseLanguageHandle = async (response) => {
        let res = JSON.parse(response?.response)
        let checkLanguage = languageCode ? languageCode : 'en'
        const retrievedData = res;
        if (retrievedData?.languageList) {
            const sortedList = [...retrievedData?.languageList].sort((a, b) => a.displayOrder - b.displayOrder);
            setData(sortedList);
            setLoaderApi(false)
            setLoadingMessage()
            const defaultLanguage = sortedList.find(lang => lang?.languageCode === checkLanguage);
            if (defaultLanguage) {
                setLoaderApi(false)
                setLoadingMessage()
                setSelectedLanguage(defaultLanguage);
                setLanguageIndex(sortedList.indexOf(defaultLanguage));
            }
        } else if (error) {
            setLoaderApi(false)
            setLoadingMessage()
            console.error("Failed to load onboarding data:", error);
        }
        else {
            setData([]);
            setShowAlert(true);
        }
        // changeLanguage("en");
    }

    const navigateTo = (route) => {
        props.navigation.reset({
            index: 0,
            routes: [{ name: route }],
        });
    };

    const navigateBasedOnAppState = async () => {
        // const mobileNumber = await retrieveData(MOBILE_NUMBER);
        // const roleTypeDetails = await retrieveData(ROLENAME)
        const getStarted = await retrieveData(GETSTARTED);
        const ROUTES = {
            ONBOARDING: 'OnBoardingScreens',
            LOGIN: 'LoginNew',
            DASHBOARD: '',
            LANGUAGESCREEN: "LanguageScreen",
        };

        if (getStarted !== true) {
            navigateTo(ROUTES.ONBOARDING);
        } else {
            navigateTo(ROUTES.LOGIN);
        }
    };

    const handleContinue = async () => {
        dispatch(setLanguage({
            languageCode: selectedLanguage?.languageCode,
            languageName: selectedLanguage?.languageName,
            languageId: `${selectedLanguage?.id}`,
        }))
        // console.log(selectedLanguage,"after setting into redux language was")
        global.selectedLanguageCode = selectedLanguage?.languageCode || 'en';
        changeLanguage(selectedLanguage?.languageCode)
        if (enableTheme) {
            // props.navigation.navigate('Profile');
            navigation.navigate('Profile', { ekycStatus: ekycStatus })
        } else {
            navigateBasedOnAppState()
        }
    };

    const handleCancelAlert = () => {
        setShowAlert(false)
    }

    const handleLanGuageSelection = (item) => {
        setSelectedLanguage(item)
    }

    const renderLanguageItem = ({ item, index }) => {
        const isSelected = index === languageIndex;
        return (
            <TouchableOpacity onPress={() => {
                setSelectedLanguage(item);
                setLanguageIndex(index);
                changeLanguage(item?.languageCode)
            }} style={[RnStyles.flatListItem, { backgroundColor: isSelected ? (enableTheme ? dynamicStyles.highLightedColor : "rgba(132, 94, 241, 0.1)") : 'transparent', borderColor: isSelected ? (enableTheme ? dynamicStyles?.primaryColor : Colors.purple) : Colors.very_light_grey }]}>

                {isSelected && (<RnImg source={require("../assets/images/tickMark.png")} style={[RnStyles.tickIcon, { tintColor: enableTheme ? dynamicStyles?.primaryColor : Colors.purple }]} />)}

                <View>
                    <Text style={[RnStyles.localLanguageNameText, { color: 'rgba(0, 0, 0, 1)' },styles['font_size_13_semibold']]}>
                        {item.localLanguageName}
                    </Text>

                    <Text style={[RnStyles.languageNameText, { color: 'rgba(0, 0, 0, 1)' },styles['font_size_10_regular']]}>
                        {item.languageName}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: enableTheme ? dynamicStyles?.primaryColor : Colors.purple }} edges={['top']}>
            <View style={{ flex: 1 }}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={enableTheme ? dynamicStyles?.primaryColor : Colors.purple} barStyle='dark-content' />}
                <ImageBackground source={require('../assets/images/login_bg.png')} resizeMode='stretch' style={[styles['full_screen']]}>
                    <View style={[(Platform.OS == 'ios' ? styles['padding_top_30'] : styles['padding_20']), styles['border_bottom_left_radius_25'], styles['border_bottom_right_radius_25'], { alignItems: 'center' }, { position: "relative", backgroundColor: enableTheme ? dynamicStyles?.primaryColor : "rgba(132, 94, 241, 1)" }]}>
                        <Image source={require('../assets/images/flower.png')} style={{ height: 80, width: 80, resizeMode: "contain", position: "absolute", right: 10, top: 10 }} />
                        <Text style={[styles['text_color_white'], Platform.OS == "ios" ? styles['font_size_30_bold'] : styles['font_size_18_bold'], styles['margin_10'], { marginTop: 10},Platform.OS == "ios" &&{marginBottom: 35}]}>{translate('choose_lang')}</Text>
                        {enableTheme && <TouchableOpacity style={
                            [{ height: 50, width: 50, resizeMode: "contain", position: "absolute", left: 5, top: 15 },Platform.OS == "ios" &&{top:25}]
                        } onPress={() => {
                            changeLanguage(languageCode)
                            navigation.navigate('Profile', { ekycStatus: ekycStatus })
                        }}>
                            <Image source={require('../assets/images/previous.png')} style={{
                                height: 20, width: 20, tintColor: dynamicStyles.secondaryColor, marginTop: 17, marginLeft: 10,resizeMode:"contain"
                            }} />
                        </TouchableOpacity>}
                    </View>
                    <View style={[styles['bg_white'], styles['margin_horizontal_15'], styles['margin_top_15'], Styles['border_radius_10'], { minHeight: responsiveHeight(69) }]}>
                        <View style={[styles['width_100%'], styles['centerItems'], styles['top_10'], styles['border_radius_6'], styles['padding_10']]}>
                            <Text style={[RnStyles.chooseLanguageSubText,styles['font_size_16_bold'],Platform.OS == "ios" && styles['padding_bottom_5']]}>{translate('preferred_lang')}</Text>
                            <FlatList
                                style={RnStyles.flatListContainer}
                                data={data}
                                numColumns={3}
                                renderItem={renderLanguageItem}
                                keyExtractor={(item) => item.id.toString()}
                                ListEmptyComponent={
                                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                                        <Text style={[{ textAlign: 'center', color: 'gray', marginTop: 20 },styles['font_size_12_bold']]}>{translate('no_data_available')}</Text>
                                    </View>
                                }
                            />
                        </View>
                        {data.length > 0 && <View style={[styles['centerItems'], styles['width_100%'], styles['margin_bottom_10'], { marginTop: "auto" }]}>
                            <CustomButton title={enableTheme ? translate('submit') : translate('getStarted')} onPress={() => { handleContinue() }} buttonBg={enableTheme ? dynamicStyles?.primaryColor : 'rgba(132, 94, 241, 1)'} btnWidth={"90%"} titleTextColor={Colors.white} />
                        </View>}
                    </View>
                </ImageBackground>
                {
                    showAlert &&
                    <CustomAlert
                        onPressClose={() => { handleCancelAlert() }}
                        title={translate('alert')}
                        showHeader={showAlertHeader}
                        showHeaderText={true}
                        message={translate('something_went_wrong')}
                        onPressOkButton={() => { handleCancelAlert() }}
                        onPressNoButton={() => { handleCancelAlert() }}
                        showYesButton={false}
                        showNoButton={true}
                        yesButtonText={translate('ok')}
                        noButtonText={translate('cancel')} />

                }
                {loaderApi && <CustomLoader loading={loaderApi} message={loadingMessage} />}
            </View>
        </SafeAreaView>
    );

};

export default LanguageScreen;

const RnStyles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#fff",
        width: "100%"
    },

    headerContainer: {
        width: "100%",
        backgroundColor: "#F7F7F7",
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        alignItems: "center",
        height: height * 0.25,
        justifyContent: "center",
    },

    companyLogo: {
        height: height * 0.2,
        width: width * 0.4,
        resizeMode: "contain"
    },

    chooseLanguageTextContainer: {
        // paddingLeft:15
        alignItems: "center",
        paddingTop: height * 0.05
    },

    chooseLanguageSubText: {
        color: "rgba(93, 93, 93, 0.6)",
    },

    getStartedBtnConatiner: {
        alignItems: "center"
    },

    getStartBtn: {
        borderRadius: 8, alignItems: "center",
        justifyContent: "center",
        height: height * 0.06,
        width: "85%",
        marginBottom: height * 0.005
    },

    getStartedText: {
        fontSize: 16,
    },

    flatListContainer: {
        width: "95%",
        alignSelf: "center"
    },

    flatListItem: {
        width: "31%",
        padding: 15,
        alignSelf: "center",
        // margin:5,
        borderRadius: 8,
        borderWidth: 1,
        height: height * 0.125,
        marginBottom: 10,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 15,
    },

    tickContainer: {
        padding: 3,
        // borderRadius: 100,
        position: "absolute",
        top: 5,
        right: 5,
        width: 20, height: 20,
    },

    tickIcon: {
        resizeMode: "contain",
        height: 15,
        width: 15,
        position: "absolute",
        top: 5,
        right: 5,
    },

    localLanguageNameText: {
        textAlign: "center",
    },

    languageNameText: {
        textAlign: "center",
        marginTop: 2.5,
        // marginBottom:10
    }
})
