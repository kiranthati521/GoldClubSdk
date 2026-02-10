import { useDispatch, useSelector } from 'react-redux';

import React, { useEffect, useState } from "react";
import { Dimensions, Image, ImageBackground, View, StyleSheet,StatusBar, Alert } from "react-native";
import { getCompanyStyles, updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';

import { Styles } from "../assets/style/styles";
import { retrieveData, MOBILE_NUMBER, GETSTARTED,ROLENAME } from "../assets/Utils/Utils";
import { Colors } from '../assets/Utils/Color';
import { strings } from "../strings/strings";
import SimpleToast from 'react-native-simple-toast';
import { selectUser } from '../redux/store/slices/UserSlice';
import { translate } from '../Localisation/Localisation';
import { getNetworkStatus } from '../NetworkUtils/NetworkUtils';

const styles = Styles;
const TIMEOUT_DURATION = 4000;



const Splash = (props) => {
    const dispatch = useDispatch();
    const networkStatus = useSelector((state) => state.networkStatus.value);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const getUserData = useSelector(selectUser);

    const ROUTES = {
        ONBOARDING: 'OnBoardingScreens',
        LOGIN: 'LoginNew',
        DASHBOARD: '',
        LANGUAGESCREEN:"LanguageScreen",
    };

    useEffect(()  => {
        
        if (dynamicStyles.primaryColor == undefined) {

            const tempSlectedObject = {};
            tempSlectedObject.primaryColor = Colors.themeRed;
            tempSlectedObject.secondaryColor = Colors.white;
            tempSlectedObject.textColor = Colors.black;


            if (tempSlectedObject) {
                if (tempSlectedObject != undefined) {
                    dispatch(updateCompanyStyles(tempSlectedObject))
                }
            }

        } else {

        }
        // console.log("777777777",networkStatus)
        setTimeout(async () => {
            var networkStatus = await getNetworkStatus()
            if (networkStatus) {
                navigateBasedOnAppState();
            } else {
                const mobileNumber = await retrieveData(MOBILE_NUMBER);
                const roleTypeDetails = await retrieveData(ROLENAME)
                if (mobileNumber) {
                    console.log("nandu002")
                    navigateTo((roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard': 'Dashboard');
                } else {
                    // facing issue when their is no internet then we are not navigating user to anywhere so added else condition
                    if (networkStatus) {
                        navigateTo(ROUTES.LANGUAGESCREEN);
                        // navigateTo(ROUTES.ONBOARDING);
                        SimpleToast.show(translate('no_internet_conneccted'));
                    }
                }
                  SimpleToast.show(translate('no_internet_conneccted'));
            }
        }, TIMEOUT_DURATION);
    }, []);

    const navigateBasedOnAppState = async () => {

        const mobileNumber = await retrieveData(MOBILE_NUMBER);
        const getStarted = await retrieveData(GETSTARTED);
        const roleTypeDetails = await retrieveData(ROLENAME)
        if (getStarted !== true) {
            navigateTo(ROUTES.LANGUAGESCREEN);
            // navigateTo(ROUTES.ONBOARDING);
        } else if (mobileNumber) {
            navigateTo((roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard': 'Dashboard');
            return
        } else {
            // navigateTo(ROUTES.LOGIN);
            navigateTo(ROUTES.LANGUAGESCREEN);
        }
    };

    const navigateTo = (route) => {
        props.navigation.reset({
            index: 0,
            routes: [{ name: route }],
        });
    };

    return (
        <View style={styleSheetStyles.full}>
        <StatusBar backgroundColor={'white'} barStyle='dark-content' />
            {/* {getUserData[0]?.companyCode != undefined && getUserData[0]?.companyCode == "1100" ? (
                <ImageBackground
                    source={require('../assets/images/bg_view_plain.png')}
                    resizeMode="stretch"
                    style={{
                        height: Dimensions.get('window').height,
                        width: Dimensions.get('window').width,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        source={require('../assets/images/newAppIcon.png')}
                        style={[styles.margin_left_10, styles.align_self_center, { width: Dimensions.get('window').width / 2.25 }]}
                        resizeMode="contain"
                    />
                </ImageBackground>
            ) : ( */}
                <View
                    style={styleSheetStyles.whiteBg}
                >
                    <Image
                        source={getUserData[0]?.companyLogoPath != undefined ? { uri: getUserData[0]?.companyLogoPath } : require('../assets/images/newAppIcon.png')}
                        style={[styles.margin_left_10, styles.align_self_center, { width: Dimensions.get('window').width / 2.25, height: 200 }]}
                        resizeMode="contain"
                    />
                     <Image
                        source={ require('../assets/images/farm.png')}
                        style={[ styles.align_self_center, styleSheetStyles.farm]}
                    />
                </View>
            {/* )} */}
        </View>
    );
};

let styleSheetStyles = StyleSheet.create({
    full: { flex: 1 },
    whiteBg: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white"
    },
    farm: { width: '100%', height: 200, position: "absolute", bottom: 0 },
})

export default Splash;
