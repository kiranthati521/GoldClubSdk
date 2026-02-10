import {
    StatusBar, Platform, StyleSheet, TouchableOpacity, Image, Alert,
    View, Text, FlatList, ScrollView
} from 'react-native'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { GetApiHeaders, GetRequest, PostRequest } from '../NetworkUtils/NetworkUtils';
import { configs, HTTP_OK } from '../helpers/URLConstants';
import SimpleToast from 'react-native-simple-toast';
import CustomLoader from '../Components/CustomLoader';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomButton from '../Components/CustomButton';
import CustomAlert from '../Components/CustomAlert';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const Agronomy = () => {
    const navigation = useNavigation()
    const networkStatus = useSelector(state => state.networkStatus.value)
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const [selectedSeasonCode, setSelectedSeasonCode] = useState('')
    const [selectedSeason, setSelectedSeason] = useState(translate('select'))
    const [selectedCrop, setSelectedCrop] = useState(translate('select'))
    const [selectedCropId, setSelectedCropId] = useState(0)
    const companyStyle = useSelector(getCompanyStyles);
    const [loading, setLoading] = useState(false)
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const [cropMastersFilter, setCropMastersFilter] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('')
    const [dropDownData, setdropDownData] = useState();
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    const [seasonsList, setSeasonsList] = useState([])
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const monthListRef = useRef(null);
    const [taskData, setTaskData] = useState([]);
    const [alertTitle, setAlertTitle] = useState('');
    const [showAlertHeader, setShowAlertHeader] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false);
    const [showAlertYesButton, setShowAlertYesButton] = useState(false);
    const [showAlertNoButton, setShowAlertNoButton] = useState(false);
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false);
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [daysList, setDaysList] = useState([])
    const [selectedDayListItem, setSelectedDayListItem] = useState(0);
    const [taskGroups, setTaskGroups] = useState({});
    const ITEM_WIDTH = 90; // width of each timeline item
    const ITEM_MARGIN = 4; // horizontal margin of each item
    const [flatListWidth, setFlatListWidth] = useState(0);
    const [textWidth, setTextWidth] = useState(0);



    const getTasksByTimelineStage = (selectedStage, dtoList) => {
        const tasksByStage = {};
        console.log('selectedStage', selectedStage?.timeLineCat, dtoList);
        if (!selectedStage || !dtoList) return tasksByStage;

        dtoList.forEach((task) => {
            if (task.timeLineCat !== selectedStage?.timeLineCat) return;

            const range = task.timeLineCat ? task.timeLineCat.trim() : "No Range";
            console.log('range======>', range, task);
            if (!tasksByStage[range]) {
                tasksByStage[range] = [];
            }

            tasksByStage[range].push(task);
        });
        console.log('tasksByStage', tasksByStage);
        return tasksByStage;
    };

    useEffect(() => {
        if (daysList.length > 0 && !selectedDayListItem) {
            // Set first item as selected by default
            setSelectedDayListItem(daysList[0]);
        }
    }, [daysList]);



    useEffect(() => {
        const groups = getTasksByTimelineStage(selectedDayListItem, taskData);
        setTaskGroups(groups);
    }, [selectedDayListItem]);

    const handleFocus = () => {
        getSeasonMaster()
    };

    useFocusEffect(
        React.useCallback(() => {
            console.log('Screen is focused!');
            handleFocus();
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [networkStatus])
    );

    const onSelectedCrop = async (item) => {
        setSelectedCrop(item.name)
        setSelectedCropId(item?.id);
        setShowDropDowns(false);
        setSelectedSeasonCode('')
        setSelectedSeason(translate('select'))
    }

    let getTasksData = async () => {
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getURL = configs.BASE_URL + configs.MASTERS.getAgronomyInfo;
                var getHeaders = await GetApiHeaders();

                var dataList = {
                    season: selectedSeason,
                    cropName: selectedCrop
                }

                var APIResponse = await PostRequest(getURL, getHeaders, dataList);
                console.log('crops list response is:', JSON.stringify(APIResponse))
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse?.statusCode == HTTP_OK) {
                        var masterResp = APIResponse?.response
                        if (masterResp != undefined && masterResp != null) {
                            setDaysList([])
                            setTaskData([]);
                            if (masterResp?.dtoList == undefined || masterResp?.dtoList == null || masterResp?.dtoList.length == 0) {
                                showAlertWithMessage(translate('alert'), true, true, translate('no_data_available'), false, true, '', translate('ok'))
                                return;
                            }
                            if (masterResp?.timeLineStages == undefined || masterResp?.timeLineStages == null || masterResp?.timeLineStages.length == 0) {
                                showAlertWithMessage(translate('alert'), true, true, translate('no_data_available'), false, true, '', translate('ok'))
                                return;
                            }
                            setDaysList(masterResp?.timeLineStages || [])
                            setTaskData(masterResp?.dtoList || []);
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
                }, 1000);
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }
    }


    const getSeasonMaster = async () => {
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var seasonMasterUrl = configs.BASE_URL + configs.MASTERS.getCropsAndSeasonsForAgronomy;
                var getHeaders = await GetApiHeaders();
                console.log(getHeaders, "<----------- headers in agronomy")
                var APIResponse = await GetRequest(seasonMasterUrl, getHeaders);

                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        setTimeout(() => {
                            setLoading(false)
                            setLoadingMessage()
                        }, 700);
                        var response = APIResponse?.response
                        console.log(JSON.stringify(response), "<------------------ check response")
                        var seasonData = response?.seasonJsonList //seasonListWithCropArray
                        var cropsData = response?.cropJsonList
                        setSeasonsList(seasonData)
                        setCropMastersFilter(cropsData)
                    }
                    else {
                        SimpleToast.show(APIResponse.message)
                    }
                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 500);
                }
            } catch (error) {
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }
    }

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        if (dropDownData?.length == 0) {
            SimpleToast.show(translate('no_data_available'))
        }
        else {
            setShowDropDowns(true);
            setdropDownData(dropDownData);
            setDropDownType(type);
            setSelectedDropDownItem(selectedItem);
        }

    }

    const onSelectedSeasonItem = (itemdata) => {
        if (itemdata != null) {
            setSelectedSeasonCode(itemdata?.id)
            setSelectedSeason(itemdata?.name)
            setShowDropDowns(false)
        }
    }

    let getStatus = () => {
        if (selectedCrop.length > 0 || selectedSeason.length > 0) {
            return false
        }
        else return true
    }

    const handleSubmit = () => {
        const isCropSelected = selectedCrop !== undefined && selectedCrop !== translate('select');
        const isSeasonSelected = selectedSeason !== undefined && selectedSeason !== translate('select');

        if (!isCropSelected) {
            showAlertWithMessage(translate('alert'), true, true, translate('please_select_crop'), false, true, '', translate('ok'))
            return;
        }

        if (!isSeasonSelected) {
            showAlertWithMessage(translate('alert'), true, true, translate('please_select_season'), false, true, '', translate('ok'))
            return;
        }
        setDaysList([])
        setTaskData([]);
        setSelectedDayListItem(0)
        getTasksData();
    };

    const handleCancelAlert = () => {
        setShowAlert(false)
    }

    const handleOkAlert = () => {

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



    const ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

    const hasTasksForMonth = (item, taskData) => {
        // your logic to determine if dot should be shown
        return taskData?.some(task => task.month === item.timeLineCat);
    };

    const scrollToCentered = (index, animated = true) => {
        if (!monthListRef.current || !daysList?.length || !flatListWidth) return;

        const offset = ITEM_FULL_WIDTH * index - flatListWidth / 2 + ITEM_FULL_WIDTH / 2;

        monthListRef.current.scrollToOffset({
            offset: Math.max(0, offset),
            animated,
            viewPosition: 0.5,
        });
    };

    useEffect(() => {
        if (!selectedDayListItem || !flatListWidth) return;

        const index = daysList.findIndex(
            x => x.timeLineCat === selectedDayListItem.timeLineCat
        );

        if (index !== -1) {
            scrollToCentered(index, true);
        }
    }, [selectedDayListItem, flatListWidth]);


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            <View style={[stylesheetstyles.flexFull, stylesheetstyles.gray300bg]}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
                <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 20 : 20 }]}>
                    <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => navigation.goBack()}>
                        <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                        <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('Agronomy')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={stylesheetstyles.shadoww}>
                    <CustomInputDropDown
                        width={[styles['width_100%'], styles['margin_top_10'], styles['centerItems']]}
                        defaultValue={selectedCrop != undefined && selectedCrop != translate('select') ? selectedCrop : translate('select')}
                        labelName={translate('crop')}
                        IsRequired={false}
                        placeholder={translate('select')}
                        onEndEditing={async event => { }}
                        onFocus={() => {
                            changeDropDownData(cropMastersFilter.sort((a, b) => a.displayOrder - b.displayOrder), strings.crop, selectedCrop)
                        }}
                    />
                    <CustomInputDropDown
                        width={[styles['width_100%'], styles['margin_top_5'], styles['centerItems']]}
                        defaultValue={selectedSeason != undefined && selectedSeason != translate('select') ? selectedSeason : translate('select')}
                        labelName={translate('season')}
                        IsRequired={false}
                        placeholder={translate('select')}
                        onEndEditing={async event => { }}
                        onFocus={() => {
                            let filtredSeason = seasonsList?.filter((season) => {
                                return season?.crop == selectedCrop
                            })
                            changeDropDownData(filtredSeason.sort((a, b) => a.displayOrder - b.displayOrder), strings.season, selectedSeason)
                        }}
                    />
                    <CustomButton
                        shouldDisable={getStatus()}
                        onPress={handleSubmit}
                        title={translate('submit')}
                        margin={{ marginTop: 12, marginBottom: 4 }}
                        buttonBg={
                            getStatus() ? '#E5E5E5' :
                                dynamicStyles.primaryColor}
                        btnWidth={"100%"}
                        titleTextColor={
                            getStatus() ? 'white' :
                                dynamicStyles.secondaryColor} />
                </View>
                {taskData && daysList != null && daysList.length > 0 && <>
                    <View style={AgronomyStyles.calendarContainer}>
                        <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_18_semibold']]}>
                            {translate('Time_Line_stages')}
                        </Text>

                        <View style={[AgronomyStyles.monthSelector]}>
                            {/* Left Arrow */}
                            <TouchableOpacity
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: dynamicStyles.highLightedColor,
                                    padding: 10,
                                    borderRadius: 50,
                                    marginRight: 8,
                                }}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (!daysList?.length) return;
                                    const currentIndex = daysList.findIndex(
                                        x => x.timeLineCat === selectedDayListItem.timeLineCat
                                    );
                                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : daysList.length - 1;
                                    setSelectedDayListItem(daysList[prevIndex]);
                                }}
                            >
                                <Image
                                    source={require("../assets/images/leftArw.png")}
                                    style={{ height: 16, width: 16, tintColor: dynamicStyles.primaryColor }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>

                            {/* Timeline FlatList */}
                            <View style={{ flex: 1, paddingBottom: 8 }} onLayout={e => setFlatListWidth(e.nativeEvent.layout.width)}>
                                {daysList?.length > 0 && (
                                    <FlatList
                                        ref={monthListRef}
                                        horizontal
                                        data={daysList}
                                        keyExtractor={(item, index) => item?.timeLineCat?.toString() || index.toString()}
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{
                                            alignItems: "center",
                                            // paddingHorizontal: flatListWidth / 2 - ITEM_FULL_WIDTH / 2,
                                        }}
                                        initialNumToRender={Math.min(10, daysList.length)}
                                        getItemLayout={(_, index) => ({
                                            length: ITEM_FULL_WIDTH,
                                            offset: ITEM_FULL_WIDTH * index,
                                            index,
                                        })}
                                        renderItem={({ item, index }) => {
                                            const isSelected = selectedDayListItem?.timeLineCat === item?.timeLineCat;
                                            return (
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    onPress={() => setSelectedDayListItem(item)}
                                                >
                                                    <View
                                                        style={{
                                                            width: ITEM_WIDTH,
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            marginHorizontal: ITEM_MARGIN,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: 4,
                                                                backgroundColor: hasTasksForMonth(item, taskData)
                                                                    ? dynamicStyles.primaryColor
                                                                    : "transparent",
                                                                // marginBottom: 6,
                                                            }}
                                                        />
                                                        <Text
                                                            style={[
                                                                AgronomyStyles.month,
                                                                { fontSize: 13, fontWeight: "600" },
                                                                {
                                                                    color: isSelected
                                                                        ? dynamicStyles.primaryColor
                                                                        : dynamicStyles.textColor,
                                                                    textAlign: "center",
                                                                },
                                                            ]}
                                                            onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
                                                        >
                                                            {item?.timeLineCat}
                                                        </Text>
                                                        {isSelected && (
                                                            <View
                                                                style={{
                                                                    width: textWidth || "40%",
                                                                    height: 2,
                                                                    borderRadius: 1,
                                                                    backgroundColor: dynamicStyles.primaryColor,
                                                                    marginTop: 4,
                                                                }}
                                                            />
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                )}
                            </View>

                            {/* Right Arrow */}
                            <TouchableOpacity
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: dynamicStyles.highLightedColor,
                                    padding: 10,
                                    borderRadius: 50,
                                    marginLeft: 8,
                                }}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (!daysList?.length) return;
                                    const currentIndex = daysList.findIndex(
                                        x => x.timeLineCat === selectedDayListItem.timeLineCat
                                    );
                                    const nextIndex = currentIndex < daysList.length - 1 ? currentIndex + 1 : 0;
                                    setSelectedDayListItem(daysList[nextIndex]);
                                }}
                            >
                                <Image
                                    source={require("../assets/images/rightArw.png")}
                                    style={{ height: 16, width: 16, tintColor: dynamicStyles.primaryColor }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>


                    </View>


                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        {Object.entries(taskGroups).length === 0 ? (
                            <Text style={[{ alignSelf: "center", color: "rgba(0, 0, 0, 0.3)", marginTop: 10 }, styles['font_size_14_semibold']]}>{translate('no_data_available')}</Text>
                        ) : (
                            Object.entries(taskGroups).map(([range, tasks]) => (
                                <View key={range} style={{ marginBottom: 10, backgroundColor: "#fff", padding: 10, borderRadius: 10, elevation: 2, }}>
                                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                                        <View style={{ height: '100%', width: "1%", borderRightWidth: 1, borderColor: dynamicStyles.primaryColor }} />
                                        <View style={{ marginLeft: 15, }}>
                                            {range && <Text style={[{ marginBottom: 8, color: dynamicStyles.textColor }, styles['font_size_12_bold']]}>
                                                {range}
                                            </Text>}
                                            {tasks.map((task, index) => (
                                                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                                    {tasks.length > 1 && (
                                                        <Text style={[{ width: 12, color: dynamicStyles.textColor }, styles['font_size_12_regular']]}>{`${index + 1}.`}</Text>
                                                    )}
                                                    <Text style={[{ paddingRight: 18, color: dynamicStyles.textColor }, styles['font_size_12_regular']]}>
                                                        {task.task}
                                                    </Text>
                                                </View>
                                            ))}

                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </>}
            </View>
            {
                showDropDowns &&
                <CustomListViewModal
                    dropDownType={dropDownType}
                    listItems={dropDownData}
                    selectedItem={selectedDropDownItem}
                    onSelectedCrop={(item) => onSelectedCrop(item)}
                    onSelectedSeason={(item) => { onSelectedSeasonItem(item) }}
                    closeModal={() => setShowDropDowns(false)} />
            }
            {
                showAlert &&
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

            }
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
        </SafeAreaView>
    )
}

const stylesheetstyles = StyleSheet.create({
    backBtn: {
        height: 20, width: 34, marginTop: 15, marginLeft: 10
    },
    shadoww: {
        backgroundColor: "rgba(255, 255, 255, 1)", marginVertical: 10, borderRadius: 10, padding: 10, width: "92%", alignSelf: "center",
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        marginTop: 15,
    },
    button: {
        width: '100%',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    buttonText: {},
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
    gray300bg: { backgroundColor: 'rgba(249, 249, 249, 1)' },
    header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
    backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },

});
export default Agronomy


const AgronomyStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF0000',
        padding: 15,
    },
    backArrow: {
        fontSize: 24,
        color: '#FFF',
        marginRight: 10,
    },
    formContainer: {
        backgroundColor: '#FFF',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#FF0000',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    calendarContainer: {
        // backgroundColor: '#FFF',
        // margin: 10,
        // padding: 15,
        // borderRadius: 10,
        // elevation: 2,
        width: "90%",
        alignSelf: "center",
        marginTop: 10,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    month: {
        marginHorizontal: 10,
        paddingVertical: 5,
    },
    selectedMonth: {
        color: '#FF0000',
        lineHeight: 20,
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
    },
    weekSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    dayContainer: {
        alignItems: 'center',
        width: 50,
        marginHorizontal: 5,
    },
    day: {
        fontSize: 16,
    },
    dayLabel: {
        fontSize: 14,
        color: '#666',
    },
    selectedDayLabel: {
        color: '#FF0000',
    },
    arrow: {
        fontSize: 24,
        color: '#FF0000',
    },
    tasksContainer: {
        flex: 1,
        margin: 10,
    },
    section: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    taskItem: {
        marginBottom: 10,
    },
    taskText: {
        fontSize: 14,
    },
    noData: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});

