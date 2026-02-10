import { StatusBar, StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Platform, } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { useSelector } from 'react-redux';
import { translate } from '../Localisation/Localisation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import SimpleToast from 'react-native-simple-toast';
import { createStyles } from '../assets/style/createStyles';


var styles = BuildStyleOverwrite(Styles);
const CropDesiesDetection = ({ route }) => {
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const navigation = useNavigation();
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
  const [cropDiseases, setCropDiseases] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [cropName, setCropName] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advisory, setAdvisory] = useState([]);
  const viewShotRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const data = route?.params?.data;

    let normalizedData = [];

    // Normalize to array
    if (Array.isArray(data)) {
      normalizedData = data;
    } else if (typeof data === 'object' && data !== null) {
      normalizedData = [data];
    }

    setCropDiseases(normalizedData);

    const firstItem = normalizedData[0] || {};
    setImageUrl(firstItem.imageUrl || null);
    setCropName(firstItem.cropName || '');
    setDiseaseName(firstItem.diseaseName || '');
    setDiagnosis(firstItem.diagnosis || '');
    setAdvisory(Array.isArray(firstItem.advisory) ? firstItem.advisory : []);
  }, [route?.params?.data]);

  const shareProductDetails = async () => {

    if (isProcessing) return; // prevent multiple clicks
    setIsProcessing(true);

    setTimeout(async () => {
      try {
        if (Platform.OS === 'ios') {
          const uri = await viewShotRef.current.capture();
          const shareOptions = {
            title: 'Share via',
            url: uri,
          };
          Share.open(shareOptions);
        }
        else {
          const uri = await viewShotRef.current.capture();
          console.log('Screenshot saved at:', uri);
          const shareOptions = {
            url: uri,
            type: 'image/png',
            social: Share.Social.WHATSAPP,
          };

          await Share.shareSingle(shareOptions);
        }
      } catch (error) {
        console.error('Failed to share product details via WhatsApp:', error);
        SimpleToast.show(translate('failed_to_share_via_whatsapp'));
      }
      finally {
        setIsProcessing(false);
      }
    }, 200);


  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
      <View style={[styles['flex_1'], { backgroundColor: 'rgba(249, 249, 249, 1)' }]}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
        <View style={[{ backgroundColor: dynamicStyles.primaryColor }, { paddingStart: 20, paddingEnd: 20, paddingBottom: 20, borderBottomStartRadius: 10, borderBottomEndRadius: 10, paddingTop: Platform.OS == 'ios' ? 20 : 20 }]}>
          <TouchableOpacity style={[styles['flex_direction_row']]} onPress={() => navigation.goBack()}>
            <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 15, width: 20, top: 5 }]} source={require('../assets/images/previous.png')}></Image>
            <Text style={[styles['margin_left_10'], { color: dynamicStyles.secondaryColor }, styles['font_size_18_bold'], Platform.OS === 'ios' && { minHeight: 25 }]}>{translate('crop_disease_detection')}</Text>
          </TouchableOpacity>
        </View>

        <ViewShot ref={viewShotRef} options={{ format: Platform.OS == 'android' ? "png" : "jpg", quality: 0.1 }}>
          <Image source={{ uri: imageUrl }} style={{ width: "100%", height: 200, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, resizeMode: 'cover' }} />
          <ScrollView>
            <View style={{ backgroundColor: "white", width: "95%", alignSelf: "center", marginTop: 20, borderRadius: 10, }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
                <View>
                  <Text style={[styles['font_size_14_bold'], { color: "grey" }]}>{translate('disease_name')}</Text>
                  <Text style={[{ color: dynamicStyles.textColor }, styles['font_size_14_bold']]}>{diseaseName || translate('not_available')}</Text>
                </View>
                {!isProcessing &&
                  <TouchableOpacity
                    style={{
                      borderColor: '#0CB500',
                      borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#0CB500',
                      // backgroundColor : 'black',
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                    }}
                    onPress={() => shareProductDetails()}
                  >
                    <Image
                      source={require('../assets/images/callIcon.png')}
                      style={{ width: 25, height: 25, resizeMode: "contain", }}
                    />
                  </TouchableOpacity>}
              </View>
              <View style={{ height: 2, backgroundColor: 'rgba(242, 246, 249, 1)', marginVertical: 7, margin: 10 }} />

              <Text style={[{ color: dynamicStyles?.textColor, marginLeft: 10 }, styles['font_size_14_semibold']]}>{translate('most_possible_diagnosis')}</Text>
              <View style={{ margin: 0, width: '90%' }}>
                <Text style={[{ color: dynamicStyles?.textColor, marginLeft: 10, margin: 2, lineHeight: 23 }, styles['font_size_13_regular']]}>{diagnosis || translate('not_available')}</Text>

                <View style={{ marginBottom: 10 }}>
                  {console.log('advisoryPointsInFlatlist', advisory)}
                  {advisory.length > 0 ? (
                    <FlatList
                      data={advisory}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <View style={{ marginHorizontal: 10, flexDirection: 'row', width: '95%' }}>
                          <Text style={[styles['font_size_14_regular'], { color: dynamicStyles?.textColor }]}>{index + 1}. </Text>
                          <Text style={[styles['font_size_14_regular'], { color: dynamicStyles?.textColor, lineHeight: 23 }]}>{item.point}</Text>
                        </View>
                      )}
                    />
                  ) : (
                    <Text style={[{ color: dynamicStyles?.textColor, marginLeft: 10, margin: 2 }, styles['font_size_13_regular']]}>{translate('not_available')}</Text>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </ViewShot>
      </View>
    </SafeAreaView>
  )
}

export default CropDesiesDetection