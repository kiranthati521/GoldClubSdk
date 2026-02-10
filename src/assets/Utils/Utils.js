import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions, Linking, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { PermissionsAndroid, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from "react-native-blob-util";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import Geolocation from 'react-native-geolocation-service';


export const GETSTARTED = "GETSTARTED";
export const FCM_TOKEN = "FCM_TOKEN";
export const MOBILE_NUMBER = "MOBILE_NUMBER";
export const MODULENAME = "MODULENAME";
export const COMPANY_STYLES = "COMPANY_STYLES";
export const USER_DETAILS = "USER_DETAILS"
export const USER_ID = "USER_ID";
export const USER_NAME = "USER_NAME";
export const LANGUAGE_ID = "1";
export const COUNTRY_ID = "5";
export const LANGUAGE_CODE = "en";
export const DEVICE_TOKEN = 'deviceToken';
export const YES = 'Yes';
export const NO = 'No';
export const OK = 'Ok';
export const NOTOK = 'Not Ok';
export const LOGINONCE = "LOGINONCE";
export const USERMENU = "USERMENU";
export const PROFILEIMAGE = "PROFILEIMAGE";
export const PROFILEIMAGEOFFLINE = "PROFILEIMAGEOFFLINE";
export const FAQDATA = "FAQDATA";
export const ROLENAME = "ROLENAME";
export const SELECTEDCOMPANY = "SELECTEDCOMPANY";
export const ROLEID = "ROLEID";

export const Partially_Accepted = 'Partially Accepted';
export const ASSIGNED = 'Assigned';
export const APPROVED = 'Approved';
export const INPROGRESS = 'InProgress';
export const COMPLETED = 'Completed';
export const REJECTED = 'Rejected';
export const EDITDATA = 'EditData'
export const TERMS_CONDITIONS = 'termsConditionsAccepted'
export const WHATSAPPCHECKED = 'WhatsappChecked'
export const LOADER_GIF = "LOADER_GIF";


export async function getSystemVersion() {
    let deviceId = DeviceInfo.getSystemVersion()
    return deviceId;
}

export async function getAppVersion() {
    let version = DeviceInfo.getVersion();
    console.log("APPVERSION", version);
    return version;
}
export async function getBuildNumber() {
    let number = DeviceInfo.getBuildNumber();
    return number;
}

export async function getPlatformNumber() {
    let number = DeviceInfo.getBuildNumber();
    return number;
}
export async function getAppName() {
    let appName = DeviceInfo.getApplicationName();
    return appName;
}
export async function getAppVersionCode() {
    return DeviceInfo.getBuildNumber();
}

export async function getDeviceId() {
    let deviceId = await DeviceInfo.getUniqueId()
    return deviceId;
}
export async function getDeviceName() {
    let deviceId = await DeviceInfo.getDeviceName()
    return deviceId;
}

export async function getScale() {
    let deviceId = await DeviceInfo.getFontScale()
    return deviceId;
}
export async function filterArrayOfObjects(array, field, code) {
    return array.filter(data => data[field] !== undefined && data[field] == code);
}

export async function removeItemFromArray(array, field, code) {
    return array.filter(item => item[field] !== code);
}

// export async function filterObjects(array, field, code) {
//     console.warn("crop filterting herer", array.length + "--" + field + "--" + code)
//     return array.filter(data => data[field] == code);
// }
// export async function filterArrayOfObjects2(array, field1, code1, field2, code2) {
//     console.warn("crop filterting herer", array + "--" + field1 + "--" + code1 + "--" + field2 + "--" + code2)
//     return array.filter(data => (data[field1] == code1) && (data[field2] == code2));
// }
// export async function filterArrayOfObjects3(array, field1, code1, field2, code2, field3, code3) {
//     console.warn("crop filterting herer", array + "--" + field1 + "--" + code1 + "--" + field2 + "--" + code2 + "--" + field3 + "--" + code3)
//     return array.filter(data => (data[field1] == code1) && (data[field2] == code2) && (data[field3] == code3));
// }

export async function filterObjects(array, field, code) {
    console.warn("Filtering objects here:", array.length + "--" + field + "--" + code);

    // Filter the array based on the provided field and code
    let filteredArray = array.filter(data => data[field] == code);

    // Check if the first object should be added
    if (filteredArray != null && filteredArray.length > 1 && (code == 0 || array[0].name == "All")) {
        filteredArray.unshift(array[0]);
    }

    return filteredArray;
}
export async function filterArrayOfObjects2(array, field1, code1, field2, code2) {
    console.warn("crop filterting herer", array + "--" + field1 + "--" + code1 + "--" + field2 + "--" + code2)
    let filteredArray = array.filter(data => (data[field1] == code1) && (data[field2] == code2));
    // Check if the first object should be added
    if (filteredArray != null && filteredArray.length > 1 && array[0].name == "All") {
        filteredArray.unshift(array[0]);
    }
    return filteredArray;
}
export async function filterArrayOfObjects3(array, field1, code1, field2, code2, field3, code3) {
    console.warn("crop filterting herer", array + "--" + field1 + "--" + code1 + "--" + field2 + "--" + code2 + "--" + field3 + "--" + code3)

    let filteredArray = array.filter(data => (data[field1] == code1) && (data[field2] == code2) && (data[field3] == code3));
    if (filteredArray != null && filteredArray.length > 1 && array[0].name == "All") {
        filteredArray.unshift(array[0]);
    }
    return filteredArray;
}
export const getUniqueItems = (array, propertyName) => {
    const uniqueItemsMap = new Map();
    array.forEach(item => uniqueItemsMap.set(item[propertyName], item));
    return Array.from(uniqueItemsMap.values());
};

export async function getNotchHeight() {
    let deviceId = DeviceInfo.hasNotch()
    if (deviceId) {
        if (Platform.OS === 'ios') {
            // For iOS devices with a notch
            const { height, windowPhysicalPixels } = Dimensions.get('screen');
            console.log(windowPhysicalPixels + " check window")
            const windowHeight = height;
            const windowPhysicalHeight = windowPhysicalPixels.height;

            // Calculate the notch height
            const notchHeight = windowPhysicalHeight - windowHeight;

            return notchHeight;
        } else if (Platform.OS === 'android') {
            // For Android devices with a notch (Not all Android devices have notches)
            // You may need to use a library or check the device model to determine if it has a notch
            // and its dimensions.
            // On Android, you might need to use a third-party library or native modules to detect the notch.

            // Placeholder for Android notch height calculation
            // You may need to implement this part based on your requirements.
            return 0; // Replace with actual notch height calculation logic
        } else {
            // For devices without a notch or other platforms
            return 0;
        }
    }

}

export async function storeData(key, value) {
    var isStored = false;
    try {
        AsyncStorage.setItem(key, JSON.stringify(value));
        isStored = true;
        return isStored;
    } catch (error) {
        return isStored;
    }
}

export async function retrieveData(key) {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
        // We have data!!
        return JSON.parse(value);
    }
    else
        return "";
}

