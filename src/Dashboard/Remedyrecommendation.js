import { Platform, Text, StatusBar, View, FlatList, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';
import { GetApiHeaders, getNetworkStatus, GetRequest, PostRequest } from '../NetworkUtils/NetworkUtils';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import SimpleToast from 'react-native-simple-toast';
import CustomLoader from '../Components/CustomLoader';
import { selectUser } from '../redux/store/slices/UserSlice';
import CustomCircularProgress from '../Components/CustomCircularProgress';
import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { createStyles } from '../assets/style/createStyles';
var styles = BuildStyleOverwrite(Styles);

const Remedyrecommendation = ({ route }) => {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  console.log('rrrrrrr', route)
  const [diseaseData, setDiseaseData] = useState(route?.params?.data || '')
  const [pests, setPests] = useState(route?.params?.data?.pests || '')
  const [description, setDescription] = useState(route?.params?.data?.description || '')
  const [cropName, setCropName] = useState(route?.params?.cropName || '');
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const { latitude, longitude } = useSelector((state) => state.location);
  const [diagnosis, setDiagnosis] = useState('');
  const [advisory, setAdvisory] = useState([]);


  useEffect(() => {
    getRedemy();
  }, [])

  const getRedemy = async () => {
    const networkStatus = await getNetworkStatus();
    if (networkStatus) {
      try {
        setTimeout(() => {
          setLoading(true)
          setLoadingMessage(translate('please_wait_getting_data'))
        }, 50);
        var getRemedyUrl = configs.BASE_URL + configs.PLANNING_TOOL.getRemedies;
        var getHeaders = await GetApiHeaders();
        var body = {
          "cropName": cropName,
          "diseaseName": pests,
          "latitude": latitude.toString(),
          "longitude": longitude.toString(),
        }
        console.log('urlRemedy', getRemedyUrl);
        console.log('headersInRemedy', getHeaders);
        console.log('bodyInRemedy', body);
        var APIResponse = await PostRequest(getRemedyUrl, getHeaders, body);
        console.log('responseForRemedy', APIResponse);
        if (APIResponse != undefined && APIResponse != null) {
          setTimeout(() => {
            setLoadingMessage()
            setLoading(false)
          }, 500);
          if (APIResponse.statusCode == HTTP_OK) {
            setTimeout(() => {
              setLoading(false)
            }, 1000);
            console.log('what is reponse In Remedy', APIResponse)
            setDiagnosis(APIResponse.response[0].diagnosis)
            setAdvisory(APIResponse.response[0].advisory)
          }
          else {
            SimpleToast.show(APIResponse.message)
          }
        } else {
          setTimeout(() => {
            setLoading(false)
            setLoadingMessage()
          }, 1000);
        }
      } catch (error) {
        setTimeout(() => {
          setLoading(false)
          setSuccessLoadingMessage(error.message)
        }, 1000);
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }


  return (
    <View style={[stylesRN.flexFull, stylesRN.gray300bg]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
      <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 60 : 20 }]}>
        <TouchableOpacity style={[{ flexDirection: 'row' }]} onPress={() => navigation.goBack()}>
          <Image source={require('../../src/assets/images/previous.png')} style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} />
          <Text style={[styles['font_size_18_bold'], { marginLeft: 10, color: dynamicStyles.secondaryColor }]}>
            {translate('remedy_recommendation')}
          </Text>
        </TouchableOpacity>

      </View>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, margin: 10, width: "90%", alignSelf: "center", borderRadius: 10, shadowColor: '#000', backgroundColor: "white", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 2 }}>
        <View style={{ margin: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ width: "78%" }}>
            <Text style={[{ color: dynamicStyles.textColor },styles['font_size_16_bold']]}>{pests}</Text>
            <Text style={[styles['font_size_16_regular'], { color: dynamicStyles?.textColor, marginTop: 5 }]}>{description}</Text>
          </View>
          {diseaseData?.percentage && <CustomCircularProgress
            percentage={diseaseData?.percentage} radius={25} strokeWidth={6} percentageText={diseaseData?.percentage} level={diseaseData?.level}
          />}
        </View>
        <View style={{ height: 2, backgroundColor: 'rgba(242, 246, 249, 1)', marginVertical: 7, margin: 10 }} />
        <View style={{ margin: 10 }}>
          <Text style={[styles['font_size_16_regular'], { color: dynamicStyles?.textColor, marginBottom: 10 }]}>{diagnosis}</Text>
          {advisory.length > 0 ? (
            <View style={{ maxHeight: responsiveHeight(60), }} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
              {advisory.map((item, index) => (
                  <View style={{ width: '95%' }}>
                  <View style={{ flexDirection: 'row', width: "100%", }}>
                    <Text style={[styles['font_size_14_regular'], { color: dynamicStyles?.textColor, width: "10%", textAlign: "center" }]}>{index + 1}. </Text>
                      <Text style={[styles['font_size_14_regular'], { color: dynamicStyles?.textColor, lineHeight: 23, width: "90%", textAlign: "justify" }]}>{item.point}</Text>
                    </View>
                  </View>
              ))}
            </View>
          ) : (
            <Text style={[{ color: dynamicStyles?.textColor, marginLeft: 10, margin: 2, },styles['font_size_13_regular']]}>{translate('not_available')}</Text>
          )}
        </View>
      </ScrollView>
      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
    </View>
  );
};

const stylesRN = StyleSheet.create({
  flexFull: { flex: 1 },
  gray300bg: { backgroundColor: '#f5f5f5' },
  header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
})

export default Remedyrecommendation;