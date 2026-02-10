import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    Platform,
    TouchableOpacity,
    Image,
    Text,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getCompanyStyles } from "../redux/store/slices/CompanyStyleSlice";
import CustomButton from "../Components/CustomButton";
import { Styles } from "../assets/style/styles";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import MapplsGL from 'mappls-map-react-native';
import { MAP_MY_INDIA_URL } from '../helpers/URLConstants';
import CustomLoaderDefault from "../Components/CustomLoaderDefault";
import { translate } from "../Localisation/Localisation";
import SimpleToast from "react-native-simple-toast";
import { createStyles } from "../assets/style/createStyles";
import { Colors } from "../assets/Utils/Color";


// Mappls keys setup
MapplsGL.setMapSDKKey("hgxmpb6gldoe2jb2r3upyje5rej6v72p");
MapplsGL.setRestAPIKey("5zf2txekry89tciw19sgmjpo7w133ioj");
MapplsGL.setAtlasClientId("qwj3TMxdzY7SIXZq8s3A4xDzY3LBjO3xAepnlJFBOjA_DQ7xzJWYtgfi1mKTFeTCLePMnWjzcGfP3PeOP6QozA==");
MapplsGL.setAtlasClientSecret("NdJUAD9O1c0LyinGBY0q0A17p-U96zMmvmehrrw4OVI91FWsWwBD2VCd3HVpTBawIi_g0BxxNireuLAJZpwie4283oO0mRYf");

var styles = BuildStyleOverwrite(Styles);