export async function clearAsyncStorage() {
    console.log("clearAsyncStorage");

    RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.CacheDir + '/vm_loader.gif');
    storeData(LOGINONCE, false);
    try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared successfully.');
        return true;
    } catch (error) {
        console.error('Failed to clear AsyncStorage:', error);
        return false;
    }
}

export const getGreetingMessage = () => {
    const currentHour = new Date().getHours();
    const is24HourFormat = true;
    let greetingMessage = '';
    if (is24HourFormat) {
        if (currentHour >= 5 && currentHour < 12) {
            greetingMessage = 'Good morning';
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingMessage = 'Good afternoon';
        } else {
            greetingMessage = 'Good evening';
        }
    } else {
        const amPm = currentHour >= 12 ? 'PM' : 'AM';
        const formattedHour = currentHour % 12 || 12;
        if (currentHour >= 5 && currentHour < 12) {
            greetingMessage = `Good morning`;
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingMessage = `Good afternoon`;
        } else {
            greetingMessage = `Good evening`;
        }
    }
    return greetingMessage;
};

export const requestMultiplePermissions = async (permissions) => {
    let settingsOpened = false;

    try {
        const grantedPermissions = {};

        for (const permission of permissions) {
            let result;
            if (Platform.OS === 'android') {
                result = await PermissionsAndroid.request(permission);
            } else if (Platform.OS === 'ios') {
                console.log('iOS platform detected. Handling permission request for iOS.');
                result = 'granted'; // Adjust this logic for iOS
            } else {
                console.warn(`Unsupported platform: ${Platform.OS}`);
                result = PermissionsAndroid.RESULTS.DENIED;
            }

            grantedPermissions[permission] = result;

            if (result === PermissionsAndroid.RESULTS.GRANTED || result === 'granted') {
                console.log(`Permission ${permission} granted`);
            } else {
                console.log(`Permission ${permission} denied`);

                if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN && !settingsOpened) {
                    console.log(`Permission ${permission} denied with Never Ask Again.`);
                    settingsOpened = true;

                    let permissionName = '';
                    switch (permission) {
                        case PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE:
                            permissionName = 'Read External Storage';
                            break;
                        case PermissionsAndroid.PERMISSIONS.CAMERA:
                            permissionName = 'Camera';
                            break;
                        default:
                            permissionName = 'required permission';
                    }

                    Alert.alert(
                        'Permission Required',
                        `App needs access to your ${permissionName}. Please go to app settings and grant permission.`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => openAppSettings() },
                        ]
                    );
                }

            }
        }

        return grantedPermissions;
    } catch (err) {
        console.error(err);
        return {};
    }
};


