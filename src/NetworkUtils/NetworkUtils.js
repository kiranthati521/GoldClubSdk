
import store from '../redux/store/store';
import NetInfo from "@react-native-community/netinfo";
import { DEVICE_TOKEN, FCM_TOKEN, MOBILE_NUMBER, MODULENAME, ROLENAME, USER_ID, USER_NAME, getAppVersion, getAppVersionCode, getDeviceId, retrieveData } from "../assets/Utils/Utils";
import { Platform } from "react-native";
import { strings } from "../strings/strings";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from '@react-native-firebase/messaging';
import { EventRegister } from 'react-native-event-listeners';
import { MAP_MY_INDIA_KEY } from '../helpers/URLConstants';
import { selectUser } from '../redux/store/slices/UserSlice';
import { translate } from '../Localisation/Localisation';
import { useSelector } from 'react-redux';

const REQUEST_TIMEOUT = 60000;

export async function checkJSON(response) {
    try {
        const responseJson = await response.json();
        return responseJson
    } catch (error) {
        return ""
    }
}


export async function GetApiHeaders() {
    const state = store.getState(); 
    const userData = selectUser(state);
    var userId = await getUserIdFromStorage();
    var mobileNumber = await retrieveData(MOBILE_NUMBER);
    var userName = await retrieveData(USER_NAME);
    var deviceId = await getDeviceId();
    var fcmToken = await retrieveData(FCM_TOKEN)
    var appVersion = await getAppVersion();
    var appVersionCode = await getAppVersionCode();
    var deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
    let roleTypeCheck = await retrieveData(ROLENAME)
    let applicationName = strings.VyaparMitraTwo
    const language = state.language;
    const moduleName = await retrieveData(MODULENAME)  // added 15092025 bcz of points dropdown only need to show some 1.0 value
    // alert(roleTypeCheck)

    console.log(roleTypeCheck,"check roleee")
    const { languageCode, languageName, languageId } = language;
    let langID;
    if (roleTypeCheck) {
        if ((roleTypeCheck === 'Retailer' || roleTypeCheck === 'Distributor')) {
            langID = languageId || '1'
        } else {
            langID = '1';
        }
    } else {
        langID = languageId || '1'
    }


    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'deviceId': deviceId,
        "deviceType": Platform.OS,
        "appVersionCode": Number.parseInt(appVersionCode),
        "appVersionName": appVersion,
        'userId': userId,
        'mobileNumber': mobileNumber,
        'fcmToken': fcmToken,
        'deviceToken': deviceToken,
        'userName': userName,
        'applicationName':applicationName,
        "userCompanyCode": userData[0]?.companyCode,
        "companyCode": userData[0]?.companyCode,
        languageId: langID  || '1',
        moduleName: moduleName || ''
    };
    return headers;

}
export async function GetApiHeaderswithLoginResponse(loginData) {
    console.log("fetched response is", loginData);
    const logggedData = loginData;
    var userId = logggedData.id;
    var mobileNumber = logggedData.mobileNumber;
    var userName = logggedData.roleName == 'Retailer' ? logggedData.proprietorName : logggedData.name;
    var deviceId = await getDeviceId();
    var fcmToken = await messaging().getToken();;
    var appVersion = await getAppVersion();
    var appVersionCode = await getAppVersionCode();
    var deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN)

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'deviceId': deviceId,
        "deviceType": Platform.OS,
        "appVersionCode": Number.parseInt(appVersionCode),
        "appVersionName": appVersion,
        'userId': userId,
        'mobileNumber': mobileNumber,
        'fcmToken': fcmToken,
        'deviceToken': deviceToken,
        'userName': userName
    };
    console.log("fetching dynamic response is",headers);
    return headers;

}

