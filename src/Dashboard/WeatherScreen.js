import { Platform, Text, StatusBar, View, FlatList, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, PermissionsAndroid, Linking } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { strings } from "../strings/strings";
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import { GetApiHeaders, getNetworkStatus, GetRequest, PostRequest } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, MAP_MY_INDIA_URL, configs } from '../helpers/URLConstants';
import SimpleToast from 'react-native-simple-toast';
import CustomCalanderSelection from "../Components/CustomCalanderSelection";
import CustomLoader from '../Components/CustomLoader';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from 'axios';
import CustomInputDropDown from '../Components/CustomInputDropDown';
import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomCircularProgress from '../Components/CustomCircularProgress';
import { Colors } from '../assets/Utils/Color';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { createStyles } from '../assets/style/createStyles';
import { checkIfGpsEnabled } from '../assets/Utils/Utils';
var styles = BuildStyleOverwrite(Styles);

const WeatherScreen = ({ route }) => {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);

  const [cropList, setCropList] = useState(null)
  const [SowingDate, setSowingDate] = useState('')
  const [showDatePicker, setDatePicker] = useState(false);
  const [dropDownData, setdropDownData] = useState();
  const [showDropDowns, setShowDropDowns] = useState(false)
  const [dropDownType, setDropDownType] = useState("");
  const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(moment().format("LT"));
  const itemData = route?.params?.itemData;
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const navigation = useNavigation()
  const FILTERS = [translate('fifteenDaysForecast'), translate('Hourly')];
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const [selectedWeather, setSelectedWeather] = useState('');
  const { latitude, longitude } = useSelector((state) => state.location);
  const [localLatitude, setLocalLatitude] = useState(null)
  const [localLongitude, setLocalLongitude] = useState(null)
  const [localAddress, setLocalAddress] = useState(null)
  const [forecastData, setForecastData] = useState(null)
  const [weatherIsVisible, setWeatherIsVisible] = useState(false)
  const [title, setTitle] = useState((route?.params?.enablePestForecast === true) ? translate('PestForecast') : translate('Weather'))
  const [hourlyData, setHourlyData] = useState(null)
  const [cityDet, setCityDet] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [selectedCropId, setSelectedCropId] = useState(null)
  const [pestForecastData, setPestForecastData] = useState(null)
  const [mapZoomingLevel, setMapZoomingLevel] = useState(18)

  useEffect(() => {
    getCropsList()
    getWeatherData()
    const interval = setInterval(() => {
      setCurrentTime(moment().format("LT"));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getCropsList()
  }, [cityDet?.state]);

  let getWeatherData = useCallback(async (lat = null, long = null) => {
    var networkStatus = await getNetworkStatus()
    setTimeout(() => {
      setLoading(true)
      setLoadingMessage(translate('please_wait_getting_data'))
    }, 500)
    if (networkStatus) {
      try {
        var getloginURL = configs.BASE_URL + configs.MASTERS.getWeatherDetailsV1;
        var getHeaders = await GetApiHeaders();
        var dataList = {
          "userId": getHeaders.userId,
          'mobileNumber': getHeaders.mobileNumber,
          "latitude": lat ? lat : latitude,
          "longitude": long ? long : longitude
        }
        console.log('headers For weather =========> ', getHeaders)
        console.log('Input Request =======> ', dataList)
        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        console.log("SAINATH", JSON.stringify(APIResponse));
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
              setLoadingMessage()
            }, 1000)
            setTimeout(async () => {
              var dashboardResp = APIResponse.response
              console.log('dddddddddddddddddddddddddd sefdwkelnfjk', JSON.stringify(dashboardResp));
              setForecastData(dashboardResp?.dailyBaseWeatherInfo)
              setHourlyData(dashboardResp?.hourlyBaseWeatherInfo)
              setWeatherIsVisible(APIResponse?.response?.isVisible)
              let res = await getDetailsFromLatlong(lat ? lat : latitude, long ? long : longitude)
              console.log(res, "<------------------ res")
              setCityDet(res)
            }, 100);
          }
          else if (APIResponse.statusCode == 601) {
            SimpleToast.show(APIResponse?.message)
          }
          else {
            setTimeout(() => {
              setLoading(false)
              setLoadingMessage()
            }, 1000)
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 1000);
        }
      }
      catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 500);
      } finally {
        setTimeout(() => {
          setLoading(false)
          setLoadingMessage()
        }, 1000)
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }, [latitude, longitude])


  const nextFiveDays = itemData?.weeklyForecast
    ? itemData.weeklyForecast
      .map((day) => ({
        date: moment(day.date, 'DD-MMM-YYYY HH:mm:ss').format('D-MMM'),
        temperature: `${Math.round(day.max_temp || 0)}°`,
        icon: day.icon,
        day: day.day,
        weather_description: day.weather_description
      }))
      .sort((a, b) => {
        if (a.day === 'Today') return -1;
        if (b.day === 'Today') return 1;
        return moment(a.date, 'D-MMM').isBefore(moment(b.date, 'D-MMM')) ? -1 : 1;
      })
    : [];

  const formattedDate = moment().format('DD-MMM-YYYY')

  const todayForecast = forecastData?.forecast?.filter((data) => {
    return data?.day === 'Today'
  })

  const otherDaysForecast = forecastData?.forecast?.filter((data) => {
    return data?.day !== 'Today'
  })

  const handleRemedy = (item) => {
    navigation.navigate('Remedyrecommendation', { data: item, cropName: selectedCrop })
  }

  async function showPopup() {
    try {

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: translate("Location_Permission"),
            message: translate('need_to_access'),
            buttonNeutral: translate('storagePermissionNeutral'),
            buttonNegative: translate('storagePermissionNegative'),
            buttonPositive: translate("storagePermissionPositive")
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission granted");
          const gpsEnabled = await checkIfGpsEnabled();
          if (gpsEnabled) {
            navigation.navigate('Location', { primaryColor: dynamicStyles.primaryColor, secondaryColor: dynamicStyles.secondaryColor, textColor: dynamicStyles.textColor, screen: "WeatherScreen", address: localAddress, latitude: localLatitude !== null ? localLatitude : latitude, longitude: localLongitude !== null ? localLongitude : longitude, zoom: mapZoomingLevel })
          }
        } else {
          console.log("Location permission denied");
          showPermissionDeniedAlert();
        }
      } else {
        const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (permission === RESULTS.GRANTED) {
          console.log("iOS location permission granted");
          navigation.navigate('Location', { primaryColor: dynamicStyles.primaryColor, secondaryColor: dynamicStyles.secondaryColor, textColor: dynamicStyles.textColor, screen: "WeatherScreen", address: localAddress, latitude: localLatitude !== null ? localLatitude : latitude, longitude: localLongitude !== null ? localLongitude : longitude, zoom: mapZoomingLevel })
        } else {
          console.log("iOS location permission denied");
          showPermissionDeniedAlert();
        }
      }

    } catch (err) {
      console.warn(err, "<--------");
    }
  }

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      translate('Location_Permission_Required'),
      translate("deny_desc"),
      [
        { text: translate('open_settings'), onPress: () => Linking.openSettings() },
        { text: translate('storagePermissionNegative'), style: 'cancel' },
      ]
    );
  };

  const getSections = (data) => {
    if (!data) return [];

    // First, merge all objects in the array into a single object
    const mergedData = data.reduce((acc, dayData) => {
      return { ...acc, ...dayData };
    }, {});

    // Then use your existing logic
    return Object.keys(mergedData)?.map((dayTitle) => ({
      title: dayTitle,
      data: mergedData[dayTitle],
    }));
  };
  const hourlyDataArr = getSections(hourlyData);

  useFocusEffect(
    React.useCallback(() => {
      console.log('screen focused')
      console.log(route.params)
      let callApi = async () => {
        if (route?.params?.latitudes) {
          const { latitudes, longitudes, address, zoom } = route?.params;
          latitudes !== undefined && setLocalLatitude(latitudes);
          longitudes !== undefined && setLocalLongitude(longitudes);
          setMapZoomingLevel(zoom);
          setLocalAddress(address)
          setTimeout(() => {
            getWeatherData(latitudes, longitudes)
          }, 200)
          let res = await getDetailsFromLatlong(latitudes, longitudes)
          console.log(res, "<------------------ res")
          setCityDet(res)
          setSelectedCrop(null);
          setSowingDate('');
          setPestForecastData(null)
        }
        if (route?.params?.enablePestForecast === true) {
          setSelectedFilter(translate('PestForecast'))
        }
      }
      callApi()
    }, [route?.params])
  );

  useEffect(() => {
    if (SowingDate !== '' && selectedCrop !== null) {
      setPestForecastData(null)
      getDiseasesFromMap()
    }
  }, [SowingDate, selectedCrop])

  let getDiseasesFromMap = async () => {
    //getPestInformation
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))
        var getYeildCalcURL = configs.BASE_URL + configs.MASTERS.getPestInformation;
        var getHeaders = await GetApiHeaders()
        // localLatitude !== null ? localLatitude : latitude, longitude: localLongitude  !== null ? localLongitude : longitude
        var APIResponse = await PostRequest(getYeildCalcURL, getHeaders, {
          "latitude": localLatitude !== null ? localLatitude : latitude,
          "longitude": localLongitude !== null ? localLongitude : longitude,
          "crop": selectedCrop,
          "sowingDate": moment(SowingDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
          "state": cityDet?.state
        }
        );
        // var APIResponse = await GetRequest(getYeildCalcURL, getHeaders);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse?.response?.pestForecast.length >= 0) {
            var masterResp = APIResponse?.response
            let pestForecastList = masterResp?.pestForecast
            setPestForecastData(pestForecastList)
          }
          else {
            setTimeout(() => {
              setLoadingMessage()
              setLoading(false)
            }, 1000);
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
        SimpleToast.show(error.message)
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const getDetailsFromLatlong = async (latitude, longitude) => {
    const url = MAP_MY_INDIA_URL;
    try {
      let urll = `${url}?lat=${latitude}&lng=${longitude}`
      const response = await axios.get(urll);
      console.log(response.data.results, ",,,,,,, res from rev geo code")
      if (response.data && response.data.results) {
        const { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality } = response.data.results[0];
        return { pincode, state, district, poi, subDistrict, village, formatted_address, locality, subLocality };
      } else {
        console.warn('No results found from reverse geocoding');
        return null;
      }
    } catch (error) {
      console.error('Error fetching reverse geocode data:', error.message);
      return null;
    }

  }

  const openToDatePicker = () => {
    if (selectedCrop) {
      setDatePicker(true)
    } else {
      SimpleToast.show(translate('please_select_crop'))
    }
  }

  const handleConfirm = (date) => {
    var selectedDate = moment(date).format('DD-MM-YYYY');
    setSowingDate(selectedDate);
    setSelectedDate(date);
    setDatePicker(false);
  }


  const handleCancel = () => {
    setDatePicker(false)
  }

  const changeDropDownData = (dropDownData, type, selectedItem) => {
    setShowDropDowns(true);
    setdropDownData(dropDownData);
    setDropDownType(type);
    setSelectedDropDownItem(selectedItem);
  }

  const onSelectedCrop = async (item) => {
    setSelectedCrop(item.name)
    setSelectedCropId(item?.id);
    setSowingDate('')
    setPestForecastData(null)
    setShowDropDowns(false);
    setSelectedDate(new Date())
  }

  const getCropsList = async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var getYeildCalcURL = configs.BASE_URL + configs.PLANNING_TOOL.getPestForecastCrops;
        var getHeaders = await GetApiHeaders()
        let stateCheck = await getDetailsFromLatlong(localLatitude !== null ? localLatitude : latitude, localLongitude !== null ? localLongitude : longitude)
        setCityDet(stateCheck)
        var APIResponse = await PostRequest(getYeildCalcURL, getHeaders, {
          "latitude": localLatitude !== null ? localLatitude : latitude,
          "longitude": localLongitude !== null ? localLongitude : longitude,
          "state": stateCheck?.state
        });
        console.log(JSON.stringify(APIResponse), "<------------ crop list in weather")
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            var masterResp = APIResponse.response
            if (masterResp != undefined && masterResp != null) {
              setCropList(masterResp?.pestForecastCropsList)
            }
          }
          else {
            setTimeout(() => {
              setLoadingMessage()
              setLoading(false)
            }, 1000);
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
        SimpleToast.show(error.message)
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }


  return (
    <View style={[styleSheetStyles.flexFull, styleSheetStyles.gray300bg]}>
      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
      <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { width: "100%", paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[{ flexDirection: "row", alignItems: "center", maxWidth: "55%" }]} onPress={() => navigation.goBack()}>
          <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, marginRight: 10 }]} source={require('../assets/images/previous.png')}></Image>
          <Text style={[{ color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{title}</Text>
        </TouchableOpacity>
      </View>

      {
        showDatePicker && (
          <DateTimePickerModal
            isVisible={true}
            mode="date"
            is24Hour={false}
            // minimumDate={new Date()}
            // date={new Date(selectedDate)}
            date={selectedDate}
            onConfirm={(date) => { handleConfirm(date) }}
            onCancel={() => handleCancel()}
          // onTouchStart={new Date(selectedDate)}
          />
        )
      }
      {showDropDowns &&
        <CustomListViewModal
          dropDownType={dropDownType}
          listItems={dropDownData}
          selectedItem={selectedDropDownItem}
          onSelectedCrop={(item) => onSelectedCrop(item)}
          closeModal={() => setShowDropDowns(false)} />}

      {selectedFilter === translate('fifteenDaysForecast') && forecastData && <View style={[styleSheetStyles.weatherInfoCard]}>
        <View style={[styleSheetStyles.locationTimeContainer, { marginBottom: 0, }]}>
          <View style={[styleSheetStyles.locationContainer, { flexDirection: "column", alignItems: "center", }]}>
            <Text style={[stylesheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor, marginHorizontal: 0, textAlign: "left", alignSelf: "flex-start" }, Platform.OS === 'ios' && styles['font_size_16_semibold']]}>
              {todayForecast[0]?.displayDay || '--'}
            </Text>
            <Text style={[stylesheetStyles.rangeText, styles['font_size_11_regular']]}>
              {todayForecast[0]?.date || '--'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => {
            console.log(localLatitude, "localLatitude")
            console.log(localLongitude, "localLongitude")
            showPopup()
          }} style={[styleSheetStyles.locationContainer, { marginTop: -responsiveHeight(4) }]}>
            <Image source={require('../../src/assets/images/weatherScreen/locationImg.png')} style={styleSheetStyles.locationIcon} />
            <Text style={[styleSheetStyles.locationText, styles['font_size_12_semibold'], { color: dynamicStyles.textColor }]}>
              {(todayForecast[0]?.city) || '--'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styleSheetStyles.weatherDetails}>
          <View style={styleSheetStyles.weatherDescriptionContainer}>
            <Image source={{ uri: todayForecast[0]?.image }} style={styleSheetStyles.weatherIcon} />
            <View style={styleSheetStyles.weatherDescription}>
              <Text style={[styleSheetStyles.weatherDescText, styles['font_size_9_semibold'], { color: 'rgba(255, 181, 1, 1)', minWidth: "80%" }, styles['font_size_15_semibold']]}>
                {todayForecast[0]?.weather_description || "--"}
              </Text>
              {todayForecast[0]?.max_temp ? <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[stylesheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor, fontSize: 34 }]}>
                  {Math.round(todayForecast[0]?.max_temp)}
                </Text>
                <Text style={[styleSheetStyles.degreeText, { color: dynamicStyles.textColor, marginTop: -3 }, styles['font_size_12_semibold'],]}>{"°c"}</Text>
              </View> : <Text style={[styleSheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor }]}>
                {'--'}
              </Text>}

              <View style={styleSheetStyles.tempRange}>
                {todayForecast[0]?.max_temp ?
                  <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
                    <Text style={[styleSheetStyles.rangeText, styles['font_size_14_regular'], { color: '#d3d3d3' }]}>
                      {`${translate('High')} ${Math.round(todayForecast[0]?.max_temp)}`}
                    </Text>
                    <Text style={[styleSheetStyles.degree2Text, { color: '#d3d3d3' }, styles['font_size_14_regular']]}>{"°"}</Text>
                  </View> :

                  <Text style={[styleSheetStyles.tempText, styles['font_size_15_semibold'], { color: '#d3d3d3' }]}>
                    {'--'}
                  </Text>}
                <View style={styleSheetStyles.divider} />
                {todayForecast[0]?.min_temp ?
                  <View style={{ flexDirection: "row", alignItems: 'center', marginLeft: 5 }}>
                    <Text style={[styleSheetStyles.rangeText, styles['font_size_14_regular'], { color: '#d3d3d3' }]}>
                      {`${translate('Low')} ${Math.round(todayForecast[0]?.min_temp)}`}
                    </Text>
                    <Text style={[styleSheetStyles.degree2Text, { color: '#d3d3d3' }, styles['font_size_14_regular']]}>{"°"}</Text>
                  </View> :

                  <Text style={[styleSheetStyles.tempText, styles['font_size_15_semibold'], { color: '#d3d3d3' }]}>
                    {'--'}
                  </Text>}
              </View>
            </View>
          </View>
        </View>

        <View style={styleSheetStyles.weatherStats}>
          <View style={styleSheetStyles.weatherStatItem}>
            <Image source={require('../../src/assets/images/weatherScreen/lineimg.png')} style={styleSheetStyles.weatherStatIcon} />
            <Text style={[styleSheetStyles.weatherStatText, styles['font_size_12_bold'], { color: dynamicStyles.textColor }]}>
              {todayForecast[0]?.speed ? `${todayForecast[0]?.speed}/h` : '--'}
            </Text>
          </View>
          <View style={styleSheetStyles.divider} />
          <View style={styleSheetStyles.weatherStatItem}>
            <Image source={require('../../src/assets/images/weatherScreen/dropImg.png')} style={styleSheetStyles.weatherStatIcon} />
            <Text style={[styleSheetStyles.weatherStatText, styles['font_size_12_bold'], { color: dynamicStyles.textColor }]}>
              {todayForecast[0]?.humidity ? `${todayForecast[0]?.humidity}%` : '--'}
            </Text>
          </View>
          <View style={styleSheetStyles.divider} />
          <View style={styleSheetStyles.weatherStatItem}>
            <Image source={require('../../src/assets/images/weatherScreen/rainImg.png')} style={styleSheetStyles.weatherStatIcon} />
            <Text style={[styleSheetStyles.weatherStatText, styles['font_size_12_bold'], { color: dynamicStyles.textColor }]}>
              {todayForecast[0]?.rain !== undefined ? `${todayForecast[0]?.rain}%` : '--'}
            </Text>
          </View>
        </View>
      </View>}

      {weatherIsVisible && <View style={{ flexDirection: "row", alignSelf: "flex-end", marginRight: "5%", marginBottom: 15, marginTop: 15 }}>
        <TouchableOpacity onPress={() => {
          setSelectedFilter(translate('fifteenDaysForecast'))
          setSelectedWeather('')
        }} activeOpacity={0.5} style={[selectedFilter === translate('fifteenDaysForecast') ? {
          marginRight: "2%",
          backgroundColor: dynamicStyles.primaryColor,
          borderRadius: 5,
          alignItems: "center",
          justifyContent: "center",
          minWidth: '28%',
          minHeight: "4%",
          width: "37%",
        } :
          {
            borderWidth: 1,
            borderColor: dynamicStyles.primaryColor,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            minWidth: '28%',
            minHeight: "4%",
            marginRight: "2%",
            width: "37%",
          }
        ]}>
          <Text style={[styles['font_size_10_regular'], {
            marginTop: 1, color:
              selectedFilter === translate('fifteenDaysForecast') ? dynamicStyles.secondaryColor : dynamicStyles.primaryColor
          }, Platform.OS === 'ios' && styles['font_size_10_semibold'],]}>{translate('fifteenDaysForecast')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setSelectedFilter(translate('Hourly'))
          if (hourlyDataArr) {
            // alert(JSON.stringify(hourlyDataArr[0]))
            setSelectedWeather(hourlyDataArr[0])
          }
        }} activeOpacity={0.5} style={[
          selectedFilter === translate('Hourly') ?
            {
              backgroundColor: dynamicStyles.primaryColor,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
              minWidth: '25%',
              minHeight: "4%"
            } :
            {
              borderWidth: 1,
              borderColor: dynamicStyles.primaryColor,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
              minWidth: '25%',
              minHeight: "4%"
            }]}>
          <Text style={[styles['font_size_10_regular'], {
            marginTop: 1, color:
              selectedFilter === translate('Hourly') ? dynamicStyles.secondaryColor : dynamicStyles.primaryColor
          }, Platform.OS === 'ios' && styles['font_size_10_semibold'],]}>{translate('Hourly')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setSelectedFilter(translate('PestForecast'))
          if (hourlyDataArr) {
            // alert(JSON.stringify(hourlyDataArr[0]))
            setSelectedWeather(hourlyDataArr[0])
          }
        }} activeOpacity={0.5} style={[
          { marginLeft: 10 },
          selectedFilter === translate('PestForecast') ?
            {
              backgroundColor: dynamicStyles.primaryColor,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
              minWidth: '25%',
              minHeight: "4%"
            } :
            {
              borderWidth: 1,
              borderColor: dynamicStyles.primaryColor,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
              minWidth: '25%',
              minHeight: "4%"
            }]}>
          <Text style={[styles['font_size_10_regular'], {
            marginTop: 1, color:
              selectedFilter === translate('PestForecast') ? dynamicStyles.secondaryColor : dynamicStyles.primaryColor
          }, Platform.OS === 'ios' && styles['font_size_10_semibold'],]}>{translate('PestForecast')}</Text>
        </TouchableOpacity>
      </View>}
      {selectedFilter === translate('PestForecast') ?
        <ScrollView>
          <View
            style={[styleSheetStyles.weatherInfoCard, { marginBottom: 5, marginTop: !(weatherIsVisible) ? responsiveHeight(3) : 5, padding: 10 }]}>
            <View style={[styleSheetStyles.locationTimeContainer, { marginBottom: 0, }]}>
              <View style={[styleSheetStyles.locationContainer, { flexDirection: "column", alignItems: "center", }]}>
                <Text style={[stylesheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor, marginHorizontal: 0, textAlign: "left", alignSelf: "flex-start" }, Platform.OS === 'ios' && styles['font_size_15_semibold']]}>
                  {translate('Location_Details')}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => {
                  setSelectedDate(new Date())
                  showPopup()
                }} style={styleSheetStyles.locationContainer}>
                  <Image source={require('../../src/assets/images/weatherScreen/locationImg.png')} style={styleSheetStyles.locationIcon} />
                </TouchableOpacity></View>
            </View>
            <View style={{ backgroundColor: "rgba(242, 246, 249, 1)", height: 1, width: "100%", alignSelf: "center", marginVertical: 5 }} />
            <Text style={[styleSheetStyles.forecastTemp, { color: dynamicStyles.textColor, }, styles['font_size_12_regular']]}>
              {translate("forecastDesc")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
              <View>
                <Text style={[styleSheetStyles.forecastTemp, { color: 'rgba(93, 93, 93, 1)' }, styles['font_size_10_regular']]}>{translate('state')}</Text>
                <Text style={[styleSheetStyles.forecastTemp, { color: dynamicStyles.textColor }, styles['font_size_11_bold']]}>{cityDet?.state || '--'}</Text>
              </View>
              <View>
                <Text style={[styleSheetStyles.forecastTemp, { color: 'rgba(93, 93, 93, 1)' }, styles['font_size_10_regular']]}>{translate('district')}</Text>
                <Text style={[styleSheetStyles.forecastTemp, { color: dynamicStyles.textColor }, styles['font_size_11_bold']]}>{cityDet?.district || '--'}</Text>
              </View>
              <View>
                <Text style={[styleSheetStyles.forecastTemp, { color: 'rgba(93, 93, 93, 1)' }, styles['font_size_10_regular']]}>{translate('village')}</Text>
                <Text style={[styleSheetStyles.forecastTemp, { color: dynamicStyles.textColor }, styles['font_size_11_bold']]}>{cityDet?.village || cityDet?.locality || translate('not_available')}</Text>
              </View>
            </View>
            <View style={{ backgroundColor: "rgba(242, 246, 249, 1)", height: 1, width: "100%", alignSelf: "center", marginTop: responsiveHeight(2), marginBottom: responsiveHeight(0.5) }} />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={[styles['centerItems'], { width: '45%' }]}>
                <CustomInputDropDown
                  width={[]}
                  defaultValue={(selectedCrop != translate('crop')) ?
                    selectedCrop : translate('crop')}
                  // defaultValue={selectedCrop}
                  labelName={translate('crop')}
                  IsRequired={false}
                  placeholder={translate('crop')}
                  placeholderTextColor="#888888"
                  onEndEditing={async event => {
                    // calculateTotalOrderValue()
                  }}
                  onFocus={() => {
                    // let updatedCompanyList = cropList.filter((x) => {
                    //   return x.companyCode === selectedCompanyId
                    // })
                    // changeDropDownData(updatedCompanyList, strings.crop, selectedCrop)
                    changeDropDownData(cropList, strings.crop, selectedCrop)
                  }}
                />
              </View>
              <View style={[styles['centerItems'], { width: '45%' }]}>
                <CustomCalanderSelection
                  // width={{ width: '100%' }}
                  defaultValue={SowingDate}
                  labelName={translate('SowingDate')}
                  placeholder={translate('select')}
                  IsRequired={true}
                  onEndEditing={event => {
                  }}
                  onFocus={openToDatePicker}
                />
              </View>
            </View>
            {pestForecastData && <View style={{ marginTop: responsiveHeight(2) }}>
              <View style={{ borderWidth: 1, borderColor: "rgba(242, 246, 249, 1)", paddingHorizontal: 10, paddingVertical: 10, borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_12_bold']]}>{translate('PestDiseases')}</Text>
              </View>
              <View style={{ borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, paddingHorizontal: 10, paddingVertical: 10, borderColor: "rgba(242, 246, 249, 1)", borderBottomRightRadius: 10, borderBottomLeftRadius: 10 }}>
                {/* <View style ={{flex : 1}}> */}
                <FlatList
                  data={pestForecastData}
                  scrollEnabled={true}
                  ListEmptyComponent={<>
                    <View style={{
                      alignItems: "center",
                      justifyContent: "center",
                      height: responsiveHeight(10)
                    }}>
                      <Text style={[styles['font_size_14_semibold'], {
                        color: Colors.lightish_grey,
                        textAlign: "center"
                      }]}>
                        {translate('no_pests_detected')}
                      </Text>
                    </View>
                  </>}
                  renderItem={({ item, index }) => {
                    return (
                      <>
                        <TouchableOpacity style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }, pestForecastData.length - 1 !== index && { marginBottom: 10 }]} onPress={() => handleRemedy(item)}>
                          <Image style={{ height: 50, width: 50, resizeMode: "cover", borderRadius: 10 }} source={{ uri: item?.imageUrl }} />
                          <View style={{ width: 1, height: "80%", backgroundColor: "rgba(242, 246, 249, 1)" }} />
                          <View style={{ width: '50%' }}>
                            <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_10_bold']]}>{item?.pests}</Text>
                            {item?.description && <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_9_regular']]}>{item?.description}</Text>}
                          </View>
                          <CustomCircularProgress
                            percentage={item?.percentage} radius={25} strokeWidth={6} percentageText={item?.percentage} level={item?.level}
                          />
                        </TouchableOpacity>
                        {/* {pestForecastData.length - 1 !== index && <View style={{ backgroundColor: "rgba(242, 246, 249, 1)", height: 1, width: "100%", alignSelf: "center",marginBottom:10,marginTop:5 }} />} */}
                      </>
                    )
                  }}
                  keyExtractor={item => item.id}
                />
                {/* </View> */}
              </View>
            </View>}
          </View>
        </ScrollView>
        : <FlatList
          contentContainerStyle={{}}
          data={selectedFilter === translate('fifteenDaysForecast') ? otherDaysForecast : hourlyDataArr}
          keyExtractor={(item, index) => index.toString()}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<>
            <Image style={{ height: 150, width: 150, resizeMode: "contain", alignSelf: "center", marginTop: responsiveHeight(10) }} source={require("../assets/images/weatherScreen/bigskyImg.png")} />
            <Text style={[styles['font_size_16_semibold'], {
              color: dynamicStyles?.primaryColor, alignSelf: "center", marginTop: responsiveHeight(2)
            }]}>
              {translate('NoDataFound')}
            </Text>
          </>}
          ListFooterComponent={<View style={{ height: 50 }} />}
          renderItem={({ item }) => {
            return (
              JSON.stringify(selectedWeather) === JSON.stringify(item) ?
                <View
                  style={[styleSheetStyles.weatherInfoCard, { marginBottom: 5, marginTop: 5, padding: 10 }]}>
                  <View style={[styleSheetStyles.locationTimeContainer, { marginBottom: 0, }]}>
                    <View style={[styleSheetStyles.locationContainer, { flexDirection: "column", alignItems: "center", }]}>
                      <Text style={[stylesheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor, marginHorizontal: 0, textAlign: "left", alignSelf: "flex-start" }, Platform.OS === 'ios' && styles['font_size_16_semibold']]}>
                        {selectedWeather?.data[0]?.displayDay}
                      </Text>
                      <Text style={[stylesheetStyles.rangeText, styles['font_size_11_regular']]}>
                        {moment(selectedWeather?.data[0]?.dt_txt).format('DD-MMM-YYYY')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                      <TouchableOpacity onPress={() => {
                        // navigation.navigate('Location', { primaryColor: dynamicStyles.primaryColor, secondaryColor: dynamicStyles.secondaryColor, textColor: dynamicStyles.textColor, screen: "WeatherScreen", address: localAddress, latitude: localLatitude !== null ? localLatitude : latitude, longitude: localLongitude !== null ? localLongitude : longitude,zoom: mapZoomingLevel })
                        showPopup()
                      }} style={styleSheetStyles.locationContainer}>
                        <Image source={require('../../src/assets/images/weatherScreen/locationImg.png')} style={styleSheetStyles.locationIcon} />
                        <Text style={[styleSheetStyles.locationText, styles['font_size_12_semibold'], { color: dynamicStyles.textColor }]}>
                          {(selectedWeather?.data[0]?.city) || '--'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => {
                          if (selectedWeather) {
                            setSelectedWeather('')
                            // setSelectedWeather(item)
                          } else {
                            setSelectedWeather(item)
                          }
                        }}
                        style={[{ backgroundColor: dynamicStyles.primaryColor, borderRadius: 5, padding: 5, alignItems: "center", justifyContent: "center", marginLeft: 10 }]}>
                        <Image style={[{ height: 10, width: 10, tintColor: dynamicStyles.secondaryColor }]} resizeMode='contain' source={selectedWeather === item ? require('../assets/images/up_arrow.png') : require('../assets/images/down_arow.png')}></Image>
                      </TouchableOpacity></View>
                  </View>

                  <View style={styleSheetStyles.weatherDetails}>
                    <View style={styleSheetStyles.weatherDescriptionContainer}>
                      <Image source={{ uri: selectedWeather?.data[0]?.image }} style={styleSheetStyles.weatherIcon} />
                      <View style={styleSheetStyles.weatherDescription}>
                        <Text style={[styleSheetStyles.weatherDescText, styles['font_size_9_semibold'], { color: 'rgba(255, 181, 1, 1)', minWidth: "80%" }, styles['font_size_15_semibold']]}>
                          {selectedWeather?.data[0]?.weather_description || "--"}
                        </Text>
                        {selectedWeather?.data[0]?.max_temp ? <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={[stylesheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor, fontSize: 34 }]}>
                            {Math.round(selectedWeather?.data[0]?.max_temp)}
                          </Text>
                          <Text style={[styleSheetStyles.degreeText, { color: dynamicStyles.textColor, marginTop: -3 }, styles['font_size_12_semibold'],]}>{"°c"}</Text>
                        </View> : <Text style={[styleSheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor }]}>
                          {'--'}
                        </Text>}

                        <View style={styleSheetStyles.tempRange}>
                          {selectedWeather?.data[0]?.max_temp ?
                            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
                              <Text style={[styleSheetStyles.rangeText, styles['font_size_14_regular'], { color: '#d3d3d3' }]}>
                                {`${translate('High')} ${Math.round(selectedWeather?.data[0]?.max_temp)}`}
                              </Text>
                              <Text style={[styleSheetStyles.degree2Text, { color: '#d3d3d3' }, styles['font_size_14_regular']]}>{"°"}</Text>
                            </View> :

                            <Text style={[styleSheetStyles.tempText, styles['font_size_15_semibold'], { color: '#d3d3d3' }]}>
                              {'--'}
                            </Text>}
                          <View style={styleSheetStyles.divider} />
                          {selectedWeather?.data[0]?.min_temp ?
                            <View style={{ flexDirection: "row", alignItems: 'center', marginLeft: 5 }}>
                              <Text style={[styleSheetStyles.rangeText, styles['font_size_14_regular'], { color: '#d3d3d3' }]}>
                                {`${translate('Low')} ${Math.round(selectedWeather?.data[0]?.min_temp)}`}
                              </Text>
                              <Text style={[styleSheetStyles.degree2Text, { color: '#d3d3d3' }, styles['font_size_14_regular']]}>{"°"}</Text>
                            </View> :

                            <Text style={[styleSheetStyles.tempText, styles['font_size_15_semibold'], { color: '#d3d3d3' }]}>
                              {'--'}
                            </Text>}
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styleSheetStyles.weatherStats}>
                    <View style={styleSheetStyles.weatherStatItem}>
                      <Image source={require('../../src/assets/images/weatherScreen/lineimg.png')} style={styleSheetStyles.weatherStatIcon} />
                      <Text style={[styleSheetStyles.weatherStatText, styles['font_size_12_bold'], { color: dynamicStyles.textColor }]}>
                        {selectedWeather?.data[0]?.speed ? `${selectedWeather?.data[0]?.speed}/h` : '--'}
                      </Text>
                    </View>
                    <View style={styleSheetStyles.divider} />
                    <View style={styleSheetStyles.weatherStatItem}>
                      <Image source={require('../../src/assets/images/weatherScreen/dropImg.png')} style={styleSheetStyles.weatherStatIcon} />
                      <Text style={[styleSheetStyles.weatherStatText, styles['font_size_12_bold'], { color: dynamicStyles.textColor }]}>
                        {selectedWeather?.data[0]?.humidity ? `${selectedWeather?.data[0]?.humidity}%` : '--'}
                      </Text>
                    </View>
                    <View style={styleSheetStyles.divider} />
                    <View style={styleSheetStyles.weatherStatItem}>
                      <Image source={require('../../src/assets/images/weatherScreen/rainImg.png')} style={styleSheetStyles.weatherStatIcon} />
                      <Text style={[styleSheetStyles.weatherStatText, styles['font_size_12_bold'], { color: dynamicStyles.textColor }]}>
                        {selectedWeather?.data[0]?.rain !== undefined ? `${selectedWeather?.data[0]?.rain}%` : '--'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ width: '100%', height: 1, borderBottomWidth: 0.5, borderColor: "#d3d3d3", marginTop: 10 }} />
                  <FlatList
                    data={item?.data}
                    nestedScrollEnabled={true}
                    renderItem={({ item: subItem }) => {
                      return <View style={[styleSheetStyles.forecastItem, { justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center"
                          }
                        } >
                          <Text style={[stylesheetStyles.forecastTemp, { color: dynamicStyles.textColor }, styles['font_size_12_semibold']]}>
                            {Math.round(subItem?.max_temp) || '--'}
                          </Text>
                          <Text style={[stylesheetStyles.degreeText, { color: dynamicStyles.textColor, marginTop: -3 }, styles['font_size_12_semibold'],]}>{"°c"}</Text>
                        </View>
                        <Image source={{ uri: subItem?.image }} style={styleSheetStyles.forecastIcon} />
                        {/* {subItem.weather_description === "sky is clear" ?
                        <Image source={require('../../src/assets/images/weatherScreen/sunImg.png')} style={styleSheetStyles.forecastIcon} />
                        :
                        <Image source={require('../../src/assets/images/weatherScreen/cloudySun.png')} style={styleSheetStyles.forecastIcon} />} */}
                        <Text style={[styleSheetStyles.forecastTemp, { color: dynamicStyles.textColor }, styles['font_size_14_regular']]}>
                          {subItem.time}
                        </Text>
                      </View>
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    scrollEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styleSheetStyles.flatListContainer}
                  />
                </View> :
                <TouchableOpacity
                  disabled={selectedFilter === translate('fifteenDaysForecast')}
                  activeOpacity={0.5}
                  onPress={() => {
                    // Alert.alert(item)
                    console.log(item, "<00000000000 item from hourly")
                    if (selectedWeather) {
                      setSelectedWeather('')
                      setSelectedWeather(item)
                    } else {
                      setSelectedWeather(item)
                    }
                  }}
                  style={stylesheetStyles.container}>
                  <View style={stylesheetStyles.tempContainer}>
                    {(
                      <View style={stylesheetStyles.tempWrapper}>
                        <Text style={[stylesheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor }, Platform.OS === 'ios' && styles['font_size_16_semibold']]}>
                          {selectedFilter === translate('fifteenDaysForecast') ? item?.displayDay : item?.data[0]?.displayDay || '--'}
                        </Text>
                      </View>
                    )}

                    <View style={stylesheetStyles.rangeContainer}>
                      <Text style={[stylesheetStyles.rangeText, styles['font_size_11_regular']]}>
                        {selectedFilter === translate('fifteenDaysForecast') ? item?.date : moment(item?.data[0]?.dt_txt).format('DD-MMM-YYYY') || '--'}
                      </Text>
                    </View>
                  </View>

                  <View style={stylesheetStyles.iconContainer}>
                    {<Image source={
                      selectedFilter !== translate('fifteenDaysForecast') ?
                        { uri: item?.data[0]?.image }
                        : { uri: item?.image }
                    } style={stylesheetStyles.weatherIcon} />}
                    <View style={stylesheetStyles.tempWrapper}>
                      <Text style={[stylesheetStyles.tempText, styles['font_size_15_semibold'], { color: dynamicStyles.textColor, fontSize: 27, marginTop: 10 }]}>
                        {Math.round(selectedFilter !== translate('fifteenDaysForecast') ? item?.data[0]?.max_temp : item?.max_temp) || '--'}
                      </Text>
                      <Text style={[stylesheetStyles.degreeText, { color: dynamicStyles.textColor, marginTop: 5 }, styles['font_size_12_semibold'],]}>{"°c"}</Text>
                    </View>
                  </View>
                  {selectedFilter !== translate('fifteenDaysForecast') && <View style={[{ backgroundColor: dynamicStyles.primaryColor, borderRadius: 5, padding: 5, alignItems: "center", justifyContent: "center" }]}>
                    <Image style={[{ height: 10, width: 10, tintColor: dynamicStyles.secondaryColor }]} resizeMode='contain' source={selectedWeather === item ? require('../assets/images/up_arrow.png') : require('../assets/images/down_arow.png')}></Image>
                  </View>}
                </TouchableOpacity>
            )
          }}
        />}
    </View>
  );
};

