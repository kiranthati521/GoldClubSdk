import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { strings } from '../strings/strings';
import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

var styles = BuildStyleOverwrite(Styles);

const RedeemPortal = ({ route }) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const navigation = useNavigation();
    const getUserData = useSelector(selectUser);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const portalLink = route.params.item
    const [loading, setLoading] = useState(false)
    const [successLoading, setSuccessLoading] = useState(false)
    const [errorLoading, setErrorLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const insets = useSafeAreaInsets();

    useEffect(() => {
        console.log(portalLink);
    }, [])

    goBack = () => {
        navigation.goBack();
    }

    return (
        // <View style={[styles['full_screen'], styles['flex_1'], { backgroundColor: Colors.imageUploadBackColor }]}>
         <SafeAreaView 
            style={[
                styles['full_screen'], 
                styles['flex_1'], 
                { backgroundColor: Colors.imageUploadBackColor }
            ]}
            edges={['top', 'bottom']}  // ✅ handle notch & curved edges
        >
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={[{ backgroundColor:dynamicStyles.primaryColor,paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
                <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
                    <Image style={[{tintColor:dynamicStyles.secondaryColor}, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], {color:dynamicStyles.secondaryColor},styles['font_size_18_bold']]}>{translate('redeem')}</Text>
                </TouchableOpacity>
            </View>

            {/* <View style={[styles['width_100%'], styles['height_90%']]}> */}
            <View style={{ flex: 1, paddingBottom: insets.bottom }}>

                <WebView
                    onLoadStart={() => {
                        // setLoading(true)
                        // setLoadingMessage(translate('please_wait_getting_data'))
                    }}
                    onLoad={() => {
                        setLoading(false)
                        setLoadingMessage()
                    }}
                    source={{ uri: portalLink }}
                    style={[styles['centerItems'], styles['border_radius_6'], { height: '100%', width: '100%' }]}
                    containerStyle={[styles['centerItems'], { flex: 1, width: '100%', height: '90%' }]}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    incognito={true} // ✅ disables caching + cookies
                    // onScroll={handleWebViewScroll}
                    onMessage={(event) => {
                        console.log("event", event.nativeEvent.data)

                    }}
                />
            </View>
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
            {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
            </SafeAreaView>
        // </View>
    )
};

export default RedeemPortal;