const Location = ({ route }) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const { latitude, longitude } = useSelector((state) => state.location);
    const { latti, longi } = useSelector((state) => state.location);
     console.log("latitudelatitude", latitude + "   " + longitude)
    console.log("latitudelatitude11", latti + "   " + longi)
    const networkStatus = useSelector(state => state.networkStatus.value);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [locallatitudes, setLocalLatitudes] = useState(route?.params?.latitude || 0);
    let [addLoader, setAddLoader] = useState(false)
    const [locallongitudes, setLocalLongitudes] = useState(route?.params?.longitude || 0);
    const [address, setAddress] = useState(route?.params?.address || '');
    const [isMap, setIsMap] = useState(!address);
    const [screen, setScreen] = useState(route?.params?.screen);
    const [pinDance, setPinDance] = useState(false);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef(null);
    const { width, height } = Dimensions.get('window');
    const companyStyle = useSelector(getCompanyStyles);
    const navigation = useNavigation();
    const [hasCentered, setHasCentered] = useState(false);
    const [primaryColor, setPrimaryColor] = useState(route?.params?.primaryColor ?? companyStyle?.value?.primaryColor);
    const [secondaryColor, setSecondaryColor] = useState(route?.params?.secondaryColor ?? companyStyle?.value?.secondaryColor);
    const [textColor, setTextColor] = useState(route?.params?.textColor ?? companyStyle?.value?.textColor);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle?.value);
    const [zoomLevel, setZoomLevel] = useState(route?.params?.zoom || 0)
    console.log("route?.params?.zoom", JSON.stringify(route))
    const centerMap = (lat, lng, zoomIn) => {
        if (!cameraRef?.current || !lat || !lng || isUserInteracting) return;

        cameraRef.current.setCamera({
            centerCoordinate: [lng, lat],
            zoomLevel: zoomIn,
            animationDuration: 1000,
        });
    };

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            onMapLoad();
        }, 500);
    }, [])

    const goSignup = () => {
        navigation.goBack();
    };

    const onMapLoad = () => {
        setIsMapReady(true);
        console.log("hasCentered", hasCentered)
        if (hasCentered) return;

        if (route.params?.latitude && route.params?.longitude) {
            centerMap(route?.params?.latitude, route.params.longitude, zoomLevel);
            // setMarkerLat(route.params.latitude);
            // setMarkerLng(route.params.longitude);
            setLoading(false);
            setHasCentered(true);
        }

    };

    useFocusEffect(
        React.useCallback(() => {
            console.log('screen focused', route?.params);
            setHasCentered(false); // reset on screen focus

            if (route?.params?.address && route?.params?.latitude && route?.params?.longitude) {
                setIsMap(false);
                setAddress(route?.params?.address);
                setLoading(false);
            }
            else {
                if (route.params?.address == null || route.params?.address == "") {
                    onMapLoad();
                }
            }
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [networkStatus, route?.params])
    );

    const onMapError = (error) => {
        console.log('Map error:', error);
    };

    const onMapRegionChange = (event) => {
        console.log("fetched events are", event);
        if (event?.properties?.isUserInteraction === false) {
            return
        }
        const [longitude, latitude] = event?.geometry?.coordinates || [];
        setLocalLatitudes(latitude);
        setLocalLongitudes(longitude);
    };
    console.log("checakingLocalLatitude=-=-=>", locallatitudes, locallongitudes)

    const onRegionWillChange = () => {
        setIsUserInteracting(true);
    };

    const onRegionDidChange = (region) => {
        setZoomLevel(region.properties.zoomLevel)
        setIsUserInteracting(false);
    };

    const handleBackToCurrentLocation = async () => {
        console.log("latitudelatitude12", latitude + " " + longitude)
        const isValid = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);
        console.log("latitudelatitude13", isValid)
        if (!isValid) {
            SimpleToast.show('Location not ready yet. Please wait...', SimpleToast.LONG);
            return;
        }
        // if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        //     SimpleToast.show('Location not ready yet. Please wait...', SimpleToast.LONG);
        //     return;
        // }

        setPinDance(false);
        setLocalLatitudes(latitude)
        setLocalLongitudes(longitude)
        cameraRef.current?.setCamera({
            centerCoordinate: [longitude, latitude],
            zoomLevel: 15,
            animationDuration: 1000,
        });
    };

    const reverseGeocode = async (latitude, longitude) => {
        console.log("mathed geocode", latitude, longitude);
        const url = MAP_MY_INDIA_URL;
        setAddLoader(true)
        try {
            let urll = `${url}?lat=${latitude}&lng=${longitude}`
            const res = await fetch(urll);
            const response = await res.json();
            setAddLoader(false)
            return response;
        } catch (err) {
            console.error('Reverse geocode error:', err);
            return null;
        }
    };

    const handlePickLocation = async () => {
        if (!isMap) {
            setIsMap(true);
            return;
        }

        const data = await reverseGeocode(locallatitudes, locallongitudes);
        console.log("fetched local latitude and longitude", locallatitudes, locallongitudes);
        if (data?.results?.length > 0) {
            console.log(data, "<------------------- reverse geo code response")
            const place = data.results[0];

            if (place?.formatted_address) {
                console.log('Valid place selected:', place?.formatted_address);
                setAddress(place?.formatted_address);

                if (locallatitudes && locallongitudes && place?.formatted_address) {
                    navigation.navigate(screen, {
                        latitudes: locallatitudes,
                        longitudes: locallongitudes,
                        address: place.formatted_address,
                        zoom: zoomLevel,
                        locationWHoleData: place
                    });
                }
            } else {
                Alert.alert(translate('InvalidSelection'), translate('Please_select_a_valid_land_location'),
                    [
                        { text: translate("ok"), onPress: () => console.log("OK Pressed") }
                    ]
                );
            }
        } else {
            Alert.alert(translate('Error'), translate('Failed_to_get_address_from_location'));
        }
    };
    return (
        <>
            <View
                style={{
                    backgroundColor: screen === 'SignUp' ? primaryColor : dynamicStyles?.primaryColor,
                    paddingStart: 20,
                    paddingEnd: 20,
                    paddingBottom: 20,
                    borderBottomStartRadius: 10,
                    borderBottomEndRadius: 10,
                    paddingTop: Platform.OS === 'ios' ? 60 : 20,
                }}
            >
                <TouchableOpacity style={styles['flex_direction_row']} onPress={goSignup}>
                    <Image
                        style={{
                            tintColor: screen === 'SignUp' ? secondaryColor : dynamicStyles?.secondaryColor,
                            height: 15,
                            width: 20,
                            top: 5,
                        }}
                        source={require('../assets/images/previous.png')}
                    />
                    <Text
                        style={[
                            styles['margin_left_10'],
                            {
                                color: screen === 'SignUp' ? secondaryColor : dynamicStyles?.secondaryColor,
                            },
                            styles['font_size_18_bold'],
                        ]}
                    >
                        {translate('Map')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <MapplsGL.MapView
                        style={{ flex: 1 }}
                        onDidFinishLoadingMap={onMapLoad}
                        onMapError={onMapError}
                        onRegionIsChanging={onMapRegionChange}
                        onRegionWillChange={onRegionWillChange}
                        onRegionDidChange={onRegionDidChange}
                        zoomEnabled={isMap}
                        scrollEnabled={isMap}
                        rotateEnabled={isMap}
                    >
                        <MapplsGL.Camera
                            ref={cameraRef}
                            zoomLevel={route?.params?.zoom || 12}
                            animationDuration={1000}
                        // centerCoordinate={[route?.params?.longitude,route?.params?.latitude]}
                        />
                        <MapplsGL.UserLocation visible={true} showsUserHeadingIndicator={true} />
                    </MapplsGL.MapView>
                )}
            </View>

            {isMapReady && !loading && (
                <TouchableOpacity
                    disabled={!isMap}
                    onPress={() => {
                        handleBackToCurrentLocation();
                        setPinDance(true);
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 100,
                        right: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: screen === 'SignUp' ? primaryColor : dynamicStyles?.primaryColor,
                        height: 60,
                        width: 60,
                        borderRadius: 60,
                    }}
                >
                    <Image
                        tintColor={dynamicStyles.secondaryColor ? dynamicStyles.secondaryColor : Colors.white}
                        source={require('../assets/images/gps.png')}
                        style={{ height: 30, width: 30, resizeMode: "contain" }}
                    />
                </TouchableOpacity>
            )}

            {!isMapReady &&
                <CustomLoaderDefault
                    loading={!isMapReady}
                    uriSent={true}
                    message={translate('please_wait_location_data')}
                    loaderImage={route.params.loaderPath}
                />
            }
            {!loading && (
                <View style={[
                    sheetStyles.centeredView,
                    {
                        left: (width - 40) / 2,
                        top: (height - (Platform.OS == 'ios' ? 0 : 20)) / 2,
                    }
                ]}>
                    <Image
                        source={require('../assets/images/locationMarker.png')}
                        style={{ height: 40, width: 40, resizeMode: "contain" }}
                    />
                </View>
            )}

            {isMapReady && !loading && <View style={[styles['width_100%'], { position: "absolute", bottom: 20, zIndex: 100 }]}>
                <CustomButton
                    title={isMap ? translate('save') : translate('editOnly')}
                    buttonBg={screen === 'SignUp' ? primaryColor : dynamicStyles?.primaryColor}
                    btnWidth={'90%'}
                    enableLoader={addLoader}
                    titleTextColor={screen === 'SignUp' ? secondaryColor : dynamicStyles?.secondaryColor}
                    onPress={handlePickLocation}
                />
            </View>}
        </>
    );
};

const sheetStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Location;