// const openAppSettings = () => {

//     if (Platform.OS == 'android') {
//         const pkg = DeviceInfo.getBundleId()
//         IntentLauncher.startActivity({
//             action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
//             data: 'package:' + pkg
//         })
//     } else {
//         Linking.openURL('app-settings:')
//     }
// }

const openAppSettings = async () => {
    try {
        if (Platform.OS === 'android') {
            const pkg = DeviceInfo.getBundleId();
            await Linking.openSettings(); // Works for most permissions/settings screens
            // or for app-specific settings:
            await Linking.openURL(`package:${pkg}`);
        } else {
            await Linking.openURL('app-settings:');
        }
    } catch (err) {
        console.warn('Failed to open settings:', err);
    }
};

export function isNullOrEmpty(value) {
    if (value == null || value == undefined || (typeof value == 'string' && value.trim() == '') || (Array.isArray(value) && value.length === 0)) {
        return false
    }
    else {
        return true
    }
}

export const readFileToBase64 = async (filePath) => {
    try {
        const fileContent = await RNFS.readFile(filePath, 'base64');

        // console.log("BASE64Content", fileContent);
        return fileContent;
    } catch (error) {
        console.log('Error converting file to Base64:', error);
        return null;
    }
};

export const removeTags = (content) => {
    return content.replace(/<(?!b\s*\/?)[^>]+>/g, '');
};

export const extractPlainText = (html) => {
    const element = document.createElement('div');
    element.innerHTML = html;
    return element.textContent || element.innerText || '';
};

export function isHTML(str) {
    return /<[a-z][\s\S]*>/i.test(str);
}

export function capitalizeFirstLetter(inputString) {
    if (!inputString) {
        return inputString;
    }

    const capitalizedString = inputString.charAt(0).toUpperCase() + inputString.slice(1);
    return capitalizedString;
}

export function sortObjectsAlphabetically(objects, key) {
    objects.sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];

        const valueALower = valueA.toLowerCase();
        const valueBLower = valueB.toLowerCase();

        return valueALower.localeCompare(valueBLower);
    });

    // Return the sorted array
    return objects;
}