const stylesheetStyles = StyleSheet.create({
  circle: {
    height: 10,
    width: 10,
    borderRadius: 100,
    backgroundColor: "rgba(0, 177, 122, 1)",
    position: "absolute",
    right: 10,
    top: 12,
    zIndex: 100,
  },
  leafHome: {
    height: 250,
    width: 250,
    resizeMode: "contain",
    position: "absolute",
    right: -60,
    // tintColor:"transparent"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: responsiveHeight(10),
    width: "90%",
    backgroundColor: "white",
    alignSelf: "center",
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
    elevation: 5
  },
  tempContainer: {
    width: "40%"
  },
  tempWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 0
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
    marginLeft: 'auto',
  },
  tempText: { marginHorizontal: 5 },
  degreeText: { marginLeft: 2 },
  weatherIcon: { width: 50, height: 50, resizeMode: "contain", marginLeft: 2, marginRight: 10 },
  weatherDescription: { marginLeft: 5, marginTop: 1 },
  weatherDescText: { color: 'rgba(255, 181, 1, 1)', textTransform: 'capitalize', width: "100%" },
  leftLeaf: {
    height: 200,
    width: 200,
    resizeMode: "contain",
    position: "absolute",
    left: -40,
  },
  divider: { width: 1, height: '60%', backgroundColor: '#d3d3d3', marginLeft: 5 },
  degree2Text: { color: '#d3d3d3', marginTop: -5 },
  rangeText: { color: '#00000099' },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { width: 20, height: 20, resizeMode: "contain" },
  locationText: { marginLeft: 5, width: '70%' },
});

