import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
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

var styles = BuildStyleOverwrite(Styles);

const AccountCloser = ({ route }) => {
    const navigation = useNavigation();
    
    // const companyStyle = useSelector(route?.params.dynamicStyles);
    const [dynamicStyles, setDynamicStyles] = useState(route?.params.dynamicStyles || "");
    const [title,setTitle] = useState(route?.params.title || "")
    const accountCloseLink = route.params.accountCloseLink;
    const [loading, setLoading] = useState(false)
    const [successLoading, setSuccessLoading] = useState(false)
    const [errorLoading, setErrorLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(route?.params?.loaderGif || "")


    useEffect(() => {
        console.log(accountCloseLink);
    }, [])

    goBack = () => {
        navigation.goBack();
    }

    return (
        <View style={[styles['full_screen'], styles['flex_1'], { backgroundColor: Colors.imageUploadBackColor }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={[{ backgroundColor:dynamicStyles.primaryColor,paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
                <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
                    <Image style={[{tintColor:dynamicStyles.secondaryColor}, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], {color:dynamicStyles.secondaryColor},styles['font_size_18_bold']]}>{title}</Text>
                </TouchableOpacity>
            </View>

            <View style={[Platform.OS === 'android' ? {height:"90%",backgroundColor: Colors.imageUploadBackColor } : [styles['width_100%'], styles['height_100%']]]}>

                <WebView
                    onLoadStart={() => {
                         setLoading(true)
                        // setLoadingMessage(translate('please_wait_getting_data'))
                    }}
                    onLoad={() => {
                        setLoading(false)
                        setLoadingMessage()
                    }}
                    source={{ uri: accountCloseLink }}
                    style={[styles['centerItems'], styles['border_radius_6'],Platform.OS === 'android' ? { height: '100%', width: '100%',paddingBottom:10,backgroundColor: Colors.imageUploadBackColor  }:  { height: '100%', width: '100%' }]}
                    containerStyle={[styles['centerItems'],Platform.OS === 'android' ? { height: '100%', width: '100%',paddingBottom:10 } :  { flex: 1, width: '100%', height: '90%' }]}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    // onScroll={handleWebViewScroll}
                    onMessage={(event) => {
                        if (event.nativeEvent.data === 'success') {
                            setTimeout(() => {
                                if (route.params?.onClose) {
                                    route.params.onClose(); // callback to previous screen
                                } 
                            }, 500);
                        }
                    }}
                />
            </View>
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
            {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
        </View>
    )
};

export default AccountCloser;