export const downloadFileToLocal = async (url, fileName) => {
    const { fs, config } = RNFetchBlob;
    const dirs = fs.dirs;

    // Define the path where the file will be saved
    const path = `${dirs.CacheDir}/${fileName}`;

    try {
        // Check if the file already exists
        const fileExists = await fs.exists(path);

        if (fileExists) {
            console.log('File already exists. Skipping download.');
            return path;
        }

        // If the file doesn't exist, download it
        console.log('Downloading file...');
        const response = await config({
            fileCache: true,
            path: path,
        }).fetch('GET', url);

        console.log('File downloaded to:', response.path());
        return response.path();
    } catch (error) {
        console.warn('Error downloading file:', error);
        throw error;
    }
}

export const isValidImageUrl = async (url) => {
    // Check if URL starts with HTTP or HTTPS
    if (!/^https?:\/\/.+\..+/i.test(url)) {
        return false;
    }

    // Check if the URL has a valid image extension
    const validExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const urlParts = url.split(".");
    const extension = urlParts[urlParts.length - 1].toLowerCase();

    if (!validExtensions.includes(extension)) {
        return false;
    }

    // Check if the image exists by making a HEAD request
    try {
        const response = await fetch(url, { method: "HEAD" });
        const contentType = response.headers.get("Content-Type");

        // Validate if response is an image
        return response.ok && contentType && contentType.startsWith("image/");
    } catch (error) {
        return false; // If request fails, URL is not valid
    }
};

export const getFileInfo = async (uri) => {
    try {
        // Check if file exists
        const fileExists = await RNFS.exists(uri);
        if (!fileExists) {
            throw new Error('File not found at: ' + uri);
        }

        // Get file name
        const fileName = uri.split('/').pop();

        // Get file extension
        const extension = fileName.split('.').pop();

        return {
            exists: true,
            name: fileName,
            extension: extension,
            path: uri,
        };
    } catch (err) {
        console.error('File error:', err.message);
        return { exists: false };
    }
};

// export const compareLocalizationKeys = (en, hin) => {
//   const enKeys = Object.keys(en);
//   const hinKeys = Object.keys(hin);

//   const missingInHindi = enKeys.filter(key => !hinKeys.includes(key));
//   const missingInEnglish = hinKeys.filter(key => !enKeys.includes(key));

//   console.log("🔴 Missing in hin.json:", missingInHindi);
//   console.log("🔴 Missing in en.json:", missingInEnglish);

//   return {
//     missingInHindi,
//     missingInEnglish,
//   };
// };

export const compareLocalizationKeys = (en, hin, mr, te) => {
    const enKeys = Object.keys(en);
    const hinKeys = Object.keys(hin);
    const marathiKeys = Object.keys(mr);
    const teluguKeys = Object.keys(te);

    // Missing in other languages compared to English
    const missingInHindi = enKeys.filter(key => !hinKeys.includes(key));
    const missingInMarathi = enKeys.filter(key => !marathiKeys.includes(key));
    const missingInTelugu = enKeys.filter(key => !teluguKeys.includes(key));

    // Keys present in other languages but missing in English
    const missingInEnglishFromHindi = hinKeys.filter(key => !enKeys.includes(key));
    const missingInEnglishFromMarathi = marathiKeys.filter(key => !enKeys.includes(key));
    const missingInEnglishFromTelugu = teluguKeys.filter(key => !enKeys.includes(key));

    const uniqueMissingInEnglish = [
        ...new Set([
            ...missingInEnglishFromHindi,
            ...missingInEnglishFromMarathi,
            ...missingInEnglishFromTelugu,
        ]),
    ];

    console.log("Missing in hin.json:", missingInHindi);
    console.log("Missing in marathi.json:", missingInMarathi);
    console.log("Missing in telugu.json:", missingInTelugu); console.log("Keys missing in en.json (but found in other languages):", uniqueMissingInEnglish);

    return {
        missingInHindi,
        missingInMarathi,
        missingInTelugu,
        missingInEnglish: uniqueMissingInEnglish,
    };
};

