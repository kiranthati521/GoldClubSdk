import { View, Text, StatusBar, ScrollView, FlatList, TouchableOpacity, Image, Alert, StyleSheet, Dimensions } from 'react-native'
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from 'react-redux';
import { Colors } from "../assets/Utils/Color";
import { strings } from "../strings/strings";
import { Styles } from "../assets/style/styles";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import { MODULENAME, storeData } from "../assets/Utils/Utils";
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { useNavigation } from "@react-navigation/native";
import CustomLoader from '../Components/CustomLoader';
import SimpleToast from "react-native-simple-toast";
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomListViewModal from "../Modals/CustomListViewModal";
import CustomButton from "../Components/CustomButton";
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
import CustomInputDropDown from '../Components/CustomInputDropDown';


const { height } = Dimensions.get('window');

var styles = BuildStyleOverwrite(Styles);
const Points = ({ route }) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    let isTotalPoints = route?.params?.type === 'total'
    console.log(route.params, "<<<<<<<<<<<<<<<<<<<<< check paramsssssssss")

    const [data, setData] = useState([])
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedSeason, setSelectedSeason] = useState('')
    const [selectedProgrammeName, setSelectedProgrammeName] = useState('');
    const [companyId, setCompanyId] = useState(0)
    const [selectedCompany, setSelectedCompany] = useState('')
    const [selectedCompanyCode, setSelectedCompanyCode] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [loadingTrue, setloadingTrue] = useState(false)
    const companyStyle = useSelector(getCompanyStyles);
    const [companyList, setCompanyList] = useState([])
    const [programsList, setProgramsList] = useState(null)
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownData, setdropDownData] = useState();
    const [dropDownType, setDropDownType] = useState("");
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const totalPoints = route?.params?.userPointsEarned;
    const navigation = useNavigation()
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [expandedId, setExpandedId] = useState(null);
    const [fullResponse, setFullResponse] = useState(null)

    useEffect(() => {
        getProgramNamesList();
        storeData(MODULENAME, 'redeemPoints')
    }, [])

    useEffect(() => {
        if (loadingTrue) {
            handleSubmit()
        }
    }, [loadingTrue])

    const getPointsData = async () => {
        var networkStatus = await getNetworkStatus()
        if (isLoading) return;

        // Show loader immediately
        setIsLoading(true);
        setLoading(true);
        setLoadingMessage(translate('please_wait_getting_data'));
        setloadingTrue(false);

        const itemsPerPage = 10;
        if (!networkStatus) {
            SimpleToast.show(translate('no_internet_conneccted'));
            setLoading(false);
            setIsLoading(false);
            return;
        }

        try {
            var getCarouselDataURL = configs.BASE_URL + configs.QRSCAN.getRetailerScanHistoryForTotalPoints;
            var getHeaders = await GetApiHeaders();
            var APIResponse = await PostRequest(getCarouselDataURL, getHeaders, {
                year: selectedYear || new Date().getFullYear().toString(),
                companyCode: selectedCompanyCode,
                companyId: companyId,
                page: page,
                itemsPerPage: itemsPerPage,
                programName: selectedProgrammeName
            });

            if (APIResponse?.statusCode === HTTP_OK) {
                const masterResp = APIResponse.response;
                console.log("ioioiooiooio", JSON.stringify(masterResp))
                setData(masterResp?.scanHistory || []);
                setFullResponse(masterResp);
            } else {
                Alert.alert(APIResponse?.message);
            }

        } catch (error) {
            SimpleToast.show(error.message);
        } finally {
            setTimeout(() => { // optional small delay for smoothness
                setLoading(false);
                setLoadingMessage('');
                setIsLoading(false);
            }, 300);
        }
    };


    const getProgramNamesList = async () => {
        const networkStatus = await getNetworkStatus();
        if (!networkStatus) {
            SimpleToast.show(translate('no_internet_conneccted'));
            return;
        }

        try {
            // Show loader
            setLoading(true);
            setLoadingMessage(translate('please_wait_getting_data'));

            const getURL = `${configs.BASE_URL}${configs.QRSCAN.PROGRAMS_LIST}`;
            const headers = await GetApiHeaders();
            const APIResponse = await GetRequest(getURL, headers);

            if (!APIResponse) {
                throw new Error(translate('no_data_available'));
            }

            if (APIResponse.statusCode !== HTTP_OK) {
                Alert.alert(APIResponse?.message || translate('something_went_wrong'));
                return;
            }

            const masterResp = APIResponse.response;
            if (!masterResp) return;

            // Set company and program lists
            setCompanyList(masterResp.CompanyList || []);
            setProgramsList(masterResp.programList || []);

            // Auto-select current program
            const currentProgram = masterResp.currentDBProgram;
            if (currentProgram && masterResp.programList?.length > 0) {
                const selectedProgram = masterResp.programList.find(
                    (item) => item?.id === currentProgram?.id
                );
                if (selectedProgram) {
                    setSelectedSeason(selectedProgram.name);
                    setSelectedProgrammeName(selectedProgram.programName);
                    setloadingTrue(true); // triggers handleSubmit
                }
            }
        } catch (error) {
            SimpleToast.show(error.message || translate('something_went_wrong'));
        } finally {
            // Hide loader
            setLoading(false);
            setLoadingMessage('');
            storeData(MODULENAME, '');
        }
    };


    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }
    const onSelectedSeasonItem = (itemdata) => {
        console.log('ititititit', itemdata)
        if (itemdata != null) {
            setSelectedSeason(itemdata?.name)
            setSelectedProgrammeName(itemdata?.programName)
            setShowDropDowns(false)
        }
    }

    const onSelectedCompanyNameItem = (itemdata) => {
        if (itemdata != null) {
            setCompanyId(itemdata?.id)
            setSelectedCompany(itemdata?.name)
            setSelectedCompanyCode(itemdata?.companyCode);
            setShowDropDowns(false)
        }
    }

    const handleSubmit = () => {
        setData([]);
        setPage(1);
        setLoading(true); // show loader immediately

        setTimeout(async () => {
            await getPointsData(); // API call
        }, 150); // 50ms is enough to let UI update
    };


    const getStatus = () => {
        if (selectedCompany.length > 0 || selectedSeason.length > 0) {
            return false
        }
        else return true
    }

    const handleToggle = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Reusable key-value row
    const KeyValueRow = ({ label, value }) => {
        // Ensure safe string conversion
        const safeValue =
            value === null || value === undefined
                ? "-"
                : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value);

        return (
            <View style={stylesSheetStyles.row}>
                <Text style={stylesSheetStyles.label}>
                    {label ? String(label) : "-"}
                </Text>
                <Text>{" : "}</Text>
                <Text style={stylesSheetStyles.value}>{safeValue}</Text>
            </View>
        );
    };

    // defualt first tab auto open when page load
    useEffect(() => {
        if (data?.length > 0 && expandedId === null) {
            setExpandedId(data[0].id);
        }
    }, [data]);

    // Single collapsible card
    const CollapsibleCard = ({ item, expanded, onToggle, selectedCompany }) => {

        console.log(JSON.stringify(selectedCompany), "selectedCompanyselectedCompanyselectedCompany")
        // Defensive conversion
        const companyName =
            item?.companyName && typeof item.companyName !== "object"
                ? String(item.companyName)
                : "-";

        const scannedBags =
            item?.scannedBags !== undefined && item?.scannedBags !== null
                ? String(item.scannedBags)
                : "0";

        const programName = item?.program != undefined && item?.program !== null
            ? String(item.program)
            : ""

        return (
            <View style={stylesSheetStyles.card}>
                <TouchableOpacity style={[stylesSheetStyles.header]} onPress={onToggle}>
                    <Text style={[stylesSheetStyles.title, { flex: 1 }]}>
                        {selectedCompany == "" ? companyName : programName}</Text>
                    <Text style={stylesSheetStyles.subtitle}>
                        {translate('Scanned_Bags')} : {scannedBags}
                    </Text>
                    <View style={[stylesSheetStyles.arrowBox, { backgroundColor: dynamicStyles.primaryColor }]}>
                        <Image
                            source={require('../assets/images/down_arow.png')}
                            style={[
                                { width: 9, height: 9 },
                                { transform: [{ rotate: expanded ? "180deg" : "0deg" }] },
                            ]}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableOpacity>

                {expanded && (
                    <View style={stylesSheetStyles.detailsContainer}>
                        {item?.details && (
                            <>
                                {/* Program or Company Name */}
                                {selectedCompany == "" ? (
                                    <KeyValueRow label={translate('Program')} value={item.details.program} />

                                ) : item.details.companyName ? (
                                    <KeyValueRow label={translate('company_name')} value={item.details.companyName} />
                                ) : null}

                                {/* Other points only if value exists */}
                                {item.details.earnedPoints != null ? (
                                    <KeyValueRow label={translate('earned_points')} value={item.details.earnedPoints} />
                                ) : null}

                                {item.details.bonusPoints != null ? (
                                    <KeyValueRow label={translate('bonus_points')} value={item.details.bonusPoints} />
                                ) : null}

                                {item.details.signupBonus != null ? (
                                    <KeyValueRow label={translate('signUp_bonus_points')} value={item.details.signupBonus} />
                                ) : null}

                                {item.details.additionalBonus ? (
                                    <KeyValueRow label={translate('Additional_Bonus_Points')} value={item.details.additionalBonus} />
                                ) : null}

                                {item.details.totalPoints != null ? (
                                    <KeyValueRow label={translate('totalPoints')} value={item.details.totalPoints} />
                                ) : null}

                                {item.details.redeemablePoints != null ? (
                                    <KeyValueRow label={translate('redeemable_points')} value={item.details.redeemablePoints} />
                                ) : null}

                                {item.details.redeemedPoints != null ? (
                                    <KeyValueRow label={translate('reedemed_points_value')} value={item.details.redeemedPoints} />
                                ) : null}

                            </>
                        )}
                    </View>

                )}
            </View>
        );
    };




    return (
        <View style={[styles['full_screen'], { backgroundColor: "rgba(249, 249, 249, 0.9)" }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={[{ backgroundColor: dynamicStyles.primaryColor, borderBottomEndRadius: 10, borderBottomStartRadius: 10, paddingTop: Platform.OS === 'ios' ? 60 : 0 }]}>
                <TouchableOpacity style={[styles['flex_direction_row'], styles['margin_top_10']]} onPress={() => { navigation.goBack() }}>
                    <Image style={[styles['margin_left_20'], styles[''], { tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: Platform.OS == 'ios' ? 10 : 10 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], styles[''], { color: dynamicStyles.secondaryColor }, styles[''], styles['font_size_18_bold'], { marginTop: 5 }]}>{isTotalPoints ? translate('totalPoints') : translate('redeemed_points')}</Text>
                </TouchableOpacity>

                <View style={[styles['flex_direction_row'], styles['width_90%'], styles['height_80'], styles['bg_white'], styles['border_radius_10'], styles['centerItems'], { marginTop: 20, marginBottom: 10 }]}>
                    <View style={[{ width: '15%' }]}>
                        <Image style={[styles['width_height_50']]} source={isTotalPoints ? require('../assets/images/points_img.png') : require('../assets/images/redeem_points_icon.png')}></Image>
                    </View>
                    <View style={[styles['flex_direction_column'], styles['margin_left_5'], { width: '71%' }]}>
                        <Text style={[styles['font_size_18_bold'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%']]}>{totalPoints}</Text>
                        <Text style={[styles['font_size_12_semibold'], { color: dynamicStyles.textColor }, styles['text_align_left'], styles['left_5'], styles['width_100%']]}>{isTotalPoints ? translate('totalPoints') : translate('redeemed_points')}</Text>
                    </View>
                </View>
            </View>
            <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false} bounces={false} style={{ backgroundColor: "rgba(249, 249, 249, 0.9)", flex: 1, marginTop: 10 }}>
                <View style={[{
                    padding: 10,
                    width: '95%', backgroundColor: 'white', marginTop: 5
                }, styles['centerItems'], styles['border_radius_8']]}>
                    <View>
                        <CustomInputDropDown
                            width={[{ width: '100%' }, styles['centerItems']]}
                            defaultValue={selectedSeason != undefined && selectedSeason != translate('select') ? selectedSeason : translate('select')}
                            labelName={translate('Program_Name')}
                            IsRequired={false}
                            placeholder={translate('select')}
                            onEndEditing={async event => {
                            }}
                            onFocus={() => {
                                if (Array.isArray(programsList) && programsList.length > 0) {
                                    const sortedPrograms = [...programsList].sort((a, b) => a.displayOrder - b.displayOrder);
                                    changeDropDownData(sortedPrograms, strings.season, selectedSeason);
                                } else {
                                    changeDropDownData([], strings.season, selectedSeason);
                                }
                            }}
                        />

                        <CustomInputDropDown
                            width={[styles['width_100%'], styles['centerItems']]}
                            defaultValue={selectedCompany != undefined ? selectedCompany : translate('company_name')}
                            labelName={translate('company_name')}
                            IsRequired={false}
                            placeholder={translate('select_company_name')}
                            onEndEditing={async event => {
                            }}
                            // onFocus={() => {
                            //     changeDropDownData(companyList.sort((a, b) => a.displayOrder - b.displayOrder), strings.company, selectedCompany)
                            // }}
                            onFocus={() => {
                                if (Array.isArray(companyList) && companyList.length > 0) {
                                    const sortedCompanies = [...companyList].sort((a, b) => a.displayOrder - b.displayOrder);
                                    changeDropDownData(sortedCompanies, strings.company, selectedCompany);
                                } else {
                                    changeDropDownData([], strings.company, selectedCompany);
                                }
                            }}
                        />
                    </View>

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

                <View style={[{ marginTop: 10, }]}>
                    <View style={[{ width: '95%', alignSelf: 'center', }]}>
                        {data != null && data.length > 0 && <View style={[{ width: '100%', backgroundColor: Colors.white, borderRadius: 8, padding: 5, maxHeight: height * 0.30 }]}>
                            <FlatList
                                data={data}
                                nestedScrollEnabled={true}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <CollapsibleCard
                                        item={item}
                                        expanded={expandedId === item.id}
                                        onToggle={() => handleToggle(item.id)}
                                        selectedCompany={selectedCompany}
                                    />
                                )}
                                initialNumToRender={3}
                                removeClippedSubviews={true}
                                maxToRenderPerBatch={3}
                                windowSize={5}
                                onEndReachedThreshold={0.5}
                                contentContainerStyle={{ padding: 10 }}
                            />
                        </View>}

                        {fullResponse && (data.length == 0 || data.length > 0) &&
                            <View style={[{ width: '100%', backgroundColor: Colors.white, borderRadius: 8, padding: 10, marginTop: 10 }]}>
                                <View style={{ borderWidth: 0.8, borderRadius: 8, borderColor: 'grey', padding: 10 }}>
                                    {fullResponse?.totalScannedBags != null && <KeyValueRow label={translate('Total_Scanned_Bags')} value={fullResponse?.totalScannedBags} />}
                                    {(
                                        (
                                            (selectedSeason === "All" && selectedCompany === "All") ||
                                            (fullResponse?.bonusPoints != null && fullResponse?.bonusPoints > 0)
                                        )
                                    ) && (
                                            <KeyValueRow
                                                label={translate('bonus_points')}
                                                value={fullResponse?.bonusPoints ?? 0}
                                            />
                                        )}

                                    {fullResponse?.totalPoints != null && <KeyValueRow label={translate('totalPoints')} value={fullResponse?.totalPoints} />}
                                    {fullResponse?.redeemablePoints != null && <KeyValueRow label={translate('redeemable_points')} value={fullResponse?.redeemablePoints} />}
                                    {fullResponse?.redeemedPoints != null && <KeyValueRow label={translate('reedemed_points_value')} value={fullResponse?.redeemedPoints} />}
                                </View>

                            </View>}

                        {/* {data.length == 0 && <Text style={{
                            fontSize: 14, fontWeight: 'bold',
                            color: Colors.black, textAlign: 'center', padding: 15, textAlignVertical: 'center'
                        }}>{translate('no_data_available')}</Text>} */}

                    </View>

                </View>
            </ScrollView>

            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
        </View>
    )
}

export default Points

const stylesSheetStyles = StyleSheet.create({
    footer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 5,
        marginVertical: 6,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontWeight: "600",
        fontSize: 12,
        color: "#000",
    },
    subtitle: {
        color: "#333",
        fontSize: 12,
        fontWeight: "700",
        paddingEnd: 5
    },
    arrow: {
        fontSize: 16,
        color: "#000",
    },
    detailsContainer: {
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        marginTop: 8,
        paddingTop: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 3,
    },
    label: {
        color: "#333",
        fontWeight: "600",
        flex: 1,
        fontSize: 12,
    },
    value: {
        color: "#000",
        flex: 1,
        textAlign: "left",
        paddingStart: 10,
        fontSize: 12,
    },
    arrowBox: {
        width: 18,
        height: 18,
        borderRadius: 6, // Rounded corner
        justifyContent: "center",
        alignItems: "center",
    },
})