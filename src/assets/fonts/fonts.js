import { Platform } from 'react-native';
import i18n from 'i18n-js';
import { translate } from '../../Localisation/Localisation';
import store from '../../redux/store/store';


export function CalculateFontSize(sz) {
  return sz;
}

export function FontForWeight(weight = 'Regular') {
  
  // const lang = store.getState().language.languageCode || 'en';
  // alert(lang);
 const lang = global?.selectedLanguageCode || 'en';
  // const normalizedWeight = weight[0].toUpperCase() + weight.slice(1).toLowerCase();
  const normalizedWeight = weight[0].toUpperCase() + weight.slice(1);

  // Base font prefix by language
  let fontPrefix = 'NotoSans';
  if (lang === 'hi' || lang === 'mr') {
    fontPrefix = 'NotoSansDevanagari';
  } else if (lang === 'te') {
    fontPrefix = 'NotoSansTelugu';
  }else{
    fontPrefix = 'NotoSans';
  }

  if (Platform.OS === 'android') {
    // Android uses lowercase font file names (usually without hyphen)
    return `${fontPrefix}-${normalizedWeight}`; 
    // Example: 'notosansdevanagari-bold'
  } else {
    // iOS uses exact PostScript names (case-sensitive)
    return `${fontPrefix}-${normalizedWeight}`;
    // Example: 'NotoSansTelugu-SemiBold'
  }
}