export const compareVersions = (v1, v2) => {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const diff = (a[i] || 0) - (b[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
};

export const getFormattedDateTime = async () => {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${day}${month}${year}${hours}${minutes}${seconds}`;
};

export const downloadFileSmart = async (moduleName, fileUrl) => {
    try {
        if (!fileUrl) return null;

        // 1) Extract filename safely
        let fileName = fileUrl.split("/").pop().split("?")[0];
        if (!fileName || fileName.trim() === "") {
            fileName = `${moduleName}_${Date.now()}.pdf`;
        }

        // 2) Create module folder inside app Documents (Safe for all Android & iOS versions)
        const moduleFolder = `${RNFS.DocumentDirectoryPath}/${moduleName}`;

        const folderExists = await RNFS.exists(moduleFolder);
        if (!folderExists) {
            await RNFS.mkdir(moduleFolder);
            console.log("📂 Created folder:", moduleFolder);
        }

        // 3) Final file path
        const localFilePath = `${moduleFolder}/${fileName}`;

        // 4) If file already exists → return it
        if (await RNFS.exists(localFilePath)) {
            console.log("✅ Already exists → Returning:", localFilePath);
            return `file://${localFilePath}`;
        }

        // 5) If it's content:// URI → copy
        if (fileUrl.startsWith("content://")) {
            await RNFS.copyFile(fileUrl, localFilePath);
            console.log("✅ Copied content URI →", localFilePath);
            return `file://${localFilePath}`;
        }

        // 6) HTTP/HTTPS download
        const result = await RNFS.downloadFile({
            fromUrl: fileUrl,
            toFile: localFilePath,
        }).promise;

        if (result.statusCode === 200) {
            console.log("✅ Download success →", localFilePath);
            return `file://${localFilePath}`;
        }

        console.log("❌ Download failed:", result.statusCode);
        return null;

    } catch (err) {
        console.log("❗ downloadFileSmart error:", err);
        return null;
    }
};

export const deleteModuleFolder = async (moduleName) => {
    try {
        const moduleFolder = `${RNFS.DocumentDirectoryPath}/${moduleName}`;
        const exists = await RNFS.exists(moduleFolder);
        if (exists) {
            await RNFS.unlink(moduleFolder);
            console.log("🧹 Deleted folder:", moduleFolder);
        }
    } catch (error) {
        console.log("❗ deleteModuleFolder error:", error);
    }
};

export const checkIfGpsEnabled = async () => {
    if (Platform.OS === "android") {
        try {
            await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                interval: 20000,
                fastInterval: 6000,
            });
            console.log("✅ GPS enabled (Android)");
            return true;
        } catch (err) {
            try {
                Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
            } catch (e) {
                Alert.alert("Enable GPS", "Please enable your device’s GPS", [
                    { text: "Cancel", style: "cancel" }
                ]);
            }
            return false;
        }
    } else {
        try {
            const authStatus = await Geolocation.requestAuthorization("whenInUse");

            if (authStatus === "granted" || authStatus === "always") {
                return new Promise((resolve) => {
                    Geolocation.getCurrentPosition(
                        () => {
                            console.log("✅ GPS enabled (iOS)");
                            resolve(true);
                        },
                        (error) => {
                            console.error("iOS getCurrentPosition error:", error);
                            if (error.code === 1) {
                                // User denied permission
                            } else {
                                Alert.alert(
                                    "Enable Location Services",
                                    "Please enable Location Services in Settings.",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        { text: "Open Settings", onPress: () => Linking.openSettings() },
                                    ]
                                );
                            }
                            resolve(false);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0,
                            distanceFilter: 0,
                        }
                    );
                });
            } else {
                Alert.alert(
                    "Permission Denied",
                    "Location permission is required. Please enable 'While Using the App' or 'Always' in Settings.",
                    [{ text: "Open Settings", onPress: () => Linking.openSettings() }]
                );
                return false;
            }
        } catch (err) {
            console.error("iOS location permission error:", err);
            Alert.alert("Location Error", "An error occurred while checking location permission.");
            return false;
        }
    }
};