export async function GetRequest(url, headers) {
    console.log("🔹 URL:", url);
    console.log("🧾 Headers:", JSON.stringify(headers, null, 2));

    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (response.status == 200 || response.status == 412) {
                const responseJson = await response.json();

                // console.log(url + "Get Resp ---> " + JSON.stringify(responseJson));
                console.log("URL ===> ", url + "\nHeaders ===> " + JSON.stringify(headers) + "\nResponse ===> ", JSON.stringify(responseJson));
                if (responseJson?.statusCode == 601) {
                    forceLogoutUser();
                    return responseJson;
                }

                return (responseJson)

            //     if (responseJson?.statusCode === 0) {
            //         return constructFailureObject(translate('network_request_failed_code_0'));
            //     } else if (responseJson?.statusCode == 601) {
            //         forceLogoutUser();
            //         return responseJson;
            //     }
            //     return responseJson;

            // case 404:
            //     return constructFailureObject(translate('no_http_resource_found'));

            // case 401:
            //     return constructFailureObject(translate('unauthorised_request'));

            // case 500:
            //     return constructFailureObject(translate('internal_server_error'));

            // case 503:
            //     return constructFailureObject(translate('server_down'));

            // case 504:
            //     return constructFailureObject(translate('request_timed_out'));
            // case 601:
            //     forceLogoutUser()
            //     return constructFailureObject(translate('something_went_wrong'));
            } else {
                if (response.status == 404) {
                    return constructFailureObject(translate('no_http_resource_found'));
                } else if (response.status == 401) {
                    return constructFailureObject(translate('unauthorised_request'));
                } else if (response.status == 500) {
                    return constructFailureObject(translate('internal_server_error'));
                } else if (response.status == 503) {
                    return constructFailureObject(translate('server_down'));
                } else if (response.status == 504) {
                    return constructFailureObject(translate('request_timed_out'));
                } else if (response.status == 601) {
                    forceLogoutUser();
                    return constructFailureObject(translate('something_went_wrong'));
                } else {
                    return constructFailureObject(translate('something_went_wrong'));
                }
            }
        } catch (error) {
            console.log("this is the error in the get")
            console.log(error.message);
            return constructFailureObject(translate('something_went_wrong'))
        }
    } else {
        // SimpleToast.show(translate('no_internet_conneccted'))
    }
}

export async function PostRequest(url, headers, inputObject) {
    
    /* var networkStatus = await getNetworkStatus();
    if (!networkStatus) {
        return constructFailureObject(translate('no_internet_conneccted'));
    } */

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(inputObject),
        });
       
        switch (response?.status) {
            case 200:
            case 201:
            case 412:
                const responseJson = await response.json();
                console.log("URL ===>", url);
                console.log("Headers ===>", JSON.stringify(headers));
                console.log("Input Request ===>", JSON.stringify(inputObject));
                console.log("Response ===>", JSON.stringify(responseJson));


                // Check if the response body contains statusCode 0
                if (responseJson?.statusCode === 0) {
                    return constructFailureObject(translate('network_request_failed_code_0'));
                } else if (responseJson?.statusCode == 601) {
                    forceLogoutUser();
                    return responseJson;
                }
                return responseJson;

            case 404:
                return constructFailureObject(translate('no_http_resource_found'));

            case 401:
                return constructFailureObject(translate('unauthorised_request'));

            case 500:
                return constructFailureObject(translate('internal_server_error'));

            case 503:
                return constructFailureObject(translate('server_down'));

            case 504:
                return constructFailureObject(translate('request_timed_out'));
            case 601:
                forceLogoutUser()
                return constructFailureObject(translate('something_went_wrong'));

            default:
                console.log('Unexpected response status code:', response.status);
                return constructFailureObject(translate('something_went_wrong'));
        }

    } catch (error) {
        console.error('Network or server error:', error);

        // Handle network request failure specifically
        // if (error instanceof TypeError && error.message === "Failed to fetch") {
        //     return constructFailureObject("Network request failed: Network request failed");
        // }else if(error instanceof TypeError && error.message)

        return constructFailureObject(translate('request_failed_with_message'));
    }
}

export async function getUserIdFromStorage() {
    var userId = await retrieveData(USER_ID);
    userId = userId.toString()
    return userId;
}
export async function getUserNameFromStorage() {
    var userName = await retrieveData(USER_NAME);
    userName = userName.toString()
    return userName;
}

export async function getUserMobileNoFromStorage() {
    var userMobileNo = await retrieveData(MOBILE_NUMBER);
    userMobileNo = userMobileNo.toString()
    return userMobileNo;
}

export async function getNetworkStatus() {
    const response = await NetInfo.fetch();
    global.isNetworkConnected = response.isInternetReachable
    return response.isConnected;
}


export function toUrlEncodedString(obj) {
    const keyValuePairs = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            keyValuePairs.push(
                encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
            );
        }
    }
    return keyValuePairs.join('&');
}


function constructFailureObject(message) {
    message = (message == undefined) ? translate('something_went_wrong') : message
    var newResponse = {
        statusCode: 0,
        message: message,
        Message: message,
        Status: ""
    }

    return newResponse
}


function forceLogoutUser() {
    EventRegister.emit('LogoutEvent', 'logOut')

}

export async function GetApiHeadersWithoutUserId() {
    var headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        //  'Authorization': `Bearer ${MAP_MY_INDIA_KEY}`
    };
    return headers;

}

export const uploadFormData = async (formData, url, headers) => {
    console.log("🔹 URL:", url);
    console.log("📦 Request:", JSON.stringify(formData, null, 2));
    console.log("🧾 Headers:", JSON.stringify(headers, null, 2));

    try {
        const response = await axios.post(url, formData, {
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("URL ==> ", url);
        console.log("Headers ==> ", headers);
        console.log("Request ==> ", formData);
        console.log("Response ==> ", response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading form data:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
};


