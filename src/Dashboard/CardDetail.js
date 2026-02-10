import { Platform, Text, StatusBar, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { useNavigation } from '@react-navigation/native';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { createStyles } from '../assets/style/createStyles';
var styles = BuildStyleOverwrite(Styles);
const CardDetail = ({ route }) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const navigation = useNavigation()
    let wholeData = route?.params?.data
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);

    return (
        <View style={[styles['full_screen'], styles['bg_grey_light']]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
                <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { navigation.goBack() }}>
                    <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold']]}>{'Market Details'}</Text>
                </TouchableOpacity>
            </View>
            <View style={{ elevation: 5 }}>
                <Image
                    source={{ uri: wholeData?.fileName[0]?.imageUrl }}
                    style={{ width: responsiveWidth(90), alignSelf: "center", height: responsiveHeight(25), borderRadius: 20, marginVertical: 10 }}
                    resizeMode="stretch"
                />
            </View>
        </View>
    );
};

export default CardDetail;
