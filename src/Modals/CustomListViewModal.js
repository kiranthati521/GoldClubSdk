import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Modal, FlatList, Image, TouchableOpacity, AppState, Keyboard } from 'react-native';
import { strings } from '../strings/strings';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

const CustomListViewModal = ({
    visible,
    onBackdropPress,
    closeModal,
    listItems,
    unFilteredDeputeeList,
    dropDownType,
    selectedItem,
    onSelectedRole,
    onSelectedState,
    onSelectedDistrict,
    onSelectedTM,
    onSelectedMDO,
    onSelectedCategory,
    onSelectedSubCategory,
    onSelectedSeason,
    onSelectedCrop,
    onSelectedZone,
    onSelectedRegion,
    onSelectedTerritory,
    onSelectedHeadquarter,
    onSelectedRetailerName,
    onSelectedYear,
    onSelectedStatus,
    onSelectedRetailerType,
    onSelectedGender,
    onSelectedCompanyName,
    onSelectedLocationName,
    onSelectedCropCal,
    onSelectedSoilType,
    onSelectedPlantingType,
    onSelectedRowSpacing,
    onSelectedPlantSpacing,
    onSelectedAreaToPlanted,
    onSelectedAvgBollsPerPlant,
    onSelectedsetAvgBollWt,
    onSelectedAtthetime,
    onSelectedUrea,
    onSelectedFirstDose,
    onSelectedFirstDoseUrea,
    onSelectedsecondDose,
    onSelectedsecondDoseUrea,
    onSelectedGrainYield,
    onSelectedProductiveTillers,
    onSelectedAvgGrainsPannicle,
    onSelectedDAPAtSowing,
    onSelectedMOPAtSowing,
    onSelectedZincSuplhateAtSowing,
    onSelectedSulphurSowing,
    onSelectedMopSecondDose,
    onSelectedSulphurSecondDose,
    onSelectedZincSulphateSecondDose,
    onSelectedHybrid,
    style
}) => {
    const [search, setSearch] = useState("");
    let newStyles =  BuildStyleOverwrite(Styles)
    newStyles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const [filteredList, setFilteredList] = useState(listItems);
    const [styles, setStyles] = useState(newStyles);
    const getUserData = useSelector(selectUser);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active') {
                setStyles(newStyles);
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        setFilteredList(listItems);
    }, [listItems]);

    const onPressDropdownItem = (item) => {
        if (item.name === translate('no_data_available')) return;
        const actions = {
            //    //sowing fertiliser
            //    [translate('dapAtSowing')]:onSelectedDAPAtSowing,
            //    [translate('mopAtSowing')]:onSelectedMOPAtSowing,
            //    [translate('zincSulphateAtSowing')]:onSelectedZincSuplhateAtSowing,
            //    [translate('sulphurAtSowing')]:onSelectedSulphurSowing,
            //    // second dose fertiliser
            //    [translate('mopSecondDose')]:onSelectedMopSecondDose,
            //    [translate('sulphurSecondDose')]:onSelectedSulphurSecondDose,
            //    [translate('zincSulphateSecondDose')]:onSelectedZincSulphateSecondDose,
            //    //rest of the things
            //    [translate('memberType')]: onSelectedRole,
            //    [translate('state')]: onSelectedState,
            //    [translate('district')]: onSelectedDistrict,
            //    [translate('tm')]: onSelectedTM,
            //    [translate('MDO')]: onSelectedMDO,
            //    [translate('selectCategory')]: onSelectedCategory,
            //    [translate('selectSubCategory')]: onSelectedSubCategory,
            //    [translate('season')]: onSelectedSeason,
            //    [translate('crop')]: onSelectedCrop,
            //    [translate('zone')]: onSelectedZone,
            //    [translate('selectRegion')]: onSelectedRegion,
            //    [translate('selectTerritory')]: onSelectedTerritory,
            //    [translate('selectHeadquarter')]: onSelectedHeadquarter,
            //    [translate('retailerName')]: onSelectedRetailerName,
            //    [translate('year')]: onSelectedYear,
            //    [translate('selectApproveReject')]: onSelectedStatus,
            //    [translate('selectRetailerType')]: onSelectedRetailerType,
            //    [translate('selectGender')]: onSelectedGender,
            //    [translate('company')]: onSelectedCompanyName,
            //    [translate('geotagging')]: onSelectedLocationName,
            //    [translate('yieldOne')] : onSelectedCropCal,
            //    [translate('yieldTwo')] : onSelectedSoilType,
            //    [translate('yieldThree')]:onSelectedPlantingType,
            //    [translate('yieldFour')]:onSelectedRowSpacing,
            //    [translate('yieldFive')]:onSelectedPlantSpacing,
            //    [translate('yieldSix')]:onSelectedAreaToPlanted,
            //    [translate('AvgBollsPerPlant')]:onSelectedAvgBollsPerPlant,
            //    [translate('AvgBollWt')]: onSelectedsetAvgBollWt,
            //    [translate('Atthetime')]: onSelectedAtthetime,
            //    [translate('Urea')]: onSelectedUrea,
            //    [translate('FirstDose')]: onSelectedFirstDose,
            //    [translate('FirstDoseUrea')]: onSelectedFirstDoseUrea,
            //    [translate('secondDose')]: onSelectedsecondDose,
            //    [translate('secondDoseUrea')]: onSelectedsecondDoseUrea,
            //    [translate('GrainYield')]: onSelectedGrainYield,
            //    [translate('productiveTillers')]: onSelectedProductiveTillers,
            //    [translate('AvgGrainsPannicle')]: onSelectedAvgGrainsPannicle,
            //    [translate('Hybrid')]:onSelectedHybrid
            //sowing fertiliser
            [strings.dapAtSowing]:onSelectedDAPAtSowing,
            [strings.mopAtSowing]:onSelectedMOPAtSowing,
            [strings.zincSulphateAtSowing]:onSelectedZincSuplhateAtSowing,
            [strings.sulphurAtSowing]:onSelectedSulphurSowing,
            // second dose fertiliser
            [strings.mopSecondDose]:onSelectedMopSecondDose,
            [strings.sulphurSecondDose]:onSelectedSulphurSecondDose,
            [strings.zincSulphateSecondDose]:onSelectedZincSulphateSecondDose,
            //rest of the things
            [strings.memberType]: onSelectedRole,
            [strings.state]: onSelectedState,
            [strings.district]: onSelectedDistrict,
            [strings.tm]: onSelectedTM,
            [strings.MDO]: onSelectedMDO,
            [strings.selectCategory]: onSelectedCategory,
            [strings.selectSubCategory]: onSelectedSubCategory,
            [strings.season]: onSelectedSeason,
            [strings.crop]: onSelectedCrop,
            [strings.zone]: onSelectedZone,
            [strings.selectRegion]: onSelectedRegion,
            [strings.selectTerritory]: onSelectedTerritory,
            [strings.selectHeadquarter]: onSelectedHeadquarter,
            [strings.retailerName]: onSelectedRetailerName,
            [strings.year]: onSelectedYear,
            [strings.selectApproveReject]: onSelectedStatus,
            [strings.selectRetailerType]: onSelectedRetailerType,
            [strings.selectGender]: onSelectedGender,
            [strings.company]: onSelectedCompanyName,
            [strings.geotagging]: onSelectedLocationName,
            [strings.yieldOne] : onSelectedCropCal,
            [strings.yieldTwo] : onSelectedSoilType,
            [strings.yieldThree]:onSelectedPlantingType,
            [strings.yieldFour]:onSelectedRowSpacing,
            [strings.yieldFive]:onSelectedPlantSpacing,
            [strings.yieldSix]:onSelectedAreaToPlanted,
            [strings.AvgBollsPerPlant]:onSelectedAvgBollsPerPlant,
            [strings.AvgBollWt]: onSelectedsetAvgBollWt,
            [strings.Atthetime]: onSelectedAtthetime,
            [strings.Urea]: onSelectedUrea,
            [strings.FirstDose]: onSelectedFirstDose,
            [strings.FirstDoseUrea]: onSelectedFirstDoseUrea,
            [strings.secondDose]: onSelectedsecondDose,
            [strings.secondDoseUrea]: onSelectedsecondDoseUrea,
            [strings.GrainYield]: onSelectedGrainYield,
            [strings.productiveTillers]: onSelectedProductiveTillers,
            [strings.AvgGrainsPannicle]: onSelectedAvgGrainsPannicle,
            [strings.Hybrid]:onSelectedHybrid
        };
        actions[dropDownType]?.(item);
    };

    const filterList = useCallback(() => {
        const sourceList = dropDownType === strings?.deputee_details ? unFilteredDeputeeList : listItems;
        let filtered = sourceList?.filter(data => data?.name?.toLowerCase().includes(search.toLowerCase()));
        if (filtered?.length === 0) {
            filtered = [{ name: translate('no_data_available') }];
        }
        setFilteredList(filtered);
    }, [search, listItems, dropDownType, unFilteredDeputeeList]);

    useEffect(() => {
        filterList();
    }, [search]);

    return (
        <Modal
            supportedOrientations={['portrait', 'landscape']}
            visible={visible}
            onRequestClose={onBackdropPress}
            animationType='slide'
            transparent={true}
            style={style}>
            <View style={[styles['width_100%'], styles['height_100%'], styles['transparent_black_bg'], styles['centerItems']]}> 
                <View style={[styles['width_85%'], styles['border_radius_normal'], styles['padding_10'], styles['margin_30'], styles['max_height_80%'], styles['bg_white']]}> 
                    <View style={[styles['align_self_flex_end'], styles['top_5']]}>
                        <TouchableOpacity onPress={closeModal}>
                            <Image source={require('../assets/images/close.png')} style={[styles['width_height_25'], { tintColor: dynamicStyles?.iconPrimaryColor || 'rgba(237, 50, 55, 1)' }]} />
                        </TouchableOpacity>
                    </View>
                    {filteredList?.length > 0 ? (
                        <FlatList
                            bounces={false}
                            data={filteredList}
                            style={[styles['width_100%'], styles['top_10']]}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => onPressDropdownItem(item)}>
                                    <View style={[styles['width_100%'], styles['top_10']]}>
                                        <Text style={[styles['font_size_13_regular'], selectedItem === item.name ? styles['text_color_blue'] : {color:dynamicStyles?.textColor || 'rgba(0, 0, 0, 1)'}, styles['text_input'], styles['padding_5']]} numberOfLines={3}>
                                            {dropDownType === strings.unit_size_uim ? item.shortDisplay : item.name}
                                        </Text>
                                    </View>
                                    <View style={[styles['bg_light_grey_color'], styles['height_1'], styles['width_100%'], styles['centerItems'], styles['top_5']]}></View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        />
                    ) : (
                        <View>
                            <Text style={[styles['text_color_black'], styles['centerItems'], styles['margin_top_80'], { height: 40 },styles['font_size_16_regular']]}>{translate('no_data_available')}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default CustomListViewModal;
