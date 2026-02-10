import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  useWindowDimensions,
  ScrollView
} from 'react-native';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { GetApiHeaders, PostRequest } from "../NetworkUtils/NetworkUtils";
import { HTTP_OK, configs } from "../helpers/URLConstants";
import moment from 'moment';
import SimpleToast from 'react-native-simple-toast';
import CustomLoader from '../Components/CustomLoader';
import CustomSuccessLoader from '../Components/CustomSuccessLoader';
import CustomErrorLoader from '../Components/CustomErrorLoader';
import { ROLENAME, retrieveData } from '../assets/Utils/Utils';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { selectUser } from '../redux/store/slices/UserSlice';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';
import MediaModal from '../Modals/MediaModal';

var styles = BuildStyleOverwrite(Styles);

function Notification() {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const dispatch = useDispatch();
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [loading, setLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('');
  const [errorLoadingMessage, setErrorLoadingMessage] = useState('');
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [mediaVisible, setMediaVisible] = useState(false);
  const [mediaLink, setMediaLink] = useState(null);
  const networkStatus = useSelector(state => state.networkStatus.value);
  const [selectedParentIndex, setSelectedParentIndex] = useState(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState(null);
  const [roleType, setRoleType] = useState(undefined);
  const [notificationData, setNotificationData] = useState(null);

  useEffect(() => {
    GetNotificationDetailsApiCall();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      handleFocus();
      return () => console.log('Screen unfocused');
    }, [networkStatus])
  );

  const handleFocus = async () => {
    const roleTypeDetails = await retrieveData(ROLENAME);
    setRoleType(roleTypeDetails);
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: roleType === 'Retailer' || roleType === 'Distributor'
              ? 'RetailerDashboard'
              : 'Dashboard'
          }
        ],
      });
    }
  };

  // const goBack = () => {
  //   let navigateTo =
  //     roleType === 'Retailer' || roleType === 'Distributor'
  //       ? 'RetailerDashboard'
  //       : 'Dashboard';
  //   navigation.navigate(navigateTo);
  // };

  const GetNotificationDetailsApiCall = async () => {
    if (!networkStatus) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage(translate('please_wait_getting_data'));

      const getloginURL = configs.BASE_URL + configs.NOTIFICATIONS.GET_NOTIFICATIONS;
      const getHeaders = await GetApiHeaders();
      const dataList = {
        userId: getHeaders.userId,
        mobileNumber: getHeaders.mobileNumber
      };

      const APIResponse = await PostRequest(getloginURL, getHeaders, dataList);

      setLoading(false);
      setLoadingMessage('');

      if (APIResponse && APIResponse.statusCode === HTTP_OK) {
        setNotificationData(APIResponse);
      } else {
        SimpleToast.show(APIResponse?.message || 'Error loading notifications');
      }
    } catch (error) {
      setLoading(false);
      setErrorLoading(true);
      setErrorLoadingMessage(error.message);
    }
  };

  const handleLongPress = (parentIndex, childIndex) => {
    setSelectedParentIndex(parentIndex);
    setSelectedChildIndex(childIndex);
  };

  const handlePress = async (item) => {
    setSelectedParentIndex(null);
    setSelectedChildIndex(null);

    if (!networkStatus) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }

    try {
      const getloginURL = configs.BASE_URL + configs.NOTIFICATIONS.READ_NOTIFICATION;
      const getHeaders = await GetApiHeaders();
      const dataList = { id: item?.id, active: false };
      const APIResponse = await PostRequest(getloginURL, getHeaders, dataList);

      if (APIResponse.statusCode === HTTP_OK) {
        GetNotificationDetailsApiCall();
      }
    } catch (error) {
      setErrorLoading(true);
      setErrorLoadingMessage(error.message);
    }
  };

  const handleDeleteNotification = async (item) => {
    if (!networkStatus) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }

    try {
      const getloginURL = configs.BASE_URL + configs.NOTIFICATIONS.DELETE_NOTIFICATION;
      const getHeaders = await GetApiHeaders();
      const dataList = { id: item?.id };

      const APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
      if (APIResponse.statusCode === HTTP_OK) {
        setSelectedParentIndex(-1);
        GetNotificationDetailsApiCall();
      }
    } catch (error) {
      setErrorLoading(true);
      setErrorLoadingMessage(error.message);
    }
  };

  /** ✅ Detect links inside plain text and make them clickable */
  const DescriptionText = ({ description = '', active = false, style }) => {
    const regex = /(https?:\/\/[^\s]+)/g;
    const parts = description.split(regex);
    console.log('Description parts:', description);
    const openLink = async (url) => {
      try {
        await Linking.openURL(url);
      } catch (err) {
        console.warn('Error opening URL:', err);
      }
    };

    return (
      <Text
        style={[
          {
            color: active ? Colors.textColor || '#000' : Colors.grey,
            fontSize: 14,
            lineHeight: 20,
          },
          style,
        ]}
      >
        {parts.map((part, index) => {
          const isLink = regex.test(part);
          if (isLink) {
            return (
              <Text
                key={index}
                style={{
                  color: Colors.blue,
                  textDecorationLine: 'underline',
                }}
                onPress={() => openLink(part)}
                onStartShouldSetResponder={() => true}
              >
                {part}
              </Text>
            );
          } else {
            return (
              <Text key={index}>
                {part}
              </Text>
            );
          }
        })}
      </Text>
    );
  };

  const renderNotification = (item, childIndex, parentIndex) => {
    const isSelected = selectedParentIndex === parentIndex && selectedChildIndex === childIndex;
    const parsedTime = moment(item?.time, "HH:mm:ss");
    const formattedTime = parsedTime.format("hh:mm A");
    console.log("item?.time", item?.time)

    return (
      <View style={{ backgroundColor: Colors.white, padding: 5, width: '100%', borderRadius: 8, elevation: 1 }}>
        <TouchableOpacity
          style={{ width: '100%' }}
          onPress={() => handlePress(item)}
          onLongPress={() => handleLongPress(parentIndex, childIndex)}
        >
          <View style={{ width: '95%', padding: 5, marginTop: 10 }}>
            <Text style={{
              color: item?.active ? dynamicStyles.textColor : Colors.grey,
              fontSize: 16,
              fontWeight: '600',
              // lineHeight: Platform.OS = 'android' ? 45 : 30,
            }}>
              {item?.title?.replace(".", "")}
            </Text>

            {/* ✅ Clickable links inside description */}
            <DescriptionText description={item?.description} active={true} />

            <View style={{ top: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                {(roleType == 'Retailer' || roleType == 'Distributor') &&
                  item?.notificationType?.toLowerCase() == translate('ekyc').toLowerCase() && (
                    <Text style={{
                      fontSize: 14,
                      color: item?.kycStatus?.toLowerCase() == strings.approve.toLowerCase()
                        ? Colors.green
                        : item?.kycStatus?.toLowerCase() == translate('reject').toLowerCase()
                          ? Colors.red
                          : Colors.buttonOrange
                    }}>
                      Status: {item?.kycStatus}
                    </Text>
                  )}
              </View>
              <Text style={{ color: Colors.grey, fontSize: 12 }}>{item?.time}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <TouchableOpacity style={{ position: 'absolute', end: 1, top: 2 }} onPress={() => handleDeleteNotification(item)}>
            <Image source={require('../assets/images/deleteCircle.png')} style={{ height: 35, width: 35 }} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const Renderingdata = (item, parentIndex) => {
    const parsedDate = moment(item?.notificationDate, "DD-MMM-YYYY h.mm A");
    const formattedDate = parsedDate.format("DD-MMM-YYYY");
    const dayOfWeek = parsedDate.format("dddd");

    return (
      <View style={{ paddingHorizontal: 20, width: '100%' }}>
        <Text style={{
          color: Colors.grey,
          alignSelf: 'center',
          marginBottom: 5,
          fontSize: 12
        }}>
          {dayOfWeek} {formattedDate}
        </Text>

        {item?.notifications &&
          <FlatList
            data={item?.notifications}
            renderItem={({ item, index }) => renderNotification(item, index, parentIndex)}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={<View style={{ height: 10 }} />}
          />}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.imageUploadBackColor }}>
      {Platform.OS === 'android' &&
        <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

      {/* Header */}
      <View style={{
        backgroundColor: dynamicStyles.primaryColor,
        padding: 20,
        borderBottomStartRadius: 10,
        borderBottomEndRadius: 10,
        paddingTop: Platform.OS === 'ios' ? 60 : 20
      }}>
        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => goBack()}>
          <Image
            style={{ tintColor: dynamicStyles.secondaryColor, height: 15, width: 20, top: 5 }}
            source={require('../assets/images/previous.png')}
          />
          <Text style={{
            marginLeft: 10,
            color: dynamicStyles.secondaryColor,
            fontSize: 18,
            fontWeight: '700'
          }}>
            {translate('notifications')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={{ marginBottom: Platform.OS === 'android' ? 100 : 50 }}>
        <View style={{ flex: 1 }}>
          {notificationData?.response?.notificationsList?.length > 0 ? (
            <FlatList
              data={notificationData?.response?.notificationsList}
              renderItem={({ item, index }) => Renderingdata(item, index)}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={<View style={{ height: 10 }} />}
              style={{ marginTop: 20, marginBottom: 35 }}
            />
          ) : (
            <View>
              <Text style={{
                color: Colors.black,
                textAlign: 'center',
                marginTop: 100,
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {translate('no_notifcations')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Media Viewer */}
      <MediaModal
        visible={mediaVisible}
        link={mediaLink}
        onClose={() => setMediaVisible(false)}
        loaderColor={dynamicStyles?.primaryColor || Colors.app_theme_color}
      />

      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
      {errorLoading && <CustomErrorLoader loading={errorLoading} message={errorLoadingMessage} />}
    </View>
  );
}

export default Notification;