const styleSheetStyles = StyleSheet.create({
  flexFull: { flex: 1 },
  gray300bg: { backgroundColor: '#f5f5f5' },
  header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
  weatherInfoCard: {
    width: "90%",
    alignSelf: "center",
    marginTop: 30,
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    backgroundColor: "white",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
  locationTimeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { width: 20, height: 20, resizeMode: "contain" },
  locationText: { marginLeft: 5 },
  weatherDetails: { flexDirection: 'row', marginTop: 5, marginBottom: 10 },
  weatherDescriptionContainer: { flexDirection: 'row', alignItems: 'center' },
  weatherIcon: { width: 110, height: 110, resizeMode: "contain" },
  weatherDescription: { marginLeft: 35 },
  weatherDescText: { color: '#FF6A00', textTransform: 'capitalize', width: "65%" },
  tempText: { marginTop: 10 },
  degreeText: { marginTop: 35, marginLeft: 2 },
  degree2Text: {},
  tempRange: { flexDirection: 'row', justifyContent: 'space-between', width: '50%' },
  rangeText: {},
  weatherStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6 },
  weatherStatItem: { flexDirection: 'row', alignItems: 'center' },
  weatherStatIcon: { width: 20, height: 20, resizeMode: "contain" },
  weatherStatText: { marginLeft: 5 },
  divider: { width: 1, height: '100%', backgroundColor: '#d3d3d3' },
  graphContainer: { marginTop: 80, paddingHorizontal: 15 },
  fiveDayForecast: {
    marginTop: 0, paddingLeft: 20, backgroundColor: "white", padding: 20, width: '90%', alignSelf: "center", borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },
  forecastItem: { marginHorizontal: 5, paddingHorizontal: 3, marginTop: 5 },
  forecastDay: { fontSize: 10, color: '#888' },
  forecastIcon: {
    width: 40, height: 40, resizeMode: "contain", marginVertical: 3,
  },
  forecastTemp: { marginTop: 5, color: '#d3d3d3' },
  flatListContainer: { marginTop: 5 },
  chartContainer: { alignItems: 'center', marginVertical: 4 },
  chart: { marginBottom: 5, borderRadius: 10 }
});

export default WeatherScreen;
