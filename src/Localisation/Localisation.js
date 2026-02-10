import * as RNLocalize from "react-native-localize";
import i18n from 'i18n-js';
import memoize from 'lodash.memoize';




export const translationGetters = {
  en: () => require('./en.json'),
  te: () => require('./te.json'),
  hi: () => require('./hi.json'),
  mr: () => require('./mr.json'),
}

export const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
)

export const setI18nConfig = (lang) => {

  if (lang == "") {
    const fallback = { languageTag: 'en' }
    const { languageTag } =
      RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
      fallback
    console.log(languageTag);
    translate.cache.clear()

    i18n.translations = { [languageTag]: translationGetters[languageTag]() }
    i18n.locale = languageTag
  } else {
    console.log("Custom language selection -->" + lang)
    const fallback = { languageTag: lang }
    const { languageTag } = fallback
    translate.cache.clear()

    //notifying the app to change the language
    i18n.changeLanguage = { [languageTag]: translationGetters[languageTag]() }

    i18n.translations = { [languageTag]: translationGetters[languageTag]() }
    i18n.locale = languageTag
  }

}





export const initLocalisation = () => {
  setI18nConfig("")
}

export const changeLanguage = async lang => {
  setI18nConfig(lang);

};

