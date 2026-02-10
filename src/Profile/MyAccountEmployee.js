import { useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, Linking, Keyboard, TouchableOpacity, PermissionsAndroid, Modal, FlatList, ScrollView } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import CustomTextInput from '../Components/CustomTextInput';
import CustomButton from '../Components/CustomButton';
import { Colors } from '../assets/Utils/Color';
import { MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, USER_ID, filterObjects, requestMultiplePermissions, retrieveData, sortObjectsAlphabetically, storeData } from '../assets/Utils/Utils';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../Components/CustomAlert';
import CustomCircularImageView from '../Components/CustomCircularImageView';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { GetApiHeaders, GetRequest, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomCalanderSelection from '../Components/CustomCalanderSelection';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import SimpleToast from 'react-native-simple-toast';
import { PERMISSIONS, check } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from "react-native-image-resizer";
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import CustomGalleryPopup from '../Components/CustomGalleryPopup';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

function MyAccountEmployee() {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const alphabetRegex = /^[A-Za-z]*$/;
    const numericRegex = /^[0-9]*$/;
    const alternateMobileNumberRegex = /^[9876][0-9]*$/
    const addressRegex = /^[A-Za-z0-9\s,'-.:]*$/
    const [loading, setLoading] = useState(false)
    const [successLoading, setSuccessLoading] = useState(false)
    const [errorLoading, setErrorLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    const [errorLoadingMessage, setErrorLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/vm_loader.gif'))
    const networkStatus = useSelector(state => state.networkStatus.value)
    const navigation = useNavigation()

    const [storeMobileNum, setStoreMobileNum] = useState('')
    const [storeUserID, setStoreUserID] = useState('')

    const [showAlert, setShowAlert] = useState(false)
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlertHeader, setShowAlertHeader] = useState(false)
    const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
    const [showAlertYesButton, setShowAlertYesButton] = useState(false)
    const [showAlertNoButton, setShowAlertNoButton] = useState(false)
    const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
    const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)

    const [firmName, setFirmName] = useState('')
    const [mobileNumber, setMobileNumber] = useState('')
    const [dateofBirth, setDateofBirth] = useState('')
    const [sendDateofBirth, setSendDateofBirth] = useState('')
    const [storeName, setStoreName] = useState('')
    const [email, setEmail] = useState('')

    const [address, setAddress] = useState('')
    const [taluk, setTaluk] = useState('')
    const [district, setDistrict] = useState('')
    const [districtID, setDistrictID] = useState('')
    const [landMark, setLandMark] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [stateID, setStateID] = useState('')
    const [pincode, setPincode] = useState('')

    const [alternativeMobileNumber, setalternativeMobileNumber] = useState('')
    const [gstNumber, setGSTNumber] = useState('')
    const [panNumber, setPANNumber] = useState('')
    const [userProfileImg, setUserProfileImg] = useState()
    const [sectionGeneralOpen, setSectionGeneralOpen] = useState(true)
    const [sectionAddressOpen, setSectionAddressOpen] = useState(false)
    const [sectionFirmInfoOpen, setSectionFirmInfoOpen] = useState(false)
    const [userDetailsData, setUserDetailsData] = useState([]);
    const [genderMaster, setgenderMaster] = useState([{ name: "Male" }, { name: "Female" }]);
    const [selectedGender, setSelectedGender] = useState(null)
    const [stateList, setStateList] = useState()
    const [districtListOriginal, setDistrictListOriginal] = useState()
    const [districtList, setDistrictList] = useState()
    const [dropDownData, setdropDownData] = useState();
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [role, setRole] = useState('')
    const [roleID, setRoleID] = useState('')
    const [roleList, setRoleList] = useState()
    const [proprietorName, setProprietorName] = useState('')

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setDatePicker] = useState(false);
    const [minimumDate, setMinDate] = useState();
    const [maximumDate, setMaxDate] = useState();
    const [documentName, setDocumentName] = useState(translate('upload_document'))
    const [documentUri, setDocumentUri] = useState("")
    const [base64Path, setBase64Path] = useState('')
    const [isItValidEmail, setIsItValidEmail] = useState(false)
    const [showSelectionModal, setShowSelectionModal] = useState(false)

    const [selectedProfile, setSelectedProfile] = useState(false)
    const [selectedPan, setSelectedPan] = useState(false)
    const [selectedGst, setSelectedGst] = useState(false)

    const [imageDataProfile, setImageDataProfile] = useState('')
    const [imageDataPan, setImageDataPan] = useState('')
    const [imageDataGst, setImageDataGst] = useState('')
    const [imageAdded, setImageAdded] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [loginRoleType, setLoginRoleType] = useState(null)
    const [employeeDetails, setEmployeeDetails] = useState(null)
    const [employeeDetailsCopy, setEmployeeDetailsCopy] = useState(null)
    const getUserData = useSelector(selectUser);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);





    const types = [
        {
            title: translate('camera'),
            id: 1
        },
        {
            title: translate('gallery'),
            id: 2
        },
    ]

    const handleLoading = () => {
        setLoading(false);
    }

    useEffect(() => {
        handleLoading();

    }, [])

    const getRoleType = async () => {
        const roleType = await retrieveData(ROLENAME)
        setLoginRoleType(roleType)
        GetUserDetailsApiCall();
        if (roleType != 'Retailer' && roleType != 'Distributor') { employeeProfileDetails(); }
    }


    useEffect(() => {
        setLoading(false)
        setLoadingMessage()
    }, [])

    useEffect(() => {
        console.log('what is in user Details', userDetailsData)
    }, { userDetailsData })

    useEffect(() => {
        if (networkStatus) {
            GetMastersApiCall()
        }
    }, [])

    const goBack = async () => {
        navigation.goBack();
    };
    gstDocumentPress = () => {
        setSelectedProfile(false)
        setSelectedPan(false)
        setSelectedGst(true)
        setShowSelectionModal(true)
    };

    panDocumentPress = () => {
        setSelectedProfile(false)
        setSelectedPan(true)
        setSelectedGst(false)
        setShowSelectionModal(true)
    };
    const getProfileDetails = async () => {
        var getMobileNumber = (await retrieveData(MOBILE_NUMBER))
        var getUserID = (await retrieveData(USER_ID))
        setStoreUserID(getUserID.toString())
    }
    const saveButtonPress = async () => {

        if (employeeDetails?.[0]?.employeeName == "") {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('select') + " " + translate('employeeName'), false, true, translate('ok'), translate('cancel'))
        } else if (!selectedGender || selectedGender == "") {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('gender'), false, true, translate('ok'), translate('cancel'))
        } else if (employeeDetails?.[0]?.alternativeMobileNumber == "") {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('alternateMobileNumber'), false, true, translate('ok'), translate('cancel'))
        } else if (employeeDetails?.[0]?.alternativeMobileNumber?.match(/[^\d]/)) {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('alternateMobileNumber'), false, true, translate('ok'), translate('cancel'))
        } else if (!(moment().diff(moment(employeeDetails?.[0]?.dateOfBirth), 'years') >= 18)) {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('dateofBirth'), false, true, translate('ok'), translate('cancel'))
        } else if (employeeDetails?.[0]?.city == "") {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('city'), false, true, translate('ok'), translate('cancel'))
        } else if (employeeDetails?.[0]?.village == "") {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('village'), false, true, translate('ok'), translate('cancel'))
        } else if (employeeDetails?.[0]?.landMark == "") {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('landMark'), false, true, translate('ok'), translate('cancel'))
        } else if (employeeDetails?.[0]?.pinCode == "") {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('pincode'), false, true, translate('ok'), translate('cancel'))
        } else if (employeeDetails?.[0]?.address == "") {
            showAlertWithMessage(translate('alert'), true, true, translate('please') + " " + translate('enter') + " " + translate('address'), false, true, translate('ok'), translate('cancel'))
        } else {
            updateApiCall()
        }
    }

    const profileImageButtonPress = () => {
        if (isEdit == true) {
            setSelectedProfile(true)
            setSelectedPan(false)
            setSelectedGst(false)
            setShowSelectionModal(true)
        }
    }

    const handleCancel = () => {
        setDatePicker(false)
    }

    const showAlertWithMessage = (title, header, heaertext, message, yesBtn, noBtn, yesText, noText) => {
        setAlertTitle(title);
        setShowAlertHeader(header);
        setShowAlertHeaderText(heaertext)
        setAlertMessage(message);
        setShowAlertYesButton(yesBtn);
        setShowAlertNoButton(noBtn);
        setShowAlertyesButtonText(yesText);
        setShowAlertNoButtonText(noText);
        setShowAlert(true)
    }


    const handleOk = () => {
        if (showAlertyesButtonText == translate('continue')) {
            setShowAlert(false)
        }
        if (showAlertyesButtonText == translate('update')) {
            if (Platform.OS == 'ios') {
                Linking.openURL(storeUrl)
            } else {
                Linking.openURL(storeUrl)
            }
        }
        setShowAlert(false)
    }


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                // Handle keyboard show event
                // Adjust your views here

            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                // Handle keyboard hide event
                // Adjust your views here
            }
        );

        // Clean up listeners
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const generalButtonPress = () => {
        setSectionGeneralOpen(!sectionGeneralOpen)
        setSectionAddressOpen(false)
        setSectionFirmInfoOpen(false)
    }

    const addressButtonPress = () => {
        setSectionGeneralOpen(false)
        setSectionAddressOpen(!sectionAddressOpen)
        setSectionFirmInfoOpen(false)
    }

    const firmInfoButtonPress = () => {
        setSectionGeneralOpen(false)
        setSectionAddressOpen(false)
        setSectionFirmInfoOpen(!sectionFirmInfoOpen)
    }

    const onSelectedRole = (item) => {
        setShowDropDowns(false);
        setRole(item.name)
        setRoleID(item.id);
        console.log('it is type01', item)
    }

    const onSelectedState = async (item) => {
        setShowDropDowns(false);
        setState(item.name)
        setStateID(item.id);
        setDistrict(translate('select'))
        setDistrictID("")

        if (item?.code.toLowerCase() == translate('all').toLowerCase()) {
            setDistrictList(sortObjectsAlphabetically(districtListOriginal, 'name'))
        } else {
            var filterDistList = await filterObjects(districtListOriginal, "stateId", item.id)
            setDistrictList(sortObjectsAlphabetically(filterDistList, 'name'))
        }
    }

    onSelectedDistrict = (item) => {
        setShowDropDowns(false);
        setDistrict(item.name)
        setDistrictID(item.id);
    }

    const GetMastersApiCall = async () => {
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getloginURL = configs.BASE_URL + configs.MASTERS.USER_MASTERS;
                var getHeaders = await GetApiHeaders();
                console.log('getloginURL is', getloginURL)
                console.log('getHeaders is', getHeaders)

                var APIResponse = await GetRequest(getloginURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.response
                        console.log('the master resp is', masterResp)
                        setRoleList(masterResp.rolesList)
                        setStateList(sortObjectsAlphabetically(masterResp?.statesList, 'name'))
                        setDistrictListOriginal(masterResp.districtsList)
                        console.log('the 002 is', stateList)
                        console.log('the 003 is', districtListOriginal)
                    }
                    else {
                        showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
                    }

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
            // SimpleToast.show(translate('no_internet_conneccted'))
        }
        if (networkStatus) {
            employeeProfileDetails();
        }
    }

    const employeeProfileDetails = async () => {
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))
                var header = await GetApiHeaders();
                var input = {
                    UserId: header?.userId,
                    mobileNumber: header?.mobileNumber,
                };
                var url = configs.BASE_URL + configs.PROFILE.EMPLOYEE_PROFILE;
                console.log("URL =>", url, " Headers =>", header, " Input =>", input);
                var apiResponse = await GetRequest(url, header, input);
                console.log('employeeDetails12213', JSON.stringify(apiResponse?.response?.usersList))
                setEmployeeDetails(apiResponse?.response?.usersList);
                setUserProfileImg(apiResponse?.response?.usersList?.[0]?.profileImage);
                storeData(PROFILEIMAGE, apiResponse?.response?.usersList?.[0]?.profileImage);
                setEmployeeDetailsCopy(apiResponse?.response?.usersList);
                if (apiResponse?.response?.usersList?.[0]?.gender) { setSelectedGender(apiResponse?.response?.usersList?.[0]?.gender) }
                setLoading(false)
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
            // SimpleToast.show(translate('no_internet_conneccted'))
        }
    }


    const updateApiCall = async () => {
        if (networkStatus) {
            try {
                setLoading(true)
                setLoadingMessage(translate('submitting_data'))

                var getloginURL = configs.BASE_URL + configs.PROFILE.UPDATE_EMPLOYEE_PROFILE;
                const roleId = await retrieveData(ROLEID)
                var getHeaders = await GetApiHeaders();
                var getUserID = (await retrieveData(USER_ID))
                var jsonData = {
                    "id": getUserID,
                    "name": employeeDetails?.[0]?.name,
                    "roleId": employeeDetails?.[0]?.roleId,
                    "mobileNumber": employeeDetails?.[0]?.mobileNumber,
                    "emailId": employeeDetails?.[0]?.emailId,
                    "dateOfBirth": employeeDetails?.[0]?.dateOfBirth,
                    "gender": selectedGender,
                    "alternativeMobileNumber": employeeDetails?.[0]?.alternativeMobileNumber,
                    "address": employeeDetails?.[0]?.address,
                    "city": employeeDetails?.[0]?.city,
                    "block": employeeDetails?.[0]?.block,
                    "village": employeeDetails?.[0]?.village,
                    "landMark": employeeDetails?.[0]?.landMark,
                    "pinCode": employeeDetails?.[0]?.pinCode,
                    "status": true,
                    "employeeId": employeeDetails?.[0]?.employeeId,
                    "countryId": employeeDetails?.[0]?.countryId,
                    "zoneId": employeeDetails?.[0]?.zoneId,
                    "regionId": employeeDetails?.[0]?.regionId,
                    "stateId": employeeDetails?.[0]?.stateId,
                    "territoryId": employeeDetails?.[0]?.territoryId,
                    "districtId": employeeDetails?.[0]?.districtId,
                    "headquarterId": employeeDetails?.[0]?.headquarterId,
                }
                const formData = new FormData();

                // Append JSON data
                formData.append('jsonData', JSON.stringify(jsonData));

                if (imageDataProfile != undefined && imageDataProfile != "") {
                    console.log('what is 0111', imageDataProfile.uri)
                    console.log('what is 0222', imageDataProfile.name)
                    formData.append('profileImage', {
                        uri: imageDataProfile.uri,
                        type: 'image/jpeg',
                        name: imageDataProfile.name
                    });
                } else if (userProfileImg != undefined && userProfileImg != "") {
                    formData.append('profileImage', {
                        uri: userProfileImg,
                        type: 'image/jpeg',
                        name: 'profileImage'
                    });
                }
                else {
                    formData.append('profileImage', "");
                }

                console.log('what is here01 url', getloginURL)
                console.log('what is here01 headers', getHeaders)
                console.log("FormData:", JSON.stringify(formData));
                var APIResponse = await uploadFormData(formData, getloginURL, getHeaders);

                console.log('complent response is:', APIResponse)
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        setTimeout(() => {
                            setLoading(false)
                            setSuccessLoading(true)
                            setSuccessLoadingMessage(translate('profileUpdatedSuccessfully'))
                        }, 1000);

                        setTimeout(async () => {
                            setSuccessLoading(false)
                            setSuccessLoadingMessage()
                            const roleTypeDetails = await retrieveData(ROLENAME)
                            if (roleTypeDetails) {
                                let navigateTo = (roleTypeDetails === 'Retailer' || roleTypeDetails === 'Distributor') ? 'RetailerDashboard' : 'Dashboard'
                                navigation.navigate(navigateTo)
                            }
                            // navigation.navigate('Dashboard')
                        }, 3000);
                    }
                    else {
                        showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
                    }

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }
    }

    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    const openCalender = () => {
        if (isEdit == true) {
            console.log("Open Calender");
            var minDate = '';
            minDate = new Date();
            minDate.setMonth(minDate.getMonth() - 432);
            setMinDate(new Date(minDate))
            setMaxDate(new Date())
            setDatePicker(true)
        }
    }


    const handleCancelAlert = () => {
        setShowAlert(false)
        //setUploadImageAlert(false)
    }
    const handleOkAlert = async () => {
        console.log('cooooooo')
        if (alertMessage == translate('submit')) {
            submitProfileUpdate(submitedJson);
            setShowAlert(false)
        }
        else if (alertMessage == translate('photo_permission_ios')) {
            if (Platform.OS == 'android') {
                // IntentLauncher.startActivity({
                //     action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
                //     data: 'package:' + pkg
                // })
                const pkg = DeviceInfo.getBundleId();
                await Linking.openSettings(); // Works for most permissions/settings screens
                // or for app-specific settings:
                await Linking.openURL(`package:${pkg}`);
            } else {
                Linking.openURL('app-settings:')
            }
        }
        else if (alertMessage == translate('camera_permission_ios')) {
            if (Platform.OS == 'android') {
                // IntentLauncher.startActivity({
                //     action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
                //     data: 'package:' + pkg
                // })
                const pkg = DeviceInfo.getBundleId();
                await Linking.openSettings(); // Works for most permissions/settings screens
                // or for app-specific settings:
                await Linking.openURL(`package:${pkg}`);
            } else {
                Linking.openURL('app-settings:')
            }
        }

        setShowAlert(false)
        // navigation.goBack()
    }

    const imageUploadBtn = () => {
        setShowSelectionModal(true)
    }
    const _renderCamera = (item, index) => {
        return (
            <TouchableOpacity style={[styles['width_90%'], styles['bg_white'], styles['centerItems']]} onPress={() => { onPressItems(item) }}>
                <Text style={[styles['font_size_12_regular'], styles['text_color_black'], styles['text_align_center'], { padding: 15 }]}>{item.title}
                </Text>
                {(index + 1 != types.length) && <View style={[styles['width_95%'], styles['centerItems'], { borderBottomWidth: 1, borderBottomColor: Colors.very_light_grey }]} />}
            </TouchableOpacity >
        )
    }
    onPressCancelBtn = () => {
        setShowSelectionModal(false)
    }

    let openCameraProfilePic = async () => {
        console.log('clciked on camera')
        setShowSelectionModal(false)
        try {
            var image = await ImagePicker.openCamera({
                cropping: false,
                includeBase64: false,
                compressImageQuality: 1.0,
                mediaType: 'photo'
            })
            var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)
            console.log(response)

            if (selectedProfile == true) {
                setImageDataProfile(response)
                setImageAdded(true)
                setUserProfileImg({ uri: response.uri })
            }
            else if (selectedPan == true) {
                setImageDataPan(response)
            }
            else if (selectedGst == true) {
                setImageDataGst(response)
            }
        } catch (err) {
            console.error(err)
        }
    }

    let openImagePickerProfilePic = async () => {
        console.log('clciked on gallery')
        setShowSelectionModal(false)
        try {
            var image = await ImagePicker.openPicker({
                cropping: false,
                includeBase64: false,
                compressImageQuality: 1.0,
                mediaType: 'photo'
            })
            var response = await ImageResizer.createResizedImage(image.path, 900, 900, "JPEG", 80, 0, null)

            if (selectedProfile == true) {
                setImageDataProfile(response)
                setImageAdded(true)
                setUserProfileImg({ uri: response.uri })
            }
            else if (selectedPan == true) {
                setImageDataPan(response)
            }
            else if (selectedGst == true) {
                setImageDataGst(response)
            }
        } catch (err) {
            console.error(err)
        }
    }

    showCameraGallery = () => {
        return (
            <Modal
                transparent={true}
                animationType='fade'
                visible={true}
                onRequestClose={() => { console.log('close modal') }}>
                <View style={[{ backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: 'center' }]} onStartShouldSetResponder={() => { }}>
                    <View style={[styles['width_100%'], styles['height_200'], styles['absolute_position'], styles['bottom_0'], styles['centerItems'], styles['border_top_left_radius_circle'], styles['border_top_right_radius_circle']]}>
                        <FlatList
                            data={types}
                            keyExtractor={(id) => id}
                            renderItem={({ item, index }) => _renderCamera(item, index)}
                            style={[styles['top_20'], styles['width_100%']]}>
                        </FlatList>
                        <TouchableOpacity style={[styles['width_90%'], styles['bg_white'], styles['height_50'], styles['centerItems'], styles['margin_bottom_10']]} onPress={() => { onPressCancelBtn() }}>
                            <Text style={[styles['default_font_size'], styles['text_color_red'], styles['text_align_center'], styles['margin_5']]}>{translate("cancel")}
                            </Text>
                            <View style={[styles['light_grey_bg_color'], styles['height_1'], styles['width_95%'], styles['centerItems'], styles['absolute_position'], styles['bottom_1']]}>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    const editButtonPress = () => {
        setIsEdit(true)
    }

    const updateEmployeeDetails = (key, value) => {
        setEmployeeDetails(prevDetails => [{
            ...prevDetails[0],
            [key]: value
        }]);
    };
    console.log('848461', new Date())

    return (
        <View style={[styles['full_screen'], styles['bg_themeRed']]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={Colors.themeRed} barStyle='dark-content' />}

            <View style={[styles[''], styles[''], { padding: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 0 }]}>
                <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
                    <Image style={[styles[''], styles[''], styles['tint_color_white'], { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], styles[''], styles['text_color_white'], styles[''], styles['font_size_18_bold']]}>{translate('myaccount')}</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles['width_100%'], styles['height_100%'], styles['flex_1']]}>

                {/* <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => { goBack() }}>
          <Image style={[styles['margin_left_20'], styles[''], styles['tint_color_white'], { height: 20, width: 25, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[styles['margin_left_10'], styles[''], styles['text_color_white'], styles[''], styles['font_size_14_bold'], { marginTop: 5 }]}>{translate('myaccount')}</Text>
        </TouchableOpacity> */}
                {/* <TouchableOpacity style={[(Platform.OS == 'ios' ? styles['top_50'] : styles['top_20']), styles['margin_10'], styles['margin_left_50']]} onPress={() => { handleBackClick() }}>
                   
          </TouchableOpacity> */}

                <Image style={[styles['margin_top_20'], styles['width_100%'], styles['height_40'], styles['bottom_minus_1']]} resizeMode='stretch' source={require('../assets/images/pyramid.png')}></Image>
                <ScrollView automaticallyAdjustKeyboardInsets={Platform.OS == 'ios' ? false : true} style={[{ height: '100%', backgroundColor: Colors.white }]}>
                    {/* <ScrollView style={[styles['width_100%'],styles['height_100%'], { flex: 1 }]}> */}
                    <View style={[styles['width_100%'], styles['bg_white'], { flex: 1, height: '100%', marginBottom: 75 }]}>
                        <View style={[styles['bg_white'], styles['width_100%'], styles['height_100%']]}>


                            <View style={[styles['top_5'], styles['align_self_center'], styles['margin_bottom_20']]}>
                                {console.log("USER_IMAGE showing", userProfileImg)}
                                <CustomCircularImageView
                                    source={userProfileImg != undefined ? (userProfileImg.toString().includes("https:") || userProfileImg.toString().includes("http:")) ? { uri: userProfileImg } : userProfileImg != "" ? { uri: imageDataProfile.uri } : require('../assets/images/profileIcon.png') : require('../assets/images/profileIcon.png')}
                                    size={95} />
                                <TouchableOpacity onPress={() => { profileImageButtonPress() }}>
                                    <Image style={[styles['margin_top_minus_30'], styles['align_self_flex_end'], styles['width_height_30']]} source={require('../assets/images/profileCamera.png')}></Image>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles['margin_top_5'], styles['height_40']]}>
                                {/* <TouchableOpacity onPress={() => { profileImageButtonPress() }}> */}
                                {/* <Text style={[styles['top_5'], styles['height_40'], styles['text_color_black'], styles['align_self_center']]}>{translate('changePicture')}</Text> */}
                                {/* </TouchableOpacity> */}

                                {isEdit != true &&
                                    <View style={[styles['absolute_position'], styles['align_self_flex_end'], styles['right_15'], styles['']]}>
                                        <TouchableOpacity onPress={() => { editButtonPress() }}>
                                            <Image style={[styles['width_height_30'], styles['align_self_flex_end'], styles['right_15']]} source={require('../assets/images/editGreen.png')}></Image>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>

                            <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>
                            <View style={[styles['shadow_box'], styles['bg_white'], styles['align_self_center'], styles['border_radius_5'], styles['margin_top_10'], { width: '90%' }]}>
                                <View style={[{ height: 40, width: '90%' }, styles['align_self_center']]}>
                                    <TouchableOpacity style={[styles['height_100%'], styles['width_100%'], styles['border_radius_8'], styles['justify_content_center'], styles['align_self_center']]} onPress={generalButtonPress}>
                                        <Text style={[styles['width_85%'], styles['text_align_left'], styles['font_size_16_semibold'], styles['text_color_black']]}>{translate('basic_information')}</Text>
                                        <View style={[styles['right_10'], styles['align_items_flex_end'], styles['absolute_position'], styles['']]}>
                                            <Image
                                                style={[{ width: 16, height: (Platform.OS == 'android') ? 16 : (Platform.OS == 'android') ? 7 : 15 }]}
                                                source={sectionGeneralOpen ? require('../assets/images/sectionUpArrow.png') : require('../assets/images/sectionDownArrow.png')} />
                                        </View>

                                    </TouchableOpacity>
                                    {/* <CustomSectionButton title={translate('basic_information')} onPress={generalButtonPress} buttonBg={Colors.white} btnWidth={"90%"} titleTextColor={Colors.black} sectionOpen={sectionGeneralOpen} isBoldText={true} /> */}
                                </View>
                                {sectionGeneralOpen == true && <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>}

                                {/* General Section */}
                                {sectionGeneralOpen == true &&
                                    <View style={[styles['align_self_center'], styles['margin_top_5']]}>
                                        {(loginRoleType != 'Retailer' && loginRoleType != 'Distributor') &&
                                            <View>
                                                <View style={[styles['margin_top_10']]}>
                                                    <CustomTextInput
                                                        style={[styles['centerItems']]}
                                                        labelName={translate('employeeId')}
                                                        IsRequired={false}
                                                        maxLength={50}
                                                        keyboardType='default'
                                                        placeholder={translate('enter') + " " + translate('employeeId')}
                                                        value={employeeDetails?.[0]?.employeeId}
                                                        editable={false}
                                                        onFocus={() => {
                                                        }}
                                                        onChangeText={(text) => { }}
                                                        onEndEditing={event => { }}
                                                    />
                                                </View>
                                                <View style={[styles['margin_top_10']]}>
                                                    <CustomTextInput
                                                        style={[styles['centerItems']]}
                                                        labelName={translate('employeeName')}
                                                        IsRequired={false}
                                                        maxLength={50}
                                                        keyboardType='default'
                                                        placeholder={translate('enter') + " " + translate('employeeName')}
                                                        value={employeeDetails?.[0]?.name}
                                                        editable={isEdit}
                                                        onFocus={() => {
                                                        }}
                                                        onChangeText={(text) => {
                                                            console.log('this is on change text email', text)
                                                            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                            if (emailPattern.test(text)) {
                                                                setIsItValidEmail(true)
                                                                console.log('Success', 'Valid email address.');
                                                            } else {
                                                                setIsItValidEmail(false)
                                                                console.log('Error', 'Please enter a valid email address.');
                                                            }
                                                            setEmail(text)
                                                        }}
                                                        onEndEditing={event => {

                                                        }}
                                                    />
                                                </View>
                                                {/* <View style={[styles['margin_top_10']]}>
                                                    <CustomTextInput
                                                        style={[styles['centerItems']]}
                                                        labelName={translate('gender')}
                                                        IsRequired={false}
                                                        maxLength={50}
                                                        keyboardType='default'
                                                        placeholder={translate('enter') + " " + translate('gender')}
                                                        value={employeeDetails?.[0]?.gender}
                                                        editable={isEdit}
                                                        onFocus={() => {
                                                        }}
                                                        onChangeText={(text) => { if (alphabetRegex.test(text)) { updateEmployeeDetails('gender', text) } }}
                                                        onEndEditing={event => { }}
                                                    />
                                                </View> */}

                                                <CustomInputDropDown
                                                    width={[{ width: '91%' }, styles['top_5'], styles['left_5'], styles['centerItems']]}
                                                    defaultValue={selectedGender != undefined ? selectedGender : translate('selectGender')}
                                                    labelName={translate('gender')}
                                                    IsRequired={false}
                                                    editable={isEdit}
                                                    placeholder={translate('selectGender')}
                                                    onEndEditing={async event => {
                                                    }}
                                                    onFocus={() => {
                                                        {
                                                            changeDropDownData(genderMaster, strings.selectGender, selectedGender)
                                                        }
                                                    }}
                                                />
                                                <View style={[styles['margin_top_10']]}>
                                                    <CustomTextInput
                                                        style={[styles['centerItems']]}
                                                        labelName={translate('email')}
                                                        IsRequired={false}
                                                        maxLength={50}
                                                        keyboardType='default'
                                                        placeholder={translate('enter') + " " + translate('email')}
                                                        value={employeeDetails?.[0]?.emailId}
                                                        editable={false}
                                                        onFocus={() => {
                                                        }}
                                                        onChangeText={(text) => { }}
                                                        onEndEditing={event => { }}
                                                    />
                                                </View>
                                                <View style={[styles['margin_top_10']]}>
                                                    <CustomTextInput
                                                        style={[styles['centerItems']]}
                                                        labelName={translate('mobile_number')}
                                                        IsRequired={false}
                                                        maxLength={50}
                                                        keyboardType='default'
                                                        placeholder={translate('enter') + " " + translate('mobile_number')}
                                                        value={employeeDetails?.[0]?.mobileNumber}
                                                        editable={false}
                                                        onFocus={() => {
                                                        }}
                                                        onChangeText={(text) => { }}
                                                        onEndEditing={event => { }}
                                                    />
                                                </View>
                                                <View style={[styles['margin_top_10']]}>
                                                    <CustomTextInput
                                                        style={[styles['centerItems']]}
                                                        labelName={translate('alternateMobileNumber')}
                                                        IsRequired={false}
                                                        maxLength={10}
                                                        keyboardType='numeric'
                                                        placeholder={translate('enter') + " " + translate('alternateMobileNumber')}
                                                        value={employeeDetails?.[0]?.alternativeMobileNumber}
                                                        editable={isEdit}
                                                        onFocus={() => {
                                                        }}
                                                        onChangeText={(text) => { if (alternateMobileNumberRegex.test(text)) { updateEmployeeDetails('alternativeMobileNumber', text) } else if (text == '') { updateEmployeeDetails('alternativeMobileNumber', text) } }}
                                                        onEndEditing={event => { }}
                                                    />
                                                </View>
                                                {!employeeDetails?.[0]?.dateOfBirth && !isEdit &&
                                                    <View style={[styles['margin_top_10']]}>
                                                        <CustomTextInput
                                                            style={[styles['centerItems']]}
                                                            labelName={translate('dateofBirth')}
                                                            IsRequired={false}
                                                            maxLength={0}
                                                            keyboardType='default'
                                                            placeholder={translate('enter') + " " + translate('dateofBirth')}
                                                            value={null}
                                                            editable={false}
                                                            onFocus={() => { }}
                                                            onChangeText={(text) => { }}
                                                            onEndEditing={event => { }}
                                                        />
                                                    </View>
                                                }
                                                {(employeeDetails?.[0]?.dateOfBirth || isEdit) &&
                                                    <View style={[styles['margin_top_10']]}>
                                                        <CustomCalanderSelection
                                                            width={[styles['width_90%']]}
                                                            defaultValue={employeeDetails?.[0]?.dateOfBirth != "" ? moment(employeeDetails?.[0]?.dateOfBirth).format('DD-MM-YYYY') : translate('select') + " " + translate('dateofBirth')}
                                                            labelName={translate('dateofBirth')}
                                                            IsRequired={true}
                                                            onEndEditing={event => {
                                                            }}
                                                            onFocus={
                                                                openCalender
                                                            }
                                                        />
                                                    </View>
                                                }
                                                {employeeDetails?.[0]?.roleName &&
                                                    <View style={[styles['margin_top_10']]}>
                                                        <CustomTextInput
                                                            style={[styles['centerItems']]}
                                                            labelName={translate('designation')}
                                                            IsRequired={false}
                                                            maxLength={50}
                                                            keyboardType='default'
                                                            placeholder={translate('enter') + " " + translate('designation')}
                                                            value={employeeDetails?.[0]?.roleName}
                                                            editable={false}
                                                            onFocus={() => {
                                                            }}
                                                            onChangeText={(text) => {
                                                                console.log('this is on change text email', text)
                                                                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                                if (emailPattern.test(text)) {
                                                                    setIsItValidEmail(true)
                                                                    console.log('Success', 'Valid email address.');
                                                                } else {
                                                                    setIsItValidEmail(false)
                                                                    console.log('Error', 'Please enter a valid email address.');
                                                                }
                                                                setEmail(text)
                                                            }}
                                                            onEndEditing={event => {

                                                            }}
                                                        />
                                                    </View>
                                                }
                                                {employeeDetails?.[0]?.zoneName &&
                                                    <View style={[styles['margin_top_10'], styles['padding_bottom_20']]}>
                                                        <CustomTextInput
                                                            style={[styles['centerItems']]}
                                                            labelName={translate('zone')}
                                                            IsRequired={false}
                                                            maxLength={50}
                                                            keyboardType='default'
                                                            placeholder={translate('enter') + " " + translate('zone')}
                                                            value={employeeDetails?.[0]?.zoneName}
                                                            editable={false}
                                                            onFocus={() => {
                                                            }}
                                                            onChangeText={(text) => {
                                                                console.log('this is on change text email', text)
                                                                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                                if (emailPattern.test(text)) {
                                                                    setIsItValidEmail(true)
                                                                    console.log('Success', 'Valid email address.');
                                                                } else {
                                                                    setIsItValidEmail(false)
                                                                    console.log('Error', 'Please enter a valid email address.');
                                                                }
                                                                setEmail(text)
                                                            }}
                                                            onEndEditing={event => {

                                                            }}
                                                        />
                                                    </View>
                                                }
                                                {employeeDetails?.[0]?.regionName &&
                                                    <View style={[styles['padding_bottom_20']]}>
                                                        <CustomTextInput
                                                            style={[styles['centerItems']]}
                                                            labelName={translate('region')}
                                                            IsRequired={false}
                                                            maxLength={50}
                                                            keyboardType='default'
                                                            placeholder={translate('enter') + " " + translate('region')}
                                                            value={employeeDetails?.[0]?.regionName}
                                                            editable={false}
                                                            onFocus={() => {
                                                            }}
                                                            onChangeText={(text) => {
                                                                console.log('this is on change text email', text)
                                                                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                                if (emailPattern.test(text)) {
                                                                    setIsItValidEmail(true)
                                                                    console.log('Success', 'Valid email address.');
                                                                } else {
                                                                    setIsItValidEmail(false)
                                                                    console.log('Error', 'Please enter a valid email address.');
                                                                }
                                                                setEmail(text)
                                                            }}
                                                            onEndEditing={event => {

                                                            }}
                                                        />
                                                    </View>
                                                }
                                                {employeeDetails?.[0]?.territoryName &&
                                                    <View style={[styles['padding_bottom_20']]}>
                                                        <CustomTextInput
                                                            style={[styles['centerItems']]}
                                                            labelName={translate('territory')}
                                                            IsRequired={false}
                                                            maxLength={50}
                                                            keyboardType='default'
                                                            placeholder={translate('enter') + " " + translate('territory')}
                                                            value={employeeDetails?.[0]?.territoryName}
                                                            editable={false}
                                                            onFocus={() => {
                                                            }}
                                                            onChangeText={(text) => {
                                                                console.log('this is on change text email', text)
                                                                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                                if (emailPattern.test(text)) {
                                                                    setIsItValidEmail(true)
                                                                    console.log('Success', 'Valid email address.');
                                                                } else {
                                                                    setIsItValidEmail(false)
                                                                    console.log('Error', 'Please enter a valid email address.');
                                                                }
                                                                setEmail(text)
                                                            }}
                                                            onEndEditing={event => {

                                                            }}
                                                        />
                                                    </View>
                                                }
                                                {employeeDetails?.[0]?.headquarterName &&
                                                    <View style={[styles['padding_bottom_20']]}>
                                                        <CustomTextInput
                                                            style={[styles['centerItems']]}
                                                            labelName={translate('headquarters')}
                                                            IsRequired={false}
                                                            maxLength={50}
                                                            keyboardType='default'
                                                            placeholder={translate('enter') + " " + translate('headquarters')}
                                                            value={employeeDetails?.[0]?.headquarterName}
                                                            editable={false}
                                                            onFocus={() => {
                                                            }}
                                                            onChangeText={(text) => {
                                                                console.log('this is on change text email', text)
                                                                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                                if (emailPattern.test(text)) {
                                                                    setIsItValidEmail(true)
                                                                    console.log('Success', 'Valid email address.');
                                                                } else {
                                                                    setIsItValidEmail(false)
                                                                    console.log('Error', 'Please enter a valid email address.');
                                                                }
                                                                setEmail(text)
                                                            }}
                                                            onEndEditing={event => {

                                                            }}
                                                        />
                                                    </View>
                                                }
                                            </View>
                                        }
                                    </View>
                                }
                            </View>
                            <View style={[styles['shadow_box'], styles['bg_white'], styles['align_self_center'], styles['border_radius_5'], styles['margin_top_10'], { width: '90%' }]}>
                                <View style={[{ height: 40, width: '90%' }, styles['align_self_center']]}>
                                    <TouchableOpacity style={[styles['height_100%'], styles['width_100%'], styles['border_radius_8'], styles['justify_content_center'], styles['align_self_center']]} onPress={addressButtonPress}>
                                        <Text style={[styles['width_85%'], styles['text_align_left'], styles['font_size_16_semibold'], styles['text_color_black']]}>{translate('address')}</Text>
                                        <View style={[styles['right_10'], styles['align_items_flex_end'], styles['absolute_position'], styles['']]}>
                                            <Image
                                                style={[{ width: 16, height: (Platform.OS == 'android') ? 16 : (Platform.OS == 'android') ? 7 : 15 }]}
                                                source={sectionAddressOpen ? require('../assets/images/sectionUpArrow.png') : require('../assets/images/sectionDownArrow.png')} />
                                        </View>

                                    </TouchableOpacity>
                                </View>
                                {sectionAddressOpen == true && <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>}
                                {/* Address Section */}
                                {sectionAddressOpen == true &&
                                    <View style={[styles['margin_top_5']]}>
                                        {/* <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View> */}

                                        {/* {employeeDetails?.[0]?.city && */}
                                        <View style={[styles['margin_top_10']]}>
                                            <CustomTextInput
                                                style={[styles['margin_top_20'], styles['centerItems']]}
                                                labelName={translate('city')}
                                                maxLength={50}
                                                IsRequired={true}
                                                keyboardType='default'
                                                placeholder={translate('enter') + " " + translate('city')}
                                                value={employeeDetails?.[0]?.city}
                                                editable={isEdit}
                                                onFocus={() => {
                                                }}
                                                onChangeText={(text) => {
                                                    if (alphabetRegex.test(text)) { updateEmployeeDetails('city', text) }
                                                }}
                                                onEndEditing={event => {

                                                }}
                                            />
                                        </View>
                                        {/* } */}
                                        {/* {employeeDetails?.[0]?.village && */}
                                        <View style={[styles['margin_top_10']]}>
                                            <CustomTextInput
                                                style={[styles['margin_top_20'], styles['centerItems']]}
                                                labelName={translate('village')}
                                                maxLength={50}
                                                IsRequired={true}
                                                keyboardType='default'
                                                placeholder={translate('enter') + " " + translate('village')}
                                                value={employeeDetails?.[0]?.village}
                                                editable={isEdit}
                                                onFocus={() => {
                                                }}
                                                onChangeText={(text) => {
                                                    if (alphabetRegex.test(text)) { updateEmployeeDetails('village', text) }
                                                }}
                                                onEndEditing={event => {

                                                }}
                                            />
                                        </View>
                                        {/* } */}

                                        {/* state
                                        <CustomInputDropDown
                                            width={[styles['width_91%'], styles['margin_top_10'], styles['centerItems']]}
                                            defaultValue={state != undefined && state != translate('select') ? state : translate('select')}
                                            labelName={translate('state')}
                                            IsRequired={true}
                                            placeholder={translate('state')}
                                            onEndEditing={async event => {
                                                // calculateTotalOrderValue()
                                            }}
                                            onFocus={() => {
                                                if (isEdit == true) {
                                                    changeDropDownData(stateList, strings.state, state)
                                                }
                                            }}
                                        /> */}

                                        {/* district
                                        <CustomInputDropDown
                                            width={[styles['width_91%'], styles['margin_top_10'], styles['centerItems']]}
                                            defaultValue={district != undefined && district != translate('select') ? district : translate('select')}
                                            labelName={translate('district')}
                                            IsRequired={true}
                                            placeholder={translate('district')}
                                            onEndEditing={async event => {
                                                // calculateTotalOrderValue()
                                            }}
                                            onFocus={() => {
                                                if (isEdit == true) {
                                                    changeDropDownData(districtList, strings.district, district)
                                                }
                                            }}
                                        /> */}
                                        {/* {employeeDetails?.[0]?.landMark && */}
                                        <View style={[styles['margin_top_10']]}>
                                            <CustomTextInput
                                                style={[styles['margin_top_20'], styles['centerItems']]}
                                                labelName={translate('landMark')}
                                                maxLength={50}
                                                IsRequired={true}
                                                keyboardType='default'
                                                placeholder={translate('enter') + " " + translate('landMark')}
                                                value={employeeDetails?.[0]?.landMark}
                                                editable={isEdit}
                                                onFocus={() => {
                                                }}
                                                onChangeText={(text) => {
                                                    if (alphabetRegex.test(text)) { updateEmployeeDetails('landMark', text) }
                                                }}
                                                onEndEditing={event => {

                                                }}
                                            />
                                        </View>
                                        {/* } */}
                                        {/* {employeeDetails?.[0]?.pinCode && */}
                                        <View style={[styles['margin_top_10'], styles['padding_bottom_20']]}>
                                            <CustomTextInput
                                                style={[styles['margin_top_20'], styles['centerItems']]}
                                                labelName={translate('pincode')}
                                                IsRequired={true}
                                                maxLength={6}
                                                keyboardType='numeric'
                                                placeholder={translate('enter') + " " + translate('pincode')}
                                                value={employeeDetails?.[0]?.pinCode}
                                                editable={isEdit}
                                                onFocus={() => {
                                                }}
                                                onChangeText={(text) => {
                                                    if (numericRegex.test(text)) { updateEmployeeDetails('pinCode', text) }
                                                }}
                                                onEndEditing={event => {

                                                }}
                                            />
                                        </View>
                                        {/* } */}
                                        {/* {employeeDetails?.[0]?.address && */}
                                        <View style={[styles['padding_bottom_20']]}>
                                            <CustomTextInput
                                                style={[styles['margin_top_20'], styles['centerItems']]}
                                                labelName={translate('address')}
                                                IsRequired={true}
                                                maxLength={50}
                                                keyboardType='default'
                                                placeholder={translate('enter') + " " + translate('address')}
                                                value={employeeDetails?.[0]?.address}
                                                editable={isEdit}
                                                onFocus={() => {
                                                }}
                                                onChangeText={(text) => {
                                                    if (addressRegex.test(text)) { updateEmployeeDetails('address', text) }
                                                }}
                                                onEndEditing={event => {

                                                }}
                                            />
                                        </View>
                                        {/* } */}
                                    </View>
                                }
                            </View>

                            {/* <CustomSectionButton title={translate('firmInformation')} onPress={firmInfoButtonPress} buttonBg={Colors.white} btnWidth={"90%"} titleTextColor={Colors.black} sectionOpen={sectionFirmInfoOpen} isBoldText={true} /> */}

                            {/* Firm Information Section */}
                            {/* {sectionFirmInfoOpen == true &&
                <View>
                  <View style={[styles['bg_lightish_grey'], styles['width_90%'], styles['height_0.5'], styles['centerItems']]} ></View>
                  <View style={[styles['margin_top_20']]}>
                    <CustomTextInput style={[styles['top_100'], styles['centerItems']]}
                      labelName={translate('alternativeNumber')}
                      IsRequired={true}
                      maxLength={10}
                      keyboardType='number-pad'
                      placeholder={translate('enter') + " " + translate('alternativeNumber')}
                      value={alternativeMobileNumber}
                      editable={isEdit}
                      onFocus={() => {
                        //console.log('this is on focus')
                      }}
                      onChangeText={(text) => {
                        console.log('this is on change text', text)
                        var enteredText = text.replace(/^[0-5][0-9]*$/gi, "");
                        enteredText = enteredText.replace(/[`a-z!@#$%^&*()_|+\-=?;:'",.₹€£¥•’<>\{\}\[\]\\\/]/gi, "");
                        setalternativeMobileNumber(enteredText)
                      }}
                      onEndEditing={(event) => {
                        if (alternativeMobileNumber.length < 10) {
                          // SimpleToast.show(translate('please') + " " + translate('enter') + " " + translate('valid') + " " + translate('mobile_number'))
                        }
                      }}
                    />
                  </View>


                  <View style={[styles['margin_top_20']]}>
                    <CustomTextInput
                      style={[styles['margin_top_20'], styles['centerItems']]}
                      labelName={translate('gstNumber')}
                      maxLength={30}
                      IsRequired={false}
                      keyboardType='default'
                      placeholder={translate('enter') + " " + translate('gstNumber')}
                      value={gstNumber}
                      editable={isEdit}
                      onFocus={() => {
                      }}
                      onChangeText={(text) => {
                        setGSTNumber(text)
                      }}
                      onEndEditing={event => {

                      }}
                    />
                  </View>

                  <View style={[styles['margin_top_10'], styles['flex_direction_row']]}>
                    <Text style={[styles['margin_top_10'], styles['height_40'], styles['text_color_grey'], styles['width_50%'], styles['margin_left_20']]}>{selectedGst == true ? translate('fileAttached') : translate('documentUpload')}</Text>
                    <TouchableOpacity style={[styles['flex_direction_row'], styles['absolute_position'], styles['right_20']]} onPress={() => { if (isEdit == true) { gstDocumentPress() } }}>
                      <Image style={[styles['width_height_30'], styles['tint_color_blue']]} source={require('../assets/images/document.png')}></Image>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles['']]}>
                    <CustomTextInput
                      style={[styles['margin_top_20'], styles['centerItems']]}
                      labelName={translate('panNumber')}
                      maxLength={10}
                      IsRequired={false}
                      keyboardType='default'
                      placeholder={translate('enter') + " " + translate('panNumber')}
                      value={panNumber}
                      editable={isEdit}
                      onFocus={() => {
                      }}
                      onChangeText={(text) => {
                        setPANNumber(text)
                      }}
                      onEndEditing={event => {

                      }}
                    />
                  </View>

                  <View style={[styles['margin_top_10'], styles['flex_direction_row']]}>
                    <Text style={[styles['margin_top_10'], styles['height_40'], styles['text_color_grey'], styles['width_50%'], styles['margin_left_20']]}>{selectedPan == true ? translate('fileAttached') : translate('documentUpload')}</Text>
                    <TouchableOpacity style={[styles['flex_direction_row'], styles['absolute_position'], styles['right_20']]} onPress={() => { if (isEdit == true) { panDocumentPress() } }}>
                      <Image style={[styles['width_height_30'], styles['tint_color_blue']]} source={require('../assets/images/document.png')}></Image>
                    </TouchableOpacity>
                  </View>
                </View>
              } */}


                            {isEdit == true &&
                                <View style={[styles['align_self_center'], styles['width_100%']]}>
                                    <CustomButton title={translate('save')} onPress={saveButtonPress} buttonBg={Colors.themeRed} btnWidth={"90%"} titleTextColor={Colors.white} />
                                </View>
                            }

                            {/* {showSelectionModal == true &&
                                showCameraGallery()
                            } */}
                            <CustomGalleryPopup
                                showOrNot={showSelectionModal}
                                onPressingOut={() => setShowSelectionModal(false)}
                                onPressingCamera={() => openCameraProfilePic()}
                                onPressingGallery={() => openImagePickerProfilePic()}
                            />
                        </View>


                    </View>

                </ScrollView>


            </View>


            {showAlert && (
                <CustomAlert
                    onPressClose={() => { handleCancelAlert() }}
                    title={alertTitle}
                    showHeader={showAlertHeader}
                    showHeaderText={showAlertHeaderText}
                    message={alertMessage}
                    onPressOkButton={() => { handleOkAlert() }}
                    onPressNoButton={() => { handleCancelAlert() }}
                    showYesButton={showAlertYesButton}
                    showNoButton={showAlertNoButton}
                    yesButtonText={showAlertyesButtonText}
                    noButtonText={showAlertNoButtonText} />
            )}

            {showDatePicker && (
                // <CustomCalendarModal
                //   labelName={translate('dateofBirth')}
                //   visible={true}
                //   mode="date"
                //   date={new Date(selectedDate)}
                //   onConfirm={(date) => { handleConfirm(date) }}
                //   onCancel={() => handleCancel()}
                //   minimumDate={new Date(minimumDate)}
                //   maximumDate={new Date(maximumDate)}
                // />
                <DateTimePickerModal
                    isVisible={true}
                    mode="date"
                    is24Hour={false}
                    date={employeeDetails?.[0]?.dateOfBirth ? new Date(employeeDetails?.[0]?.dateOfBirth) : new Date(selectedDate)}
                    maximumDate={new Date()}
                    onConfirm={(date) => { updateEmployeeDetails('dateOfBirth', date); setDatePicker(false) }}
                    onCancel={() => handleCancel()}
                />
            )}

            {showDropDowns &&
                <CustomListViewModal
                    dropDownType={dropDownType}
                    listItems={dropDownData}
                    selectedItem={selectedDropDownItem}
                    onSelectedRole={(item) => onSelectedRole(item)}
                    onSelectedState={(item) => onSelectedState(item)}
                    onSelectedDistrict={(item) => onSelectedDistrict(item)}
                    onSelectedGender={(item) => { setSelectedGender(item.name); setShowDropDowns(false); }}
                    closeModal={() => setShowDropDowns(false)} />}

            {/* {uploadImageAlert && (
        <CustomUploadDocumentAlert
          onPressClose={handleCancelAlert}
          documentTitle={"GST"}
          documentName={documentName}
          selectedImageUri={documentUri}
          onPressUploadButton={handleUploadButtonAction}
          documentButtonText={translate('upload')}
          documentObject={handleDocumentObj}
          moduleName='ds'
        />
      )} */}

            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
            {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
            {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
        </View>
    )


}

export default MyAccountEmployee;