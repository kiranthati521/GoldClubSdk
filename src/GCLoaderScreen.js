import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DEVICE_TOKEN, EDITDATA, LOGINONCE, MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, SELECTEDCOMPANY, TERMS_CONDITIONS, USERMENU, USER_ID, USER_NAME, WHATSAPPCHECKED, downloadFileToLocal, getDeviceId, retrieveData, storeData } from './assets/Utils/Utils';
import APIResponse from './assets/Utils/verifyOtp.json';
import { useNavigation } from '@react-navigation/native';
import { setUser } from './redux/store/slices/UserSlice';
import { updateCompanyStyles } from './redux/store/slices/CompanyStyleSlice';
import { useDispatch, useSelector } from 'react-redux';

const GCLoaderScreen = () => {

    const navigation = useNavigation()
    const dispatch = useDispatch();
    useEffect(() => {

        const init = async () => {
            var verifyOTPResponse = APIResponse?.response;
            console.log('verifyOTPResponse is', verifyOTPResponse)
            if (verifyOTPResponse != undefined && verifyOTPResponse != null && verifyOTPResponse.length > 0) {

                dispatch(setUser(verifyOTPResponse))
                storeData(USER_ID, verifyOTPResponse[0].id);
                storeData(USER_NAME, verifyOTPResponse[0].roleName == 'Retailer' ? verifyOTPResponse[0].proprietorName : verifyOTPResponse[0].name);
                storeData(MOBILE_NUMBER, verifyOTPResponse[0].mobileNumber);
                storeData(DEVICE_TOKEN, "");
                storeData(LOGINONCE, true)
                storeData(USERMENU, verifyOTPResponse[0].userMenuControl);
                storeData(PROFILEIMAGE, verifyOTPResponse[0].profilePic)
                storeData(ROLEID, verifyOTPResponse[0].roleId);
                storeData(ROLENAME, verifyOTPResponse[0].roleName)
                storeData(SELECTEDCOMPANY, verifyOTPResponse[0].companyLogoPath);

                const tempSlectedObject = {};
                tempSlectedObject.primaryColor = (verifyOTPResponse[0]?.primaryColor != undefined && verifyOTPResponse[0]?.primaryColor != "") ? verifyOTPResponse[0]?.primaryColor : Colors.buttonColorPurple;
                tempSlectedObject.secondaryColor = (verifyOTPResponse[0]?.secondaryColor != undefined && verifyOTPResponse[0]?.secondaryColor != "") ? verifyOTPResponse[0]?.secondaryColor : Colors.white;
                tempSlectedObject.textColor = (verifyOTPResponse[0]?.textColor != undefined && verifyOTPResponse[0]?.textColor != "") ? verifyOTPResponse[0]?.textColor : Colors.black;
                tempSlectedObject.disableColor = (verifyOTPResponse[0]?.disableColor != undefined && verifyOTPResponse[0]?.disableColor != "") ? verifyOTPResponse[0]?.disableColor : Colors.lightgrey;
                tempSlectedObject.iconPrimaryColor = (verifyOTPResponse[0]?.iconPrimaryColor != undefined && verifyOTPResponse[0]?.iconPrimaryColor != "") ? verifyOTPResponse[0]?.iconPrimaryColor : Colors.buttonColorPurple;
                if (verifyOTPResponse[0].loaderPath !== null && verifyOTPResponse[0].loaderPath !== "" && verifyOTPResponse[0].loaderPath !== undefined) {
                    const filePath = await downloadFileToLocal(verifyOTPResponse[0]?.loaderPath, verifyOTPResponse[0]?.loaderPath?.split('/').pop())
                    tempSlectedObject.loaderPath = filePath != undefined && filePath != null && filePath != "" ? filePath : ""
                } else {
                    tempSlectedObject.loaderPath = ''
                }
                if (tempSlectedObject) {
                    if (tempSlectedObject != undefined) {
                        setTimeout(() => {
                            dispatch(updateCompanyStyles(tempSlectedObject))
                        }, 1500)
                    }
                }

                let navigateTo = (verifyOTPResponse[0]?.roleName === 'Retailer' || verifyOTPResponse[0]?.roleName === 'Distributor') ? 'RetailerDashboard' : 'Dashboard';
                navigation.reset({
                    index: 0,
                    routes: [{
                        name: navigateTo,
                        params: { userData: {} }
                    }]
                })
            }
        }

        init()
    }, [])


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    )
}


export default GCLoaderScreen