import React, { useEffect, useState } from 'react';
import {
  Platform,
  Text,
  StatusBar,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleToast from 'react-native-simple-toast';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { translate } from '../Localisation/Localisation';
import { Colors } from '../assets/Utils/Color';
import { selectUser } from '../redux/store/slices/UserSlice';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { GetApiHeaders, GetRequest, getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import CustomLoader from '../Components/CustomLoader';
import MediaModal from '../Modals/MediaModal';
import { isValidImageUrl } from '../assets/Utils/Utils';

const AdvancedKnowledgeCenter = () => {
  const navigation = useNavigation();
  const networkStatus = useSelector(state => state.networkStatus.value);
  const companyStyle = useSelector(getCompanyStyles);
  const getUserData = useSelector(selectUser);
  const dynamicStyles = companyStyle.value;
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [cropsList, setCropsList] = useState([]);
  const [listOfBooksOriginal, setListOfBooksOriginal] = useState([]);
  const [listOfBooksFilter, setListOfBooksFilter] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [renderPdf, setRenderPdf] = useState(false);
  const [mediaVisible, setMediaVisible] = useState(false);
  const [mediaLink, setMediaLink] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [pdfPath, setPdfPath] = useState(null);
  const [pdfLink, setPdfLink] = useState(null)


  useEffect(() => {
    if (cropsList && cropsList.length > 0 && selectedId === null) {
      console.log("cropsList", cropsList)
      const firstCrop = cropsList[0];
      console.log("firstCrop", firstCrop)
      setSelectedId(firstCrop.cropName);
      onCropSelect(firstCrop.cropName); // trigger selection callback if needed
    }
  }, [cropsList]);

  const onCropSelect = (cropName) => {
    console.log("sdsds", cropName + "  " + selectedId)
    setSelectedId(cropName);
    const filtered = listOfBooksOriginal.filter(
      (book) => book.cropName === cropName
    );
    console.log("filtered", filtered)
    setListOfBooksFilter(filtered);
  };

  useEffect(() => {
    if (networkStatus) fetchKnowledgeCenterData();
  }, [networkStatus])

  const fetchKnowledgeCenterData = async () => {
    const network = await getNetworkStatus();
    if (!network) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }
    try {
      setLoading(true);
      setLoadingMessage(translate('please_wait_getting_data'));

      const headers = await GetApiHeaders();
      headers.companyCode = getUserData[0]?.companyCode;
      const APIResponse = await GetRequest(
        configs.BASE_URL + configs.KNOWLEDGECENTREADVCANCED.getAdvancedKnowledgeCenterDataByCompany,
        headers
      );

      if (APIResponse?.statusCode === HTTP_OK) {
        const resp = APIResponse.response;
        setListOfBooksOriginal(resp.knowledgeCenterJsonList || []);
        setListOfBooksFilter(resp.knowledgeCenterJsonList || []);
        setCropsList(resp.knowledgeCntrCropsList || []);

        // Auto-select first crop if none selected
        // if (resp.knowledgeCntrCropsList?.length && !selectedCrop) {
        //   setSelectedCrop(resp.knowledgeCntrCropsList[0].cropName);
        //   // filterByCrop(resp.knowledgeCntrCropsList[0].cropName);
        // }
      } else {
        Alert.alert(APIResponse?.message || translate('something_went_wrong'));
      }
    } catch (error) {
      SimpleToast.show(error.message);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const filterByCrop = (cropName) => {
    setSelectedCrop(cropName);
    const filtered = listOfBooksOriginal.filter(book => book.cropName === cropName);
    setListOfBooksFilter(filtered);
  };


  const renderCropsListItem = ({ item }) => {
    const isSelected = selectedId === item.cropName;

    return (
      <View
        style={{
          alignItems: 'center',
          width: `${100 / 5}%`, // 5 items per row
          // marginVertical: 8,
          padding: 4    // vertical spacing
        }}
      >
        <TouchableOpacity
          style={[
            styleSheetStyles.itemContainer,
            isSelected && { backgroundColor: dynamicStyles.primaryColor }
          ]}
          onPress={() => onCropSelect(item.cropName)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.vectorImage }}
            style={styleSheetStyles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 12,
            textAlign: "center",
            marginTop: 4, // spacing below circle
            fontWeight: isSelected ? 'bold' : 'normal',
            color: isSelected ? dynamicStyles.primaryColor : dynamicStyles.textColor,
          }}

        >
          {item?.cropName.replace(/-/g, " ")}
        </Text>
      </View>
    );
  };



  const isYouTubeLink = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
  const isImageLink = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
  const isPdfLink = (url) => /\.pdf$/i.test(url);
  const isMp4Link = (url) => /\.mp4$/i.test(url);

  const handlePressBroucher = (item) => {

    if (item?.isComingSoon) {
      SimpleToast.show(translate('Comingsoon'))
      return
    }

    console.log('item?.handBookPath', item)

    if (item?.handBookPath == null || item?.handBookPath == undefined || item?.handBookPath.trim() == '') {
      SimpleToast.show(translate('invalid_file_format'))
      return;
    }

    if (isYouTubeLink(item?.handBookPath)) {
      if (networkStatus) {
        Linking.openURL(item?.handBookPath).catch(err => console.error("Couldn't load page", err))
      } else {
        SimpleToast.show(translate('no_internet_conneccted'))
      }
    }
    else if (isPdfLink(item?.handBookPath.trim())) {
      setPdfPath(null)
      setRenderPdf(true)
      setPdfLink(item?.handBookPath)
      navigation.navigate('KnowledgeCenterPDFView', { selectedItem: item, isComingFrom: true })
      return;
    }
    else if (item?.handBookPath.trim()) {
      setMediaLink(item?.handBookPath);
      setMediaVisible(true);
    }
    else {
      SimpleToast.show(translate('invalid_file_format'))
    }
  }

  const gridItem = (item, index) => {
    return (
      <TouchableOpacity
        onPress={() => handlePressBroucher(item)}
        key={index.toString()}
        activeOpacity={0.8}
      >
        <View
          style={[
            {
              width: Dimensions.get('window').width / 2.5,
              borderRadius: 5,
              borderWidth: 0.5,
              borderColor: Colors.white,
              elevation: 0.5,
              bottom: 10,
              minHeight: responsiveHeight(25),
              backgroundColor: Colors.white,
              margin: 10,
            },
          ]}
        >
          {/* ✅ Coming Soon image stays 100% visible */}
          {item?.isComingSoon && <Image
            source={require('../assets/images/comingSoon.png')}
            style={{
              width: '50%',
              height: 20,
              alignSelf: 'flex-end',
              zIndex: 2,
              position: 'absolute',
            }}
            resizeMode="contain"
          />}

          {/* ✅ Card Content with reduced opacity */}
          <View style={{ opacity: item?.isComingSoon ? 0.5 : 1.0 }}>
            <View
              style={[{ alignContent: 'center', alignSelf: 'center', justifyContent: 'center', marginTop: 10, width: '98%' }
              ]}
            >
              <Image
                source={
                  isValidImageUrl(item?.thumbNailPath)
                    ? { uri: item?.thumbNailPath }
                    : require('../assets/images/NoCropImage.png')
                }
                style={[{ width: 120, height: 120, alignContent: 'center', alignSelf: 'center', justifyContent: 'center' }
                ]}
                resizeMode="contain"
              />
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: Colors.lightGray,
                width: '95%',
                alignSelf: 'center',
                marginTop: 10,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                marginTop: 5,
                justifyContent: 'center',
              }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  {
                    color: dynamicStyles.textColor, textAlign: 'left', fontSize: 10, fontWeight: '700', width: '80%',
                    lineHeight: Platform.OS == 'android' ? 15 : 25, textAlignVertical: 'center'
                  },
                ]}
                numberOfLines={2}
              >
                {item.tittle}
              </Text>

              <View
                style={[{ width: 20, height: 20, borderRadius: 12.5, alignItems: 'center', justifyContent: 'center', backgroundColor: dynamicStyles.primaryColor },
                ]}
              >
                <Image
                  resizeMode='contain'
                  style={[{ width: 10, height: 10, tintColor: dynamicStyles.secondaryColor }
                  ]}
                  source={require('../assets/images/rightArrow.png')}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const onpressBroucher = async () => {
    if (listOfBooksOriginal.length > 0) {
      console.log("sddsdsd", listOfBooksOriginal[0]?.brouchurPath)
      if (listOfBooksOriginal[0]?.brouchurPath != undefined && listOfBooksOriginal[0]?.brouchurPath != "") {
        setPdfLink(listOfBooksOriginal[0]?.brouchurPath ? listOfBooksOriginal[0]?.brouchurPath : null)
        navigation.navigate('KnowledgeCenterPDFView', { selectedItem: listOfBooksOriginal[0], isComingFrom: false })
      }
      else {
        SimpleToast.show(translate('NoDataFound'))
      }

    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle="dark-content" />
      )}

      <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>

        {/* Header */}
        <View style={{
          backgroundColor: dynamicStyles.primaryColor,
          width: "100%", paddingStart: 20,
          paddingEnd: 20,
          paddingBottom: 20,
          borderBottomStartRadius: 10,
          borderBottomEndRadius: 10,
          paddingTop:  20

        }}>
          <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => navigation.goBack()}>
            <Image
              style={{ tintColor: dynamicStyles.secondaryColor, height: 15, width: 20, top: 5 }}
              source={require('../assets/images/previous.png')}
            />
            <Text style={{
              color: dynamicStyles.secondaryColor, marginLeft: 10, fontSize: 18, fontWeight: 'bold',
              flexShrink: 1,
              flexWrap: 'wrap',
              lineHeight: Platform.OS == 'android' ? 30 : 25,
              minWidth: 200
            }}
              adjustsFontSizeToFit>
              {translate('KnowledgeCenter')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Single Scrollable List */}
        <FlatList
          data={listOfBooksFilter}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          renderItem={({ item, index }) => gridItem(item, index)}
          contentContainerStyle={{
            paddingBottom: 100,
            alignSelf: 'center'
          }} // space above bottom button
          ListEmptyComponent={
            <View style={{ height: responsiveHeight(70), alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: dynamicStyles.textColor, fontSize: 13, fontWeight: '700' }}>
                {translate('no_data_available')}
              </Text>
            </View>
          }

          // ✅ Crops grid is now the list header
          ListHeaderComponent={
            cropsList.length > 0 && (
              <View style={{ width: '95%', marginTop: 15, }}>
                {/* Header Row */}
                <View style={styleSheetStyles.headerRow}>
                  <Text style={styleSheetStyles.title}>{translate('Crops')}</Text>

                  {cropsList.length > 5 && (
                    <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                      <Text style={styleSheetStyles.viewAll}>
                        {showAll ? translate('View_Less') : translate('View_All')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Crops Grid (Always scrollable naturally now) */}
                <FlatList
                  data={showAll ? cropsList : cropsList.slice(0, 5)}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderCropsListItem}
                  numColumns={5}
                  style={{ marginBottom: 20 }}
                  scrollEnabled={false}
                  contentContainerStyle={{

                  }}
                />
              </View>
            )
          }
        />

        {/* ✅ Always stays at bottom correctly */}
        {cropsList.length > 0 && 
          <TouchableOpacity
            onPress={() => { onpressBroucher() }}
            style={{
              height: 50,
              width: '95%',
              backgroundColor: dynamicStyles.primaryColor,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: 15,
              alignSelf: "center"
            }}
          >
            <Text style={{ color: dynamicStyles.secondaryColor, fontSize: 14, fontWeight: 'bold' }}>
              {translate("view_nsl_broucher")}
            </Text>
          </TouchableOpacity>}

        {loading && <CustomLoader loading={loading} message={loadingMessage} />}
        <MediaModal
          visible={mediaVisible}
          link={mediaLink}
          onClose={() => setMediaVisible(false)}
          loaderColor={dynamicStyles.primaryColor}
        />
      </View>
    </SafeAreaView>
  );
};

export default AdvancedKnowledgeCenter;

const styleSheetStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black
  },
  viewAll: {
    fontSize: 14,
    color: Colors.black,
    padding: 5
  },
  itemContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,   // half of width/height
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    padding: 5
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 15, // make the image circular
    marginBottom: 5,
  }
});
