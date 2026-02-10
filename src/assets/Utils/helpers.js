import { NativeModules, Platform } from "react-native";
// import DeviceInfo from 'react-native-device-info';
// import RNFS from 'react-native-fs';
// import { getFromAsyncStorage } from "./keychainUtils";
// import { JWTAUTHENTICATION, LANGUAGECODE, LANGUAGEID, MOBILENUMBER, ROLDID, USER_ID, USERNAME, REFERRALCODE } from ".";
// import RNFetchBlob from "rn-fetch-blob";
 
 
 
// export async function createJwtToken(req) {
//     const jsonData = JSON.stringify(req);
 
//     if (Platform.OS === 'ios') {
//         try {
//             const result = await NativeModules.JWTManager.encrypt(jsonData);
//             console.log('Encoded JWT on iOS:', result);
//             return result;
//         } catch (error) {
//             console.error('Error creating JWT on iOS:', error);
//             throw error;
//         }
//     } else if (Platform.OS === 'android') {
//         try {
//             const result = await NativeModules.JWTModule.encrypt(jsonData);
//             console.log('Encoded JWT on Android:', result);
//             return result;
//         } catch (error) {
//             console.error('Error creating JWT on Android:', error);
//             throw error;
//         }
//     } else {
//         throw new Error('Unsupported platform');
//     }
// }
 
export async function decodeJwt(jwt) {
    if (Platform.OS == 'ios') {
        try {
            const result = await NativeModules.JWTManager.decrypt(jwt);
            console.log(result)
            return result;
        } catch (error) {
            console.error(error);
        }
    } else {
        try {
            const result = await NativeModules.JWTModule.decrypt(jwt);
            console.log(result)
            return result;
        } catch (error) {
            console.error(error);
        }
    }
 
}
 
// export function toUrlEncodedString(obj) {
//     const keyValuePairs = [];
 
//     for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             keyValuePairs.push(
//                 encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
//             );
//         }
//     }
 
//     return keyValuePairs.join('&');
// }
 
// export async function getSystemVersion() {
//     let deviceId = DeviceInfo.getSystemVersion()
//     return deviceId;
// }
 
// export async function getAppVersion() {
//     let version = DeviceInfo.getVersion();
//     return version;
// }
// export async function getBuildNumber() {
//     let number = DeviceInfo.getBuildNumber();
//     return number;
// }
 
// export async function getPlatformNumber() {
//     let number = DeviceInfo.getBuildNumber();
//     return number;
// }
// export async function getAppName() {
//     let appName = DeviceInfo.getApplicationName();
//     return appName;
// }
 
// export async function getDeviceId() {
//     let deviceId = await DeviceInfo.getUniqueId()
//     return deviceId;
// }
// export async function getDeviceName() {
//     let deviceId = await DeviceInfo.getDeviceName()
//     return deviceId;
// }
 
// export async function getScale() {
//     let deviceId = await DeviceInfo.getFontScale()
//     return deviceId;
// }
 
// export async function getNotchHeight() {
//     let deviceId = DeviceInfo.hasNotch()
//     if (deviceId) {
//         if (Platform.OS === 'ios') {
//             const { height, windowPhysicalPixels } = Dimensions.get('screen');
//             console.log(windowPhysicalPixels + " check window")
//             const windowHeight = height;
//             const windowPhysicalHeight = windowPhysicalPixels.height;
 
//             const notchHeight = windowPhysicalHeight - windowHeight;
 
//             return notchHeight;
//         } else if (Platform.OS === 'android') {
//             return 0;
//         } else {
//             return 0;
//         }
//     }
 
// }
 
// export const readFileToBase64 = async (filePath) => {
//     try {
//         const fileContent = await RNFS.readFile(filePath, 'base64');
 
//         // console.log("BASE64Content", fileContent);
//         return fileContent;
//     } catch (error) {
//         console.log('Error converting file to Base64:', error);
//         return null;
//     }
// };
 
// export const stringToBoolean = (str) => {
//     return str === 'true';
// };
 
// export async function GetApiHeaders() {
 
//     var headers = {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         "userId": await getFromAsyncStorage(USER_ID),
//         'mobileNumber': await getFromAsyncStorage(MOBILENUMBER),
//         'deviceId': await getDeviceId(),
//         'fcmToken': '',
//         'appVersionCode': await getAppVersion(),
//         'appVersionName': await getAppName(),
//         'deviceToken': "",
//         'deviceType': Platform.OS,
//         'userName': await getFromAsyncStorage(USERNAME),
//         'roleId': await getFromAsyncStorage(ROLDID),
//         'languageId': await getFromAsyncStorage(LANGUAGEID),
//         'authType': JWTAUTHENTICATION,
//         'referralCode': await getFromAsyncStorage(REFERRALCODE)
 
//     };
 
//     return headers;
// }
 
// export function isNullOrEmpty(value) {
//     if (value == null || value == undefined || (typeof value == 'string' && value.trim() == '') || (Array.isArray(value) && value.length === 0)) {
//         return false
//     }
//     else {
//         return true
//     }
// }
 
// export const processResponseData = async (data, isEncoded) => {
//     if (isEncoded && isJwt(data)) {
//         console.log("Decoding JWT response", await decodeJwt(data));
//         return await decodeJwt(data);
//     } else {
//         console.log("Response is JSON");
//         return data;
//     }
// };
 
// export const isJwt = (data) => {
//     return typeof data === 'string' && data.split('.').length === 3;
// };
 
// // timeHelpers.js
 
// export const getGreetingMessage = () => {
//     const hour = new Date().getHours();
 
//     if (hour < 12) return "Good morning";
//     if (hour < 18) return "Good afternoon";
//     return "Good evening";
// };
 
// export const normalizeText = (text) => {
//     return text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
// };
 
 
// // for company logo.........
// export const downloadFileToLocal = async (shouldVisible, url, fileName) => {
//     console.log("url is here",url);
//     const { fs, config } = RNFetchBlob;
//     const dirs = fs.dirs;
 
//     // Define the path where the file will be saved
//     const path = `${shouldVisible ? dirs.DownloadDir : dirs.CacheDir}/${fileName}`;
 
//     try {
//         // Check if the file already exists
//         const fileExists = await fs.exists(path);
//         console.log(fileExists,"???")
//         if (fileExists) {
//             console.log('File already exists. Skipping download.');
//             return path;
//         }
 
//         // If the file doesn't exist, download it
//         console.log('Downloading file...');
//         const response = await config({
//             fileCache: true,
//             path: path,
//         }).fetch('GET', url);
 
//         console.log('File downloaded to:', response.path());
//         return response.path();
//     } catch (error) {
//         console.warn('Error downloading file:', error);
//         throw error;
//     }
// }